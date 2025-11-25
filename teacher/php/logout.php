<?php
// teacher/php/logout.php
session_start();

// Get browser instance ID from URL
$browser_instance_id = $_GET['bid'] ?? '';

// Clear all session variables
$_SESSION = [];

// If session cookie exists, delete it
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Destroy the session
session_destroy();

// Redirect to login page with browser instance ID if provided
$redirect_url = "../login.php";
if (!empty($browser_instance_id)) {
    $redirect_url .= "?bid=" . urlencode($browser_instance_id);
}

header('Location: ' . $redirect_url);
exit;
?>