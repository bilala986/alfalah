<?php
// admin/php/remove_parent.php
require_once 'admin_protect.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['parent_id'])) {
    $parent_id = intval($_POST['parent_id']);
    
    try {
        $stmt = $pdo->prepare("DELETE FROM parent_users WHERE id = ?");
        $stmt->execute([$parent_id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Parent removed successfully'
        ]);
        
    } catch (PDOException $e) {
        error_log("Database error in remove_parent.php: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Database error occurred'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request'
    ]);
}
?>