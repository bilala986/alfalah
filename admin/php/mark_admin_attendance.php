<?php
// admin/php/mark_admin_attendance.php - ADMIN VERSION (can modify any attendance)
header('Content-Type: application/json');
require_once 'admin_protect.php';

try {
    require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';
    
    // Admin can always modify attendance
    $admin_id = $_SESSION['admin_id'];
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $student_id = isset($_POST['student_id']) ? (int)$_POST['student_id'] : 0;
        $class_id = isset($_POST['class_id']) ? (int)$_POST['class_id'] : null;
        $status = isset($_POST['status']) ? trim($_POST['status']) : null;
        $date = isset($_POST['date']) ? trim($_POST['date']) : null;
        
        if (!$student_id || !$date) {
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
        
        // Check if record exists
        $sql = "SELECT id, teacher_id FROM attendance WHERE student_id = ? AND attendance_date = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$student_id, $date]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Handle "remove" status (clear attendance)
        if ($status === 'remove') {
            if ($existing) {
                // Delete existing record
                $sql = "DELETE FROM attendance WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $success = $stmt->execute([$existing['id']]);
                
                if ($success) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Attendance record removed successfully'
                    ]);
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Failed to remove attendance'
                    ]);
                }
            } else {
                // No record to remove - still successful
                echo json_encode([
                    'success' => true,
                    'message' => 'No attendance record to remove'
                ]);
            }
            exit;
        }
        
        // Validate regular status
        $valid_statuses = ['Present', 'Absent', 'Late', 'Excused'];
        if (!in_array($status, $valid_statuses)) {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid status'
            ]);
            exit;
        }
        
        if ($existing) {
            // Update existing record - admin can override any teacher's record
            $sql = "UPDATE attendance 
                    SET status = ?, teacher_id = ?, class_id = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $success = $stmt->execute([$status, $existing['teacher_id'], $class_id, $existing['id']]);
        } else {
            // Insert new record with the original teacher if exists, otherwise use admin
            // Get student's teacher_id
            $sql = "SELECT teacher_id FROM students WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$student_id]);
            $student = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $teacher_id = $student['teacher_id'] ?: $admin_id;
            
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
    error_log("Database error in mark_admin_attendance.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Error in mark_admin_attendance.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error saving attendance'
    ]);
}
?>