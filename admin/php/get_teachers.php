<?php
// admin/php/get_teachers.php - UPDATED WITHOUT YEAR GROUPS/PROGRAMS
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

try {
    // Simple query to get only teacher data
    $stmt = $pdo->prepare("
        SELECT 
            id,
            name,
            email,
            is_approved,
            last_login,
            created_at,
            updated_at
        FROM teacher_users 
        ORDER BY created_at DESC
    ");
    $stmt->execute();
    $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // For each teacher, fetch their assigned classes
    foreach ($teachers as &$teacher) {
        $classStmt = $pdo->prepare("
            SELECT class_name 
            FROM classes 
            WHERE teacher_id = ? AND status = 'active' 
            ORDER BY class_name
        ");
        $classStmt->execute([$teacher['id']]);
        $teacher['classes'] = $classStmt->fetchAll(PDO::FETCH_COLUMN, 0);
    }
    
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