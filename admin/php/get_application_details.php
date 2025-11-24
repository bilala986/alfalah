<?php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

if (isset($_GET['id'])) {
    $application_id = intval($_GET['id']);
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM initial_admission WHERE id = ?");
        $stmt->execute([$application_id]);
        $application = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($application) {
            echo json_encode([
                'success' => true,
                'application' => $application
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Application not found'
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No application ID provided'
    ]);
}
?>