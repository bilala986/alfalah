<?php
// admin/php/edit_teacher.php - UPDATED FOR CLASSES
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if teacher_id is set
    if (!isset($_POST['teacher_id'])) {
        echo json_encode(["success" => false, "message" => "Teacher ID is required"]);
        exit;
    }
    
    // Update teacher details
    $teacher_id = intval($_POST['teacher_id']);
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    
    // Handle classes assignment
    $classes = [];
    if (isset($_POST['classes']) && is_array($_POST['classes'])) {
        // Validate each class exists
        foreach ($_POST['classes'] as $class_id) {
            $class_id_int = intval($class_id);
            if ($class_id_int > 0) {
                $classes[] = $class_id_int;
            }
        }
    }
    
    // Properly check checkbox value
    $is_approved = (!empty($_POST['is_approved']) && $_POST['is_approved'] == '1') ? 1 : 0;
    
    // Validate inputs
    if (empty($name) || empty($email)) {
        echo json_encode(["success" => false, "message" => "Name and email are required"]);
        exit;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["success" => false, "message" => "Invalid email format"]);
        exit;
    }
    
    try {
        // Check if email already exists for another teacher
        $stmt = $pdo->prepare("SELECT id FROM teacher_users WHERE email = ? AND id != ?");
        $stmt->execute([$email, $teacher_id]);
        
        if ($stmt->fetch()) {
            echo json_encode(["success" => false, "message" => "Email already exists"]);
            exit;
        }
        
        // Start transaction
        $pdo->beginTransaction();
        
        // Update teacher basic info
        $stmt = $pdo->prepare("UPDATE teacher_users SET name = ?, email = ?, is_approved = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$name, $email, $is_approved, $teacher_id]);
        
        // First, get list of classes this teacher is currently assigned to
        $stmt = $pdo->prepare("SELECT id FROM classes WHERE teacher_id = ?");
        $stmt->execute([$teacher_id]);
        $current_classes = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
        
        // Remove teacher from all current classes
        $stmt = $pdo->prepare("UPDATE classes SET teacher_id = NULL WHERE teacher_id = ?");
        $stmt->execute([$teacher_id]);
        
        // ALSO: Remove teacher assignment from students in those classes
        if (!empty($current_classes)) {
            $placeholders = str_repeat('?,', count($current_classes) - 1) . '?';
            $stmt = $pdo->prepare("UPDATE students SET teacher_id = NULL WHERE class_id IN ($placeholders)");
            $stmt->execute($current_classes);
        }
        
        // Assign teacher to selected classes
        if (!empty($classes)) {
            $placeholders = str_repeat('?,', count($classes) - 1) . '?';
            $stmt = $pdo->prepare("UPDATE classes SET teacher_id = ? WHERE id IN ($placeholders)");
            $stmt->execute(array_merge([$teacher_id], $classes));
            
            // Update students in these classes to have this teacher
            $stmt = $pdo->prepare("UPDATE students SET teacher_id = ? WHERE class_id IN ($placeholders)");
            $stmt->execute(array_merge([$teacher_id], $classes));
        }
        
        // Commit transaction
        $pdo->commit();
        
        echo json_encode([
            "success" => true, 
            "message" => "Teacher updated successfully",
            "data" => [
                "is_approved" => $is_approved,
                "classes" => $classes,
                "removed_from_classes" => $current_classes
            ]
        ]);
        
    } catch (PDOException $e) {
        // Rollback on error
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log("Edit teacher error: " . $e->getMessage());
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
    
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
}
?>