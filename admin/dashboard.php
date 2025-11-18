<?php
// At the very top of admin/dashboard.php
require_once '../php/admin_protect.php';
// ADD THIS LINE:
$adminData = $adminAuth->getAdminData();
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

    <a href="dashboard.php" class="active"><i class="bi bi-speedometer2"></i> Dashboard</a>
    <a href="#"><i class="bi bi-gear"></i> Settings</a>

    <hr>

    <a href="../php/admin_auth.php?action=logout" class="logout" onclick="return confirm('Are you sure you want to logout?')">
        <i class="bi bi-box-arrow-right"></i> Logout
    </a>
</div>


<!-- HEADER (always at top) -->
<div class="header-bar d-flex align-items-center justify-content-between">
    <button class="open-sidebar-btn" id="openSidebar"><i class="bi bi-list"></i></button>
</div>


<!-- MAIN CONTENT -->
<div class="content" id="content">
    
    <h2 class="dashboard-title m-0 text-center">Admin Dashboard Overview</h2>

    <div class="row mt-4">

        <!-- ADMISSIONS CARD -->
        <div class="col-md-4 mb-3">
            <div class="card shadow-sm p-3">
                <h5><i class="bi bi-file-earmark-text text-success"></i> Admissions</h5>
                <p class="text-muted">View new applications.</p>
                <a href="#" class="btn btn-success-modern btn-sm">Open</a>
            </div>
        </div>

        <!-- STUDENTS -->
        <div class="col-md-4 mb-3">
            <div class="card shadow-sm p-3">
                <h5><i class="bi bi-people-fill text-success"></i> Students</h5>
                <p class="text-muted">Manage all registered students.</p>
                <a href="#" class="btn btn-success-modern btn-sm">View</a>
            </div>
        </div>

        <!-- TEACHERS -->
        <div class="col-md-4 mb-3">
            <div class="card shadow-sm p-3">
                <h5><i class="bi bi-people text-success"></i> Teachers</h5>
                <p class="text-muted">Manage teacher accounts.</p>
                <a href="#" class="btn btn-success-modern btn-sm">Manage</a>
            </div>
        </div>

        <!-- PARENTS -->
        <div class="col-md-4 mb-3">
            <div class="card shadow-sm p-3">
                <h5><i class="bi bi-person-heart text-success"></i> Parents</h5>
                <p class="text-muted">View parent profiles.</p>
                <a href="#" class="btn btn-success-modern btn-sm">Open</a>
            </div>
        </div>

    </div>
</div>

<script src="../bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="js/dashboard.js"></script>

</body>
</html>
