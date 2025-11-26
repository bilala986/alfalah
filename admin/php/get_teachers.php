<?php
// admin/php/get_teachers.php - UPDATED WITHOUT STUDENT DATA
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

try {
    // Simplified query without student data
    $stmt = $pdo->prepare("
        SELECT 
            tu.id,
            tu.name,
            tu.email,
            tu.year_group,
            tu.program,
            tu.is_approved,
            tu.last_login,
            tu.created_at
        FROM teacher_users tu
        ORDER BY tu.created_at DESC
    ");
    $stmt->execute();
    $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'teachers' => $teachers
    ]);
} catch (PDOException $e) {
    error_log("get_teachers.php error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>