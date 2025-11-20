<?php
// admin/php/admin_login.php - SECURITY HARDENED WITH FALLBACKS
session_start();
header('Content-Type: application/json');

// Security headers
header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");
header("Referrer-Policy: strict-origin-when-cross-origin");

// Include database connection
require_once '../../php/db_connect.php';

// Include security functions
require_once '../../php/security_functions.php';

$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$browser_instance_id = $_POST['browser_instance_id'] ?? '';
$csrf_token = $_POST['csrf_token'] ?? '';

// Debug logging
error_log("Admin Login Attempt - Email: $email, Browser Instance ID: $browser_instance_id");

// Validate CSRF token
if (!validateCsrfToken($csrf_token)) {
    error_log("CSRF token validation failed for admin login from IP: " . getClientIP());
    echo json_encode(["success" => false, "message" => "Security validation failed. Please refresh the page."]);
    exit;
}

// Basic validation
if (empty($email) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Please fill out all fields."]);
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Invalid email format."]);
    exit;
}

// Sanitize email
$email = filter_var($email, FILTER_SANITIZE_EMAIL);

// Check for brute force attempts (with fallback)
if (isBruteForce(getClientIP(), $email)) {
    error_log("Brute force attempt detected for email: " . $email . " from IP: " . getClientIP());
    echo json_encode(["success" => false, "message" => "Too many login attempts. Please try again in 15 minutes."]);
    exit;
}

try {
    // Check if login_attempts column exists to adjust query
    $columnExists = $pdo->query("SHOW COLUMNS FROM admin_users LIKE 'login_attempts'")->rowCount() > 0;
    
    if ($columnExists) {
        $stmt = $pdo->prepare("SELECT id, name, email, password_hash, is_approved, login_attempts, lockout_until FROM admin_users WHERE email = ? AND is_active = 1");
    } else {
        $stmt = $pdo->prepare("SELECT id, name, email, password_hash, is_approved FROM admin_users WHERE email = ? AND is_active = 1");
    }
    
    $stmt->execute([$email]);
    $admin = $stmt->fetch();
    
    if ($admin) {
        // Check if account is locked (only if column exists)
        if ($columnExists && $admin['lockout_until'] && strtotime($admin['lockout_until']) > time()) {
            $lockout_time = date('g:i A', strtotime($admin['lockout_until']));
            echo json_encode(["success" => false, "message" => "Account temporarily locked. Try again after $lockout_time."]);
            exit;
        }
        
        if (password_verify($password, $admin['password_hash'])) {
            // Successful login - reset attempt counter if column exists
            if ($columnExists) {
                $updateStmt = $pdo->prepare("UPDATE admin_users SET login_attempts = 0, lockout_until = NULL, last_login = NOW() WHERE id = ?");
            } else {
                $updateStmt = $pdo->prepare("UPDATE admin_users SET last_login = NOW() WHERE id = ?");
            }
            $updateStmt->execute([$admin['id']]);
            
            // Generate a NEW session ID for login
            $new_browser_instance_id = 'a' . bin2hex(random_bytes(16));
            
            // Close any existing session completely
            session_write_close();
            
            // Set the new session ID
            session_id($new_browser_instance_id);
            session_start();
            
            // Don't regenerate ID - we already set a new one
            // session_regenerate_id(true);
            
            // Clear any existing session data
            $_SESSION = [];
            
            // Set fresh session data
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_name'] = htmlspecialchars($admin['name'], ENT_QUOTES, 'UTF-8');
            $_SESSION['admin_email'] = htmlspecialchars($admin['email'], ENT_QUOTES, 'UTF-8');
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['pending_approval'] = ($admin['is_approved'] == 0);
            $_SESSION['login_time'] = time();
            $_SESSION['browser_instance_id'] = $new_browser_instance_id;
            $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? '';
            $_SESSION['ip_address'] = getClientIP();
            
            // Set session timeout (1 hour)
            $_SESSION['last_activity'] = time();
            
            // Debug logging
            error_log("Admin Login Success - New Session ID: $new_browser_instance_id, Admin ID: " . $admin['id']);
            
            echo json_encode([
                "success" => true, 
                "message" => "Login successful!",
                "browser_instance_id" => $new_browser_instance_id
            ]);
        } else {
            // Failed login - increment attempt counter (with fallback)
            recordFailedAttempt($pdo, $admin['id'], getClientIP());
            error_log("Failed login attempt for email: " . $email . " from IP: " . getClientIP());
            
            // Use generic message to prevent user enumeration
            echo json_encode(["success" => false, "message" => "Invalid email or password."]);
        }
    } else {
        // Use generic message to prevent user enumeration
        error_log("Failed login attempt for non-existent email: " . $email . " from IP: " . getClientIP());
        echo json_encode(["success" => false, "message" => "Invalid email or password."]);
    }
    
} catch (PDOException $e) {
    error_log("Database error in admin_login.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "A system error occurred. Please try again later."]);
}
?>