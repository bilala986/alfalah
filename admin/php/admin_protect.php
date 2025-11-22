<?php
// admin/php/admin_protect.php - FIXED VERSION WITH PROPER TAB ISOLATION

// Security headers
header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");

// Get the browser instance ID from GET parameter first
$browser_instance_id = $_GET['bid'] ?? '';

// Start session with proper isolation
if (session_status() === PHP_SESSION_NONE) {
    // If we have a browser instance ID, use it as session ID
    if (!empty($browser_instance_id)) {
        // Validate and sanitize the session ID
        $browser_instance_id = preg_replace('/[^a-zA-Z0-9]/', '', $browser_instance_id);
        
        // Only use if it's a valid format (starts with 'a' and has proper length)
        if (!empty($browser_instance_id) && preg_match('/^a[a-f0-9]{32}$/', $browser_instance_id)) {
            session_id($browser_instance_id);
        }
    }
    
    session_start();
}

// CRITICAL FIX: Store the current session ID in the session itself
// This ensures each tab maintains its own session identity
if (empty($_SESSION['browser_instance_id'])) {
    $_SESSION['browser_instance_id'] = session_id();
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
    // Only destroy this specific session
    session_destroy();
    
    $redirect_url = "login.php";
    if (!empty($browser_instance_id)) {
        $redirect_url .= "?bid=" . urlencode($browser_instance_id);
    }
    header('Location: ' . $redirect_url);
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
        // Admin not found or inactive - destroy only this session
        session_destroy();
        
        $redirect_url = "login.php";
        if (!empty($browser_instance_id)) {
            $redirect_url .= "?bid=" . urlencode($browser_instance_id);
        }
        header('Location: ' . $redirect_url);
        exit;
    }
    
    $_SESSION['pending_approval'] = ($admin['is_approved'] == 0);
    
} catch (PDOException $e) {
    error_log("Database error in admin_protect.php: " . $e->getMessage());
    $_SESSION['pending_approval'] = true;
}
?>