<?php
header('Content-Type: application/json');
require_once 'teacher_protect.php';

try {
    require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';
    
    $teacher_id = $_SESSION['teacher_id'];
    $class_id = isset($_GET['class_id']) ? (int)$_GET['class_id'] : null;
    $month = isset($_GET['month']) ? $_GET['month'] : date('Y-m');
    
    // Validate month format
    if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid month format. Use YYYY-MM'
        ]);
        exit;
    }
    
    $start_date = $month . '-01';
    $end_date = date('Y-m-t', strtotime($start_date));
    
    if ($class_id) {
        $sql = "SELECT a.student_id, a.attendance_date, a.status,
                       CONCAT(s.student_first_name, ' ', s.student_last_name) as student_name,
                       c.class_name
                FROM attendance a
                JOIN students s ON a.student_id = s.id
                JOIN classes c ON s.class_id = c.id
                WHERE a.teacher_id = ? AND s.class_id = ? 
                  AND a.attendance_date BETWEEN ? AND ?
                ORDER BY a.attendance_date, s.student_first_name";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$teacher_id, $class_id, $start_date, $end_date]);
    } else {
        $sql = "SELECT a.student_id, a.attendance_date, a.status,
                       CONCAT(s.student_first_name, ' ', s.student_last_name) as student_name,
                       c.class_name
                FROM attendance a
                JOIN students s ON a.student_id = s.id
                JOIN classes c ON s.class_id = c.id
                WHERE a.teacher_id = ? AND a.attendance_date BETWEEN ? AND ?
                ORDER BY c.class_name, a.attendance_date, s.student_first_name";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$teacher_id, $start_date, $end_date]);
    }
    
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Organize by student
    $organized = [];
    foreach ($records as $record) {
        $student_id = $record['student_id'];
        $date = date('d', strtotime($record['attendance_date']));
        
        if (!isset($organized[$student_id])) {
            $organized[$student_id] = [
                'student_id' => $student_id,
                'student_name' => $record['student_name'],
                'class_name' => $record['class_name'],
                'attendance' => []
            ];
        }
        
        $organized[$student_id]['attendance'][$date] = $record['status'];
    }
    
    // Convert to indexed array
    $result = array_values($organized);
    
    echo json_encode([
        'success' => true,
        'month' => $month,
        'data' => $result
    ]);
    
} catch (PDOException $e) {
    error_log("Database error in get_monthly_attendance.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error'
    ]);
} catch (Exception $e) {
    error_log("Error in get_monthly_attendance.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching monthly attendance'
    ]);
}
?>