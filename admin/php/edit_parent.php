<?php
// admin/php/edit_parent.php
require_once 'admin_protect.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['parent_id'])) {
    $parent_id = intval($_POST['parent_id']);
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $is_approved = isset($_POST['is_approved']) ? 1 : 0;
    
    // Basic validation
    if (empty($name) || empty($email)) {
        echo json_encode([
            'success' => false,
            'message' => 'Name and email are required'
        ]);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("UPDATE parent_users SET name = ?, email = ?, is_approved = ? WHERE id = ?");
        $stmt->execute([$name, $email, $is_approved, $parent_id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Parent updated successfully'
        ]);
        
    } catch (PDOException $e) {
        error_log("Database error in edit_parent.php: " . $e->getMessage());
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