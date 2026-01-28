<?php
// admin/php/bulk_assign_students.php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $class_id = isset($_POST['class_id']) ? intval($_POST['class_id']) : 0;
    $remove_existing = isset($_POST['remove_existing']) && $_POST['remove_existing'] === '1';
    $student_ids_json = $_POST['student_ids'] ?? '[]';
    
    // Decode student IDs from JSON
    $student_ids = json_decode($student_ids_json, true);
    
    // Validate inputs
    if (empty($class_id)) {
        echo json_encode([
            'success' => false,
            'message' => 'Class ID is required'
        ]);
        exit;
    }
    
    if (!is_array($student_ids) || empty($student_ids)) {
        echo json_encode([
            'success' => false,
            'message' => 'No students selected'
        ]);
        exit;
    }
    
    try {
        // Start transaction
        $pdo->beginTransaction();
        
        // Get teacher from class
        $classStmt = $pdo->prepare("SELECT teacher_id FROM classes WHERE id = ?");
        $classStmt->execute([$class_id]);
        $class = $classStmt->fetch();
        $teacher_id = $class ? $class['teacher_id'] : null;
        
        // Prepare the update statement
        if ($remove_existing) {
            // Remove from existing classes first (set class_id and teacher_id to NULL)
            $removeStmt = $pdo->prepare("UPDATE students SET class_id = NULL, teacher_id = NULL WHERE id = ?");
            foreach ($student_ids as $student_id) {
                $removeStmt->execute([intval($student_id)]);
            }
        }
        
        // Assign to new class
        $updateStmt = $pdo->prepare("UPDATE students SET class_id = ?, teacher_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $updated_count = 0;
        
        foreach ($student_ids as $student_id) {
            $student_id_int = intval($student_id);
            if ($student_id_int > 0) {
                $updateStmt->execute([$class_id, $teacher_id, $student_id_int]);
                $updated_count++;
            }
        }
        
        // Commit transaction
        $pdo->commit();
        
        // Get class name for message
        $classNameStmt = $pdo->prepare("SELECT class_name FROM classes WHERE id = ?");
        $classNameStmt->execute([$class_id]);
        $class_data = $classNameStmt->fetch();
        $class_name = $class_data ? $class_data['class_name'] : 'the selected class';
        
        echo json_encode([
            'success' => true,
            'message' => "Successfully assigned {$updated_count} student(s) to {$class_name}",
            'updated_count' => $updated_count
        ]);
        
    } catch (PDOException $e) {
        // Rollback on error
        $pdo->rollBack();
        error_log("Bulk assign students error: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
}
?>