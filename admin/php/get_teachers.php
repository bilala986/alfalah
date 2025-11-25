<?php
// admin/php/get_teachers.php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->prepare("SELECT id, name, email, created_at, last_login, is_approved FROM teacher_users ORDER BY created_at DESC");
    $stmt->execute();
    $teachers = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'teachers' => $teachers
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching teachers: ' . $e->getMessage()
    ]);
}
?>