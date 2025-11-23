<?php
// parent/php/logout.php - SECURE PARENT LOGOUT

// Security headers
header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");

// Get browser instance ID
$browser_instance_id = $_GET['bid'] ?? '';

// Start session with proper isolation
if (session_status() === PHP_SESSION_NONE) {
    if (!empty($browser_instance_id)) {
        $browser_instance_id = preg_replace('/[^a-zA-Z0-9]/', '', $browser_instance_id);
        if (!empty($browser_instance_id) && preg_match('/^p[a-f0-9]{32}$/', $browser_instance_id)) {
            session_id($browser_instance_id);
        }
    }
    session_start();
}

// Clear all session variables
$_SESSION = [];

// Destroy the session
if (session_status() === PHP_SESSION_ACTIVE) {
    session_destroy();
}

// Clear session cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Redirect to login page
header('Location: ../login.php');
exit;
?>