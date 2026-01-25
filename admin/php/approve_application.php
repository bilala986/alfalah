<?php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['application_id'])) {
    $application_id = intval($_POST['application_id']);
    
    // Handle empty values properly - convert empty strings to NULL
    $class_id = isset($_POST['class_id']) && $_POST['class_id'] !== '' ? intval($_POST['class_id']) : null;
    $teacher_id = isset($_POST['teacher_id']) && $_POST['teacher_id'] !== '' ? intval($_POST['teacher_id']) : null;
    
    error_log("Approving application ID: $application_id, Class ID: " . ($class_id ?? 'NULL') . ", Teacher ID: " . ($teacher_id ?? 'NULL'));
    
    try {
        // First, let's check if the application exists
        $checkStmt = $pdo->prepare("SELECT * FROM initial_admission WHERE id = ?");
        $checkStmt->execute([$application_id]);
        $application = $checkStmt->fetch();
        
        if (!$application) {
            error_log("Application not found: $application_id");
            echo json_encode([
                'success' => false,
                'message' => 'Application not found'
            ]);
            exit;
        }
        
        error_log("Application found: " . $application['student_first_name'] . ' ' . $application['student_last_name']);
        
        // Check if student already exists for this application
        $studentCheckStmt = $pdo->prepare("SELECT id FROM students WHERE admission_id = ?");
        $studentCheckStmt->execute([$application_id]);
        $existingStudent = $studentCheckStmt->fetch();
        
        if ($existingStudent) {
            error_log("Student already exists, updating...");
            // Student already exists, just update the application status
            $stmt = $pdo->prepare("UPDATE initial_admission SET status = 'approved', scheduled_for_deletion_at = NULL WHERE id = ?");
            $stmt->execute([$application_id]);
            
            // If class_id is provided, update student's class and teacher
            if ($class_id) {
                error_log("Updating student class to $class_id and teacher to " . ($teacher_id ?? 'NULL'));
                $updateStudentStmt = $pdo->prepare("UPDATE students SET class_id = ?, teacher_id = ? WHERE admission_id = ?");
                $updateStudentStmt->execute([$class_id, $teacher_id, $application_id]);
            }
        } else {
            error_log("Creating new student record...");
            // Create new student record with optional class assignment
            // Use NULL for teacher_id if it's empty (to satisfy foreign key constraint)
            $insertStmt = $pdo->prepare("INSERT INTO students (admission_id, student_first_name, student_last_name, student_age, year_group, year_group_other, interested_program, class_id, teacher_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')");
            
            $params = [
                $application_id,
                $application['student_first_name'],
                $application['student_last_name'],
                $application['student_age'],
                $application['year_group'],
                $application['year_group_other'],
                $application['interested_program'],
                $class_id,
                $teacher_id  // This could be NULL
            ];
            
            error_log("Insert params: " . print_r($params, true));
            $insertStmt->execute($params);
            
            // Update application status to approved
            $stmt = $pdo->prepare("UPDATE initial_admission SET status = 'approved', scheduled_for_deletion_at = NULL WHERE id = ?");
            $stmt->execute([$application_id]);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Application approved successfully' . ($class_id ? ' with class assignment' : ''),
            'application' => [
                'id' => $application_id,
                'student_name' => $application['student_first_name'] . ' ' . $application['student_last_name'],
                'status' => 'approved'
            ]
        ]);
        
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request'
    ]);
}
?>