<?php
// admin/php/admin_protect.php - TAB-ISOLATED SESSION PROTECTION
session_start();

// Check if we have a browser instance ID from localStorage (passed via GET)
$browser_instance_id = $_GET['bid'] ?? '';

if (!empty($browser_instance_id)) {
    // Validate and sanitize the session ID
    $browser_instance_id = preg_replace('/[^a-zA-Z0-9]/', '', $browser_instance_id);
    
    if (!empty($browser_instance_id) && strlen($browser_instance_id) === 33) {
        // Use the browser instance ID as session ID ONLY if it matches our format
        session_write_close();
        session_id($browser_instance_id);
        session_start();
    }
}

// Validate session exists and is valid
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    // Redirect with current bid to maintain tab context
    $redirect_url = "login.php";
    if (!empty($browser_instance_id)) {
        $redirect_url .= "?bid=" . urlencode($browser_instance_id);
    }
    header('Location: ' . $redirect_url);
    exit;
}

// Verify session belongs to actual admin and get current approval status
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

try {
    $stmt = $pdo->prepare("SELECT is_approved FROM admin_users WHERE id = ?");
    $stmt->execute([$_SESSION['admin_id']]);
    $admin = $stmt->fetch();
    
    if (!$admin) {
        session_destroy();
        header('Location: login.php');
        exit;
    }
    
    $_SESSION['pending_approval'] = ($admin['is_approved'] == 0);
    
} catch (PDOException $e) {
    $_SESSION['pending_approval'] = true;
}
?>