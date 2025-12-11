<?php
header('Content-Type: application/json');
require_once 'teacher_protect.php';

try {
    require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';
    
    $teacher_id = $_SESSION['teacher_id'];
    $class_id = isset($_GET['class_id']) ? (int)$_GET['class_id'] : null;
    $date = isset($_GET['date']) ? $_GET['date'] : null;
    
    if (!$date) {
        echo json_encode(['success' => false, 'message' => 'Date is required']);
        exit;
    }
    
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        echo json_encode(['success' => false, 'message' => 'Invalid date format']);
        exit;
    }
    
    if ($class_id) {
        $sql = "SELECT a.id, a.student_id, a.status, a.attendance_date,
                       s.student_first_name, s.student_last_name,
                       c.class_name
                FROM attendance a
                JOIN students s ON a.student_id = s.id
                JOIN classes c ON s.class_id = c.id
                WHERE a.teacher_id = ? AND s.class_id = ? AND a.attendance_date = ?
                ORDER BY s.student_first_name, s.student_last_name";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$teacher_id, $class_id, $date]);
    } else {
        $sql = "SELECT a.id, a.student_id, a.status, a.attendance_date,
                       s.student_first_name, s.student_last_name,
                       c.class_name
                FROM attendance a
                JOIN students s ON a.student_id = s.id
                JOIN classes c ON s.class_id = c.id
                WHERE a.teacher_id = ? AND a.attendance_date = ?
                ORDER BY c.class_name, s.student_first_name, s.student_last_name";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$teacher_id, $date]);
    }
    
    $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $attendanceMap = [];
    foreach ($attendance as $record) {
        $attendanceMap[$record['student_id']] = $record['status'];
    }
    
    echo json_encode([
        'success' => true,
        'attendance' => $attendanceMap
    ]);
    
} catch (PDOException $e) {
    error_log("Database error in get_attendance.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error'
    ]);
} catch (Exception $e) {
    error_log("Error in get_attendance.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching attendance'
    ]);
}
?>