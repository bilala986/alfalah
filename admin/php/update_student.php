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
    $class_id = $_POST['class_id'] ?? null;
    $teacher_id = $_POST['teacher_id'] ?? null;
    
    try {
        // Start transaction
        $pdo->beginTransaction();
        
        // If class is assigned, get teacher from class if teacher_id is not provided
        if (!empty($class_id)) {
            $classStmt = $pdo->prepare("SELECT teacher_id FROM classes WHERE id = ?");
            $classStmt->execute([$class_id]);
            $class = $classStmt->fetch();

            // Set teacher_id from class (even if it's NULL - classes can have no teacher)
            $teacher_id = $class ? $class['teacher_id'] : null;
        } else {
            // If no class is selected, student should not have a teacher
            $teacher_id = null;
        }
        
        // Update student with class and teacher assignment
        $stmt = $pdo->prepare("UPDATE students SET 
            student_first_name = ?,
            student_last_name = ?,
            student_age = ?,
            interested_program = ?,
            year_group = ?,
            class_id = ?,
            teacher_id = ?,
            updated_at = CURRENT_TIMESTAMP
            WHERE id = ?");
        $stmt->execute([$first_name, $last_name, $age, $program, $year_group, $class_id, $teacher_id, $student_id]);

        // Commit operation
        $pdo->commit();
        
        $message = 'Student updated successfully';
        if (!empty($class_id)) {
            $message .= ' and assigned to class';
        }
        if (!empty($teacher_id)) {
            $message .= ' with teacher assigned';
        }
        
        echo json_encode([
            'success' => true,
            'message' => $message,
            'teacher_assigned' => (!empty($teacher_id)),
            'class_assigned' => (!empty($class_id))
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