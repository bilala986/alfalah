<?php
// admin/php/get_classes_for_admin.php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

try {
    // Fetch all active classes with teacher information
    $stmt = $pdo->prepare("
        SELECT 
            c.id,
            c.class_name,
            c.year_group,
            c.program,
            c.gender,
            tu.name as teacher_name,
            tu.id as teacher_id,
            COUNT(s.id) as student_count
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
    error_log("get_classes_for_admin.php error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>