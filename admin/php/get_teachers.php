<?php
// admin/php/get_teachers.php - SIMPLIFIED VERSION WITHOUT STUDENT DATA
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

try {
    // Simple query to get only teacher data without student joins
    $stmt = $pdo->prepare("
        SELECT 
            id,
            name,
            email,
            year_group,
            program,
            is_approved,
            last_login,
            created_at,
            updated_at
        FROM teacher_users 
        ORDER BY created_at DESC
    ");
    $stmt->execute();
    $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Debug: Log what we're returning
    error_log("get_teachers.php returning: " . count($teachers) . " teachers");
    foreach ($teachers as $teacher) {
        error_log("Teacher: " . $teacher['name'] . " - Year Groups: " . $teacher['year_group'] . " - Programs: " . $teacher['program']);
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