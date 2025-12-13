<?php
// At the very top of teacher/private/attendance.php
require_once '../php/teacher_protect.php';

// Get the browser instance ID for this session
$browser_instance_id = $_SESSION['browser_instance_id'] ?? '';

// Verify the session ID in URL matches the one in session
if (isset($_GET['bid']) && $_GET['bid'] !== $browser_instance_id) {
    session_destroy();
    header('Location: ../login.php');
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Attendance - Al Falah Teacher Panel</title>

    <!-- Bootstrap -->
    <link href="../../bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../../admin/css/admin.css">
    
    <!-- Custom Attendance CSS -->
    <style>
        .selected-date-btn {
            background-color: #28a745 !important;
            color: #fff !important;
            border-color: #28a745 !important;
        }
        #calendarContainer button { min-width: 40px; min-height: 36px; }
        
        .attendance-badge {
            font-size: 0.85rem;
            padding: 0.25rem 0.5rem;
        }
        
        .attendance-table th {
            background-color: #f8f9fa;
            font-weight: 600;
        }
        
        .day-cell {
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .day-cell:hover:not(.disabled) {
            background-color: #f8f9fa;
        }
        
        .day-cell.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .calendar-empty {
            width: 42px;
            height: 42px;
        }
        
        @media (max-width: 768px) {
            .btn-attendance-toggle {
                padding: 0.25rem 0.5rem;
                font-size: 0.8rem;
            }
            
            .table-responsive {
                font-size: 0.9rem;
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
                <h5 class="m-0 fw-bold">Teacher Panel</h5>
            </div>
            <button class="toggle-btn" id="closeSidebar"><i class="bi bi-x-lg"></i></button>
        </div>

        <a href="../dashboard.php?bid=<?= $browser_instance_id ?>"><i class="bi bi-speedometer2"></i> Dashboard</a>
        <a href="attendance.php?bid=<?= $browser_instance_id ?>" class="active"><i class="bi bi-calendar-check"></i> Attendance</a>
        <a href="#?bid=<?= $browser_instance_id ?>"><i class="bi bi-emoji-smile"></i> Behaviour</a>
        <a href="#?bid=<?= $browser_instance_id ?>"><i class="bi bi-journal-text"></i> Classes</a>
        <a href="#?bid=<?= $browser_instance_id ?>"><i class="bi bi-gear"></i> Settings</a>

        <hr>
        <a href="../php/logout.php?bid=<?= $browser_instance_id ?>" class="logout">
            <i class="bi bi-box-arrow-right"></i> Logout
        </a>
    </div>

    <!-- HEADER -->
    <div class="header-bar d-flex align-items-center justify-content-between">
        <button class="open-sidebar-btn" id="openSidebar"><i class="bi bi-list"></i></button>

        <div class="d-flex align-items-center">
            <span class="me-3 d-none d-md-block">
                <i class="bi bi-person-circle me-2"></i>
                Welcome, <strong><?php echo htmlspecialchars($_SESSION['teacher_name'] ?? 'Teacher'); ?></strong>
            </span>
            <span class="d-block d-md-none">
                <i class="bi bi-person-circle me-1"></i>
                <strong><?php echo htmlspecialchars(explode(' ', $_SESSION['teacher_name'] ?? 'Teacher')[0]); ?></strong>
            </span>
        </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="content" id="content">
        <!-- Back Button -->
        <div class="mb-3">
            <a href="../dashboard.php?bid=<?= $browser_instance_id ?>" class="btn btn-outline-success btn-sm">
                <i class="bi bi-arrow-left"></i> Back to Dashboard
            </a>
        </div>

        <!-- Page Title -->
        <h2 class="dashboard-title mb-3">Attendance Management</h2>
        
        <?php if (isset($_SESSION['pending_approval']) && $_SESSION['pending_approval']): ?>
        <div class="alert alert-warning alert-dismissible fade show mt-3" role="alert">
            <i class="bi bi-clock-history me-2"></i>
            <strong>Account Pending Approval</strong> - You can view attendance but cannot make changes until approved.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        <?php endif; ?>

        <!-- ATTENDANCE ENTRY SECTION -->
        <div id="attendanceEntrySection" class="container-fluid mt-4">
            <div class="card p-3 shadow-sm">
                <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 top-controls">
                    <div class="input-group me-3 mb-2" style="max-width: 300px;">
                        <span class="input-group-text"><i class="bi bi-search"></i></span>
                        <input id="attendanceSearchInput" type="text" class="form-control" placeholder="Search student name...">
                    </div>
                    <div class="d-flex align-items-center gap-2 mb-2">
                        <select id="attendanceClassSelect" class="form-select form-select-sm w-auto">
                            <option value="">Select Class</option>
                        </select>
                        <button id="attendanceRefreshBtn" class="btn btn-outline-secondary btn-sm" title="Refresh">
                            <i class="bi bi-arrow-clockwise"></i>
                        </button>
                        <button id="attendanceFilterBtn" class="btn btn-outline-secondary btn-sm" title="Filter">
                            <i class="bi bi-filter"></i>
                        </button>
                        <button id="attendanceSaveBtn" class="btn btn-success-modern btn-sm" disabled>
                            <i class="bi bi-save"></i> Save
                        </button>
                    </div>
                </div>

                <!-- Date Controls -->
                <div class="row mb-3 align-items-center">
                    <div class="col-12 col-md-4 d-flex justify-content-start">
                        <div class="input-group" style="max-width: 250px;">
                            <span class="input-group-text"><i class="bi bi-calendar"></i></span>
                            <input type="date" id="datePicker" class="form-control form-control-sm">
                            <button id="todayBtn" class="btn btn-outline-success btn-sm" title="Today">
                                Today
                            </button>
                        </div>
                    </div>
                    <div class="col-12 col-md-4 d-flex justify-content-center align-items-center">
                        <span id="selectedDate" class="fw-bold text-success"></span>
                    </div>
                    <div class="col-12 col-md-4 d-flex justify-content-end">
                        <button id="toggleCalendarBtn" class="btn btn-outline-success btn-sm">
                            <i class="bi bi-calendar-week"></i> Show Calendar
                        </button>
                    </div>
                </div>

                <!-- Calendar Container -->
                <div id="calendarContainer" class="mt-2 mb-4" style="display:none;"></div>

                <!-- Attendance Table -->
                <div class="table-responsive mt-3">
                    <table class="table table-hover align-middle text-center attendance-table">
                        <thead class="table-light">
                            <tr>
                                <th>Student Name</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="attendanceTableBody">
                            <!-- Populated by JavaScript -->
                            <tr>
                                <td colspan="3" class="text-center text-muted py-4">
                                    <div class="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                                    Loading attendance data...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="text-muted mt-2">
                    <small><span id="studentCount">0</span> student(s) found</small>
                </div>
            </div>
        </div>
    </div>

    <!-- FILTER MODAL -->
    <div class="modal fade" id="attendanceFilterModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-md">
            <div class="modal-content">
                <div class="modal-header bg-success text-white">
                    <h5 class="modal-title"><i class="bi bi-filter me-2"></i> Filter Attendance</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Status</label>
                        <select id="attendanceFilterStatus" class="form-select">
                            <option value="">Any Status</option>
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Late">Late</option>
                            <option value="Excused">Excused</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer d-flex justify-content-between">
                    <button type="button" id="attendanceClearFilters" class="btn btn-outline-danger">
                        <i class="bi bi-x-circle me-1"></i> Clear
                    </button>
                    <div>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" id="attendanceApplyFilters" class="btn btn-success">
                            <i class="bi bi-check-circle me-1"></i> Apply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="../../bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="../../admin/js/dashboard.js"></script>
    <script src="../js/attendance.js"></script>
</body>
</html>