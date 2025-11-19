<?php
// admin/php/admin_signup.php - FINAL VERSION WITH APPROVAL
session_start();
header('Content-Type: application/json');

// Include database connection
require_once '../../php/db_connect.php';

$admin_name = trim($_POST['admin_name'] ?? '');
$admin_email = trim($_POST['admin_email'] ?? '');
$admin_password = $_POST['admin_password'] ?? '';
$admin_confirm_password = $_POST['admin_confirm_password'] ?? '';

// Basic validation
if (empty($admin_name) || empty($admin_email) || empty($admin_password) || empty($admin_confirm_password)) {
    echo json_encode(["success" => false, "message" => "Please fill out all fields."]);
    exit;
}

if ($admin_password !== $admin_confirm_password) {
    echo json_encode(["success" => false, "message" => "Passwords do not match."]);
    exit;
}

// Enhanced password validation
if (strlen($admin_password) < 8) {
    echo json_encode(["success" => false, "message" => "Password must be at least 8 characters long."]);
    exit;
}

if (!preg_match('/[A-Z]/', $admin_password)) {
    echo json_encode(["success" => false, "message" => "Password must contain at least one uppercase letter."]);
    exit;
}

if (!preg_match('/[0-9]/', $admin_password)) {
    echo json_encode(["success" => false, "message" => "Password must contain at least one number."]);
    exit;
}

if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\\\|,.<>\/?]/', $admin_password)) {
    echo json_encode(["success" => false, "message" => "Password must contain at least one special character."]);
    exit;
}

try {
    // Check if email exists
    $stmt = $pdo->prepare("SELECT id FROM admin_users WHERE email = ?");
    $stmt->execute([$admin_email]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => false, "message" => "This email is already registered."]);
        exit;
    }

    // Hash and insert admin - set is_approved to 0 (pending)
    $hashedPassword = password_hash($admin_password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO admin_users (name, email, password_hash, is_approved) VALUES (?, ?, ?, 0)");
    
    if ($stmt->execute([$admin_name, $admin_email, $hashedPassword])) {
        // Set session variables after successful signup
        $admin_id = $pdo->lastInsertId();
        $_SESSION['admin_id'] = $admin_id;
        $_SESSION['admin_name'] = $admin_name;
        $_SESSION['admin_email'] = $admin_email;
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['pending_approval'] = true; // New admin needs approval
        
        echo json_encode(["success" => true, "message" => "Admin account created successfully! Awaiting approval."]);
    } else {
        echo json_encode(["success" => false, "message" => "Database error occurred."]);
    }
    
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>