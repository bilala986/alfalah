<?php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

try {
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
                           END as account_status
                           FROM initial_admission ia
                           LEFT JOIN parent_users pu ON (pu.email = ia.parent1_email OR pu.email = ia.parent2_email)
                           ORDER BY ia.submitted_at DESC");
    $stmt->execute();
    $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'applications' => $applications
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>