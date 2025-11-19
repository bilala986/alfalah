<?php
// admin/php/admin_protect.php - TAB-SPECIFIC SESSION VALIDATION
session_start();

// Function to safely destroy and restart session
function safeSessionRestart() {
    session_destroy();
    session_start();
    $_SESSION = array();
}

// Check if we need to recover from session corruption
if (session_status() !== PHP_SESSION_ACTIVE) {
    safeSessionRestart();
    header('Location: login.php');
    exit;
}

// Validate session exists and is valid
if (!isset($_SESSION['admin_logged_in']) || 
    $_SESSION['admin_logged_in'] !== true || 
    !isset($_SESSION['tab_identifier']) ||
    !isset($_SESSION['login_token'])) {
    header('Location: login.php');
    exit;
}

// Check if admin is approved
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

try {
    $stmt = $pdo->prepare("SELECT is_approved FROM admin_users WHERE id = ?");
    $stmt->execute([$_SESSION['admin_id']]);
    $admin = $stmt->fetch();
    
    if (!$admin) {
        safeSessionRestart();
        header('Location: login.php');
        exit;
    }
    
    $_SESSION['pending_approval'] = ($admin['is_approved'] == 0);
    
} catch (PDOException $e) {
    $_SESSION['pending_approval'] = true;
}
?>