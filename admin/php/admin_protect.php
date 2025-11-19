<?php
// admin/php/admin_protect.php
session_start();

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit;
}

// Check if admin is approved
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

try {
    $stmt = $pdo->prepare("SELECT is_approved FROM admin_users WHERE id = ?");
    $stmt->execute([$_SESSION['admin_id']]);
    $admin = $stmt->fetch();
    
    if (!$admin || $admin['is_approved'] == 0) {
        $_SESSION['pending_approval'] = true;
    } else {
        $_SESSION['pending_approval'] = false;
    }
    
} catch (PDOException $e) {
    // If there's a database error, assume not approved for security
    $_SESSION['pending_approval'] = true;
}
?>