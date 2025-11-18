<?php
// admin/php/admin_login.php
session_start();
header('Content-Type: application/json');

// Include database connection
require_once '../../php/db_connect.php';

$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

// Basic validation
if (empty($email) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Please fill out all fields."]);
    exit;
}

try {
    // Check if admin exists and is active
    $stmt = $pdo->prepare("SELECT id, name, email, password_hash FROM admin_users WHERE email = ? AND is_active = 1");
    $stmt->execute([$email]);
    $admin = $stmt->fetch();
    
    if ($admin && password_verify($password, $admin['password_hash'])) {
        // Update last login
        $updateStmt = $pdo->prepare("UPDATE admin_users SET last_login = NOW() WHERE id = ?");
        $updateStmt->execute([$admin['id']]);
        
        // Set session
        $_SESSION['admin_id'] = $admin['id'];
        $_SESSION['admin_name'] = $admin['name'];
        $_SESSION['admin_email'] = $admin['email'];
        $_SESSION['admin_logged_in'] = true;
        
        echo json_encode(["success" => true, "message" => "Login successful!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid email or password."]);
    }
    
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>