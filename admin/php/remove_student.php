<?php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['student_id'])) {
    $student_id = intval($_POST['student_id']);
    
    try {
        $stmt = $pdo->prepare("UPDATE students SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$student_id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Student removed successfully'
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