<?php
// admin/php/get_students_by_class.php
header('Content-Type: application/json');
require_once 'admin_protect.php';

try {
    require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';
    
    $class_id = isset($_GET['class_id']) ? (int)$_GET['class_id'] : null;
    
    if (!$class_id) {
        echo json_encode(['success' => false, 'message' => 'Class ID is required']);
        exit;
    }
    
    $sql = "SELECT s.id, 
                   s.admission_id, 
                   CONCAT(s.student_first_name, ' ', s.student_last_name) as full_name,
                   s.year_group,
                   c.class_name,
                   s.class_id
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
            WHERE s.class_id = ? AND s.status = 'active'
            ORDER BY s.student_first_name, s.student_last_name";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$class_id]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'students' => $students
    ]);
    
} catch (PDOException $e) {
    error_log("Database error in get_students_by_class.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error'
    ]);
} catch (Exception $e) {
    error_log("Error in get_students_by_class.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching students'
    ]);
}
?>