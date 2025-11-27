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
        
        // Use UTC time to avoid timezone issues
        $stmt = $pdo->prepare("UPDATE initial_admission SET status = 'pending_rejection', scheduled_for_deletion_at = UTC_TIMESTAMP() + INTERVAL 24 HOUR WHERE id = ?");
        $stmt->execute([$application_id]);
        
        // Get the actual deletion time for the response
        $timeStmt = $pdo->prepare("SELECT scheduled_for_deletion_at FROM initial_admission WHERE id = ?");
        $timeStmt->execute([$application_id]);
        $deletionTime = $timeStmt->fetchColumn();
        
        echo json_encode([
            'success' => true,
            'message' => 'Application rejected successfully. It will be deleted in 24 hours.',
            'application' => [
                'id' => $application_id,
                'student_name' => $application['student_first_name'] . ' ' . $application['student_last_name'],
                'status' => 'pending_rejection',
                'scheduled_for_deletion_at' => $deletionTime
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