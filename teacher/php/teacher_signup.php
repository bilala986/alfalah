<?php
// teacher/php/teacher_signup.php
session_start();
header('Content-Type: application/json');

// Security headers
header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");

// Include database connection
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/security_functions.php';

$teacher_name = trim($_POST['teacher_name'] ?? '');
$teacher_email = trim($_POST['teacher_email'] ?? '');
$teacher_password = $_POST['teacher_password'] ?? '';
$teacher_password_confirm = $_POST['teacher_password_confirm'] ?? '';
$csrf_token = $_POST['csrf_token'] ?? '';

// Validate CSRF token
if (!validateCsrfToken($csrf_token)) {
    error_log("CSRF token validation failed for teacher signup from IP: " . getClientIP());
    echo json_encode(["success" => false, "message" => "Security validation failed. Please refresh the page."]);
    exit;
}

// Basic validation
if (empty($teacher_name) || empty($teacher_email) || empty($teacher_password) || empty($teacher_password_confirm)) {
    echo json_encode(["success" => false, "message" => "Please fill out all fields."]);
    exit;
}

// Validate name
if (!preg_match('/^[a-zA-Z\s\.\-\']{2,100}$/', $teacher_name)) {
    echo json_encode(["success" => false, "message" => "Name can only contain letters, spaces, hyphens, apostrophes, and periods."]);
    exit;
}

// Validate email format
if (!filter_var($teacher_email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Invalid email format."]);
    exit;
}

// Sanitize inputs
$teacher_name = htmlspecialchars($teacher_name, ENT_QUOTES, 'UTF-8');
$teacher_email = filter_var($teacher_email, FILTER_SANITIZE_EMAIL);

// Validate password strength
$password_errors = validatePasswordStrength($teacher_password);
if (!empty($password_errors)) {
    echo json_encode(["success" => false, "message" => implode(' ', $password_errors)]);
    exit;
}

// Check if passwords match
if ($teacher_password !== $teacher_password_confirm) {
    echo json_encode(["success" => false, "message" => "Passwords do not match."]);
    exit;
}

// Check for existing email
try {
    $stmt = $pdo->prepare("SELECT id FROM teacher_users WHERE email = ?");
    $stmt->execute([$teacher_email]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => false, "message" => "An account with this email already exists."]);
        exit;
    }

    // Hash password
    $hashedPassword = password_hash($teacher_password, PASSWORD_DEFAULT, ['cost' => 12]);
    
    if ($hashedPassword === false) {
        throw new Exception("Password hashing failed");
    }

    // Insert teacher - Set is_approved = 0 (pending)
    $stmt = $pdo->prepare("INSERT INTO teacher_users (name, email, password_hash, is_approved, is_active, created_at, login_attempts) VALUES (?, ?, ?, 0, 1, NOW(), 0)");
    
    if ($stmt->execute([$teacher_name, $teacher_email, $hashedPassword])) {
        $teacher_id = $pdo->lastInsertId();
        
        // Generate a NEW browser instance ID
        $new_browser_instance_id = 't' . bin2hex(random_bytes(16));
        
        // Proper session handling
        session_write_close();
        
        // Start new session with the custom ID
        session_id($new_browser_instance_id);
        session_start();
        
        // Set session variables - Set pending_approval to true
        $_SESSION['teacher_id'] = $teacher_id;
        $_SESSION['teacher_name'] = $teacher_name;
        $_SESSION['teacher_email'] = $teacher_email;
        $_SESSION['teacher_logged_in'] = true;
        $_SESSION['pending_approval'] = true; // TRUE for new accounts
        $_SESSION['login_time'] = time();
        $_SESSION['browser_instance_id'] = $new_browser_instance_id;
        $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $_SESSION['ip_address'] = getClientIP();
        $_SESSION['last_activity'] = time();
        
        // Force session write
        session_write_close();
        
        echo json_encode([
            "success" => true, 
            "message" => "Teacher account created successfully! Awaiting admin approval.",
            "browser_instance_id" => $new_browser_instance_id
        ]);
        exit;
    } else {
        throw new Exception("Database insertion failed");
    }
    
} catch (PDOException $e) {
    error_log("Database error in teacher_signup.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "A system error occurred. Please try again later."]);
} catch (Exception $e) {
    error_log("Error in teacher_signup.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "A system error occurred. Please try again later."]);
}
?>