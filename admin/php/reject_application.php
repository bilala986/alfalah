<?php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['application_id'])) {
    $application_id = intval($_POST['application_id']);
    
    try {
        // First, let's check if the application exists
        $checkStmt = $pdo->prepare("SELECT * FROM initial_admission WHERE id = ?");
        $checkStmt->execute([$application_id]);
        $application = $checkStmt->fetch();
        
        if (!$application) {
            echo json_encode([
                'success' => false,
                'message' => 'Application not found'
            ]);
            exit;
        }
        
        // For now, we'll just log the rejection. You can modify this to:
        // 1. Update a status column in the table
        // 2. Move to a rejected_applications table
        // 3. Send email notifications, etc.
        
        // Example: If you add a status column to initial_admission:
        // $stmt = $pdo->prepare("UPDATE initial_admission SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW() WHERE id = ?");
        // $stmt->execute([$_SESSION['admin_id'], $application_id]);
        
        // For now, we'll just return success
        echo json_encode([
            'success' => true,
            'message' => 'Application rejected successfully',
            'application' => [
                'id' => $application_id,
                'student_name' => $application['student_first_name'] . ' ' . $application['student_last_name']
            ]
        ]);
        
    } catch (PDOException $e) {
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