<?php
// admin/teacher-accounts.php
require_once '../php/admin_protect.php';

// Only allow approved admins to access this page
if ($_SESSION['pending_approval']) {
    header('Location: ../dashboard.php?bid=' . ($_SESSION['browser_instance_id'] ?? ''));
    exit;
}

// Include database connection
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

// Function to format program names for display
function formatProgramNames($programValues) {
    $programMap = [
        'weekday_morning_hifdh' => 'Weekday Morning Hifdh',
        'weekday_evening_hifdh' => 'Weekday Evening Hifdh',
        'weekend_evening_islamic_studies' => 'Weekend Evening Islamic Studies',
        'weekend_hifdh' => 'Weekend Hifdh',
        'weekend_islamic_studies' => 'Weekend Islamic Studies'
    ];
    
    if (empty($programValues)) {
        return 'Not set';
    }
    
    $programs = explode(',', $programValues);
    $formattedPrograms = array_map(function($program) use ($programMap) {
        return $programMap[trim($program)] ?? trim($program);
    }, $programs);
    
    return implode(', ', $formattedPrograms);
}

// Fetch all teacher users
$stmt = $pdo->prepare("SELECT id, name, email, year_group, program, created_at, last_login, is_approved FROM teacher_users ORDER BY created_at DESC");
$stmt->execute();
$teachers = $stmt->fetchAll();

$browser_instance_id = $_SESSION['browser_instance_id'] ?? '';
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Teacher Accounts - Al Falah</title>

        <link href="../../bootstrap/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
        <link rel="stylesheet" href="../css/admin.css">
        <link rel="stylesheet" href="../css/teacher-accounts.css">
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
            <a href="teacher-accounts.php?bid=<?= $browser_instance_id ?>" class="active"><i class="bi bi-person-badge"></i> Teacher Accounts</a>
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
                <h2 class="dashboard-title m-0">Teacher Accounts Management</h2>
            </div>

            <!-- Teacher Accounts Table -->
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
                                    Showing <span id="visibleCount"><?= count($teachers) ?></span> of <span id="totalCount"><?= count($teachers) ?></span> teachers
                                </small>
                            </div>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-hover" id="teacherTable">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th class="mobile-hide">Year Groups</th>
                                    <th class="mobile-hide">Programs</th>
                                    <th class="mobile-hide">Last Login</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="teacherTableBody">
                                <?php if (empty($teachers)): ?>
                                    <tr>
                                        <td colspan="7" class="text-center text-muted py-4">No teacher accounts found.</td>
                                    </tr>
                                <?php else: ?>
                                    <?php 
                                    // Set UK timezone with automatic DST
                                    $ukTimezone = new DateTimeZone('Europe/London');
                                    ?>
                                    <?php foreach ($teachers as $teacher): ?>
                                    <tr data-name="<?= htmlspecialchars(strtolower($teacher['name'])) ?>" 
                                        data-email="<?= htmlspecialchars(strtolower($teacher['email'])) ?>" 
                                        data-status="<?= $teacher['is_approved'] ? 'approved' : 'pending' ?>"
                                        data-teacher-id="<?= $teacher['id'] ?>">
                                        <td class="fw-semibold"><?= htmlspecialchars($teacher['name']) ?></td>
                                        <td><?= htmlspecialchars($teacher['email']) ?></td>
                                        <td class="mobile-hide">
                                            <?php if (!empty($teacher['year_group'])): ?>
                                                <div class="year-group-badges">
                                                    <?php 
                                                    $yearGroups = explode(',', $teacher['year_group']);
                                                    foreach ($yearGroups as $year): ?>
                                                        <span class="badge bg-primary me-1">Year <?= htmlspecialchars(trim($year)) ?></span>
                                                    <?php endforeach; ?>
                                                </div>
                                            <?php else: ?>
                                                <span class="text-muted">Not set</span>
                                            <?php endif; ?>
                                        </td>
                                        <td class="mobile-hide">
                                            <?php if (!empty($teacher['program'])): ?>
                                                <div class="program-badges">
                                                    <?php 
                                                    $programs = explode(',', $teacher['program']);
                                                    foreach ($programs as $program): 
                                                        $formattedProgram = formatProgramNames($program);
                                                    ?>
                                                        <span class="badge bg-info me-1 mb-1"><?= htmlspecialchars($formattedProgram) ?></span>
                                                    <?php endforeach; ?>
                                                </div>
                                            <?php else: ?>
                                                <span class="text-muted">Not set</span>
                                            <?php endif; ?>
                                        </td>
                                        <td class="mobile-hide">
                                            <?php if ($teacher['last_login']): ?>
                                                <?php 
                                                // Convert from UTC to UK time
                                                $loginDate = new DateTime($teacher['last_login'], new DateTimeZone('UTC'));
                                                $loginDate->setTimezone(new DateTimeZone('Europe/London'));
                                                echo $loginDate->format('M j, Y g:i A');
                                                ?>
                                            <?php else: ?>
                                                <span class="text-muted">Never</span>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <?php if ($teacher['is_approved']): ?>
                                                <span class="badge bg-success">Approved</span>
                                            <?php else: ?>
                                                <span class="badge bg-danger">Pending</span>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <div class="btn-group btn-group-sm">
                                                <button type="button" 
                                                        class="btn btn-outline-primary edit-btn" 
                                                        data-teacher-id="<?= $teacher['id'] ?>"
                                                        data-teacher-name="<?= htmlspecialchars($teacher['name']) ?>"
                                                        data-teacher-email="<?= htmlspecialchars($teacher['email']) ?>"
                                                        data-teacher-approved="<?= $teacher['is_approved'] ?>"
                                                        data-year-group="<?= $teacher['year_group'] ?? '' ?>"
                                                        data-program="<?= $teacher['program'] ?? '' ?>">
                                                    <i class="bi bi-pencil"></i> Edit
                                                </button>

                                                <?php if (!$teacher['is_approved']): ?>
                                                    <button type="button" 
                                                            class="btn btn-outline-success approve-btn" 
                                                            data-teacher-id="<?= $teacher['id'] ?>"
                                                            data-teacher-name="<?= htmlspecialchars($teacher['name']) ?>"
                                                            data-teacher-email="<?= htmlspecialchars($teacher['email']) ?>">
                                                        <i class="bi bi-check-lg"></i> Approve
                                                    </button>
                                                <?php endif; ?>

                                                <button type="button" 
                                                        class="btn btn-outline-danger remove-btn" 
                                                        data-teacher-id="<?= $teacher['id'] ?>"
                                                        data-teacher-name="<?= htmlspecialchars($teacher['name']) ?>"
                                                        data-teacher-email="<?= htmlspecialchars($teacher['email']) ?>">
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

        <!-- Edit Teacher Modal -->
        <div class="modal fade modal-blue" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editModalLabel">Edit Teacher</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editTeacherForm">
                            <input type="hidden" id="editTeacherId" name="teacher_id">
                            
                            <!-- Basic Information -->
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="editName" class="form-label">Name <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="editName" name="name" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="editEmail" class="form-label">Email <span class="text-danger">*</span></label>
                                        <input type="email" class="form-control" id="editEmail" name="email" required>
                                    </div>
                                </div>
                            </div>

                            <!-- Year Groups Selection -->
                            <div class="mb-4">
                                <label class="form-label fw-semibold">Year Groups</label>
                                <div class="multi-select-card" id="yearGroupSelectCard">
                                    <div class="multi-select-header">
                                        <span>Select year groups this teacher can teach</span>
                                        <small class="text-muted" id="yearGroupCount">0 selected</small>
                                    </div>
                                    <div class="multi-select-grid" id="yearGroupGrid">
                                        <?php for ($i = 1; $i <= 11; $i++): ?>
                                            <div class="multi-select-option" data-value="<?= $i ?>">
                                                <div class="option-checkbox">
                                                    <i class="bi bi-check-lg"></i>
                                                </div>
                                                <span class="option-label">Year <?= $i ?></span>
                                            </div>
                                        <?php endfor; ?>
                                    </div>
                                    <input type="hidden" id="editYearGroup" name="year_group[]">
                                </div>
                            </div>

                            <!-- Programs Selection -->
                            <div class="mb-4">
                                <label class="form-label fw-semibold">Programs</label>
                                <div class="multi-select-card" id="programSelectCard">
                                    <div class="multi-select-header">
                                        <span>Select programs this teacher can teach</span>
                                        <small class="text-muted" id="programCount">0 selected</small>
                                    </div>
                                    <div class="multi-select-grid" id="programGrid">
                                        <div class="multi-select-option" data-value="weekday_morning_hifdh">
                                            <div class="option-checkbox">
                                                <i class="bi bi-check-lg"></i>
                                            </div>
                                            <span class="option-label">Weekday Morning Hifdh</span>
                                        </div>
                                        <div class="multi-select-option" data-value="weekday_evening_hifdh">
                                            <div class="option-checkbox">
                                                <i class="bi bi-check-lg"></i>
                                            </div>
                                            <span class="option-label">Weekday Evening Hifdh</span>
                                        </div>
                                        <div class="multi-select-option" data-value="weekend_evening_islamic_studies">
                                            <div class="option-checkbox">
                                                <i class="bi bi-check-lg"></i>
                                            </div>
                                            <span class="option-label">Weekend Evening Islamic Studies</span>
                                        </div>
                                        <div class="multi-select-option" data-value="weekend_hifdh">
                                            <div class="option-checkbox">
                                                <i class="bi bi-check-lg"></i>
                                            </div>
                                            <span class="option-label">Weekend Hifdh</span>
                                        </div>
                                        <div class="multi-select-option" data-value="weekend_islamic_studies">
                                            <div class="option-checkbox">
                                                <i class="bi bi-check-lg"></i>
                                            </div>
                                            <span class="option-label">Weekend Islamic Studies</span>
                                        </div>
                                    </div>
                                    <input type="hidden" id="editProgram" name="program[]">
                                </div>
                            </div>

                            <!-- Approval Status -->
                            <div class="mb-3">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="editApproved" name="is_approved">
                                    <label class="form-check-label fw-semibold" for="editApproved">Approved Account</label>
                                </div>
                                <small class="form-text text-muted">Approved teachers can access the teacher panel and be assigned students.</small>
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

        <!-- Filter Modal -->
        <div class="modal fade modal-blue" id="filterModal" tabindex="-1" aria-labelledby="filterModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="filterModalLabel">Filter Teachers</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="statusSelect" class="form-label">Filter by Status</label>
                            <select id="statusSelect" class="form-select">
                                <option value="all">All Teachers</option>
                                <option value="approved">Approved Only</option>
                                <option value="pending">Pending Only</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="yearGroupFilterSelect" class="form-label">Filter by Year Group</label>
                            <select id="yearGroupFilterSelect" class="form-select">
                                <option value="all">All Year Groups</option>
                                <?php for ($i = 1; $i <= 11; $i++): ?>
                                    <option value="<?= $i ?>">Year <?= $i ?></option>
                                <?php endfor; ?>
                                <option value="not_set">Not Set</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="programFilterSelect" class="form-label">Filter by Program</label>
                            <select id="programFilterSelect" class="form-select">
                                <option value="all">All Programs</option>
                                <option value="weekday_morning_hifdh">Weekday Morning Hifdh</option>
                                <option value="weekday_evening_hifdh">Weekday Evening Hifdh</option>
                                <option value="weekend_evening_islamic_studies">Weekend Evening Islamic Studies</option>
                                <option value="weekend_hifdh">Weekend Hifdh</option>
                                <option value="weekend_islamic_studies">Weekend Islamic Studies</option>
                                <option value="not_set">Not Set</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" id="clearFilterBtn" class="btn btn-outline-danger">Clear Filter</button>
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
                        <p>Are you sure you want to approve <strong id="approveTeacherName"></strong> (<span id="approveTeacherEmail"></span>)?</p>
                        <p class="text-muted">This will grant them full access to the teacher panel.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" id="confirmApprove" class="btn btn-success">Approve</button>
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
                        <p>Are you sure you want to remove <strong id="removeTeacherName"></strong> (<span id="removeTeacherEmail"></span>)?</p>
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
        </script>
        
        <script src="../js/teacher-accounts.js"></script>
    </body>
</html>