<?php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

try {
    // AUTO-DELETE: Remove expired pending_rejection applications first
    $deleteStmt = $pdo->prepare("DELETE FROM initial_admission WHERE status = 'pending_rejection' AND scheduled_for_deletion_at <= NOW()");
    $deleteStmt->execute();
    $deletedCount = $deleteStmt->rowCount();
    
    if ($deletedCount > 0) {
        error_log("Auto-deleted $deletedCount expired rejected applications");
    }

    // Then fetch the remaining applications
    $stmt = $pdo->prepare("SELECT ia.*, 
                           CASE 
                               WHEN ia.status = 'approved' THEN 'approved'
                               WHEN ia.status = 'pending_rejection' THEN 'pending_rejection' 
                               ELSE 'pending' 
                           END as display_status,
                           CASE 
                               WHEN ia.status = 'approved' AND pu.id IS NOT NULL THEN 'created'
                               WHEN ia.status = 'approved' AND pu.id IS NULL THEN 'not_created'
                               ELSE 'not_applicable'
                           END as account_status,
                           CASE 
                               WHEN s.teacher_id IS NOT NULL THEN 'assigned'
                               ELSE 'unassigned'
                           END as teacher_status
                           FROM initial_admission ia
                           LEFT JOIN parent_users pu ON (pu.email = ia.parent1_email OR pu.email = ia.parent2_email)
                           LEFT JOIN students s ON s.admission_id = ia.id
                           WHERE (s.teacher_id IS NULL OR s.id IS NULL)  -- EXCLUDE APPLICATIONS WITH ASSIGNED TEACHERS
                           ORDER BY ia.submitted_at DESC");
    $stmt->execute();
    $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'applications' => $applications,
        'deleted_count' => $deletedCount // Optional: for debugging
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>