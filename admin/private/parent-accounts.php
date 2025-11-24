<?php
// admin/private/parent-accounts.php
require_once '../php/admin_protect.php';

// Only allow approved admins to access this page
if ($_SESSION['pending_approval']) {
    header('Location: ../dashboard.php?bid=' . ($_SESSION['browser_instance_id'] ?? ''));
    exit;
}

// Include database connection
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

// Fetch all parent users
$stmt = $pdo->prepare("SELECT id, name, email, created_at, last_login, is_approved FROM parent_users ORDER BY created_at DESC");
$stmt->execute();
$parents = $stmt->fetchAll();

// Fetch only APPROVED students for dropdown
$students_stmt = $pdo->prepare("
    SELECT id, student_first_name, student_last_name, parent1_email, parent2_email 
    FROM initial_admission 
    WHERE (parent1_email IS NOT NULL OR parent2_email IS NOT NULL)
    AND status = 'approved'
    ORDER BY student_first_name, student_last_name
");
$students_stmt->execute();
$all_students = $students_stmt->fetchAll();

$browser_instance_id = $_SESSION['browser_instance_id'] ?? '';
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Parent Accounts - Al Falah</title>

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
            
            .save-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            /* Toast positioning */
            .toast-container {
                z-index: 9999;
            }
            
            /* Desktop - bottom right */
            @media (min-width: 768px) {
                .toast-container {
                    bottom: 20px;
                    right: 20px;
                }
            }
            
            /* Mobile - center */
            @media (max-width: 767.98px) {
                .toast-container {
                    bottom: 50%;
                    left: 50%;
                    transform: translate(-50%, 50%);
                    width: 90%;
                    max-width: 400px;
                }
            }
            
            /* Success toast styling */
            .toast.bg-success .toast-header {
                background-color: #198754 !important;
                color: white;
            }
            
            /* Error toast styling */
            .toast.bg-danger .toast-header {
                background-color: #dc3545 !important;
                color: white;
            }
            
            /* Green theme for modals */
            .modal-green .modal-header {
                background-color: #198754;
                color: white;
                border-bottom: none;
            }
            
            .modal-green .modal-header .btn-close {
                filter: invert(1);
            }
            
            .modal-green .btn-primary {
                background-color: #198754;
                border-color: #198754;
            }
            
            .modal-green .btn-primary:hover {
                background-color: #157347;
                border-color: #146c43;
            }
            
            /* Student dropdown styling */
            .student-dropdown {
                max-height: 200px;
                overflow-y: auto;
            }
            
            .matched-students {
                background-color: #e8f5e8;
                border-left: 4px solid #28a745;
            }
            
            .no-students {
                color: #6c757d;
                font-style: italic;
            }
            
            .student-list {
                max-height: 120px;
                overflow-y: auto;
            }

            .student-item {
                padding: 2px 0;
                font-size: 0.9rem;
            }

            .student-item:not(:last-child) {
                border-bottom: 1px solid #f0f0f0;
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
            <a href="admin-accounts.php?bid=<?= $browser_instance_id ?>"><i class="bi bi-shield-check"></i> Admin Accounts</a>
            <a href="parent-accounts.php?bid=<?= $browser_instance_id ?>" class="active"><i class="bi bi-person-heart"></i> Parent Accounts</a>
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
                <h2 class="dashboard-title m-0">Parent Accounts Management</h2>
            </div>

            <!-- Parent Accounts Table -->
            <div class="card shadow-sm">
                <div class="card-body">
                    <!-- Table Controls Inside Card -->
                    <div class="table-controls">
                        <div class="row g-2 align-items-center">
                            <!-- Search on the left -->
                            <div class="col-md-6">
                                <div class="input-group">
                                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                                    <input type="text" id="searchInput" class="form-control" placeholder="Search names, emails, or students...">
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
                                    Showing <span id="visibleCount"><?= count($parents) ?></span> of <span id="totalCount"><?= count($parents) ?></span> parents
                                </small>
                            </div>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-hover" id="parentTable">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Student Match</th>
                                    <th class="mobile-hide">Account Created</th>
                                    <th class="mobile-hide">Last Login</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="parentTableBody">
                                <?php if (empty($parents)): ?>
                                    <tr>
                                        <td colspan="7" class="text-center text-muted py-4">No parent accounts found.</td>
                                    </tr>
                                <?php else: ?>
                                    <?php 
                                    // Set UK timezone with automatic DST
                                    $ukTimezone = new DateTimeZone('Europe/London');
                                    
                                    foreach ($parents as $parent): 
                                        // Find matching students for this parent email
                                        // Find matching APPROVED students for this parent email
                                        $matching_students = array_filter($all_students, function($student) use ($parent) {
                                            return ($student['parent1_email'] === $parent['email'] || 
                                                    $student['parent2_email'] === $parent['email']);
                                            // Note: We don't need to check status here because $all_students now only contains approved students
                                        });
                                    ?>
                                    <tr data-name="<?= htmlspecialchars(strtolower($parent['name'])) ?>" 
                                        data-email="<?= htmlspecialchars(strtolower($parent['email'])) ?>" 
                                        data-status="<?= $parent['is_approved'] ? 'approved' : 'pending' ?>"
                                        data-parent-id="<?= $parent['id'] ?>">
                                        <td class="fw-semibold"><?= htmlspecialchars($parent['name']) ?></td>
                                        <td><?= htmlspecialchars($parent['email']) ?></td>
                                        <td>
                                            <?php if (count($matching_students) === 1): ?>
                                                <!-- Single student - show directly -->
                                                <?php $student = reset($matching_students); ?>
                                                <span class="fw-semibold">
                                                    <?= htmlspecialchars($student['student_first_name'] . ' ' . $student['student_last_name']) ?>
                                                </span>
                                                <small class="text-muted d-block">(Only child)</small>
                                            <?php elseif (count($matching_students) > 1): ?>
                                                <!-- Multiple students - simple list -->
                                                <div class="student-list">
                                                    <?php foreach ($matching_students as $student): ?>
                                                        <div class="student-item">
                                                            <i class="bi bi-person-fill me-1"></i>
                                                            <?= htmlspecialchars($student['student_first_name'] . ' ' . $student['student_last_name']) ?>
                                                        </div>
                                                    <?php endforeach; ?>
                                                </div>
                                                <small class="text-success d-block mt-1">
                                                    <i class="bi bi-people-fill"></i> 
                                                    <?= count($matching_students) ?> children enrolled
                                                </small>
                                            <?php else: ?>
                                                <!-- No students -->
                                                <span class="text-muted">No approved students</span>
                                            <?php endif; ?>
                                        </td>
                                        <td class="mobile-hide">
                                            <?php if ($parent['created_at']): ?>
                                                <?php 
                                                // Convert from UTC to UK time
                                                $createdDate = new DateTime($parent['created_at'], new DateTimeZone('UTC'));
                                                $createdDate->setTimezone(new DateTimeZone('Europe/London'));
                                                echo $createdDate->format('M j, Y g:i A');
                                                ?>
                                            <?php else: ?>
                                                N/A
                                            <?php endif; ?>
                                        </td>
                                        <td class="mobile-hide">
                                            <?php if ($parent['last_login']): ?>
                                                <?php 
                                                // Convert from UTC to UK time
                                                $loginDate = new DateTime($parent['last_login'], new DateTimeZone('UTC'));
                                                $loginDate->setTimezone(new DateTimeZone('Europe/London'));
                                                echo $loginDate->format('M j, Y g:i A');
                                                ?>
                                            <?php else: ?>
                                                <span class="text-muted">Never</span>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <div class="btn-group btn-group-sm">
                                                <button type="button" 
                                                        class="btn btn-outline-primary edit-btn" 
                                                        data-parent-id="<?= $parent['id'] ?>"
                                                        data-parent-name="<?= htmlspecialchars($parent['name']) ?>"
                                                        data-parent-email="<?= htmlspecialchars($parent['email']) ?>"
                                                        data-parent-approved="<?= $parent['is_approved'] ?>">
                                                    <i class="bi bi-pencil"></i> Edit
                                                </button>

                                                <button type="button" 
                                                        class="btn btn-outline-danger remove-btn" 
                                                        data-parent-id="<?= $parent['id'] ?>"
                                                        data-parent-name="<?= htmlspecialchars($parent['name']) ?>"
                                                        data-parent-email="<?= htmlspecialchars($parent['email']) ?>">
                                                    <i class="bi bi-trash"></i> Remove
                                                </button>
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

        <!-- Edit Parent Modal -->
        <div class="modal fade modal-green" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editModalLabel">Edit Parent</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editParentForm">
                            <input type="hidden" id="editParentId" name="parent_id">
                            <div class="mb-3">
                                <label for="editName" class="form-label">Name</label>
                                <input type="text" class="form-control" id="editName" name="name" required>
                            </div>
                            <div class="mb-3">
                                <label for="editEmail" class="form-label">Email</label>
                                <input type="email" class="form-control" id="editEmail" name="email" required>
                            </div>
                            <div class="mb-3 form-check">
                                <input type="checkbox" class="form-check-input" id="editApproved" name="is_approved">
                                <label class="form-check-label" for="editApproved">Approved Account</label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" id="saveChangesBtn" class="btn btn-primary save-btn" disabled>Save Changes</button>
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
                        <p>Are you sure you want to remove <strong id="removeParentName"></strong> (<span id="removeParentEmail"></span>)?</p>
                        <p class="text-danger"><strong>This action cannot be undone.</strong></p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" id="confirmRemove" class="btn btn-danger">Remove</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Toast Notification Container -->
        <div class="toast-container position-fixed p-3">
            <div id="liveToast" class="toast align-items-center" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        Operation completed successfully!
                    </div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        </div>

        <script src="../../bootstrap/js/bootstrap.bundle.min.js"></script>
        <script src="../js/dashboard.js"></script>
        <script>
            // Pass PHP variables to JavaScript
            const browserInstanceId = '<?= $browser_instance_id ?>';
            const currentAdminId = <?= json_encode($_SESSION['admin_id'] ?? 0) ?>;
        </script>
        
        <script src="../js/parent-accounts.js"></script>
    </body>
</html>