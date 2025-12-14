<?php
// admin/php/mark_attendance_admin.php
header('Content-Type: application/json');
require_once 'admin_protect.php';

try {
    require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $student_id = isset($_POST['student_id']) ? (int)$_POST['student_id'] : 0;
        $class_id = isset($_POST['class_id']) ? (int)$_POST['class_id'] : null;
        $teacher_id = isset($_POST['teacher_id']) ? (int)$_POST['teacher_id'] : null;
        $status = isset($_POST['status']) ? trim($_POST['status']) : null;
        $date = isset($_POST['date']) ? trim($_POST['date']) : null;
        
        if (!$student_id || !$date || !$status) {
            echo json_encode([
                'success' => false,
                'message' => 'Missing required fields'
            ]);
            exit;
        }
        
        // Validate date format
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid date format'
            ]);
            exit;
        }
        
        // Validate status
        $valid_statuses = ['Present', 'Absent', 'Late', 'Excused'];
        if (!in_array($status, $valid_statuses)) {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid status'
            ]);
            exit;
        }
        
        // Check if record exists
        $sql = "SELECT id FROM attendance WHERE student_id = ? AND attendance_date = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$student_id, $date]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Get admin ID from session
        $admin_id = $_SESSION['admin_id'] ?? null;
        
        if ($existing) {
            // Update existing record
            $sql = "UPDATE attendance 
                    SET status = ?, class_id = ?, teacher_id = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $success = $stmt->execute([$status, $class_id, $teacher_id, $existing['id']]);
        } else {
            // Insert new record
            $sql = "INSERT INTO attendance (student_id, class_id, teacher_id, status, attendance_date) 
                    VALUES (?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $success = $stmt->execute([$student_id, $class_id, $teacher_id, $status, $date]);
        }
        
        if ($success) {
            echo json_encode([
                'success' => true,
                'message' => 'Attendance saved successfully'
            ]);
        } else {
            $errorInfo = $stmt->errorInfo();
            error_log("Database error: " . print_r($errorInfo, true));
            echo json_encode([
                'success' => false,
                'message' => 'Failed to save attendance'
            ]);
        }
        
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid request method'
        ]);
    }
    
} catch (PDOException $e) {
    error_log("Database error in mark_attendance_admin.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Error in mark_attendance_admin.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error saving attendance'
    ]);
}
?>