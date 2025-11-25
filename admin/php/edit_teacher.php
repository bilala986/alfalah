<?php
// admin/php/edit_teacher.php

// Add error handling at the very top
error_reporting(0); // Turn off error display
ini_set('display_errors', 0);

// Set content type first
header('Content-Type: application/json');

try {
    require_once 'admin_protect.php';
    require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Method not allowed");
    }
    
    if (!isset($_POST['teacher_id'])) {
        throw new Exception("Teacher ID is required");
    }
    
    $teacher_id = intval($_POST['teacher_id']);
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $is_approved = (!empty($_POST['is_approved']) && $_POST['is_approved'] == '1') ? 1 : 0;
    
    // Validate inputs
    if (empty($name) || empty($email)) {
        throw new Exception("Name and email are required");
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email format");
    }
    
    // Check if email already exists for another teacher
    $stmt = $pdo->prepare("SELECT id FROM teacher_users WHERE email = ? AND id != ?");
    $stmt->execute([$email, $teacher_id]);
    
    if ($stmt->fetch()) {
        throw new Exception("Email already exists");
    }
    
    // Update teacher
    $stmt = $pdo->prepare("UPDATE teacher_users SET name = ?, email = ?, is_approved = ? WHERE id = ?");
    $stmt->execute([$name, $email, $is_approved, $teacher_id]);
    
    // Check if update was successful
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            "success" => true, 
            "message" => "Teacher updated successfully",
            "data" => [
                "is_approved" => $is_approved
            ]
        ]);
    } else {
        echo json_encode([
            "success" => true, 
            "message" => "No changes made or teacher not found",
            "data" => [
                "is_approved" => $is_approved
            ]
        ]);
    }
    
} catch (PDOException $e) {
    error_log("Edit teacher PDO error: " . $e->getMessage());
    echo json_encode([
        "success" => false, 
        "message" => "Database error occurred"
    ]);
} catch (Exception $e) {
    error_log("Edit teacher error: " . $e->getMessage());
    echo json_encode([
        "success" => false, 
        "message" => $e->getMessage()
    ]);
}
?>