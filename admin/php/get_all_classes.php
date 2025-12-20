<?php
// admin/php/get_all_classes.php

// Turn off all error reporting temporarily to prevent HTML output
error_reporting(0);
ini_set('display_errors', 0);

// Start output buffering
if (!ob_get_level()) {
    ob_start();
}

try {
    require_once 'admin_protect.php';
    
    // Check if we're actually authenticated
    if (!isset($_SESSION['admin_id'])) {
        throw new Exception('Not authenticated');
    }
    
    require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';
    
    // UPDATED: Changed FROM teachers TO teacher_users
    $sql = "SELECT c.id, c.class_name, c.year_group, c.program, 
                   CONCAT(t.name) as teacher_name
            FROM classes c
            LEFT JOIN teacher_users t ON c.teacher_id = t.id
            WHERE c.status = 'active'
            ORDER BY c.class_name, c.year_group";
    
    $stmt = $pdo->query($sql);
    $classes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Clean output buffer if it exists
    if (ob_get_length()) {
        ob_end_clean();
    }
    
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'classes' => $classes
    ]);
    
} catch (PDOException $e) {
    // Clean output buffer if it exists
    if (ob_get_length()) {
        ob_end_clean();
    }
    
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    // Clean output buffer if it exists
    if (ob_get_length()) {
        ob_end_clean();
    }
    
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>