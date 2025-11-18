<?php
// admin/php/admin_signup.php
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

if (strlen($admin_password) < 6) {
    echo json_encode(["success" => false, "message" => "Password must be at least 6 characters long."]);
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

    // Hash and insert admin
    $hashedPassword = password_hash($admin_password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO admin_users (name, email, password_hash) VALUES (?, ?, ?)");
    
    if ($stmt->execute([$admin_name, $admin_email, $hashedPassword])) {
        echo json_encode(["success" => true, "message" => "Admin account created successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Database error occurred."]);
    }
    
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>