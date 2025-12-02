<?php
// admin/php/update_class_details.php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $class_id = intval($_POST['class_id'] ?? 0);
    $class_name = trim($_POST['class_name'] ?? '');
    $year_group = trim($_POST['year_group'] ?? '');
    $program = trim($_POST['program'] ?? '');
    $gender = trim($_POST['gender'] ?? 'Mixed');
    $teacher_id = !empty($_POST['teacher_id']) ? intval($_POST['teacher_id']) : null;
    
    // Validate required fields
    if (empty($class_id) || empty($class_name) || empty($year_group) || empty($program)) {
        echo json_encode(["success" => false, "message" => "All required fields must be filled"]);
        exit;
    }
    
    try {
        // Check if class exists
        $stmt = $pdo->prepare("SELECT id FROM classes WHERE id = ? AND status = 'active'");
        $stmt->execute([$class_id]);
        
        if (!$stmt->fetch()) {
            echo json_encode(["success" => false, "message" => "Class not found"]);
            exit;
        }
        
        // Check if new class name already exists (excluding current class)
        $stmt = $pdo->prepare("SELECT id FROM classes WHERE class_name = ? AND id != ? AND status = 'active'");
        $stmt->execute([$class_name, $class_id]);
        
        if ($stmt->fetch()) {
            echo json_encode(["success" => false, "message" => "A class with this name already exists"]);
            exit;
        }
        
        // Update the class
        $stmt = $pdo->prepare("UPDATE classes SET class_name = ?, year_group = ?, program = ?, gender = ?, teacher_id = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$class_name, $year_group, $program, $gender, $teacher_id, $class_id]);
        
        // If teacher changed, update students in this class
        if ($teacher_id !== null) {
            $updateStudents = $pdo->prepare("UPDATE students SET teacher_id = ? WHERE class_id = ?");
            $updateStudents->execute([$teacher_id, $class_id]);
        }
        
        echo json_encode([
            "success" => true, 
            "message" => "Class updated successfully"
        ]);
        
    } catch (PDOException $e) {
        error_log("Update class details error: " . $e->getMessage());
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
}
?>