<?php
// admin/private/students.php
require_once '../php/admin_protect.php';

// Only allow approved admins to access this page
if ($_SESSION['pending_approval']) {
    header('Location: ../dashboard.php?bid=' . ($_SESSION['browser_instance_id'] ?? ''));
    exit;
}

// Include database connection
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

// Fetch all approved students with teacher information
$stmt = $pdo->prepare("SELECT 
    s.*,
    ia.student_gender,
    ia.student_dob,
    ia.student_school,
    ia.parent1_first_name,
    ia.parent1_last_name,
    ia.parent1_relationship,
    ia.parent1_relationship_other,
    ia.parent1_mobile,
    ia.parent1_email,
    ia.parent2_first_name,
    ia.parent2_last_name,
    ia.parent2_relationship,
    ia.parent2_relationship_other,
    ia.parent2_mobile,
    ia.parent2_email,
    ia.emergency_contact,
    ia.address,
    ia.city,
    ia.county,
    ia.postal_code,
    ia.illness,
    ia.illness_details,
    ia.special_needs,
    ia.special_needs_details,
    ia.allergies,
    ia.allergies_details,
    ia.knows_swimming,
    ia.travel_sickness,
    ia.travel_permission,
    ia.photo_permission,
    ia.transport_mode,
    ia.go_home_alone,
    ia.attended_islamic_education,
    ia.islamic_years,
    ia.islamic_education_details,
    ia.submitted_at,
    tu.name as teacher_name,
    tu.id as teacher_id
FROM students s
LEFT JOIN initial_admission ia ON s.admission_id = ia.id
LEFT JOIN teacher_users tu ON s.teacher_id = tu.id
WHERE s.status = 'active'
ORDER BY s.student_first_name, s.student_last_name");
$stmt->execute();
$students = $stmt->fetchAll();

$browser_instance_id = $_SESSION['browser_instance_id'] ?? '';
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Students - Al Falah</title>

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
            
            .student-details {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease-out;
                background-color: #f8f9fa;
                border-radius: 0.375rem;
            }

            .student-details.show {
                max-height: none; /* ← REMOVE HEIGHT RESTRICTION */
                height: auto;     /* ← ALLOW NATURAL HEIGHT */
                padding: 1rem;
                margin-top: 0.5rem;
                border: 1px solid #dee2e6;
            }
            
            .detail-section {
                margin-bottom: 1rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid #e9ecef;
            }
            
            .detail-section:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            
            .detail-label {
                font-weight: 600;
                color: #495057;
            }
            
            .detail-value {
                color: #6c757d;
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

            /* Detail grid styles from applications page */
            .detail-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-top: 0.5rem;
            }
            
            .detail-item {
                display: flex;
                flex-direction: column;
            }
            
            .detail-item strong {
                font-size: 0.875rem;
                color: #6c757d;
                margin-bottom: 0.25rem;
            }
            
            .compact-layout {
                align-items: start;
            }
            
            .parent-card {
                background: white;
                border: 1px solid #e9ecef;
                border-radius: 0.375rem;
                padding: 1rem;
                height: 100%;
            }
            
            .parent-card h6 {
                color: #495057;
                margin-bottom: 0.75rem;
                font-size: 0.9rem;
            }
            
            .contact-info {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .contact-item {
                display: flex;
                align-items: flex-start;
                gap: 0.5rem;
                font-size: 0.875rem;
            }
            
            .contact-item i {
                color: #6c757d;
                margin-top: 0.125rem;
                flex-shrink: 0;
            }
            
            .emergency-contact-card {
                background: #fff3cd;
                border-color: #ffeaa7;
            }
            
            .medical-info {
                background: #f8d7da;
                border-color: #f5c6cb;
            }
            
            .special-needs-info {
                background: #d1ecf1;
                border-color: #bee5eb;
            }
            
            .allergy-info {
                background: #fff3cd;
                border-color: #ffeaa7;
            }
            
            .permissions-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1rem;
                margin-top: 0.5rem;
            }
            
            .permission-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem;
                background: white;
                border: 1px solid #e9ecef;
                border-radius: 0.375rem;
                font-size: 0.875rem;
            }
            
            .permission-item i {
                color: #6c757d;
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
            <a href="../applications.php?bid=<?= $browser_instance_id ?>"><i class="bi bi-file-earmark-text"></i> Applications</a>
            <a href="students.php?bid=<?= $browser_instance_id ?>" class="active"><i class="bi bi-people"></i> Students</a>
            <a href="admin-accounts.php?bid=<?= $browser_instance_id ?>"><i class="bi bi-shield-check"></i> Admin Accounts</a>
            <a href="#?bid=<?= $browser_instance_id ?>"><i class="bi bi-gear"></i> Settings</a>

            <hr>
            <a href="../../php/logout.php?bid=<?= $browser_instance_id ?>" class="logout"><i class="bi bi-box-arrow-right"></i> Logout</a>
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
                <h2 class="dashboard-title m-0">Students Management</h2>
            </div>

            <!-- Students Table -->
            <div class="card shadow-sm">
                <div class="card-body">
                    <!-- Table Controls Inside Card -->
                    <div class="table-controls">
                        <div class="row g-2 align-items-center">
                            <!-- Search on the left -->
                            <div class="col-md-6">
                                <div class="input-group">
                                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                                    <input type="text" id="searchInput" class="form-control" placeholder="Search students...">
                                </div>
                            </div>

                            <!-- Refresh and Filter buttons on the right -->
                            <div class="col-md-6 text-end">
                                <div class="btn-group">
                                    <button id="refreshBtn" class="btn btn-outline-primary" title="Refresh Table">
                                        <i class="bi bi-arrow-repeat"></i> Refresh
                                    </button>
                                    <button id="filterBtn" class="btn btn-outline-primary" title="Filter Students">
                                        <i class="bi bi-funnel"></i> Filter
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Results count -->
                        <div class="row mt-2">
                            <div class="col-12">
                                <small class="text-muted">
                                    Showing <span id="visibleCount"><?= count($students) ?></span> of <span id="totalCount"><?= count($students) ?></span> students
                                </small>
                            </div>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-hover" id="studentsTable">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Age</th>
                                    <th class="mobile-hide">Program</th>
                                    <th class="mobile-hide">Year Group</th>
                                    <th>Teacher</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="studentsTableBody">
                                <?php if (empty($students)): ?>
                                    <tr>
                                        <td colspan="6" class="text-center text-muted py-4">No students found.</td>
                                    </tr>
                                <?php else: ?>
                                    <?php foreach ($students as $student): ?>
                                    <tr data-student="<?= htmlspecialchars(strtolower($student['student_first_name'] . ' ' . $student['student_last_name'])) ?>" 
                                        data-program="<?= htmlspecialchars(strtolower($student['interested_program'])) ?>"
                                        data-year-group="<?= htmlspecialchars(strtolower($student['year_group'])) ?>"
                                        data-teacher="<?= htmlspecialchars(strtolower($student['teacher_name'] ?? 'Unassigned')) ?>"
                                        data-age="<?= $student['student_age'] ?? '0' ?>"
                                        data-student-id="<?= $student['id'] ?>">
                                        <td class="fw-semibold">
                                            <?= htmlspecialchars($student['student_first_name'] . ' ' . $student['student_last_name']) ?>
                                        </td>
                                        <td><?= $student['student_age'] ?? 'N/A' ?></td>
                                        <td class="mobile-hide"><?= htmlspecialchars($student['interested_program']) ?></td>
                                        <td class="mobile-hide">
                                            <?= htmlspecialchars($student['year_group']) ?>
                                            <?php if (!empty($student['year_group_other'])): ?>
                                                <br><small class="text-muted">(<?= htmlspecialchars($student['year_group_other']) ?>)</small>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <?php if (!empty($student['teacher_name'])): ?>
                                                <?= htmlspecialchars($student['teacher_name']) ?>
                                            <?php else: ?>
                                                <span class="text-muted">Unassigned</span>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <div class="btn-group btn-group-sm">
                                                <button type="button" 
                                                        class="btn btn-outline-primary view-btn" 
                                                        data-student-id="<?= $student['id'] ?>">
                                                    <i class="bi bi-eye"></i> View
                                                </button>
                                                <button type="button" 
                                                        class="btn btn-outline-primary edit-btn" 
                                                        data-student-id="<?= $student['id'] ?>"
                                                        data-student-name="<?= htmlspecialchars($student['student_first_name'] . ' ' . $student['student_last_name']) ?>">
                                                    <i class="bi bi-pencil"></i> Edit
                                                </button>
                                                <button type="button" 
                                                        class="btn btn-outline-danger remove-btn" 
                                                        data-student-id="<?= $student['id'] ?>"
                                                        data-student-name="<?= htmlspecialchars($student['student_first_name'] . ' ' . $student['student_last_name']) ?>">
                                                    <i class="bi bi-person-dash"></i> Remove
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <!-- Student Details Row - Same design as applications page -->
                                    <tr class="student-details-row" style="display: none;">
                                        <td colspan="6">
                                            <div class="student-details" id="details-<?= $student['id'] ?>">
                                                <div class="text-center text-muted py-3">
                                                    <i class="bi bi-hourglass-split"></i> Click "View" to load details
                                                </div>
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

        <!-- Remove Student Confirmation Modal -->
        <div class="modal fade" id="removeModal" tabindex="-1" aria-labelledby="removeModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="removeModalLabel">Confirm Removal</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to remove <strong id="removeStudentName"></strong> from the students list?</p>
                        <p class="text-muted">This will mark the student as inactive but preserve their record.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" id="confirmRemove" class="btn btn-danger">Remove</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit Student Modal -->
        <div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editModalLabel">Edit Student</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editStudentForm">
                            <input type="hidden" id="editStudentId" name="student_id">
                            <div class="mb-3">
                                <label for="editFirstName" class="form-label">First Name</label>
                                <input type="text" class="form-control" id="editFirstName" name="first_name" required>
                            </div>
                            <div class="mb-3">
                                <label for="editLastName" class="form-label">Last Name</label>
                                <input type="text" class="form-control" id="editLastName" name="last_name" required>
                            </div>
                            <div class="mb-3">
                                <label for="editAge" class="form-label">Age</label>
                                <input type="number" class="form-control" id="editAge" name="age" min="0" max="30">
                            </div>
                            <div class="mb-3">
                                <label for="editProgram" class="form-label">Program</label>
                                <select class="form-select" id="editProgram" name="program">
                                    <option value="">Select Program</option>
                                    <option value="Weekday Morning Hifdh">Weekday Morning Hifdh</option>
                                    <option value="Weekday Evening Hifdh">Weekday Evening Hifdh</option>
                                    <option value="Weekday Evening Islamic Studies">Weekday Evening Islamic Studies</option>
                                    <option value="Weekend Hifdh">Weekend Hifdh</option>
                                    <option value="Weekend Islamic Studies">Weekend Islamic Studies</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="editYearGroup" class="form-label">Year Group</label>
                                <select class="form-select" id="editYearGroup" name="year_group">
                                    <option value="">Select Year Group</option>
                                    <option value="Nursery">Nursery</option>
                                    <option value="Reception">Reception</option>
                                    <option value="Year 1">Year 1</option>
                                    <option value="Year 2">Year 2</option>
                                    <option value="Year 3">Year 3</option>
                                    <option value="Year 4">Year 4</option>
                                    <option value="Year 5">Year 5</option>
                                    <option value="Year 6">Year 6</option>
                                    <option value="Year 7">Year 7</option>
                                    <option value="Year 8">Year 8</option>
                                    <option value="Year 9">Year 9</option>
                                    <option value="Year 10">Year 10</option>
                                    <option value="Year 11">Year 11</option>
                                    <option value="College / Sixth Form">College / Sixth Form</option>
                                    <option value="University">University</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="editTeacher" class="form-label">Assign Teacher</label>
                                <select class="form-select" id="editTeacher" name="teacher_id">
                                    <option value="">Unassigned</option>
                                    <?php
                                    // Fetch active teachers
                                    $teacherStmt = $pdo->prepare("SELECT id, name FROM teacher_users WHERE is_active = 1 AND is_approved = 1 ORDER BY name");
                                    $teacherStmt->execute();
                                    $teachers = $teacherStmt->fetchAll();
                                    foreach ($teachers as $teacher): ?>
                                        <option value="<?= $teacher['id'] ?>"><?= htmlspecialchars($teacher['name']) ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" id="confirmEdit" class="btn btn-primary">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filter Modal -->
        <div class="modal fade modal-green" id="filterModal" tabindex="-1" aria-labelledby="filterModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="filterModalLabel">Filter Students</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="programSelect" class="form-label">Program</label>
                            <select id="programSelect" class="form-select">
                                <option value="all">All Programs</option>
                                <option value="Weekday Morning Hifdh">Weekday Morning Hifdh</option>
                                <option value="Weekday Evening Hifdh">Weekday Evening Hifdh</option>
                                <option value="Weekday Evening Islamic Studies">Weekday Evening Islamic Studies</option>
                                <option value="Weekend Hifdh">Weekend Hifdh</option>
                                <option value="Weekend Islamic Studies">Weekend Islamic Studies</option>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label for="yearGroupSelect" class="form-label">Year Group</label>
                            <select id="yearGroupSelect" class="form-select">
                                <option value="all">All Year Groups</option>
                                <option value="Nursery">Nursery</option>
                                <option value="Reception">Reception</option>
                                <option value="Year 1">Year 1</option>
                                <option value="Year 2">Year 2</option>
                                <option value="Year 3">Year 3</option>
                                <option value="Year 4">Year 4</option>
                                <option value="Year 5">Year 5</option>
                                <option value="Year 6">Year 6</option>
                                <option value="Year 7">Year 7</option>
                                <option value="Year 8">Year 8</option>
                                <option value="Year 9">Year 9</option>
                                <option value="Year 10">Year 10</option>
                                <option value="Year 11">Year 11</option>
                                <option value="College / Sixth Form">College / Sixth Form</option>
                                <option value="University">University</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label for="teacherSelect" class="form-label">Teacher</label>
                            <select id="teacherSelect" class="form-select">
                                <option value="all">All Teachers</option>
                                <option value="unassigned">Unassigned</option>
                                <?php foreach ($teachers as $teacher): ?>
                                    <option value="<?= $teacher['id'] ?>"><?= htmlspecialchars($teacher['name']) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <!-- Age Range Filter -->
                        <div class="mb-3">
                            <label class="form-label">Age Range</label>
                            <div class="row g-2">
                                <div class="col-6">
                                    <input type="number" id="minAge" class="form-control" placeholder="Min Age" min="0" max="30">
                                </div>
                                <div class="col-6">
                                    <input type="number" id="maxAge" class="form-control" placeholder="Max Age" min="0" max="30">
                                </div>
                            </div>
                            <small class="text-muted">Leave empty for no age limit</small>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" id="clearFilterBtn" class="btn btn-outline-danger">Clear Filter</button>
                        <button type="button" id="applyFilterBtn" class="btn btn-primary">Apply Filter</button>
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
        
        <script src="../js/students.js"></script>
    </body>
</html>