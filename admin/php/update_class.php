<?php
// admin/php/update_class.php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $class_id = intval($_POST['class_id'] ?? 0);
    $teacher_id = !empty($_POST['teacher_id']) ? intval($_POST['teacher_id']) : null;
    
    if ($class_id === 0) {
        echo json_encode(["success" => false, "message" => "Class ID is required"]);
        exit;
    }
    
    try {
        // Update class with teacher
        $stmt = $pdo->prepare("UPDATE classes SET teacher_id = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$teacher_id, $class_id]);
        
        // If teacher is assigned, update all students in this class
        if (!empty($teacher_id)) {
            $updateStudents = $pdo->prepare("UPDATE students SET teacher_id = ? WHERE class_id = ?");
            $updateStudents->execute([$teacher_id, $class_id]);
        }
        
        echo json_encode([
            "success" => true, 
            "message" => "Class updated successfully"
        ]);
        
    } catch (PDOException $e) {
        error_log("Update class error: " . $e->getMessage());
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
}
?>