<?php
// teacher/php/logout.php - TAB-SPECIFIC LOGOUT

// Get browser instance ID from GET parameter first (for redirect)
$browser_instance_id = $_GET['bid'] ?? '';

// Start session with the specific ID if provided
if (!empty($browser_instance_id)) {
    $browser_instance_id = preg_replace('/[^a-zA-Z0-9]/', '', $browser_instance_id);
    if (!empty($browser_instance_id) && preg_match('/^t[a-f0-9]{32}$/', $browser_instance_id)) {
        session_id($browser_instance_id);
    }
}

session_start();

// Get the browser instance ID from session as well (for verification)
$session_browser_id = $_SESSION['browser_instance_id'] ?? '';

// Clear all session data
$_SESSION = [];

// Destroy this specific session
session_destroy();

// Clear the session cookie for this specific session
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Redirect to login with the bid parameter to maintain context
$redirect_url = "../login.php";
if (!empty($browser_instance_id)) {
    $redirect_url .= "?bid=" . urlencode($browser_instance_id);
}
header('Location: ' . $redirect_url);
exit;
?>