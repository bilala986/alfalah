<?php
// admin/php/logout.php - IMPROVED TAB-SPECIFIC LOGOUT
session_start();

// Get the browser instance ID before destroying session
$browser_instance_id = $_SESSION['browser_instance_id'] ?? '';

// Only destroy this specific session (not all sessions)
session_destroy();

// Clear the session cookie for this domain/path
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