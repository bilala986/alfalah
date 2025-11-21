<?php
// admin/php/edit_admin.php
session_start();

// Set proper headers for JSON response
header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Simple session check
if (!isset($_SESSION['admin_id'])) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Access denied: Not logged in"]);
    exit;
}

try {
    // Try to include files with error handling
    $docRoot = $_SERVER['DOCUMENT_ROOT'];
    
    // Check if files exist
    $dbFile = $docRoot . '/alfalah/php/db_connect.php';
    $securityFile = $docRoot . '/alfalah/php/security_functions.php';
    
    if (!file_exists($dbFile)) {
        throw new Exception("Database file not found: " . $dbFile);
    }
    
    if (!file_exists($securityFile)) {
        throw new Exception("Security file not found: " . $securityFile);
    }
    
    require_once $dbFile;
    require_once $securityFile;

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Check if admin_id is set
        if (!isset($_POST['admin_id'])) {
            echo json_encode(["success" => false, "message" => "Admin ID is required"]);
            exit;
        }
        
        // Update admin details
        $admin_id = intval($_POST['admin_id']);
        $name = trim($_POST['name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $is_approved = isset($_POST['is_approved']) ? 1 : 0;
        
        // Validate inputs
        if (empty($name) || empty($email)) {
            echo json_encode(["success" => false, "message" => "Name and email are required"]);
            exit;
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(["success" => false, "message" => "Invalid email format"]);
            exit;
        }
        
        // Check if email already exists for another admin
        $stmt = $pdo->prepare("SELECT id FROM admin_users WHERE email = ? AND id != ?");
        $stmt->execute([$email, $admin_id]);
        
        if ($stmt->fetch()) {
            echo json_encode(["success" => false, "message" => "Email already exists"]);
            exit;
        }
        
        // Update admin
        $stmt = $pdo->prepare("UPDATE admin_users SET name = ?, email = ?, is_approved = ? WHERE id = ?");
        $stmt->execute([$name, $email, $is_approved, $admin_id]);
        
        echo json_encode(["success" => true, "message" => "Admin updated successfully"]);
        exit;
    }

    // If no valid method or parameters
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid request"]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
?>