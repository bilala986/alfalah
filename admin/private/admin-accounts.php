<?php
// admin/private/admin-accounts.php
require_once '../php/admin_protect.php';

// Only allow approved admins to access this page
if ($_SESSION['pending_approval']) {
    header('Location: ../dashboard.php?bid=' . ($_SESSION['browser_instance_id'] ?? ''));
    exit;
}

// Include database connection
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

// Handle actions
if (isset($_GET['action']) && isset($_GET['id'])) {
    $admin_id = intval($_GET['id']);
    $browser_instance_id = $_SESSION['browser_instance_id'] ?? '';
    
    if ($_GET['action'] === 'approve') {
        $stmt = $pdo->prepare("UPDATE admin_users SET is_approved = 1 WHERE id = ?");
        $stmt->execute([$admin_id]);
    } elseif ($_GET['action'] === 'delete') {
        $stmt = $pdo->prepare("DELETE FROM admin_users WHERE id = ?");
        $stmt->execute([$admin_id]);
    }
    
    // Redirect to refresh the page with proper session ID
    header('Location: admin-accounts.php?bid=' . $browser_instance_id);
    exit;
}

// Fetch all admin users
$stmt = $pdo->prepare("SELECT id, name, email, created_at, last_login, is_approved FROM admin_users ORDER BY created_at DESC");
$stmt->execute();
$admins = $stmt->fetchAll();

$browser_instance_id = $_SESSION['browser_instance_id'] ?? '';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Accounts - Al Falah</title>

    <link href="../../bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../css/admin.css">
</head>

<body>

<!-- SIDEBAR -->
<div class="sidebar" id="sidebar">
    <div class="sidebar-header d-flex align-items-center justify-content-between px-3">
        <div class="d-flex align-items-center">
            <img src="../../img/logo.png" alt="Al Falah Logo" height="35" class="me-2">
            <h5 class="m-0 fw-bold">Admin Panel</h5>
        </div>
        <button class="toggle-btn" id="closeSidebar"><i class="bi bi-x-lg"></i></button>
    </div>

    <a href="../dashboard.php?bid=<?= $browser_instance_id ?>"><i class="bi bi-speedometer2"></i> Dashboard</a>
    <a href="admin-accounts.php?bid=<?= $browser_instance_id ?>" class="active"><i class="bi bi-shield-check"></i> Admin Accounts</a>
    <a href="#?bid=<?= $browser_instance_id ?>"><i class="bi bi-gear"></i> Settings</a>

    <hr>
    <a href="../php/logout.php?bid=<?= $browser_instance_id ?>" class="logout"><i class="bi bi-box-arrow-right"></i> Logout</a>
</div>

<!-- HEADER -->
<div class="header-bar d-flex align-items-center justify-content-between">
    <button class="open-sidebar-btn" id="openSidebar"><i class="bi bi-list"></i></button>
</div>

<!-- MAIN CONTENT -->
<div class="content" id="content">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="dashboard-title m-0">Admin Accounts Management</h2>
    </div>

    <!-- Admin Accounts Table -->
    <div class="card shadow-sm">
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Account Created</th>
                            <th>Last Login</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($admins)): ?>
                            <tr>
                                <td colspan="6" class="text-center text-muted py-4">No admin accounts found.</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($admins as $admin): ?>
                            <tr>
                                <td class="fw-semibold"><?= htmlspecialchars($admin['name']) ?></td>
                                <td><?= htmlspecialchars($admin['email']) ?></td>
                                <td><?= $admin['created_at'] ? date('M j, Y g:i A', strtotime($admin['created_at'])) : 'N/A' ?></td>
                                <td>
                                    <?php if ($admin['last_login']): ?>
                                        <?= date('M j, Y g:i A', strtotime($admin['last_login'])) ?>
                                    <?php else: ?>
                                        <span class="text-muted">Never</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if ($admin['is_approved']): ?>
                                        <span class="badge bg-success">Approved</span>
                                    <?php else: ?>
                                        <span class="badge bg-warning">Pending</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <div class="btn-group btn-group-sm">
                                        <?php if (!$admin['is_approved']): ?>
                                            <a href="?action=approve&id=<?= $admin['id'] ?>&bid=<?= $browser_instance_id ?>" 
                                               class="btn btn-outline-success" 
                                               title="Approve Admin">
                                                <i class="bi bi-check-lg"></i> Approve
                                            </a>
                                        <?php endif; ?>
                                        
                                        <!-- Don't allow deleting your own account -->
                                        <?php if ($admin['id'] != $_SESSION['admin_id']): ?>
                                            <a href="?action=delete&id=<?= $admin['id'] ?>&bid=<?= $browser_instance_id ?>" 
                                               class="btn btn-outline-danger" 
                                               title="Delete Account"
                                               onclick="return confirm('Are you sure you want to delete this admin account? This action cannot be undone.')">
                                                <i class="bi bi-trash"></i> Remove
                                            </a>
                                        <?php else: ?>
                                            <button class="btn btn-outline-secondary" disabled title="Cannot delete your own account">
                                                <i class="bi bi-trash"></i> Remove
                                            </button>
                                        <?php endif; ?>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script src="../../bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="../js/dashboard.js"></script>
</body>
</html>