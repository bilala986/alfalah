<?php
// admin/php/get_teacher_students.php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

if (isset($_GET['teacher_id'])) {
    $teacher_id = intval($_GET['teacher_id']);
    
    try {
        $stmt = $pdo->prepare("
            SELECT id, student_first_name, student_last_name, student_age, year_group, interested_program
            FROM students 
            WHERE teacher_id = ? AND status = 'active'
            ORDER BY student_first_name, student_last_name
        ");
        $stmt->execute([$teacher_id]);
        $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'students' => $students
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No teacher ID provided'
    ]);
}
?>