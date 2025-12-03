<?php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

if (isset($_GET['class_id'])) {
    $class_id = intval($_GET['class_id']);
    
    try {
        $stmt = $pdo->prepare("SELECT teacher_id FROM classes WHERE id = ?");
        $stmt->execute([$class_id]);
        $class = $stmt->fetch();
        
        echo json_encode([
            'success' => true,
            'teacher_id' => $class ? $class['teacher_id'] : null
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
        'message' => 'No class ID provided'
    ]);
}
?>