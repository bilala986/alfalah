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

        // Commit operation
        $pdo->commit();
        
        $message = 'Student updated successfully';
        if (!empty($teacher_id)) {
            $message .= ' and teacher assigned';
        }
        
        echo json_encode([
            'success' => true,
            'message' => $message,
            'teacher_assigned' => (!empty($teacher_id))
        ]);
        
    } catch (PDOException $e) {
        // Rollback if operation fails
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