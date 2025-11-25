<?php
// teacher/php/teacher_protect.php - FIXED VERSION WITH AJAX SUPPORT

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
        
        // Only use if it's a valid format (starts with 't' and has proper length)
        if (!empty($browser_instance_id) && preg_match('/^t[a-f0-9]{32}$/', $browser_instance_id)) {
            session_id($browser_instance_id);
        }
    }
    
    session_start();
}

// CRITICAL FIX: Store the current session ID in the session itself
if (empty($_SESSION['browser_instance_id'])) {
    $_SESSION['browser_instance_id'] = session_id();
}

// Check if this is an AJAX request
$is_ajax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

// Validate session exists and is valid
if (!isset($_SESSION['teacher_logged_in']) || $_SESSION['teacher_logged_in'] !== true) {
    if ($is_ajax) {
        // For AJAX requests, return JSON error instead of redirect
        header('Content-Type: application/json');
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Session expired. Please refresh the page.',
            'requires_login' => true
        ]);
        exit;
    } else {
        // For normal requests, redirect to login
        $redirect_url = "login.php";
        if (!empty($browser_instance_id)) {
            $redirect_url .= "?bid=" . urlencode($browser_instance_id);
        }
        header('Location: ' . $redirect_url);
        exit;
    }
}

// Session timeout (1 hour)
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 3600)) {
    if ($is_ajax) {
        // For AJAX requests, return JSON error
        header('Content-Type: application/json');
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Session expired. Please refresh the page.',
            'requires_login' => true
        ]);
        exit;
    } else {
        // For normal requests, redirect to login
        session_destroy();
        $redirect_url = "login.php";
        if (!empty($browser_instance_id)) {
            $redirect_url .= "?bid=" . urlencode($browser_instance_id);
        }
        header('Location: ' . $redirect_url);
        exit;
    }
}

// Update last activity time
$_SESSION['last_activity'] = time();

// Verify session belongs to actual teacher and get current approval status
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/security_functions.php';

try {
    $stmt = $pdo->prepare("SELECT is_approved, is_active FROM teacher_users WHERE id = ?");
    $stmt->execute([$_SESSION['teacher_id']]);
    $teacher = $stmt->fetch();
    
    if (!$teacher || $teacher['is_active'] == 0) {
        if ($is_ajax) {
            // For AJAX requests, return JSON error
            header('Content-Type: application/json');
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Teacher account not found or inactive.',
                'requires_login' => true
            ]);
            exit;
        } else {
            // For normal requests, redirect to login
            session_destroy();
            $redirect_url = "login.php";
            if (!empty($browser_instance_id)) {
                $redirect_url .= "?bid=" . urlencode($browser_instance_id);
            }
            header('Location: ' . $redirect_url);
            exit;
        }
    }
    
    $_SESSION['pending_approval'] = ($teacher['is_approved'] == 0);
    
} catch (PDOException $e) {
    error_log("Database error in teacher_protect.php: " . $e->getMessage());
    $_SESSION['pending_approval'] = true;
}
?>