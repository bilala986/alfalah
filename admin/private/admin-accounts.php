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
        <style>
            .table-controls {
                padding: 1rem 0;
                border-bottom: 1px solid #dee2e6;
                margin-bottom: 1rem;
            }
            .refresh-spin {
                animation: refreshSpin 0.6s ease;
            }
            @keyframes refreshSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Mobile responsive adjustments */
            @media (max-width: 768px) {
                .table-controls .btn-group {
                    justify-content: center;
                    width: 100%;
                    margin-top: 10px;
                }
                .table-controls .col-md-6.text-end {
                    text-align: center !important;
                }
            }
            
            /* Hide columns on mobile */
            @media (max-width: 576px) {
                .mobile-hide {
                    display: none;
                }
            }
        </style>
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
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="dashboard-title m-0">Admin Accounts Management</h2>
            </div>

            <!-- Admin Accounts Table -->
            <div class="card shadow-sm">
                <div class="card-body">
                    <!-- Table Controls Inside Card -->
                    <div class="table-controls">
                        <div class="row g-2 align-items-center">
                            <!-- Search on the left -->
                            <div class="col-md-6">
                                <div class="input-group">
                                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                                    <input type="text" id="searchInput" class="form-control" placeholder="Search names or emails...">
                                </div>
                            </div>
                            
                            <!-- Refresh and Filter buttons on the right -->
                            <div class="col-md-6 text-end">
                                <div class="btn-group">
                                    <button id="refreshBtn" class="btn btn-outline-primary" title="Refresh Table">
                                        <i class="bi bi-arrow-repeat"></i> Refresh
                                    </button>
                                    <button id="filterBtn" class="btn btn-outline-primary" title="Filter Table">
                                        <i class="bi bi-funnel"></i> Filter
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Results count -->
                        <div class="row mt-2">
                            <div class="col-12">
                                <small class="text-muted">
                                    Showing <span id="visibleCount"><?= count($admins) ?></span> of <?= count($admins) ?> admins
                                </small>
                            </div>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-hover" id="adminTable">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th class="mobile-hide">Account Created</th>
                                    <th class="mobile-hide">Last Login</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="adminTableBody">
                                <?php if (empty($admins)): ?>
                                    <tr>
                                        <td colspan="6" class="text-center text-muted py-4">No admin accounts found.</td>
                                    </tr>
                                <?php else: ?>
                                    <?php foreach ($admins as $admin): ?>
                                    <tr data-name="<?= htmlspecialchars(strtolower($admin['name'])) ?>" 
                                        data-email="<?= htmlspecialchars(strtolower($admin['email'])) ?>" 
                                        data-status="<?= $admin['is_approved'] ? 'approved' : 'pending' ?>">
                                        <td class="fw-semibold"><?= htmlspecialchars($admin['name']) ?></td>
                                        <td><?= htmlspecialchars($admin['email']) ?></td>
                                        <td class="mobile-hide"><?= $admin['created_at'] ? date('M j, Y g:i A', strtotime($admin['created_at'])) : 'N/A' ?></td>
                                        <td class="mobile-hide">
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
                                                <span class="badge bg-danger">Pending</span>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <div class="btn-group btn-group-sm">
                                                <?php if (!$admin['is_approved']): ?>
                                                    <button type="button" 
                                                            class="btn btn-outline-success approve-btn" 
                                                            data-admin-id="<?= $admin['id'] ?>"
                                                            data-admin-name="<?= htmlspecialchars($admin['name']) ?>"
                                                            data-admin-email="<?= htmlspecialchars($admin['email']) ?>">
                                                        <i class="bi bi-check-lg"></i> Approve
                                                    </button>
                                                <?php endif; ?>

                                                <!-- Don't allow deleting your own account -->
                                                <?php if ($admin['id'] != $_SESSION['admin_id']): ?>
                                                    <button type="button" 
                                                            class="btn btn-outline-danger remove-btn" 
                                                            data-admin-id="<?= $admin['id'] ?>"
                                                            data-admin-name="<?= htmlspecialchars($admin['name']) ?>"
                                                            data-admin-email="<?= htmlspecialchars($admin['email']) ?>">
                                                        <i class="bi bi-trash"></i> Remove
                                                    </button>
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

        <!-- Filter Modal -->
        <div class="modal fade" id="filterModal" tabindex="-1" aria-labelledby="filterModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="filterModalLabel">Filter Admins</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="statusSelect" class="form-label">Filter by Status</label>
                            <select id="statusSelect" class="form-select">
                                <option value="all">All Admins</option>
                                <option value="approved">Approved Only</option>
                                <option value="pending">Pending Only</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" id="applyFilterBtn" class="btn btn-primary">Apply Filter</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Approve Confirmation Modal -->
        <div class="modal fade" id="approveModal" tabindex="-1" aria-labelledby="approveModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="approveModalLabel">Confirm Approval</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to approve <strong id="approveAdminName"></strong> (<span id="approveAdminEmail"></span>)?</p>
                        <p class="text-muted">This will grant them full access to the admin panel.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <a href="#" id="confirmApprove" class="btn btn-success">Approve</a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Remove Confirmation Modal -->
        <div class="modal fade" id="removeModal" tabindex="-1" aria-labelledby="removeModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="removeModalLabel">Confirm Removal</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to remove <strong id="removeAdminName"></strong> (<span id="removeAdminEmail"></span>)?</p>
                        <p class="text-danger"><strong>This action cannot be undone.</strong></p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <a href="#" id="confirmRemove" class="btn btn-danger">Remove</a>
                    </div>
                </div>
            </div>
        </div>

        <script src="../../bootstrap/js/bootstrap.bundle.min.js"></script>
        <script src="../js/dashboard.js"></script>
        <script>
            // Pass PHP variable to JavaScript
            const browserInstanceId = '<?= $browser_instance_id ?>';
        </script>
        <script src="../js/admin-accounts.js"></script>
    </body>
</html>