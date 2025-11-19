<?php
// admin/php/logout.php - TAB-SPECIFIC LOGOUT
session_start();

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

header('Location: ../login.php');
exit;
?>