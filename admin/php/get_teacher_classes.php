<?php
// admin/php/get_teacher_classes.php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

if (isset($_GET['teacher_id'])) {
    $teacher_id = intval($_GET['teacher_id']);
    
    try {
        $stmt = $pdo->prepare("SELECT id FROM classes WHERE teacher_id = ? AND status = 'active'");
        $stmt->execute([$teacher_id]);
        $classes = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
        
        echo json_encode([
            'success' => true,
            'classes' => $classes
        ]);
    } catch (PDOException $e) {
        error_log("get_teacher_classes.php error: " . $e->getMessage());
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