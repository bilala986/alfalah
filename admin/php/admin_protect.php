<?php
// admin/php/admin_protect.php - FIXED VERSION

// Security headers
header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");

// Start session first
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if we have a browser instance ID from localStorage (passed via GET)
$browser_instance_id = $_GET['bid'] ?? '';

// Only switch sessions if we have a valid browser instance ID
if (!empty($browser_instance_id)) {
    // Validate and sanitize the session ID
    $browser_instance_id = preg_replace('/[^a-zA-Z0-9]/', '', $browser_instance_id);
    
    $current_session_id = session_id();
    
    // Only switch if it's a valid format AND different from current session
    if (!empty($browser_instance_id) && $browser_instance_id !== $current_session_id) {
        // Use the browser instance ID as session ID
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

// Session timeout (1 hour)
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 3600)) {
    session_destroy();
    header('Location: login.php');
    exit;
}

// Update last activity time
$_SESSION['last_activity'] = time();

// Verify session belongs to actual admin and get current approval status
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/security_functions.php';

try {
    $stmt = $pdo->prepare("SELECT is_approved, is_active FROM admin_users WHERE id = ?");
    $stmt->execute([$_SESSION['admin_id']]);
    $admin = $stmt->fetch();
    
    if (!$admin || $admin['is_active'] == 0) {
        // Admin not found or inactive - destroy session
        session_destroy();
        header('Location: login.php');
        exit;
    }
    
    $_SESSION['pending_approval'] = ($admin['is_approved'] == 0);
    
} catch (PDOException $e) {
    error_log("Database error in admin_protect.php: " . $e->getMessage());
    $_SESSION['pending_approval'] = true;
}
?>