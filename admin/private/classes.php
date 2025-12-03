<?php
// admin/private/classes.php
require_once '../php/admin_protect.php';

// Only allow approved admins to access this page
if ($_SESSION['pending_approval']) {
    header('Location: ../dashboard.php?bid=' . ($_SESSION['browser_instance_id'] ?? ''));
    exit;
}

// Include database connection
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

// Initialize variables
$classes = [];
$error = null;
$browser_instance_id = $_SESSION['browser_instance_id'] ?? '';

try {
    // First, check if the classes table exists
    $checkTableStmt = $pdo->query("SHOW TABLES LIKE 'classes'");
    $tableExists = $checkTableStmt->rowCount() > 0;
    
    if ($tableExists) {
        // Fetch classes data with teacher and student information - INCLUDING GENDER
        $stmt = $pdo->prepare("
            SELECT 
                c.id as class_id,
                c.class_name,
                c.year_group,
                c.program,
                c.gender,
                tu.name as teacher_name,
                tu.id as teacher_id,
                COUNT(s.id) as student_count,
                GROUP_CONCAT(
                    CONCAT(s.student_first_name, ' ', s.student_last_name) 
                    ORDER BY s.student_first_name, s.student_last_name
                    SEPARATOR ', '
                ) as student_names
            FROM classes c
            LEFT JOIN teacher_users tu ON c.teacher_id = tu.id
            LEFT JOIN students s ON c.id = s.class_id AND s.status = 'active'
            WHERE c.status = 'active'
            GROUP BY c.id
            ORDER BY c.year_group, c.class_name
        ");
        $stmt->execute();
        $classes = $stmt->fetchAll();
    } else {
        // Table doesn't exist yet - this is normal for first-time setup
        $error = "classes table not found. Please run the database setup.";
    }
    
} catch (PDOException $e) {
    // Handle database errors gracefully
    $error = "Database error: " . $e->getMessage();
    error_log("Classes page error: " . $e->getMessage());
}

// Fetch teachers for filter dropdown (always fetch this even if classes table doesn't exist)
try {
    $teacherStmt = $pdo->prepare("SELECT id, name FROM teacher_users WHERE is_active = 1 ORDER BY name");
    $teacherStmt->execute();
    $teachers = $teacherStmt->fetchAll();
} catch (PDOException $e) {
    $teachers = [];
    error_log("Error fetching teachers: " . $e->getMessage());
}
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Classes - Al Falah</title>

        <link href="../../bootstrap/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
        <link rel="stylesheet" href="../css/admin.css">
        <style>
            .classes-table {
                margin-top: 20px;
            }
            
            .class-row:hover {
                background-color: #f8f9fa;
            }
            
            .student-list {
                max-height: 150px;
                overflow-y: auto;
                padding: 8px;
                background-color: #f8f9fa;
                border-radius: 4px;
                font-size: 0.9rem;
            }
            
            .student-list-item {
                padding: 4px 0;
                border-bottom: 1px solid #e9ecef;
            }
            
            .student-list-item:last-child {
                border-bottom: none;
            }
            
            .badge-class {
                background-color: #6610f2;
                font-size: 0.8rem;
            }
            
            .badge-year {
                background-color: #20c997;
                font-size: 0.8rem;
            }
            
            .badge-students {
                background-color: #fd7e14;
                font-size: 0.8rem;
            }
            
            .table-controls {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            
            .filter-active {
                background-color: #28a745 !important;
                color: white !important;
            }
            
            .mobile-hide {
                display: table-cell;
            }
            
            @media (max-width: 768px) {
                .mobile-hide {
                    display: none;
                }
                .actions-column {
                    min-width: 100px;
                }
            }
            
            .setup-alert {
                margin-bottom: 20px;
            }
            
            .actions-column {
                white-space: nowrap;
            }
            
            .btn-group-sm .btn {
                padding: 0.25rem 0.5rem;
                font-size: 0.875rem;
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
            <a href="students.php?bid=<?= $browser_instance_id ?>"><i class="bi bi-people"></i> Students</a>
            <a href="teacher-accounts.php?bid=<?= $browser_instance_id ?>"><i class="bi bi-person-badge"></i> Teacher Accounts</a>
            <a href="classes.php?bid=<?= $browser_instance_id ?>" class="active"><i class="bi bi-mortarboard"></i> Classes</a>
            <a href="admin-accounts.php?bid=<?= $browser_instance_id ?>"><i class="bi bi-shield-check"></i> Admin Accounts</a>

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
                <h2 class="dashboard-title m-0">Classes Management</h2>
            </div>

            <!-- Show setup message if needed -->
            <?php if ($error): ?>
            <div class="alert alert-warning setup-alert" role="alert">
                <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Setup Required</h4>
                <p><?= htmlspecialchars($error) ?></p>
                <hr>
                <p class="mb-0">Please run the following SQL queries in your database:</p>
                <pre class="mt-2 p-2 bg-light border rounded">
CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(100) NOT NULL,
    year_group VARCHAR(50) NOT NULL,
    program VARCHAR(100),
    teacher_id INT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teacher_users(id) ON DELETE SET NULL
);

ALTER TABLE students ADD COLUMN class_id INT NULL AFTER teacher_id;
ALTER TABLE students ADD FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL;</pre>
            </div>
            <?php endif; ?>

            <!-- Classes Table Card -->
            <div class="card shadow-sm">
                <div class="card-body">
                    <!-- Table Controls Inside Card -->
                    <div class="table-controls">
                        <div class="row g-2 align-items-center">
                            <!-- Search on the left -->
                            <div class="col-md-6">
                                <div class="input-group">
                                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                                    <input type="text" id="searchInput" class="form-control" placeholder="Search classes, teachers, or students..." <?= $error ? 'disabled' : '' ?>>
                                </div>
                            </div>

                            <!-- Refresh and Filter buttons on the right -->
                            <div class="col-md-6 text-end">
                                <div class="btn-group">
                                    <button id="refreshBtn" class="btn btn-outline-primary" title="Refresh Table" <?= $error ? 'disabled' : '' ?>>
                                        <i class="bi bi-arrow-repeat"></i> Refresh
                                    </button>
                                    <button id="filterBtn" class="btn btn-outline-primary" title="Filter Classes" <?= $error ? 'disabled' : '' ?>>
                                        <i class="bi bi-funnel"></i> Filter
                                    </button>
                                    <button id="addClassBtn" class="btn btn-primary" <?= $error ? 'disabled' : '' ?>>
                                        <i class="bi bi-plus-lg"></i> Add Class
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Results count -->
                        <div class="row mt-2">
                            <div class="col-12">
                                <small class="text-muted">
                                    Showing <span id="visibleCount"><?= count($classes) ?></span> of <span id="totalCount"><?= count($classes) ?></span> classes
                                </small>
                            </div>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-hover" id="classesTable">
                            <thead>
                                <tr>
                                    <th>Class Name</th>
                                    <th class="mobile-hide">Program</th>
                                    <th>Year Group</th>
                                    <th>Teacher</th>
                                    <th>Students</th>
                                    <th class="mobile-hide">Student List</th>
                                    <th class="actions-column">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="classesTableBody">
                                <?php if ($error): ?>
                                    <tr>
                                        <td colspan="7" class="text-center text-muted py-4">
                                            <i class="bi bi-database-exclamation display-6"></i>
                                            <p class="mt-2">Database setup required. Please create the classes table.</p>
                                        </td>
                                    </tr>
                                <?php elseif (empty($classes)): ?>
                                    <tr>
                                        <td colspan="7" class="text-center text-muted py-4">
                                            <i class="bi bi-mortarboard display-6"></i>
                                            <p class="mt-2">No classes found. Create your first class to get started.</p>
                                        </td>
                                    </tr>
                                <?php else: ?>
                                    <?php foreach ($classes as $class): ?>
                                    <!-- In the table row loop, around line 195, update the data attributes: -->
                                    <tr class="class-row"
                                        data-class-id="<?= $class['class_id'] ?>"
                                        data-class-name="<?= htmlspecialchars(strtolower($class['class_name'])) ?>"
                                        data-program="<?= htmlspecialchars(strtolower($class['program'] ?? '')) ?>"
                                        data-year-group="<?= htmlspecialchars(strtolower($class['year_group'])) ?>"
                                        data-gender="<?= htmlspecialchars($class['gender'] ?? 'Mixed') ?>"
                                        data-teacher="<?= htmlspecialchars(strtolower($class['teacher_name'] ?? 'Unassigned')) ?>"
                                        data-teacher-id="<?= $class['teacher_id'] ?? '' ?>"
                                        data-students="<?= htmlspecialchars(strtolower($class['student_names'] ?? '')) ?>">
                                        <td class="fw-semibold">
                                            <span class="badge badge-class me-2"><?= htmlspecialchars($class['class_name']) ?></span>
                                        </td>
                                        <td class="mobile-hide"><?= htmlspecialchars($class['program'] ?? 'N/A') ?></td>
                                        <td>
                                            <span class="badge badge-year"><?= htmlspecialchars($class['year_group']) ?></span>
                                        </td>
                                        <td>
                                            <?php if (!empty($class['teacher_name'])): ?>
                                                <?= htmlspecialchars($class['teacher_name']) ?>
                                            <?php else: ?>
                                                <span class="text-muted">Unassigned</span>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <span class="badge badge-students">
                                                <i class="bi bi-people"></i> <?= $class['student_count'] ?> students
                                            </span>
                                        </td>
                                        <td class="mobile-hide">
                                            <?php if (!empty($class['student_names'])): ?>
                                                <div class="student-list">
                                                    <?php 
                                                    $student_names = explode(', ', $class['student_names']);
                                                    foreach ($student_names as $student): 
                                                        if (!empty(trim($student))):
                                                    ?>
                                                        <div class="student-list-item"><?= htmlspecialchars($student) ?></div>
                                                    <?php 
                                                        endif;
                                                    endforeach; 
                                                    ?>
                                                </div>
                                            <?php else: ?>
                                                <span class="text-muted">No students</span>
                                            <?php endif; ?>
                                        </td>
                                        <td class="actions-column">
                                            <div class="btn-group btn-group-sm">
                                                <button type="button" 
                                                        class="btn btn-outline-primary edit-class-btn"
                                                        data-class-id="<?= $class['class_id'] ?>"
                                                        data-class-name="<?= htmlspecialchars($class['class_name']) ?>"
                                                        data-year-group="<?= htmlspecialchars($class['year_group']) ?>"
                                                        data-program="<?= htmlspecialchars($class['program'] ?? '') ?>"
                                                        data-gender="<?= htmlspecialchars($class['gender'] ?? 'Male') ?>"
                                                        data-teacher-id="<?= $class['teacher_id'] ?? '' ?>">
                                                    <i class="bi bi-pencil"></i> Edit
                                                </button>
                                                <button type="button" 
                                                        class="btn btn-outline-danger remove-class-btn"
                                                        data-class-id="<?= $class['class_id'] ?>"
                                                        data-class-name="<?= htmlspecialchars($class['class_name']) ?>"
                                                        data-student-count="<?= $class['student_count'] ?>">
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

        <!-- Filter Modal -->
        <div class="modal fade" id="filterModal" tabindex="-1" aria-labelledby="filterModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="filterModalLabel">Filter Classes</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="yearGroupFilter" class="form-label">Year Group</label>
                            <select id="yearGroupFilter" class="form-select" <?= $error ? 'disabled' : '' ?>>
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
                            </select>
                        </div>

                        <div class="mb-3">
                            <label for="teacherFilter" class="form-label">Teacher</label>
                            <select id="teacherFilter" class="form-select" <?= $error ? 'disabled' : '' ?>>
                                <option value="all">All Teachers</option>
                                <option value="unassigned">Unassigned</option>
                                <?php if (!empty($teachers)): ?>
                                    <?php foreach ($teachers as $teacher): ?>
                                        <option value="<?= $teacher['id'] ?>"><?= htmlspecialchars($teacher['name']) ?></option>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label for="programFilter" class="form-label">Program</label>
                            <select id="programFilter" class="form-select" <?= $error ? 'disabled' : '' ?>>
                                <option value="all">All Programs</option>
                                <option value="Weekday Morning Hifdh">Weekday Morning Hifdh</option>
                                <option value="Weekday Evening Hifdh">Weekday Evening Hifdh</option>
                                <option value="Weekday Evening Islamic Studies">Weekday Evening Islamic Studies</option>
                                <option value="Weekend Hifdh">Weekend Hifdh</option>
                                <option value="Weekend Islamic Studies">Weekend Islamic Studies</option>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Students Range</label>
                            <div class="row g-2">
                                <div class="col-6">
                                    <input type="number" id="minStudents" class="form-control" placeholder="Min" min="0" <?= $error ? 'disabled' : '' ?>>
                                </div>
                                <div class="col-6">
                                    <input type="number" id="maxStudents" class="form-control" placeholder="Max" min="0" <?= $error ? 'disabled' : '' ?>>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" id="clearFilterBtn" class="btn btn-outline-danger" <?= $error ? 'disabled' : '' ?>>Clear Filter</button>
                        <button type="button" id="applyFilterBtn" class="btn btn-primary" <?= $error ? 'disabled' : '' ?>>Apply Filter</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Add Class Modal -->
        <div class="modal fade" id="addClassModal" tabindex="-1" aria-labelledby="addClassModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="addClassModalLabel">Add New Class</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addClassForm">
                            <!-- Auto-generated class name -->
                            <div class="mb-3">
                                <label for="autoClassName" class="form-label">Class Name (Auto-generated)</label>
                                <input type="text" class="form-control" id="autoClassName" disabled readonly>
                            </div>

                            <!-- Required fields -->
                            <div class="mb-3">
                                <label for="classProgram" class="form-label">Program <span class="text-danger">*</span></label>
                                <select class="form-select" id="classProgram" name="program" required>
                                    <option value="">Select Program</option>
                                    <option value="Weekday Morning Hifdh">Weekday Morning Hifdh</option>
                                    <option value="Weekday Evening Hifdh">Weekday Evening Hifdh</option>
                                    <option value="Weekday Evening Islamic Studies">Weekday Evening Islamic Studies</option>
                                    <option value="Weekend Hifdh">Weekend Hifdh</option>
                                    <option value="Weekend Islamic Studies">Weekend Islamic Studies</option>
                                </select>
                            </div>

                            <div class="mb-3">
                                <label for="classYearGroup" class="form-label">Year Group <span class="text-danger">*</span></label>
                                <select class="form-select" id="classYearGroup" name="year_group" required>
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
                                </select>
                            </div>

                            <div class="mb-3">
                                <label for="classGender" class="form-label">Gender <span class="text-danger">*</span></label>
                                <select class="form-select" id="classGender" name="gender" required>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            <!-- Optional fields -->
                            <div class="mb-3">
                                <label for="classTeacher" class="form-label">Teacher (Optional)</label>
                                <select class="form-select" id="classTeacher" name="teacher_id">
                                    <option value="">Unassigned</option>
                                    <?php if (!empty($teachers)): ?>
                                        <?php foreach ($teachers as $teacher): ?>
                                            <option value="<?= $teacher['id'] ?>"><?= htmlspecialchars($teacher['name']) ?></option>
                                        <?php endforeach; ?>
                                    <?php endif; ?>
                                </select>
                            </div>

                            <!-- Hidden field for the actual class name -->
                            <input type="hidden" id="className" name="class_name">
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" id="confirmAddClass" class="btn btn-primary">Create Class</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Edit Class Modal -->
        <div class="modal fade" id="editClassModal" tabindex="-1" aria-labelledby="editClassModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editClassModalLabel">Edit Class</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editClassForm">
                            <!-- Hidden field for class ID -->
                            <input type="hidden" id="editClassId" name="class_id">

                            <!-- Current class name (read-only) -->
                            <div class="mb-3">
                                <label for="currentClassName" class="form-label">Current Class Name</label>
                                <input type="text" class="form-control" id="currentClassName" disabled readonly>
                            </div>

                            <!-- Auto-generated new class name -->
                            <div class="mb-3">
                                <label for="newAutoClassName" class="form-label">New Class Name (Auto-generated)</label>
                                <input type="text" class="form-control" id="newAutoClassName" disabled readonly>
                                <small class="text-muted">Based on selections below</small>
                            </div>

                            <!-- Required fields -->
                            <div class="mb-3">
                                <label for="editClassProgram" class="form-label">Program <span class="text-danger">*</span></label>
                                <select class="form-select" id="editClassProgram" name="program" required>
                                    <option value="">Select Program</option>
                                    <option value="Weekday Morning Hifdh">Weekday Morning Hifdh</option>
                                    <option value="Weekday Evening Hifdh">Weekday Evening Hifdh</option>
                                    <option value="Weekday Evening Islamic Studies">Weekday Evening Islamic Studies</option>
                                    <option value="Weekend Hifdh">Weekend Hifdh</option>
                                    <option value="Weekend Islamic Studies">Weekend Islamic Studies</option>
                                </select>
                            </div>

                            <div class="mb-3">
                                <label for="editClassYearGroup" class="form-label">Year Group <span class="text-danger">*</span></label>
                                <select class="form-select" id="editClassYearGroup" name="year_group" required>
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
                                </select>
                            </div>

                            <div class="mb-3">
                                <label for="editClassGender" class="form-label">Gender <span class="text-danger">*</span></label>
                                <select class="form-select" id="editClassGender" name="gender" required>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            <!-- Optional teacher field -->
                            <div class="mb-3">
                                <label for="editClassTeacher" class="form-label">Teacher (Optional)</label>
                                <select class="form-select" id="editClassTeacher" name="teacher_id">
                                    <option value="">Unassigned</option>
                                    <?php if (!empty($teachers)): ?>
                                        <?php foreach ($teachers as $teacher): ?>
                                            <option value="<?= $teacher['id'] ?>"><?= htmlspecialchars($teacher['name']) ?></option>
                                        <?php endforeach; ?>
                                    <?php endif; ?>
                                </select>
                            </div>

                            <!-- Hidden field for the actual class name -->
                            <input type="hidden" id="editClassName" name="class_name">
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" id="confirmEditClass" class="btn btn-primary">Update Class</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Remove Confirmation Modal -->
        <div class="modal fade" id="removeClassModal" tabindex="-1" aria-labelledby="removeClassModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="removeClassModalLabel">Confirm Class Removal</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to remove the class: <strong id="removeClassName"></strong>?</p>
                        <div class="alert alert-warning">
                            <i class="bi bi-exclamation-triangle"></i> <strong>Warning:</strong>
                            <ul class="mb-0 mt-2">
                                <li>All students in this class will have their class assignment removed</li>
                                <li>Teachers assigned to this class will have it removed from their profile</li>
                                <li>This action cannot be undone</li>
                            </ul>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" id="confirmRemoveClass" class="btn btn-danger">Remove Class</button>
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
            const hasDatabaseError = <?= $error ? 'true' : 'false' ?>;
            
            // Disable JavaScript functionality if there's a database error
            if (hasDatabaseError) {
                console.warn('Classes page disabled due to database setup required');
            }
        </script>
        
        <script src="../js/classes.js"></script>
    </body>
</html>