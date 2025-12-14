<?php
// admin/php/get_students_for_class.php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

try {
    $class_id = isset($_GET['class_id']) ? (int)$_GET['class_id'] : null;
    
    if (!$class_id) {
        echo json_encode(['success' => false, 'message' => 'Class ID is required']);
        exit;
    }
    
    $stmt = $pdo->prepare("
        SELECT 
            s.id,
            s.admission_id, 
            CONCAT(s.student_first_name, ' ', s.student_last_name) as full_name,
            s.year_group,
            s.class_id
        FROM students s
        WHERE s.class_id = ? AND s.status = 'active'
        ORDER BY s.student_first_name, s.student_last_name
    ");
    $stmt->execute([$class_id]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'students' => $students
    ]);
} catch (PDOException $e) {
    error_log("get_students_for_class.php error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>