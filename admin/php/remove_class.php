<?php
// admin/php/remove_class.php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $class_id = intval($_POST['class_id'] ?? 0);
    
    if (empty($class_id)) {
        echo json_encode(["success" => false, "message" => "Class ID is required"]);
        exit;
    }
    
    try {
        // Start transaction
        $pdo->beginTransaction();
        
        // 1. Remove class assignment from all students in this class
        $updateStudents = $pdo->prepare("UPDATE students SET class_id = NULL WHERE class_id = ?");
        $updateStudents->execute([$class_id]);
        
        // Note: Teachers are not directly affected since classes table references teachers
        // The teacher_id in classes will be set to NULL on delete
        
        // 2. Remove the class (set status to inactive instead of deleting)
        $removeClass = $pdo->prepare("UPDATE classes SET status = 'inactive', teacher_id = NULL, updated_at = NOW() WHERE id = ?");
        $removeClass->execute([$class_id]);
        
        // 3. Get count of affected students for logging
        $affectedStudents = $updateStudents->rowCount();
        
        // Commit transaction
        $pdo->commit();
        
        echo json_encode([
            "success" => true, 
            "message" => "Class removed successfully. {$affectedStudents} students were unassigned from this class."
        ]);
        
    } catch (PDOException $e) {
        // Rollback on error
        $pdo->rollBack();
        error_log("Remove class error: " . $e->getMessage());
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
}
?>