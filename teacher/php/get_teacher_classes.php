<?php
header('Content-Type: application/json');
require_once 'teacher_protect.php';

try {
    require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';
    
    $teacher_id = $_SESSION['teacher_id'];
    
    $sql = "SELECT id, class_name, year_group, program 
            FROM classes 
            WHERE teacher_id = ? AND status = 'active'
            ORDER BY class_name";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$teacher_id]);
    $classes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'classes' => $classes
    ]);
    
} catch (PDOException $e) {
    error_log("Database error in get_teacher_classes.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error'
    ]);
} catch (Exception $e) {
    error_log("Error in get_teacher_classes.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching classes'
    ]);
}
?>