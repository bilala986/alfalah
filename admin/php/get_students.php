<?php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->prepare("SELECT 
        s.*,
        ia.student_gender,
        ia.student_dob,
        ia.student_school,
        c.teacher_id as class_teacher_id,  -- Get teacher from class
        tu.name as teacher_name,
        tu.id as teacher_id,
        c.class_name,
        c.teacher_id as class_has_teacher  -- Check if class has teacher
    FROM students s
    LEFT JOIN initial_admission ia ON s.admission_id = ia.id
    LEFT JOIN classes c ON s.class_id = c.id
    LEFT JOIN teacher_users tu ON c.teacher_id = tu.id  -- Join via class, not directly
    WHERE s.status = 'active'
    ORDER BY s.student_first_name, s.student_last_name");
    $stmt->execute();
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
?>