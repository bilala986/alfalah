<?php
// parent/php/parent_signup.php - FIXED VERSION
session_start();
header('Content-Type: application/json');

// Security headers
header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");

// Include database connection
require_once '../../php/db_connect.php';
require_once '../../php/security_functions.php';

$parent_name = trim($_POST['parent_name'] ?? '');
$parent_email = trim($_POST['parent_email'] ?? '');
$parent_password = $_POST['parent_password'] ?? '';
$parent_confirm_password = $_POST['parent_password_confirm'] ?? '';
$csrf_token = $_POST['csrf_token'] ?? '';

// Validate CSRF token
if (!validateCsrfToken($csrf_token)) {
    error_log("CSRF token validation failed for parent signup from IP: " . getClientIP());
    echo json_encode(["success" => false, "message" => "Security validation failed. Please refresh the page."]);
    exit;
}

// Basic validation
if (empty($parent_name) || empty($parent_email) || empty($parent_password) || empty($parent_confirm_password)) {
    echo json_encode(["success" => false, "message" => "Please fill out all fields."]);
    exit;
}

// Validate name
if (!preg_match('/^[a-zA-Z\s\.\-\']{2,100}$/', $parent_name)) {
    echo json_encode(["success" => false, "message" => "Name can only contain letters, spaces, hyphens, apostrophes, and periods."]);
    exit;
}

// Validate email format
if (!filter_var($parent_email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Invalid email format."]);
    exit;
}

// Sanitize inputs
$parent_name = htmlspecialchars($parent_name, ENT_QUOTES, 'UTF-8');
$parent_email = filter_var($parent_email, FILTER_SANITIZE_EMAIL);

// Validate password strength
$password_errors = validatePasswordStrength($parent_password);
if (!empty($password_errors)) {
    echo json_encode(["success" => false, "message" => implode(' ', $password_errors)]);
    exit;
}

// Check if passwords match
if ($parent_password !== $parent_confirm_password) {
    echo json_encode(["success" => false, "message" => "Passwords do not match."]);
    exit;
}

// Check for existing email
try {
    $stmt = $pdo->prepare("SELECT id FROM parent_users WHERE email = ?");
    $stmt->execute([$parent_email]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => false, "message" => "An account with this email already exists."]);
        exit;
    }

    // Hash password
    $hashedPassword = password_hash($parent_password, PASSWORD_DEFAULT, ['cost' => 12]);
    
    if ($hashedPassword === false) {
        throw new Exception("Password hashing failed");
    }

    // Insert parent - Auto-approved for parents (no approval needed)
    $stmt = $pdo->prepare("INSERT INTO parent_users (name, email, password_hash, is_approved, is_active, created_at, login_attempts) VALUES (?, ?, ?, 1, 1, NOW(), 0)");
    
    if ($stmt->execute([$parent_name, $parent_email, $hashedPassword])) {
        $parent_id = $pdo->lastInsertId();
        
        // Generate a NEW browser instance ID
        $new_browser_instance_id = 'p' . bin2hex(random_bytes(16));
        
        // CRITICAL FIX: Proper session handling
        session_write_close(); // Close current session
        
        // Start new session with the custom ID
        session_id($new_browser_instance_id);
        session_start();
        
        // Set session variables - Parent accounts are auto-approved
        $_SESSION['parent_id'] = $parent_id;
        $_SESSION['parent_name'] = $parent_name;
        $_SESSION['parent_email'] = $parent_email;
        $_SESSION['parent_logged_in'] = true;
        $_SESSION['login_time'] = time();
        $_SESSION['browser_instance_id'] = $new_browser_instance_id;
        $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $_SESSION['ip_address'] = getClientIP();
        $_SESSION['last_activity'] = time();
        
        // Force session write
        session_write_close();
        
        echo json_encode([
            "success" => true, 
            "message" => "Parent account created successfully!",
            "browser_instance_id" => $new_browser_instance_id
        ]);
        exit;
    } else {
        throw new Exception("Database insertion failed");
    }
    
} catch (PDOException $e) {
    error_log("Database error in parent_signup.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "A system error occurred. Please try again later."]);
} catch (Exception $e) {
    error_log("Error in parent_signup.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "A system error occurred. Please try again later."]);
}
?>