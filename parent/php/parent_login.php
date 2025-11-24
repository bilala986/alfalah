<?php
// parent/php/parent_login.php - FIXED VERSION WITH LAST LOGIN UPDATE
session_start();
header('Content-Type: application/json');

// Security headers
header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");
header("Referrer-Policy: strict-origin-when-cross-origin");

// Include database connection
require_once '../../php/db_connect.php';
require_once '../../php/security_functions.php';

$email = trim($_POST['parent_email'] ?? '');
$password = $_POST['parent_password'] ?? '';
$browser_instance_id = $_POST['browser_instance_id'] ?? '';
$csrf_token = $_POST['csrf_token'] ?? '';

// Validate CSRF token
if (!validateCsrfToken($csrf_token)) {
    error_log("CSRF token validation failed for parent login from IP: " . getClientIP());
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
    // Check if parent exists - simplified query without column checks
    $stmt = $pdo->prepare("SELECT id, name, email, password_hash, is_approved FROM parent_users WHERE email = ? AND is_active = 1");
    $stmt->execute([$email]);
    $parent = $stmt->fetch();
    
    if ($parent) {        
        if (password_verify($password, $parent['password_hash'])) {
            // Successful login - ALWAYS update last_login timestamp
            $updateStmt = $pdo->prepare("UPDATE parent_users SET last_login = NOW() WHERE id = ?");
            $updateResult = $updateStmt->execute([$parent['id']]);
            
            if (!$updateResult) {
                error_log("Failed to update last_login for parent ID: " . $parent['id']);
            }
            
            // Generate a NEW session ID for login
            $new_browser_instance_id = 'p' . bin2hex(random_bytes(16));
            
            // Close any existing session completely
            session_write_close();
            
            // Set the new session ID
            session_id($new_browser_instance_id);
            session_start();
            
            // Clear any existing session data
            $_SESSION = [];
            
            // Set fresh session data
            $_SESSION['parent_id'] = $parent['id'];
            $_SESSION['parent_name'] = htmlspecialchars($parent['name'], ENT_QUOTES, 'UTF-8');
            $_SESSION['parent_email'] = htmlspecialchars($parent['email'], ENT_QUOTES, 'UTF-8');
            $_SESSION['parent_logged_in'] = true;
            $_SESSION['login_time'] = time();
            $_SESSION['browser_instance_id'] = $new_browser_instance_id;
            $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? '';
            $_SESSION['ip_address'] = getClientIP();
            
            // Set session timeout (1 hour)
            $_SESSION['last_activity'] = time();
            
            echo json_encode([
                "success" => true, 
                "message" => "Login successful!",
                "browser_instance_id" => $new_browser_instance_id
            ]);
        } else {
            // Failed login
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
    error_log("Database error in parent_login.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "A system error occurred. Please try again later."]);
}
?>