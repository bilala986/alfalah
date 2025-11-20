<?php
// admin/php/admin_signup.php - FORCE NEW SESSIONS PER TAB
session_start();
header('Content-Type: application/json');

// Include database connection
require_once '../../php/db_connect.php';

$admin_name = trim($_POST['admin_name'] ?? '');
$admin_email = trim($_POST['admin_email'] ?? '');
$admin_password = $_POST['admin_password'] ?? '';
$admin_confirm_password = $_POST['admin_confirm_password'] ?? '';
$browser_instance_id = $_POST['browser_instance_id'] ?? '';

// Basic validation
if (empty($admin_name) || empty($admin_email) || empty($admin_password) || empty($admin_confirm_password)) {
    echo json_encode(["success" => false, "message" => "Please fill out all fields."]);
    exit;
}

// ... (keep your existing validation code) ...

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
        $admin_id = $pdo->lastInsertId();
        
        // ALWAYS generate a NEW session ID for signup
        $browser_instance_id = 'a' . bin2hex(random_bytes(16)); // Always new ID on signup
        
        // Use the browser instance ID as session ID
        session_write_close();
        session_id($browser_instance_id);
        session_start();
        
        // Set session variables
        $_SESSION['admin_id'] = $admin_id;
        $_SESSION['admin_name'] = $admin_name;
        $_SESSION['admin_email'] = $admin_email;
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['pending_approval'] = true;
        $_SESSION['login_time'] = time();
        $_SESSION['browser_instance_id'] = $browser_instance_id;
        
        echo json_encode([
            "success" => true, 
            "message" => "Admin account created successfully! Awaiting approval.",
            "browser_instance_id" => $browser_instance_id
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Database error occurred."]);
    }
    
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>