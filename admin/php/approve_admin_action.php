<?php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['admin_id'])) {
    $admin_id = intval($_POST['admin_id']);
    
    try {
        $stmt = $pdo->prepare("UPDATE admin_users SET is_approved = 1 WHERE id = ?");
        $stmt->execute([$admin_id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Admin approved successfully'
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