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
    
    <!-- Chart.js for Pie Charts -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
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
        
        .date-navigation {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        
        .date-navigation button {
            width: 36px;
            height: 36px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .date-display {
            font-size: 1.1rem;
            font-weight: 600;
            min-width: 120px;
            text-align: center;
        }
        
        /* Mobile Optimized Controls */
        .mobile-controls {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .search-container, .class-container {
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
        }
        
        .button-row {
            display: flex;
            justify-content: center;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 5px;
        }
        
        .button-row .btn {
            flex: 0 0 auto;
        }
        
        .date-row {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            margin: 15px 0 5px 0;
        }
        
        .today-row {
            display: flex;
            justify-content: center;
            margin-bottom: 15px;
        }
        
        .btn-success-modern {
            background-color: #28a745;
            color: white;
            border-color: #28a745;
        }
        
        .btn-success-modern:hover {
            background-color: #218838;
            border-color: #1e7e34;
            color: white;
        }
        
        .btn-success-modern.active {
            background-color: #1e7e34;
            border-color: #1c7430;
        }
        
        @media (max-width: 768px) {
            .btn-attendance-toggle {
                padding: 0.25rem 0.5rem;
                font-size: 0.8rem;
            }
            
            .table-responsive {
                font-size: 0.9rem;
            }
            
            .date-navigation {
                gap: 5px;
            }
            
            .date-display {
                min-width: 100px;
                font-size: 1rem;
            }
            
            .button-row .btn {
                padding: 0.25rem 0.5rem;
                font-size: 0.8rem;
            }
            
            .today-row .btn {
                padding: 0.25rem 0.75rem;
                font-size: 0.85rem;
            }
            
            .date-navigation button {
                width: 32px;
                height: 32px;
            }
        }
        
        @media (max-width: 576px) {
            .date-display {
                min-width: 80px;
                font-size: 0.9rem;
            }
            
            .date-navigation {
                gap: 3px;
            }
            
            .date-navigation button {
                width: 28px;
                height: 28px;
            }
            
            .button-row {
                gap: 5px;
            }
            
            .button-row .btn {
                padding: 0.2rem 0.4rem;
                font-size: 0.75rem;
            }
        }
        
        /* Summary table styles */
        #summaryTable th {
            font-size: 0.85rem;
            padding: 5px 2px;
            text-align: center;
        }
        
        #summaryTable td {
            vertical-align: middle;
            padding: 5px 2px;
        }
        
        .summary-day-cell {
            min-width: 35px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
                /* Pie Chart Responsive Styles */
        .student-name-link {
            transition: all 0.2s ease;
        }
        
        .student-name-link:hover {
            color: #28a745 !important;
            text-decoration: underline !important;
        }
        
        @media (max-width: 768px) {
            #attendancePieChart {
                width: 180px !important;
                height: 180px !important;
            }
            
            #pieChartCenterText {
                font-size: 0.9rem;
            }
            
            #pieChartPercentage {
                font-size: 1.5rem !important;
            }
            
            .card-body .row .col-6 {
                margin-bottom: 0.5rem;
            }
        }
        
        @media (max-width: 576px) {
            #attendancePieChart {
                width: 150px !important;
                height: 150px !important;
            }
            
            #pieChartPercentage {
                font-size: 1.2rem !important;
            }
            
            .card-body .row .col-6 {
                flex: 0 0 100%;
                max-width: 100%;
            }
        }
        
        /* For very small screens */
        @media (max-width: 400px) {
            #attendancePieChart {
                width: 120px !important;
                height: 120px !important;
            }
            
            #pieChartCenterText {
                font-size: 0.8rem;
            }
            
            #pieChartPercentage {
                font-size: 1rem !important;
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

        <!-- Tab Buttons -->
        <div class="text-center mb-4">
            <div class="btn-group" role="group" aria-label="Attendance tabs">
                <button type="button" id="entryTabBtn" class="btn btn-success-modern active" data-tab="entry">
                    <i class="bi bi-calendar-check me-1"></i> Attendance Entry
                </button>
                <button type="button" id="summaryTabBtn" class="btn btn-outline-success" data-tab="summary">
                    <i class="bi bi-calendar-month me-1"></i> Attendance Summary
                </button>
            </div>
        </div>

        <!-- ATTENDANCE ENTRY SECTION -->
        <div id="attendanceEntrySection" class="container-fluid">
            <div class="card p-3 shadow-sm">
                <!-- Mobile Optimized Controls -->
                <div class="mobile-controls">
                    <!-- Search Bar -->
                    <div class="search-container">
                        <div class="input-group">
                            <span class="input-group-text"><i class="bi bi-search"></i></span>
                            <input id="attendanceSearchInput" type="text" class="form-control" placeholder="Search student name...">
                        </div>
                    </div>
                    
                    <!-- Class Dropdown -->
                    <div class="class-container">
                        <select id="attendanceClassSelect" class="form-select">
                            <option value="">Select Class</option>
                        </select>
                    </div>
                    
                    <!-- Action Buttons Row -->
                    <div class="button-row">
                        <button id="toggleCalendarBtn" class="btn btn-outline-success btn-sm" title="Show/Hide Calendar">
                            <i class="bi bi-calendar-week"></i> Calendar
                        </button>
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
                    
                    <!-- Date Navigation Row -->
                    <div class="date-row">
                        <button id="prevDayBtn" class="btn btn-outline-secondary" title="Previous day">
                            <i class="bi bi-chevron-left"></i>
                        </button>
                        <div class="date-display text-success">
                            <span id="selectedDate"></span>
                            <br>
                            <small id="selectedWeekday" class="text-muted"></small>
                        </div>
                        <button id="nextDayBtn" class="btn btn-outline-secondary" title="Next day">
                            <i class="bi bi-chevron-right"></i>
                        </button>
                    </div>
                    
                    <!-- Today Button Row -->
                    <div class="today-row">
                        <button id="todayBtn" class="btn btn-outline-success btn-sm" title="Go to Today">
                            <i class="bi bi-calendar-day"></i> Today
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

        <!-- ATTENDANCE SUMMARY SECTION -->
        <div id="attendanceSummarySection" class="container-fluid" style="display: none;">
            <div class="card p-3 shadow-sm">
                <!-- Summary Controls -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="d-flex align-items-center gap-3">
                            <button id="prevMonthBtn" class="btn btn-outline-secondary">
                                <i class="bi bi-chevron-left"></i>
                            </button>
                            <h4 id="monthYearDisplay" class="m-0 text-center" style="min-width: 200px;"></h4>
                            <button id="nextMonthBtn" class="btn btn-outline-secondary">
                                <i class="bi bi-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="d-flex justify-content-md-end">
                            <select id="summaryClassSelect" class="form-select" style="max-width: 300px;">
                                <option value="">Select Class</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Alternative: Simple colored circles -->
                <div class="row mb-3">
                    <div class="col-12">
                        <div class="d-flex flex-wrap gap-3 justify-content-center">
                            <div class="d-flex align-items-center">
                                <span class="rounded-circle me-2" 
                                      style="width: 15px; height: 15px; background-color: #28a745;"></span>
                                <small class="fw-medium">Present</small>
                            </div>
                            <div class="d-flex align-items-center">
                                <span class="rounded-circle me-2" 
                                      style="width: 15px; height: 15px; background-color: #dc3545;"></span>
                                <small class="fw-medium">Absent</small>
                            </div>
                            <div class="d-flex align-items-center">
                                <span class="rounded-circle me-2" 
                                      style="width: 15px; height: 15px; background-color: #ffc107;"></span>
                                <small class="fw-medium">Late</small>
                            </div>
                            <div class="d-flex align-items-center">
                                <span class="rounded-circle me-2" 
                                      style="width: 15px; height: 15px; background-color: #17a2b8;"></span>
                                <small class="fw-medium">Excused</small>
                            </div>
                            <div class="d-flex align-items-center">
                                <span class="rounded-circle me-2" 
                                      style="width: 15px; height: 15px; background-color: #6c757d;"></span>
                                <small class="fw-medium">No Record</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Summary Table -->
                <div class="table-responsive">
                    <table class="table table-bordered text-center" id="summaryTable">
                        <thead class="table-light">
                            <tr>
                                <th>Student Name</th>
                                <!-- Days will be populated by JavaScript -->
                            </tr>
                        </thead>
                        <tbody id="summaryTableBody">
                            <tr>
                                <td colspan="32" class="text-center text-muted py-4">
                                    <div class="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                                    Loading attendance summary...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Statistics -->
                <div class="row mt-3">
                    <div class="col-md-4">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6 class="card-subtitle mb-2 text-muted">Total Present Days</h6>
                                <h3 id="totalPresent" class="text-success">0</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6 class="card-subtitle mb-2 text-muted">Total Absent Days</h6>
                                <h3 id="totalAbsent" class="text-danger">0</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6 class="card-subtitle mb-2 text-muted">Attendance Rate</h6>
                                <h3 id="attendanceRate" class="text-primary">0%</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Student Details Section (Initially Hidden) -->
            <div id="studentDetailsSection" class="mt-4" style="display: none;">
                <div class="card shadow-sm border-0">
                    <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="bi bi-person-circle me-2"></i>
                            <span id="selectedStudentName"></span> - Attendance Breakdown
                        </h5>
                        <button type="button" class="btn btn-sm btn-light" id="closeStudentDetails">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="row align-items-center">
                            <!-- Pie Chart Container -->
                            <div class="col-md-5 col-lg-4 text-center mb-3 mb-md-0">
                                <div class="position-relative" style="max-width: 250px; margin: 0 auto;">
                                    <canvas id="attendancePieChart" width="200" height="200"></canvas>
                                    <div id="pieChartCenterText" class="position-absolute top-50 start-50 translate-middle text-center">
                                        <div class="fs-1 fw-bold" id="pieChartPercentage">0%</div>
                                        <div class="text-muted small">Present</div>
                                    </div>
                                </div>
                                <div class="mt-2 small text-muted">
                                    Total Class Days: <span id="totalClassDays">0</span>
                                </div>
                            </div>
                            
                            <!-- Statistics List -->
                            <div class="col-md-7 col-lg-8">
                                <div class="row g-2">
                                    <div class="col-6">
                                        <div class="d-flex align-items-center p-2 border rounded">
                                            <span class="rounded-circle me-2" 
                                                  style="width: 15px; height: 15px; background-color: #28a745;"></span>
                                            <div class="flex-grow-1">
                                                <div class="fw-medium">Present</div>
                                                <div class="text-muted small" id="presentDays">0 days</div>
                                            </div>
                                            <div class="fs-5 fw-bold text-success" id="presentPercentage">0%</div>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="d-flex align-items-center p-2 border rounded">
                                            <span class="rounded-circle me-2" 
                                                  style="width: 15px; height: 15px; background-color: #dc3545;"></span>
                                            <div class="flex-grow-1">
                                                <div class="fw-medium">Absent</div>
                                                <div class="text-muted small" id="absentDays">0 days</div>
                                            </div>
                                            <div class="fs-5 fw-bold text-danger" id="absentPercentage">0%</div>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="d-flex align-items-center p-2 border rounded">
                                            <span class="rounded-circle me-2" 
                                                  style="width: 15px; height: 15px; background-color: #ffc107;"></span>
                                            <div class="flex-grow-1">
                                                <div class="fw-medium">Late</div>
                                                <div class="text-muted small" id="lateDays">0 days</div>
                                            </div>
                                            <div class="fs-5 fw-bold text-warning" id="latePercentage">0%</div>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="d-flex align-items-center p-2 border rounded">
                                            <span class="rounded-circle me-2" 
                                                  style="width: 15px; height: 15px; background-color: #17a2b8;"></span>
                                            <div class="flex-grow-1">
                                                <div class="fw-medium">Excused</div>
                                                <div class="text-muted small" id="excusedDays">0 days</div>
                                            </div>
                                            <div class="fs-5 fw-bold text-info" id="excusedPercentage">0%</div>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="d-flex align-items-center p-2 border rounded">
                                            <span class="rounded-circle me-2" 
                                                  style="width: 15px; height: 15px; background-color: #6c757d;"></span>
                                            <div class="flex-grow-1">
                                                <div class="fw-medium">No Record</div>
                                                <div class="text-muted small" id="noRecordDays">0 days</div>
                                            </div>
                                            <div class="fs-5 fw-bold text-secondary" id="noRecordPercentage">0%</div>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="d-flex align-items-center p-2 border rounded bg-light">
                                            <span class="rounded-circle me-2" 
                                                  style="width: 15px; height: 15px; background-color: #adb5bd; border: 1px solid #6c757d;"></span>
                                            <div class="flex-grow-1">
                                                <div class="fw-medium">Non-Class Days</div>
                                                <div class="text-muted small" id="nonClassDays">0 days</div>
                                            </div>
                                            <div class="fs-5 fw-bold text-muted" id="nonClassPercentage">0%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                            
                        <!-- Attendance Pattern Summary -->
                        <div class="mt-3 pt-3 border-top">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="d-flex align-items-center mb-2">
                                        <i class="bi bi-calendar-check me-2 text-success"></i>
                                        <div>
                                            <div class="fw-medium">Attendance Rate</div>
                                            <div class="text-muted small" id="attendanceSummaryRate">0%</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="d-flex align-items-center mb-2">
                                        <i class="bi bi-flag me-2 text-danger"></i>
                                        <div>
                                            <div class="fw-medium">Most Common Status</div>
                                            <div class="text-muted small" id="mostCommonStatus">No Record</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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