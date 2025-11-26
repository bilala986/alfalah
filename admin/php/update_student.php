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

        // Debug logging
        error_log("Student update: ID {$student_id}, Teacher ID: {$teacher_id}");

        // Verify the update worked
        $checkStmt = $pdo->prepare("SELECT teacher_id FROM students WHERE id = ?");
        $checkStmt->execute([$student_id]);
        $result = $checkStmt->fetch();
        error_log("Verified teacher_id: " . $result['teacher_id']);
        
        echo json_encode([
            'success' => true,
            'message' => 'Student updated successfully'
        ]);
        
    } catch (PDOException $e) {
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