<?php
// admin/php/admin_signup.php - FIXED VERSION
session_start();
header('Content-Type: application/json');

// Security headers
header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");

// Include database connection
require_once '../../php/db_connect.php';
require_once '../../php/security_functions.php';

$admin_name = trim($_POST['admin_name'] ?? '');
$admin_email = trim($_POST['admin_email'] ?? '');
$admin_password = $_POST['admin_password'] ?? '';
$admin_confirm_password = $_POST['admin_confirm_password'] ?? '';
$csrf_token = $_POST['csrf_token'] ?? '';

// Validate CSRF token
if (!validateCsrfToken($csrf_token)) {
    error_log("CSRF token validation failed for admin signup from IP: " . getClientIP());
    echo json_encode(["success" => false, "message" => "Security validation failed. Please refresh the page."]);
    exit;
}

// Basic validation
if (empty($admin_name) || empty($admin_email) || empty($admin_password) || empty($admin_confirm_password)) {
    echo json_encode(["success" => false, "message" => "Please fill out all fields."]);
    exit;
}

// Validate name
if (!preg_match('/^[a-zA-Z\s\.\-\']{2,100}$/', $admin_name)) {
    echo json_encode(["success" => false, "message" => "Name can only contain letters, spaces, hyphens, apostrophes, and periods."]);
    exit;
}

// Validate email format
if (!filter_var($admin_email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Invalid email format."]);
    exit;
}

// Sanitize inputs
$admin_name = htmlspecialchars($admin_name, ENT_QUOTES, 'UTF-8');
$admin_email = filter_var($admin_email, FILTER_SANITIZE_EMAIL);

// Validate password strength
$password_errors = validatePasswordStrength($admin_password);
if (!empty($password_errors)) {
    echo json_encode(["success" => false, "message" => implode(' ', $password_errors)]);
    exit;
}

// Check if passwords match
if ($admin_password !== $admin_confirm_password) {
    echo json_encode(["success" => false, "message" => "Passwords do not match."]);
    exit;
}

// Check for existing email
try {
    $stmt = $pdo->prepare("SELECT id FROM admin_users WHERE email = ?");
    $stmt->execute([$admin_email]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => false, "message" => "An account with this email already exists."]);
        exit;
    }

    // Hash password
    $hashedPassword = password_hash($admin_password, PASSWORD_DEFAULT, ['cost' => 12]);
    
    if ($hashedPassword === false) {
        throw new Exception("Password hashing failed");
    }

    // Insert admin - FIX: Set is_approved = 0 (pending)
    $stmt = $pdo->prepare("INSERT INTO admin_users (name, email, password_hash, is_approved, is_active, created_at, login_attempts) VALUES (?, ?, ?, 0, 1, NOW(), 0)");
    
    if ($stmt->execute([$admin_name, $admin_email, $hashedPassword])) {
        $admin_id = $pdo->lastInsertId();
        
        // Generate a NEW browser instance ID
        $new_browser_instance_id = 'a' . bin2hex(random_bytes(16));
        
        // CRITICAL FIX: Proper session handling
        session_write_close(); // Close current session
        
        // Start new session with the custom ID
        session_id($new_browser_instance_id);
        session_start();
        
        // Set session variables - FIX: Set pending_approval to true
        $_SESSION['admin_id'] = $admin_id;
        $_SESSION['admin_name'] = $admin_name;
        $_SESSION['admin_email'] = $admin_email;
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['pending_approval'] = true; // This should be TRUE for new accounts
        $_SESSION['login_time'] = time();
        $_SESSION['browser_instance_id'] = $new_browser_instance_id;
        $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $_SESSION['ip_address'] = getClientIP();
        $_SESSION['last_activity'] = time();
        
        // Force session write
        session_write_close();
        
        echo json_encode([
            "success" => true, 
            "message" => "Admin account created successfully! Awaiting approval.",
            "browser_instance_id" => $new_browser_instance_id
        ]);
        exit;
    } else {
        throw new Exception("Database insertion failed");
    }
    
} catch (PDOException $e) {
    error_log("Database error in admin_signup.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "A system error occurred. Please try again later."]);
} catch (Exception $e) {
    error_log("Error in admin_signup.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "A system error occurred. Please try again later."]);
}
?>