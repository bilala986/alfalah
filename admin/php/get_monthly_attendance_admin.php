<?php
// admin/php/get_monthly_attendance_admin.php
header('Content-Type: application/json');
require_once 'admin_protect.php';

try {
    require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';
    
    $start_date = isset($_GET['start_date']) ? $_GET['start_date'] : null;
    $end_date = isset($_GET['end_date']) ? $_GET['end_date'] : null;
    $class_id = isset($_GET['class_id']) ? (int)$_GET['class_id'] : null;
    
    if (!$start_date || !$end_date) {
        echo json_encode(['success' => false, 'message' => 'Start and end dates are required']);
        exit;
    }
    
    if (!$class_id) {
        echo json_encode(['success' => false, 'message' => 'Class ID is required']);
        exit;
    }
    
    // Build query
    $sql = "SELECT a.student_id, a.status, DATE(a.attendance_date) as date
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            WHERE s.class_id = ? 
            AND a.attendance_date BETWEEN ? AND ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$class_id, $start_date, $end_date]);
    
    $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Organize data by student_id -> date -> status
    $attendanceMap = [];
    foreach ($attendance as $record) {
        if (!isset($attendanceMap[$record['student_id']])) {
            $attendanceMap[$record['student_id']] = [];
        }
        $attendanceMap[$record['student_id']][$record['date']] = $record['status'];
    }
    
    echo json_encode([
        'success' => true,
        'attendance' => $attendanceMap
    ]);
    
} catch (PDOException $e) {
    error_log("Database error in get_monthly_attendance_admin.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error'
    ]);
} catch (Exception $e) {
    error_log("Error in get_monthly_attendance_admin.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching monthly attendance'
    ]);
}
?>