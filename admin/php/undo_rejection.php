<?php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['application_id'])) {
    $application_id = intval($_POST['application_id']);
    
    try {
        // First, let's check if the application exists and is pending rejection
        $checkStmt = $pdo->prepare("SELECT * FROM initial_admission WHERE id = ? AND status = 'pending_rejection'");
        $checkStmt->execute([$application_id]);
        $application = $checkStmt->fetch();
        
        if (!$application) {
            echo json_encode([
                'success' => false,
                'message' => 'Application not found or not pending rejection'
            ]);
            exit;
        }
        
        // Revert application status back to pending
        $stmt = $pdo->prepare("UPDATE initial_admission SET status = 'pending', scheduled_for_deletion_at = NULL WHERE id = ?");
        $stmt->execute([$application_id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Rejection undone successfully. Application is now pending again.',
            'application' => [
                'id' => $application_id,
                'student_name' => $application['student_first_name'] . ' ' . $application['student_last_name'],
                'status' => 'pending'
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