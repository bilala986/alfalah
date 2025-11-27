<?php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['student_id'])) {
    $student_id = intval($_POST['student_id']);
    $first_name = $_POST['first_name'] ?? '';
    $last_name = $_POST['last_name'] ?? '';
    $age = $_POST['age'] ?? null;
    $program = $_POST['program'] ?? '';
    $year_group = $_POST['year_group'] ?? '';
    $teacher_id = $_POST['teacher_id'] ?? null;
    
    try {
        // Start transaction
        $pdo->beginTransaction();
        
        // First, get the admission_id before updating
        $getStmt = $pdo->prepare("SELECT admission_id FROM students WHERE id = ?");
        $getStmt->execute([$student_id]);
        $student = $getStmt->fetch();
        $admission_id = $student['admission_id'] ?? null;
        
        // Update student with teacher assignment
        $stmt = $pdo->prepare("UPDATE students SET 
            student_first_name = ?,
            student_last_name = ?,
            student_age = ?,
            interested_program = ?,
            year_group = ?,
            teacher_id = ?,
            updated_at = CURRENT_TIMESTAMP
            WHERE id = ?");
        $stmt->execute([$first_name, $last_name, $age, $program, $year_group, $teacher_id, $student_id]);

        // If teacher is assigned (not empty/null), remove the admission_id link instead of deleting
        if (!empty($teacher_id) && !empty($admission_id)) {
            // OPTION 1: Set admission_id to NULL to break the link
            $unlinkStmt = $pdo->prepare("UPDATE students SET admission_id = NULL WHERE id = ?");
            $unlinkStmt->execute([$student_id]);
            
            // THEN delete the application
            $deleteStmt = $pdo->prepare("DELETE FROM initial_admission WHERE id = ?");
            $deleteStmt->execute([$admission_id]);
            
            error_log("Application {$admission_id} deleted - Teacher {$teacher_id} assigned to student {$student_id} (link broken)");
        }
        
        // Commit both operations
        $pdo->commit();
        
        $message = 'Student updated successfully';
        if (!empty($teacher_id) && !empty($admission_id)) {
            $message .= ' and application removed from admissions';
        }
        
        echo json_encode([
            'success' => true,
            'message' => $message,
            'application_removed' => (!empty($teacher_id) && !empty($admission_id))
        ]);
        
    } catch (PDOException $e) {
        // Rollback if any operation fails
        $pdo->rollBack();
        echo json_encode([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request'
    ]);
}
?>