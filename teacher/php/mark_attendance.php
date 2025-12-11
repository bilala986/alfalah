<?php
// teacher/php/mark_attendance.php - ADD DEBUG LOGGING
header('Content-Type: application/json');
require_once 'teacher_protect.php';

try {
    require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';
    
    // Debug: Log the request
    error_log("mark_attendance.php called - POST data: " . print_r($_POST, true));
    
    // Check if teacher is approved
    if (isset($_SESSION['pending_approval']) && $_SESSION['pending_approval']) {
        echo json_encode([
            'success' => false,
            'message' => 'Your account is pending approval. Cannot modify attendance.',
            'requires_approval' => true
        ]);
        exit;
    }
    
    $teacher_id = $_SESSION['teacher_id'];
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $student_id = isset($_POST['student_id']) ? (int)$_POST['student_id'] : 0;
        $class_id = isset($_POST['class_id']) ? (int)$_POST['class_id'] : null;
        $status = isset($_POST['status']) ? trim($_POST['status']) : null;
        $date = isset($_POST['date']) ? trim($_POST['date']) : null;
        
        // Debug
        error_log("Saving attendance - Student: $student_id, Status: $status, Date: $date");
        
        if (!$student_id || !$date || !$status) {
            error_log("Missing required fields - Student: $student_id, Status: $status, Date: $date");
            echo json_encode([
                'success' => false,
                'message' => 'Missing required fields'
            ]);
            exit;
        }
        
        // Validate status
        $valid_statuses = ['Present', 'Absent', 'Late', 'Excused'];
        if (!in_array($status, $valid_statuses)) {
            error_log("Invalid status: $status");
            echo json_encode([
                'success' => false,
                'message' => 'Invalid status'
            ]);
            exit;
        }
        
        // Validate date format
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            error_log("Invalid date format: $date");
            echo json_encode([
                'success' => false,
                'message' => 'Invalid date format'
            ]);
            exit;
        }
        
        // Check if record exists
        $sql = "SELECT id FROM attendance WHERE student_id = ? AND attendance_date = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$student_id, $date]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existing) {
            // Update existing record
            $sql = "UPDATE attendance 
                    SET status = ?, teacher_id = ?, class_id = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $success = $stmt->execute([$status, $teacher_id, $class_id, $existing['id']]);
            error_log("Updated existing record ID: " . $existing['id'] . " - Success: " . ($success ? 'Yes' : 'No'));
        } else {
            // Insert new record
            $sql = "INSERT INTO attendance (student_id, class_id, teacher_id, status, attendance_date) 
                    VALUES (?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $success = $stmt->execute([$student_id, $class_id, $teacher_id, $status, $date]);
            $lastId = $pdo->lastInsertId();
            error_log("Inserted new record ID: $lastId - Success: " . ($success ? 'Yes' : 'No'));
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
                'message' => 'Failed to save attendance: ' . ($errorInfo[2] ?? 'Unknown error')
            ]);
        }
        
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid request method'
        ]);
    }
    
} catch (PDOException $e) {
    error_log("Database error in mark_attendance.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Error in mark_attendance.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error saving attendance'
    ]);
}
?>