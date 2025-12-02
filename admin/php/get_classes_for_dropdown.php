<?php
// admin/php/get_classes_for_dropdown.php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->prepare("SELECT id, class_name, teacher_id FROM classes WHERE status = 'active' ORDER BY class_name");
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