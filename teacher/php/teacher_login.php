<?php
// teacher/php/teacher_login.php - SECURE VERSION WITH WORKING SECURITY FUNCTIONS
session_start();
header('Content-Type: application/json');

// Security headers
header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");
header("Referrer-Policy: strict-origin-when-cross-origin");

// Include files - IMPORTANT: security functions FIRST
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/security_functions.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$browser_instance_id = $_POST['browser_instance_id'] ?? '';
$csrf_token = $_POST['csrf_token'] ?? '';

// Enhanced CSRF validation
if (!validateCsrfToken($csrf_token)) {
    error_log("CSRF token validation failed for teacher login from IP: " . getClientIP());
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

// Check for brute force attempts with enhanced logging
$client_ip = getClientIP();
error_log("TEACHER LOGIN: Attempt for email: $email from IP: $client_ip");

if (isTeacherBruteForce($client_ip, $email)) {
    error_log("Brute force attempt detected for teacher email: " . $email . " from IP: " . $client_ip);
    echo json_encode(["success" => false, "message" => "Too many login attempts. Please try again in 15 minutes."]);
    exit;
}

try {
    // Check if login_attempts column exists to adjust query
    $columnExists = $pdo->query("SHOW COLUMNS FROM teacher_users LIKE 'login_attempts'")->rowCount() > 0;
    
    if ($columnExists) {
        $stmt = $pdo->prepare("SELECT id, name, email, password_hash, is_approved, login_attempts, lockout_until FROM teacher_users WHERE email = ? AND is_active = 1");
    } else {
        $stmt = $pdo->prepare("SELECT id, name, email, password_hash, is_approved FROM teacher_users WHERE email = ? AND is_active = 1");
    }
    
    $stmt->execute([$email]);
    $teacher = $stmt->fetch();
    
    if ($teacher) {
        // Check if account is locked
        if ($columnExists && $teacher['lockout_until'] && strtotime($teacher['lockout_until']) > time()) {
            $lockout_time = date('g:i A', strtotime($teacher['lockout_until']));
            echo json_encode(["success" => false, "message" => "Account temporarily locked. Try again after $lockout_time."]);
            exit;
        }
        
        if (password_verify($password, $teacher['password_hash'])) {
            // Successful login - update last_login timestamp
            if ($columnExists) {
                $updateStmt = $pdo->prepare("UPDATE teacher_users SET login_attempts = 0, lockout_until = NULL, last_login = NOW() WHERE id = ?");
            } else {
                $updateStmt = $pdo->prepare("UPDATE teacher_users SET last_login = NOW() WHERE id = ?");
            }
            $updateStmt->execute([$teacher['id']]);
            
            // Generate a NEW session ID for login
            $new_browser_instance_id = 't' . bin2hex(random_bytes(16));
            
            // Close any existing session completely
            session_write_close();
            
            // Set the new session ID
            session_id($new_browser_instance_id);
            session_start();
            
            // Clear any existing session data
            $_SESSION = [];
            
            // Set fresh session data
            $_SESSION['teacher_id'] = $teacher['id'];
            $_SESSION['teacher_name'] = htmlspecialchars($teacher['name'], ENT_QUOTES, 'UTF-8');
            $_SESSION['teacher_email'] = htmlspecialchars($teacher['email'], ENT_QUOTES, 'UTF-8');
            $_SESSION['teacher_logged_in'] = true;
            $_SESSION['pending_approval'] = ($teacher['is_approved'] == 0);
            $_SESSION['login_time'] = time();
            $_SESSION['browser_instance_id'] = $new_browser_instance_id;
            $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? '';
            $_SESSION['ip_address'] = $client_ip;
            
            // Set session timeout (1 hour)
            $_SESSION['last_activity'] = time();
            
            error_log("TEACHER LOGIN SUCCESS: Teacher ID " . $teacher['id'] . " logged in from IP: " . $client_ip);
            
            echo json_encode([
                "success" => true, 
                "message" => "Login successful!",
                "browser_instance_id" => $new_browser_instance_id
            ]);
        } else {
            // Failed login - increment attempt counter
            if ($columnExists) {
                recordTeacherFailedAttempt($pdo, $teacher['id'], $client_ip);
            }
            error_log("Failed login attempt for teacher email: " . $email . " from IP: " . $client_ip);
            
            // Use generic message to prevent user enumeration
            echo json_encode(["success" => false, "message" => "Invalid email or password."]);
        }
    } else {
        // Use generic message to prevent user enumeration
        error_log("Failed login attempt for non-existent teacher email: " . $email . " from IP: " . $client_ip);
        echo json_encode(["success" => false, "message" => "Invalid email or password."]);
    }
    
} catch (PDOException $e) {
    error_log("Database error in teacher_login.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "A system error occurred. Please try again later."]);
}
?>