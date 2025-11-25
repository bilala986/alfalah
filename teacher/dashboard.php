<?php
// At the very top of teacher/dashboard.php
require_once 'php/teacher_protect.php';

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
    <title>Teacher Dashboard - Al Falah</title>

    <!-- Bootstrap -->
    <link href="../bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <link rel="stylesheet" href="css/teacher.css">
</head>

<body>
    <!-- SIDEBAR -->
    <div class="sidebar" id="sidebar">
        <div class="sidebar-header d-flex align-items-center justify-content-between px-3">
            <div class="d-flex align-items-center">
                <img src="../img/logo.png" alt="Al Falah Logo" height="35" class="me-2">
                <h5 class="m-0 fw-bold">Teacher Panel</h5>
            </div>
            <button class="toggle-btn" id="closeSidebar"><i class="bi bi-x-lg"></i></button>
        </div>

        <a href="dashboard.php?bid=<?= $browser_instance_id ?>" class="active"><i class="bi bi-speedometer2"></i> Dashboard</a>
        <a href="#?bid=<?= $browser_instance_id ?>"><i class="bi bi-journal-text"></i> My Classes</a>
        <a href="#?bid=<?= $browser_instance_id ?>"><i class="bi bi-calendar-check"></i> Attendance</a>
        <a href="#?bid=<?= $browser_instance_id ?>"><i class="bi bi-clipboard-data"></i> Grades</a>
        <a href="#?bid=<?= $browser_instance_id ?>"><i class="bi bi-gear"></i> Settings</a>

        <hr>
        <a href="php/logout.php?bid=<?= $browser_instance_id ?>" class="logout">
            <i class="bi bi-box-arrow-right"></i> Logout
        </a>
    </div>

    <!-- HEADER -->
    <div class="header-bar d-flex align-items-center justify-content-between">
        <button class="open-sidebar-btn" id="openSidebar"><i class="bi bi-list"></i></button>

        <!-- Welcome Message with Teacher Name -->
        <div class="d-flex align-items-center">
            <span class="me-3 d-none d-md-block">
                <i class="bi bi-person-badge me-2"></i>
                Welcome, <strong><?php echo htmlspecialchars($_SESSION['teacher_name'] ?? 'Teacher'); ?></strong>
            </span>

            <!-- Mobile-friendly version -->
            <span class="d-block d-md-none">
                <i class="bi bi-person-badge me-1"></i>
                <strong><?php echo htmlspecialchars(explode(' ', $_SESSION['teacher_name'] ?? 'Teacher')[0]); ?></strong>
            </span>
        </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="content" id="content">
        <h2 class="dashboard-title m-0 text-center">Teacher Dashboard</h2>

        <!-- Approval Status Banner -->
        <?php if (isset($_SESSION['pending_approval']) && $_SESSION['pending_approval']): ?>
        <div class="alert alert-warning alert-dismissible fade show mt-3" role="alert">
            <i class="bi bi-clock-history me-2"></i>
            <strong>Account Pending Approval</strong> - Your teacher account is awaiting verification. 
            You will gain full access once approved by an administrator.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        <?php endif; ?>

        <!-- DASHBOARD CARDS (Only show if approved) -->
        <?php if (!isset($_SESSION['pending_approval']) || !$_SESSION['pending_approval']): ?>
        <div class="row mt-4">
            <!-- MY CLASSES -->
            <div class="col-md-4 mb-3">
                <div class="card shadow-sm p-3">
                    <h5><i class="bi bi-journal-text text-primary"></i> My Classes</h5>
                    <p class="text-muted">View and manage your assigned classes.</p>
                    <a href="#?bid=<?= $browser_instance_id ?>" class="btn btn-primary-modern btn-sm">View Classes</a>
                </div>
            </div>

            <!-- ATTENDANCE -->
            <div class="col-md-4 mb-3">
                <div class="card shadow-sm p-3">
                    <h5><i class="bi bi-calendar-check text-success"></i> Attendance</h5>
                    <p class="text-muted">Take and manage student attendance.</p>
                    <a href="#?bid=<?= $browser_instance_id ?>" class="btn btn-success-modern btn-sm">Manage</a>
                </div>
            </div>

            <!-- GRADES -->
            <div class="col-md-4 mb-3">
                <div class="card shadow-sm p-3">
                    <h5><i class="bi bi-clipboard-data text-info"></i> Grades</h5>
                    <p class="text-muted">Record and manage student grades.</p>
                    <a href="#?bid=<?= $browser_instance_id ?>" class="btn btn-info-modern btn-sm">Enter Grades</a>
                </div>
            </div>

            <!-- STUDENT PROFILES -->
            <div class="col-md-4 mb-3">
                <div class="card shadow-sm p-3">
                    <h5><i class="bi bi-people-fill text-warning"></i> Students</h5>
                    <p class="text-muted">View student profiles and information.</p>
                    <a href="#?bid=<?= $browser_instance_id ?>" class="btn btn-warning-modern btn-sm">View Students</a>
                </div>
            </div>

            <!-- REPORTS -->
            <div class="col-md-4 mb-3">
                <div class="card shadow-sm p-3">
                    <h5><i class="bi bi-graph-up text-danger"></i> Reports</h5>
                    <p class="text-muted">Generate class and student reports.</p>
                    <a href="#?bid=<?= $browser_instance_id ?>" class="btn btn-danger-modern btn-sm">View Reports</a>
                </div>
            </div>

            <!-- PROFILE -->
            <div class="col-md-4 mb-3">
                <div class="card shadow-sm p-3">
                    <h5><i class="bi bi-person-gear text-secondary"></i> Profile</h5>
                    <p class="text-muted">Manage your account settings.</p>
                    <a href="#?bid=<?= $browser_instance_id ?>" class="btn btn-secondary-modern btn-sm">Edit Profile</a>
                </div>
            </div>
        </div>
        <?php else: ?>
        <!-- Pending Approval Message -->
        <div class="text-center mt-5 py-5">
            <i class="bi bi-clock display-1 text-warning"></i>
            <h3 class="mt-3 text-muted">Account Pending Approval</h3>
            <p class="text-muted">Your teacher account is currently under review. You will receive access to all teaching features once approved.</p>
        </div>
        <?php endif; ?>
    </div>

    <script src="../bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="js/dashboard.js"></script>
</body>
</html>