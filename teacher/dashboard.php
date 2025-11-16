<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teacher Dashboard – Al Falah</title>

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

    <a href="dashboard.php" class="active"><i class="bi bi-speedometer2"></i> Dashboard</a>
    <a href="#"><i class="bi bi-book-half"></i> My Classes</a>
    <a href="#"><i class="bi bi-people-fill"></i> Students</a>
    <a href="#"><i class="bi bi-clipboard-check"></i> Attendance</a>

    <hr>

    <a href="#" class="logout"><i class="bi bi-box-arrow-right"></i> Logout</a>
</div>

<!-- HEADER -->
<div class="header-bar d-flex align-items-center justify-content-between">
    <button class="open-sidebar-btn" id="openSidebar"><i class="bi bi-list"></i></button>
</div>

<!-- MAIN CONTENT -->
<div class="content" id="content">

    <h2 class="dashboard-title m-0">Teacher Dashboard</h2>

    <div class="row mt-4">

        <!-- Classes -->
        <div class="col-md-4 mb-3">
            <div class="card shadow-sm p-3">
                <h5><i class="bi bi-book-half text-success"></i> My Classes</h5>
                <p class="text-muted">Manage and view your assigned classes.</p>
                <a href="#" class="btn btn-success-modern btn-sm">Open</a>
            </div>
        </div>

        <!-- Students -->
        <div class="col-md-4 mb-3">
            <div class="card shadow-sm p-3">
                <h5><i class="bi bi-people-fill text-success"></i> Students</h5>
                <p class="text-muted">View student lists for your classes.</p>
                <a href="#" class="btn btn-success-modern btn-sm">View</a>
            </div>
        </div>

        <!-- Diary Notes -->
        <div class="col-md-4 mb-3">
            <div class="card shadow-sm p-3">
                <h5><i class="bi bi-journal-text text-success"></i> Diary Notes</h5>
                <p class="text-muted">Record student diary or behaviour notes.</p>
                <a href="#" class="btn btn-success-modern btn-sm">Add Notes</a>
            </div>
        </div>

        <!-- Chats -->
        <div class="col-md-4 mb-3">
            <div class="card shadow-sm p-3">
                <h5><i class="bi bi-chat-dots-fill text-success"></i> Chats</h5>
                <p class="text-muted">Chat with parents.</p>
                <a href="#" class="btn btn-success-modern btn-sm">Open</a>
            </div>
        </div>

        <!-- Attendance -->
        <div class="col-md-4 mb-3">
            <div class="card shadow-sm p-3">
                <h5><i class="bi bi-clipboard-check text-success"></i> Attendance</h5>
                <p class="text-muted">Mark and review attendance.</p>
                <a href="#" class="btn btn-success-modern btn-sm">Manage</a>
            </div>
        </div>

    </div>
</div>

<script src="../bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="js/teacher.js"></script>

</body>
</html>
