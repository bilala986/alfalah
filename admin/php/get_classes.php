<?php
// admin/php/get_classes.php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->prepare("
        SELECT 
            c.id as class_id,
            c.class_name,
            c.year_group,
            c.program,
            tu.name as teacher_name,
            tu.id as teacher_id,
            COUNT(s.id) as student_count,
            GROUP_CONCAT(
                CONCAT(s.student_first_name, ' ', s.student_last_name) 
                ORDER BY s.student_first_name, s.student_last_name
                SEPARATOR ', '
            ) as student_names
        FROM classes c
        LEFT JOIN teacher_users tu ON c.teacher_id = tu.id
        LEFT JOIN students s ON c.id = s.class_id AND s.status = 'active'
        WHERE c.status = 'active'
        GROUP BY c.id
        ORDER BY c.year_group, c.class_name
    ");
    $stmt->execute();
    $classes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'classes' => $classes
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>