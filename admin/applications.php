<?php
// admin/applications.php
require_once 'php/admin_protect.php';

// Only allow approved admins to access this page
if ($_SESSION['pending_approval']) {
    header('Location: dashboard.php?bid=' . ($_SESSION['browser_instance_id'] ?? ''));
    exit;
}

// Include database connection
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

// Fetch all admission applications with parent account status AND exclude assigned teachers
$stmt = $pdo->prepare("SELECT ia.*, 
                       CASE 
                           WHEN ia.status = 'approved' THEN 'approved'
                           WHEN ia.status = 'pending_rejection' THEN 'pending_rejection' 
                           ELSE 'pending' 
                       END as display_status,
                       CASE 
                           WHEN ia.status = 'approved' AND pu.id IS NOT NULL THEN 'created'
                           WHEN ia.status = 'approved' AND pu.id IS NULL THEN 'not_created'
                           ELSE 'not_applicable'
                       END as account_status
                       FROM initial_admission ia
                       LEFT JOIN parent_users pu ON (pu.email = ia.parent1_email OR pu.email = ia.parent2_email)
                       LEFT JOIN students s ON s.admission_id = ia.id
                       WHERE s.teacher_id IS NULL  -- ADD THIS LINE
                       ORDER BY ia.submitted_at DESC");
$stmt->execute();
$applications = $stmt->fetchAll();

$browser_instance_id = $_SESSION['browser_instance_id'] ?? '';
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admission Applications - Al Falah</title>

        <link href="../bootstrap/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
        <link rel="stylesheet" href="css/admin.css">
        <link rel="stylesheet" href="css/applications.css">
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
            
            .application-details {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease-out;
                background-color: #f8f9fa;
                border-radius: 0.375rem;
            }
            
            .application-details.show {
                max-height: 500px;
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
            
            .status-badge-new {
                background-color: #0d6efd;
            }
            
            .status-badge-reviewed {
                background-color: #6c757d;
            }
            
            .status-badge-approved {
                background-color: #198754;
            }
            
            .status-badge-rejected {
                background-color: #dc3545;
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
            
            .alert-sm {
                padding: 0.5rem 1rem;
                font-size: 0.875rem;
                margin-bottom: 1rem;
            }
        </style>
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

            <a href="dashboard.php?bid=<?= $browser_instance_id ?>"><i class="bi bi-speedometer2"></i> Dashboard</a>
            <a href="applications.php?bid=<?= $browser_instance_id ?>" class="active"><i class="bi bi-file-earmark-text"></i> Applications</a>
            <a href="private/admin-accounts.php?bid=<?= $browser_instance_id ?>"><i class="bi bi-shield-check"></i> Admin Accounts</a>
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
                <h2 class="dashboard-title m-0">Admission Applications</h2>
            </div>

            <!-- Applications Table -->
            <div class="card shadow-sm">
                <div class="card-body">
                    <!-- Table Controls Inside Card -->
                    <div class="table-controls">
                        <div class="row g-2 align-items-center">
                            <!-- Search on the left -->
                            <div class="col-md-6">
                                <div class="input-group">
                                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                                    <input type="text" id="searchInput" class="form-control" placeholder="Search applications...">

                                    <!-- Search Options Dropdown -->
                                    <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i class="bi bi-filter"></i>
                                    </button>
                                    <ul class="dropdown-menu dropdown-menu-end p-2" style="min-width: 200px;">
                                        <li class="mb-2">
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="searchStudent" checked>
                                                <label class="form-check-label small" for="searchStudent">
                                                    Student Names
                                                </label>
                                            </div>
                                        </li>
                                        <li class="mb-2">
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="searchParent" checked>
                                                <label class="form-check-label small" for="searchParent">
                                                    Parent Names
                                                </label>
                                            </div>
                                        </li>
                                        <li>
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="searchEmail">
                                                <label class="form-check-label small" for="searchEmail">
                                                    Email Addresses
                                                </label>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <!-- Refresh and Filter buttons on the right -->
                            <div class="col-md-6 text-end">
                                <div class="btn-group">
                                    <button id="refreshBtn" class="btn btn-outline-primary" title="Refresh Table">
                                        <i class="bi bi-arrow-repeat"></i> Refresh
                                    </button>
                                    <button id="filterBtn" class="btn btn-outline-primary" title="Filter Applications">
                                        <i class="bi bi-funnel"></i> Filter
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Results count -->
                        <div class="row mt-2">
                            <div class="col-12">
                                <small class="text-muted">
                                    Showing <span id="visibleCount"><?= count($applications) ?></span> of <span id="totalCount"><?= count($applications) ?></span> applications
                                </small>
                            </div>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-hover" id="applicationsTable">
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th class="mobile-hide">Program</th>
                                    <th class="mobile-hide">Year Group</th>
                                    <th>Parent Contact</th>
                                    <th>Status</th>
                                    <th class="mobile-hide">Account Created?</th> <!-- NEW COLUMN -->
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="applicationsTableBody">
                                <?php if (empty($applications)): ?>
                                    <tr>
                                        <td colspan="7" class="text-center text-muted py-4">No admission applications found.</td>
                                    </tr>
                                <?php else: ?>
                                    <?php foreach ($applications as $app): ?>
                                    <tr data-student="<?= htmlspecialchars(strtolower($app['student_first_name'] . ' ' . $app['student_last_name'])) ?>" 
                                        data-parent="<?= htmlspecialchars(strtolower($app['parent1_first_name'] . ' ' . $app['parent1_last_name'])) ?>"
                                        data-program="<?= htmlspecialchars(strtolower($app['interested_program'])) ?>"
                                        data-year-group="<?= htmlspecialchars(strtolower($app['year_group'])) ?>"
                                        data-age="<?= $app['student_age'] ?? '0' ?>"
                                        data-application-id="<?= $app['id'] ?>"
                                        data-status="<?= $app['display_status'] ?? 'pending' ?>"
                                        data-account-status="<?= $app['account_status'] ?? 'not_applicable' ?>"
                                        data-deletion-time="<?= $app['scheduled_for_deletion_at'] ?? '' ?>">
                                        <td class="fw-semibold">
                                            <?= htmlspecialchars($app['student_first_name'] . ' ' . $app['student_last_name']) ?>
                                            <br>
                                            <small class="text-muted">Age: <?= $app['student_age'] ?? 'N/A' ?></small>
                                        </td>
                                        <td class="mobile-hide"><?= htmlspecialchars($app['interested_program']) ?></td>
                                        <td class="mobile-hide">
                                            <?= htmlspecialchars($app['year_group']) ?>
                                            <?php if (!empty($app['year_group_other'])): ?>
                                                <br><small class="text-muted">(<?= htmlspecialchars($app['year_group_other']) ?>)</small>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <?= htmlspecialchars($app['parent1_first_name'] . ' ' . $app['parent1_last_name']) ?>
                                            <br>
                                            <small class="text-muted"><?= htmlspecialchars($app['parent1_email']) ?></small>
                                        </td>
                                        <td>
                                            <?php
                                            $status = $app['display_status'] ?? 'pending';
                                            $badgeClass = 'status-badge-' . str_replace('_', '-', $status);
                                            $statusText = ucfirst(str_replace('_', ' ', $status));
                                            ?>
                                            <span class="status-badge <?= $badgeClass ?>" id="status-badge-<?= $app['id'] ?>">
                                                <?= $statusText ?>
                                                <?php if ($status === 'pending_rejection' && !empty($app['scheduled_for_deletion_at'])): ?>
                                                    <span class="countdown-timer" id="countdown-<?= $app['id'] ?>"></span>
                                                <?php endif; ?>
                                            </span>
                                        </td>
                                        <td class="mobile-hide">
                                            <?php if ($app['display_status'] === 'approved'): ?>
                                                <?php if ($app['account_status'] === 'created'): ?>
                                                    <span class="badge bg-success">Account Created</span>
                                                <?php else: ?>
                                                    <span class="badge bg-warning">No Account Yet</span>
                                                <?php endif; ?>
                                            <?php else: ?>
                                                <span class="text-muted">-</span>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <?php if ($status === 'pending_rejection'): ?>
                                                <!-- Show undo button instead of reject button for pending rejection -->
                                                <div class="btn-group btn-group-sm">
                                                    <button type="button" 
                                                            class="btn btn-outline-primary view-btn" 
                                                            data-application-id="<?= $app['id'] ?>">
                                                        <i class="bi bi-eye"></i> View
                                                    </button>
                                                    <button type="button" 
                                                            class="btn btn-outline-success approve-btn" 
                                                            data-application-id="<?= $app['id'] ?>"
                                                            data-student-name="<?= htmlspecialchars($app['student_first_name'] . ' ' . $app['student_last_name']) ?>">
                                                        <i class="bi bi-check-lg"></i> Approve
                                                    </button>
                                                    <button type="button" 
                                                            class="btn btn-warning undo-rejection-btn" 
                                                            data-application-id="<?= $app['id'] ?>"
                                                            data-student-name="<?= htmlspecialchars($app['student_first_name'] . ' ' . $app['student_last_name']) ?>">
                                                        <i class="bi bi-arrow-counterclockwise"></i> Undo
                                                    </button>
                                                </div>
                                            <?php else: ?>
                                                <!-- Show normal buttons for other statuses -->
                                                <div class="btn-group btn-group-sm">
                                                    <button type="button" 
                                                            class="btn btn-outline-primary view-btn" 
                                                            data-application-id="<?= $app['id'] ?>">
                                                        <i class="bi bi-eye"></i> View
                                                    </button>
                                                    <button type="button" 
                                                            class="btn btn-outline-success approve-btn <?= $status === 'approved' ? 'btn-approved' : '' ?>" 
                                                            data-application-id="<?= $app['id'] ?>"
                                                            data-student-name="<?= htmlspecialchars($app['student_first_name'] . ' ' . $app['student_last_name']) ?>"
                                                            <?= $status === 'approved' ? 'disabled' : '' ?>>
                                                        <i class="bi bi-check-lg"></i> <?= $status === 'approved' ? 'Approved' : 'Approve' ?>
                                                    </button>
                                                    <button type="button" 
                                                            class="btn btn-outline-danger reject-btn" 
                                                            data-application-id="<?= $app['id'] ?>"
                                                            data-student-name="<?= htmlspecialchars($app['student_first_name'] . ' ' . $app['student_last_name']) ?>">
                                                        <i class="bi bi-x-lg"></i> Reject
                                                    </button>
                                                </div>
                                            <?php endif; ?>
                                        </td>
                                    </tr>
                                    <!-- Application Details Row - PROFESSIONAL COMPACT DESIGN -->
                                    <tr class="application-details-row" style="display: none;">
                                        <td colspan="7">
                                            <div class="application-details" id="details-<?= $app['id'] ?>">
                                                <!-- Student & Program Header - More Compact -->
                                                <div class="detail-section">
                                                    <div class="row compact-layout">
                                                        <div class="col-md-8">
                                                            <h5 class="detail-label">
                                                                <i class="bi bi-person-badge"></i>
                                                                Student Information - <?= htmlspecialchars($app['student_first_name'] . ' ' . $app['student_last_name']) ?>
                                                            </h5>
                                                            <div class="detail-grid">
                                                                <div class="detail-item">
                                                                    <strong>Full Name</strong>
                                                                    <span><?= htmlspecialchars($app['student_first_name'] . ' ' . $app['student_last_name']) ?></span>
                                                                </div>
                                                                <div class="detail-item">
                                                                    <strong>Age</strong>
                                                                    <span><?= $app['student_age'] ?? 'N/A' ?></span>
                                                                </div>
                                                                <div class="detail-item">
                                                                    <strong>Gender</strong>
                                                                    <span><?= htmlspecialchars($app['student_gender']) ?></span>
                                                                </div>
                                                                <div class="detail-item">
                                                                    <strong>Date of Birth</strong>
                                                                    <span><?= $app['student_dob'] ? htmlspecialchars($app['student_dob']) : 'N/A' ?></span>
                                                                </div>
                                                                <div class="detail-item">
                                                                    <strong>Current School</strong>
                                                                    <span><?= htmlspecialchars($app['student_school']) ?></span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-4">
                                                            <div class="parent-card">
                                                                <h6><i class="bi bi-info-circle"></i> Program Details</h6>
                                                                <div class="contact-info">
                                                                    <div class="contact-item">
                                                                        <i class="bi bi-book"></i>
                                                                        <span><strong>Program:</strong> <?= htmlspecialchars($app['interested_program']) ?></span>
                                                                    </div>
                                                                    <div class="contact-item">
                                                                        <i class="bi bi-mortarboard"></i>
                                                                        <span><strong>Year Group:</strong> <?= htmlspecialchars($app['year_group']) ?></span>
                                                                    </div>
                                                                    <?php if (!empty($app['year_group_other'])): ?>
                                                                    <div class="contact-item">
                                                                        <i class="bi bi-pencil"></i>
                                                                        <span><strong>Other:</strong> <?= htmlspecialchars($app['year_group_other']) ?></span>
                                                                    </div>
                                                                    <?php endif; ?>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <!-- Parent Information - More Compact -->
                                                <div class="detail-section">
                                                    <h6 class="detail-label"><i class="bi bi-people"></i> Parent/Guardian Information</h6>
                                                    <div class="row">
                                                        <div class="col-md-6">
                                                            <div class="parent-card">
                                                                <h6><i class="bi bi-person-check"></i> Primary Parent</h6>
                                                                <div class="contact-info">
                                                                    <div class="contact-item">
                                                                        <i class="bi bi-person"></i>
                                                                        <span><?= htmlspecialchars($app['parent1_first_name'] . ' ' . $app['parent1_last_name']) ?></span>
                                                                    </div>
                                                                    <div class="contact-item">
                                                                        <i class="bi bi-diagram-3"></i>
                                                                        <span><?= htmlspecialchars($app['parent1_relationship']) ?></span>
                                                                        <?php if (!empty($app['parent1_relationship_other'])): ?>
                                                                        <br><small class="text-muted">(<?= htmlspecialchars($app['parent1_relationship_other']) ?>)</small>
                                                                        <?php endif; ?>
                                                                    </div>
                                                                    <div class="contact-item">
                                                                        <i class="bi bi-phone"></i>
                                                                        <span><?= htmlspecialchars($app['parent1_mobile']) ?></span>
                                                                    </div>
                                                                    <div class="contact-item">
                                                                        <i class="bi bi-envelope"></i>
                                                                        <span><?= htmlspecialchars($app['parent1_email']) ?></span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <?php if (!empty($app['parent2_first_name'])): ?>
                                                        <div class="col-md-6">
                                                            <div class="parent-card">
                                                                <h6><i class="bi bi-person-plus"></i> Additional Parent</h6>
                                                                <div class="contact-info">
                                                                    <div class="contact-item">
                                                                        <i class="bi bi-person"></i>
                                                                        <span><?= htmlspecialchars($app['parent2_first_name'] . ' ' . $app['parent2_last_name']) ?></span>
                                                                    </div>
                                                                    <div class="contact-item">
                                                                        <i class="bi bi-diagram-3"></i>
                                                                        <span><?= htmlspecialchars($app['parent2_relationship']) ?></span>
                                                                        <?php if (!empty($app['parent2_relationship_other'])): ?>
                                                                        <br><small class="text-muted">(<?= htmlspecialchars($app['parent2_relationship_other']) ?>)</small>
                                                                        <?php endif; ?>
                                                                    </div>
                                                                    <?php if (!empty($app['parent2_mobile'])): ?>
                                                                    <div class="contact-item">
                                                                        <i class="bi bi-phone"></i>
                                                                        <span><?= htmlspecialchars($app['parent2_mobile']) ?></span>
                                                                    </div>
                                                                    <?php endif; ?>
                                                                    <?php if (!empty($app['parent2_email'])): ?>
                                                                    <div class="contact-item">
                                                                        <i class="bi bi-envelope"></i>
                                                                        <span><?= htmlspecialchars($app['parent2_email']) ?></span>
                                                                    </div>
                                                                    <?php endif; ?>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <?php endif; ?>
                                                    </div>
                                                    <div class="mt-3">
                                                        <div class="parent-card emergency-contact-card">
                                                            <h6><i class="bi bi-exclamation-triangle"></i> Emergency Contact</h6>
                                                            <div class="contact-item">
                                                                <i class="bi bi-telephone-forward"></i>
                                                                <span class="fw-bold"><?= htmlspecialchars($app['emergency_contact']) ?></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <!-- Address - More Compact -->
                                                <div class="detail-section">
                                                    <h6 class="detail-label"><i class="bi bi-geo-alt"></i> Address</h6>
                                                    <div class="parent-card">
                                                        <div class="contact-info">
                                                            <div class="contact-item">
                                                                <i class="bi bi-house"></i>
                                                                <span><?= htmlspecialchars($app['address']) ?></span>
                                                            </div>
                                                            <div class="contact-item">
                                                                <i class="bi bi-building"></i>
                                                                <span><?= htmlspecialchars($app['city']) ?><?= !empty($app['county']) ? ', ' . htmlspecialchars($app['county']) : '' ?></span>
                                                            </div>
                                                            <div class="contact-item">
                                                                <i class="bi bi-mailbox"></i>
                                                                <span><?= htmlspecialchars($app['postal_code']) ?></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <!-- Medical & Additional Info - More Compact -->
                                                <?php if ($app['illness'] === 'Yes' || $app['special_needs'] === 'Yes' || $app['allergies'] === 'Yes'): ?>
                                                <div class="detail-section">
                                                    <h6 class="detail-label"><i class="bi bi-heart-pulse"></i> Health Information</h6>
                                                    <div class="row">
                                                        <?php if ($app['illness'] === 'Yes' && !empty($app['illness_details'])): ?>
                                                        <div class="col-md-4">
                                                            <div class="parent-card medical-info">
                                                                <h6><i class="bi bi-heart-pulse"></i> Medical Conditions</h6>
                                                                <p class="mb-0 small"><?= htmlspecialchars($app['illness_details']) ?></p>
                                                            </div>
                                                        </div>
                                                        <?php endif; ?>
                                                        
                                                        <?php if ($app['special_needs'] === 'Yes' && !empty($app['special_needs_details'])): ?>
                                                        <div class="col-md-4">
                                                            <div class="parent-card special-needs-info">
                                                                <h6><i class="bi bi-person-badge"></i> Special Needs</h6>
                                                                <p class="mb-0 small"><?= htmlspecialchars($app['special_needs_details']) ?></p>
                                                            </div>
                                                        </div>
                                                        <?php endif; ?>
                                                        
                                                        <?php if ($app['allergies'] === 'Yes' && !empty($app['allergies_details'])): ?>
                                                        <div class="col-md-4">
                                                            <div class="parent-card allergy-info">
                                                                <h6><i class="bi bi-exclamation-triangle"></i> Allergies</h6>
                                                                <p class="mb-0 small"><?= htmlspecialchars($app['allergies_details']) ?></p>
                                                            </div>
                                                        </div>
                                                        <?php endif; ?>
                                                    </div>
                                                </div>
                                                <?php endif; ?>

                                                <!-- Permissions - More Compact -->
                                                <div class="detail-section">
                                                    <h6 class="detail-label"><i class="bi bi-shield-check"></i> Permissions & Information</h6>
                                                    <div class="permissions-grid">
                                                        <div class="permission-item">
                                                            <i class="bi bi-water"></i>
                                                            <span>Swimming: <?= htmlspecialchars($app['knows_swimming']) ?></span>
                                                        </div>
                                                        <div class="permission-item">
                                                            <i class="bi bi-car-front"></i>
                                                            <span>Travel Sickness: <?= htmlspecialchars($app['travel_sickness']) ?></span>
                                                        </div>
                                                        <div class="permission-item">
                                                            <i class="bi bi-geo-alt"></i>
                                                            <span>Travel Permission: <?= htmlspecialchars($app['travel_permission']) ?></span>
                                                        </div>
                                                        <div class="permission-item">
                                                            <i class="bi bi-camera"></i>
                                                            <span>Photo Permission: <?= htmlspecialchars($app['photo_permission']) ?></span>
                                                        </div>
                                                        <div class="permission-item">
                                                            <i class="bi bi-bus-front"></i>
                                                            <span>Transport: <?= htmlspecialchars($app['transport_mode']) ?></span>
                                                        </div>
                                                        <div class="permission-item">
                                                            <i class="bi bi-house-door"></i>
                                                            <span>Home Alone: <?= htmlspecialchars($app['go_home_alone']) ?></span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <!-- Islamic Education - More Compact -->
                                                <?php if ($app['attended_islamic_education'] === 'Yes'): ?>
                                                <div class="detail-section">
                                                    <h6 class="detail-label"><i class="bi bi-book-half"></i> Islamic Education History</h6>
                                                    <div class="parent-card">
                                                        <div class="contact-info">
                                                            <?php if (!empty($app['islamic_years'])): ?>
                                                            <div class="contact-item">
                                                                <i class="bi bi-calendar"></i>
                                                                <span><strong>Years Attended:</strong> <?= htmlspecialchars($app['islamic_years']) ?></span>
                                                            </div>
                                                            <?php endif; ?>
                                                            <?php if (!empty($app['islamic_education_details'])): ?>
                                                            <div class="contact-item">
                                                                <i class="bi bi-journal-text"></i>
                                                                <span><strong>Details:</strong> <?= htmlspecialchars($app['islamic_education_details']) ?></span>
                                                            </div>
                                                            <?php endif; ?>
                                                        </div>
                                                    </div>
                                                </div>
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

        <!-- Enhanced Approve Confirmation Modal with Class Assignment -->
        <div class="modal fade" id="approveModal" tabindex="-1" aria-labelledby="approveModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="approveModalLabel">Approve Application</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to approve the application for <strong id="approveStudentName"></strong>?</p>
                        <p class="text-muted">This will mark the application as approved and notify the parents.</p>

                        <!-- Optional Class Assignment Section -->
                        <div class="mt-4 pt-3 border-top">
                            <h6 class="mb-3"><i class="bi bi-mortarboard"></i> Optional: Assign to Class</h6>

                            <div class="alert alert-info alert-sm mb-3">
                                <i class="bi bi-info-circle me-1"></i>
                                <small>Assigning to a class will automatically set the teacher. You can leave this empty.</small>
                            </div>

                            <div class="mb-3">
                                <label for="assignClass" class="form-label small fw-bold">Select Class (Optional)</label>
                                <select class="form-select" id="assignClass" name="class_id">
                                    <option value="">No class assignment</option>
                                    <!-- Classes will be populated by JavaScript -->
                                </select>
                                <small class="text-muted">Choose a class to assign the student</small>
                            </div>

                            <div class="mb-3">
                                <label for="assignTeacher" class="form-label small fw-bold">Teacher (Auto-filled from Class)</label>
                                <select class="form-select" id="assignTeacher" name="teacher_id" disabled>
                                    <option value="">No teacher assigned</option>
                                    <!-- Teacher will be auto-filled when class is selected -->
                                </select>
                                <input type="hidden" id="assignTeacherHidden" name="teacher_id">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" id="confirmApprove" class="btn btn-success">Approve</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Reject Confirmation Modal -->
        <div class="modal fade" id="rejectModal" tabindex="-1" aria-labelledby="rejectModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="rejectModalLabel">Confirm Rejection</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to reject the application for <strong id="rejectStudentName"></strong>?</p>
                        <p class="text-danger"><strong>This action will be irreversible in 24 hours.</strong></p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" id="confirmReject" class="btn btn-danger">Reject</button>
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
        
        <!-- Filter Modal -->
        <div class="modal fade modal-green" id="filterModal" tabindex="-1" aria-labelledby="filterModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="filterModalLabel">Filter Applications</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <!-- Status Filter -->
                        <div class="mb-3">
                            <label for="statusSelect" class="form-label">Status</label>
                            <select id="statusSelect" class="form-select">
                                <option value="all">All Statuses</option>
                                <option value="pending_and_rejection" selected>Pending & Pending Rejection</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
                                <option value="pending_rejection">Pending Rejection</option>
                            </select>
                        </div>

                        <!-- Account Created Filter -->
                        <div class="mb-3">
                            <label for="accountStatusSelect" class="form-label">Account Created</label>
                            <select id="accountStatusSelect" class="form-select">
                                <option value="all">All Account Statuses</option>
                                <option value="created">Account Created</option>
                                <option value="not_created">No Account Yet</option>
                                <option value="not_applicable">Not Approved</option>
                            </select>
                        </div>

                        <!-- Add this after the program select in the filter modal -->
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

        <script src="../bootstrap/js/bootstrap.bundle.min.js"></script>
        <script src="js/dashboard.js"></script>
        <script>
            // Pass PHP variables to JavaScript
            const browserInstanceId = '<?= $browser_instance_id ?>';
        </script>
        
        <script src="js/applications.js"></script>
    </body>
</html>