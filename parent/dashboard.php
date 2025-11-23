<?php
// At the very top of parent/dashboard.php
require_once 'php/parent_protect.php';

// Get the browser instance ID for this session
$browser_instance_id = $_SESSION['browser_instance_id'] ?? '';

// Verify the session ID in URL matches the one in session
if (isset($_GET['bid']) && $_GET['bid'] !== $browser_instance_id) {
    // Session ID mismatch - possible tab mixing, redirect to login
    session_destroy();
    header('Location: login.php');
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parent Dashboard – Al Falah</title>

    <!-- Bootstrap -->
    <link href="../bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">

    <link rel="stylesheet" href="css/parent.css">
</head>
<body>

    <!-- SIDEBAR -->
    <div class="sidebar" id="sidebar">

        <div class="sidebar-header d-flex align-items-center justify-content-between px-3">
            <div class="d-flex align-items-center">
                <img src="../img/logo.png" alt="Al Falah Logo" height="35" class="me-2">
                <h5 class="m-0 fw-bold">Parent Panel</h5>
            </div>
            <button class="toggle-btn" id="closeSidebar"><i class="bi bi-x-lg"></i></button>
        </div>

        <a href="dashboard.php?bid=<?= $browser_instance_id ?>" class="active"><i class="bi bi-speedometer2"></i> Dashboard</a>
        <a href="#?bid=<?= $browser_instance_id ?>"><i class="bi bi-person-lines-fill"></i> My Profile</a>

        <hr>

        <a href="php/logout.php?bid=<?= $browser_instance_id ?>" class="logout">
            <i class="bi bi-box-arrow-right"></i> Logout
        </a>
    </div>

    <!-- HEADER -->
    <div class="header-bar d-flex align-items-center justify-content-between">
        <button class="open-sidebar-btn" id="openSidebar"><i class="bi bi-list"></i></button>

        <!-- Welcome Message with Parent Name -->
        <div class="d-flex align-items-center">
            <span class="me-3 d-none d-md-block">
                <i class="bi bi-person-circle me-2"></i>
                Welcome, <strong><?php echo htmlspecialchars($_SESSION['parent_name'] ?? 'Parent'); ?></strong>
            </span>

            <!-- Mobile-friendly version -->
            <span class="d-block d-md-none">
                <i class="bi bi-person-circle me-1"></i>
                <strong><?php echo htmlspecialchars(explode(' ', $_SESSION['parent_name'] ?? 'Parent')[0]); ?></strong>
            </span>
        </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="content" id="content">

        <h2 class="dashboard-title m-0">Parent/Guardian Dashboard</h2>

        <div class="row mt-4">

            <!-- CHATS CARD -->
            <div class="col-md-4 mb-3">
                <div class="card shadow-sm p-3">
                    <h5><i class="bi bi-chat-dots-fill text-success"></i> Chats</h5>
                    <p class="text-muted">Communicate with teachers.</p>
                    <a href="#?bid=<?= $browser_instance_id ?>" class="btn btn-success-modern btn-sm">Open</a>
                </div>
            </div>

            <!-- DIARY CARD -->
            <div class="col-md-4 mb-3">
                <div class="card shadow-sm p-3">
                    <h5><i class="bi bi-journal-bookmark-fill text-success"></i> Diary</h5>
                    <p class="text-muted">View your child's daily notes.</p>
                    <a href="#?bid=<?= $browser_instance_id ?>" class="btn btn-success-modern btn-sm">View</a>
                </div>
            </div>

            <!-- BEHAVIOUR CARD -->
            <div class="col-md-4 mb-3">
                <div class="card shadow-sm p-3">
                    <h5><i class="bi bi-emoji-smile-fill text-success"></i> Behaviour</h5>
                    <p class="text-muted">Monitor behaviour reports.</p>
                    <a href="#?bid=<?= $browser_instance_id ?>" class="btn btn-success-modern btn-sm">Check</a>
                </div>
            </div>

        </div>
    </div>

    <script src="../bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="js/dashboard.js"></script>

</body>
</html>