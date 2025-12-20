<?php
// At the very top of admin/dashboard.php
require_once 'php/admin_protect.php';

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
        <title>Admin Dashboard - Al Falah</title>

        <!-- Bootstrap -->
        <link href="../bootstrap/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet"
              href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
        <link rel="stylesheet" href="css/admin.css">
    </head>

    <body>

        <!-- SIDEBAR -->
        <div class="sidebar" id="sidebar">

            <div class="sidebar-header d-flex align-items-center justify-content-between px-3">
                <div class="d-flex align-items-center">
                    <img src="../img/logo.png" alt="Al Falah Logo" height="35" class="me-2">
                    <h5 class="m-0 fw-bold">Admin Panel</h5>
                </div>
                <button class="toggle-btn" id="closeSidebar"><i class="bi bi-x-lg"></i></button>
            </div>

            <a href="dashboard.php?bid=<?= $browser_instance_id ?>" class="active"><i class="bi bi-speedometer2"></i> Dashboard</a>
            <a href="#?bid=<?= $browser_instance_id ?>"><i class="bi bi-gear"></i> Settings</a>

            <hr>

            <a href="php/logout.php?bid=<?= $browser_instance_id ?>" class="logout">
                <i class="bi bi-box-arrow-right"></i> Logout
            </a>
        </div>


        <!-- HEADER (always at top) -->
        <div class="header-bar d-flex align-items-center justify-content-between">
            <button class="open-sidebar-btn" id="openSidebar"><i class="bi bi-list"></i></button>

            <!-- Welcome Message with Admin Name -->
            <div class="d-flex align-items-center">
                <span class="me-3 d-none d-md-block">
                    <i class="bi bi-person-circle me-2"></i>
                    Welcome, <strong><?php echo htmlspecialchars($_SESSION['admin_name'] ?? 'Admin'); ?></strong>
                </span>

                <!-- Mobile-friendly version -->
                <span class="d-block d-md-none">
                    <i class="bi bi-person-circle me-1"></i>
                    <strong><?php echo htmlspecialchars(explode(' ', $_SESSION['admin_name'] ?? 'Admin')[0]); ?></strong>
                </span>
            </div>
        </div>


        <!-- MAIN CONTENT -->
        <div class="content" id="content">

            <h2 class="dashboard-title m-0 text-center">Admin Dashboard Overview</h2>

            <!-- Approval Status Banner -->
            <?php if (isset($_SESSION['pending_approval']) && $_SESSION['pending_approval']): ?>
            <div class="alert alert-warning alert-dismissible fade show mt-3" role="alert">
                <i class="bi bi-clock-history me-2"></i>
                <strong>Account Pending Approval</strong> - Your admin account is awaiting verification. 
                You will gain full access once approved by a system administrator.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            <?php endif; ?>

            <!-- DASHBOARD CARDS (Only show if approved) -->
            <?php if (!isset($_SESSION['pending_approval']) || !$_SESSION['pending_approval']): ?>
            <div class="row mt-4">

                <!-- ADMISSIONS CARD -->
                <div class="col-md-4 mb-3">
                    <div class="card shadow-sm p-3">
                        <h5><i class="bi bi-file-earmark-text text-success"></i> Admissions</h5>
                        <p class="text-muted">View new applications.</p>
                        <a href="applications.php?bid=<?= $browser_instance_id ?>" class="btn btn-success-modern btn-sm">Open</a>
                    </div>
                </div>

                <!-- STUDENTS -->
                <div class="col-md-4 mb-3">
                    <div class="card shadow-sm p-3">
                        <h5><i class="bi bi-people-fill text-success"></i> Students</h5>
                        <p class="text-muted">Manage all registered students.</p>
                        <a href="private/students.php?bid=<?= $browser_instance_id ?>" class="btn btn-success-modern btn-sm">View</a>
                    </div>
                </div>

                <!-- TEACHERS -->
                <div class="col-md-4 mb-3">
                    <div class="card shadow-sm p-3">
                        <h5><i class="bi bi-people text-success"></i> Teachers</h5>
                        <p class="text-muted">Manage teacher accounts.</p>
                        <a href="private/teacher-accounts.php?bid=<?= $browser_instance_id ?>" class="btn btn-success-modern btn-sm">Manage</a>
                    </div>
                </div>
                
                <!-- CLASSES -->
                <div class="col-md-4 mb-3">
                    <div class="card shadow-sm p-3">
                        <h5><i class="bi bi-mortarboard text-success"></i> Classes</h5>
                        <p class="text-muted">View and manage classes.</p>
                        <a href="private/classes.php?bid=<?= $browser_instance_id ?>" class="btn btn-success-modern btn-sm">View</a>
                    </div>
                </div>
                
                <!-- ATTENDANCE -->
                <div class="col-md-4 mb-3">
                    <div class="card shadow-sm p-3">
                        <h5><i class="bi bi-calendar-check text-success"></i> Attendance</h5>
                        <p class="text-muted">View and manage attendance for all classes.</p>
                        <a href="private/attendance.php?bid=<?= $browser_instance_id ?>" class="btn btn-success-modern btn-sm">Manage</a>
                    </div>
                </div>

                <!-- PARENTS -->
                <div class="col-md-4 mb-3">
                    <div class="card shadow-sm p-3">
                        <h5><i class="bi bi-person-heart text-success"></i> Parents</h5>
                        <p class="text-muted">View parent profiles.</p>
                        <a href="private/parent-accounts.php?bid=<?= $browser_instance_id ?>" class="btn btn-success-modern btn-sm">Open</a>
                    </div>
                </div>

                <!-- ADMIN ACCOUNTS CARD -->
                <div class="col-md-4 mb-3">
                    <div class="card shadow-sm p-3">
                        <h5><i class="bi bi-shield-check text-success"></i> Admin Accounts</h5>
                        <p class="text-muted">Manage admin users and approvals.</p>
                        <a href="private/admin-accounts.php?bid=<?= $browser_instance_id ?>" class="btn btn-success-modern btn-sm">Manage</a>
                    </div>
                </div>

            </div>
            <?php else: ?>
            <!-- Pending Approval Message (No Cards) -->
            <div class="text-center mt-5 py-5">
                <i class="bi bi-clock display-1 text-warning"></i>
                <h3 class="mt-3 text-muted">Account Pending Approval</h3>
                <p class="text-muted">Your admin account is currently under review. You will receive access to all dashboard features once approved.</p>
            </div>
            <?php endif; ?>

        </div>

        <script src="../bootstrap/js/bootstrap.bundle.min.js"></script>
        <script src="js/dashboard.js"></script>

    </body>
</html>