<?php
// admin/php/get_admin_attendance.php
header('Content-Type: application/json');
require_once 'admin_protect.php';

try {
    require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';
    
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
        $sql = "SELECT a.student_id, a.status
                FROM attendance a
                JOIN students s ON a.student_id = s.id
                WHERE s.class_id = ? AND a.attendance_date = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$class_id, $date]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Class ID is required']);
        exit;
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
    error_log("Database error in get_admin_attendance.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error'
    ]);
} catch (Exception $e) {
    error_log("Error in get_admin_attendance.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching attendance'
    ]);
}
?>