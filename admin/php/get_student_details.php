<?php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

if (isset($_GET['id'])) {
    $student_id = intval($_GET['id']);
    
    try {
        $stmt = $pdo->prepare("SELECT 
            s.*,
            tu.name as teacher_name,
            tu.id as teacher_id
        FROM students s
        LEFT JOIN teacher_users tu ON s.teacher_id = tu.id
        WHERE s.id = ?");
        $stmt->execute([$student_id]);
        $student = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($student) {
            echo json_encode([
                'success' => true,
                'student' => $student
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Student not found'
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No student ID provided'
    ]);
}
?>