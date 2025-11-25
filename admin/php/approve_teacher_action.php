<?php
// admin/php/approve_teacher_action.php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['teacher_id'])) {
    $teacher_id = intval($_POST['teacher_id']);
    
    try {
        $stmt = $pdo->prepare("UPDATE teacher_users SET is_approved = 1, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$teacher_id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Teacher approved successfully'
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