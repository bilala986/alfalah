// admin/js/applications.js
document.addEventListener('DOMContentLoaded', function() {
    // Toast notification function
    function showToast(message, type = 'success') {
        const toastEl = document.getElementById('liveToast');
        const toastBody = toastEl.querySelector('.toast-body');

        // Set toast type and message
        toastEl.className = `toast align-items-center ${type === 'success' ? 'bg-success' : 'bg-danger'}`;
        toastBody.textContent = message;

        // Show toast
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }

    // Elements
    const searchInput = document.getElementById('searchInput');
    const refreshBtn = document.getElementById('refreshBtn');
    const filterBtn = document.getElementById('filterBtn');
    const applicationsTableBody = document.getElementById('applicationsTableBody');
    const visibleCount = document.getElementById('visibleCount');
    const totalCount = document.getElementById('totalCount');
    
    // Search options elements
    const searchStudent = document.getElementById('searchStudent');
    const searchParent = document.getElementById('searchParent');
    const searchEmail = document.getElementById('searchEmail');
    
    // Modal elements
    const filterModal = new bootstrap.Modal(document.getElementById('filterModal'));
    const yearGroupSelect = document.getElementById('yearGroupSelect');
    const programSelect = document.getElementById('programSelect');
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    
    const approveModal = new bootstrap.Modal(document.getElementById('approveModal'));
    const rejectModal = new bootstrap.Modal(document.getElementById('rejectModal'));
    const approveStudentName = document.getElementById('approveStudentName');
    const rejectStudentName = document.getElementById('rejectStudentName');
    const confirmApprove = document.getElementById('confirmApprove');
    const confirmReject = document.getElementById('confirmReject');
    
    // Age filter elements
    const minAgeInput = document.getElementById('minAge');
    const maxAgeInput = document.getElementById('maxAge');

    // Current filter state (add these to your existing filter state)
    let currentMinAge = null;
    let currentMaxAge = null;
    
    // Current filter state
    let currentYearFilter = 'all';
    let currentProgramFilter = 'all';
    let currentActionApplicationId = null;

    // Get all rows
    let rows = applicationsTableBody.querySelectorAll('tr[data-student]');

    // Enhanced search function with search options and age filtering
    function searchApplications(searchTerm) {
        let visibleRows = 0;

        // Get search options
        const searchInStudent = searchStudent ? searchStudent.checked : true;
        const searchInParent = searchParent ? searchParent.checked : true;
        const searchInEmail = searchEmail ? searchEmail.checked : false;

        rows.forEach(row => {
            const studentName = row.getAttribute('data-student');
            const parentName = row.getAttribute('data-parent');
            const program = row.getAttribute('data-program');
            const applicationId = row.getAttribute('data-application-id');
            const age = parseInt(row.getAttribute('data-age')) || 0; // Get age from data attribute

            // Get additional data from the row cells
            const studentCell = row.cells[0];
            const parentCell = row.cells[3];

            const studentFullText = studentCell.textContent.toLowerCase();
            const parentFullText = parentCell.textContent.toLowerCase();

            // Determine what to search based on selected options
            let matchesSearch = false;

            if (searchTerm === '') {
                // If no search term, show all rows (but still apply filters)
                matchesSearch = true;
            } else {
                // Search based on selected options ONLY
                if (searchInStudent && studentName.includes(searchTerm)) {
                    matchesSearch = true;
                }
                if (!matchesSearch && searchInParent && parentName.includes(searchTerm)) {
                    matchesSearch = true;
                }
                if (!matchesSearch && searchInEmail && parentFullText.includes(searchTerm)) {
                    matchesSearch = true;
                }
            }

            // Apply age filter
            const matchesAge = (currentMinAge === null || age >= currentMinAge) && 
                              (currentMaxAge === null || age <= currentMaxAge);

            // Apply both search and filter
            const matchesYear = currentYearFilter === 'all' || program === currentYearFilter || row.querySelector('.mobile-hide:nth-child(3)')?.textContent.includes(currentYearFilter);
            const matchesProgram = currentProgramFilter === 'all' || program === currentProgramFilter || row.querySelector('.mobile-hide:nth-child(2)')?.textContent.includes(currentProgramFilter);

            if (matchesSearch && matchesYear && matchesProgram && matchesAge) {
                row.style.display = '';
                visibleRows++;

                // Hide details row
                const detailsRow = row.nextElementSibling;
                if (detailsRow && detailsRow.classList.contains('application-details-row')) {
                    detailsRow.style.display = 'none';
                    const detailsDiv = detailsRow.querySelector('.application-details');
                    if (detailsDiv) {
                        detailsDiv.classList.remove('show');
                    }
                }
            } else {
                row.style.display = 'none';

                // Also hide the details row
                const detailsRow = row.nextElementSibling;
                if (detailsRow && detailsRow.classList.contains('application-details-row')) {
                    detailsRow.style.display = 'none';
                    const detailsDiv = detailsRow.querySelector('.application-details');
                    if (detailsDiv) {
                        detailsDiv.classList.remove('show');
                    }
                }
            }
        });

        // Update visible count
        visibleCount.textContent = visibleRows;
    }

    // Enhanced filter function
    function filterTable() {
        const searchTerm = searchInput.value.toLowerCase();
        searchApplications(searchTerm);

        // Update filter button appearance - check if any filter is active
        const isAnyFilterActive = currentYearFilter !== 'all' || 
                                 currentProgramFilter !== 'all' || 
                                 currentMinAge !== null || 
                                 currentMaxAge !== null;

        if (isAnyFilterActive) {
            filterBtn.classList.remove('btn-outline-primary');
            filterBtn.classList.add('btn-success');
        } else {
            filterBtn.classList.remove('btn-success');
            filterBtn.classList.add('btn-outline-primary');
        }
    }

    // Dynamic table update function with status support
    function updateTable(applications) {
        console.log('Updating table with applications:', applications);
        applicationsTableBody.innerHTML = '';

        // Update total count element
        if (totalCount) {
            totalCount.textContent = applications.length;
        }

        if (applications.length === 0) {
            applicationsTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No admission applications found.</td></tr>';
            visibleCount.textContent = '0';
            rows = [];
            return;
        }

        applications.forEach(app => {
            const status = app.status || 'pending';
            const row = document.createElement('tr');
            row.setAttribute('data-student', app.student_first_name.toLowerCase() + ' ' + app.student_last_name.toLowerCase());
            row.setAttribute('data-parent', app.parent1_first_name.toLowerCase() + ' ' + app.parent1_last_name.toLowerCase());
            row.setAttribute('data-program', app.interested_program.toLowerCase());
            row.setAttribute('data-age', app.student_age || '0');
            row.setAttribute('data-application-id', app.id);
            row.setAttribute('data-status', status);
            row.setAttribute('data-deletion-time', app.scheduled_for_deletion_at || '');

            // Format submitted date
            let submittedDate = 'N/A';
            if (app.submitted_at) {
                const date = new Date(app.submitted_at);
                submittedDate = date.toLocaleString('en-GB', {
                    timeZone: 'Europe/London',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
            }

            // Determine button states and classes
            const isApproved = status === 'approved';
            const isPendingRejection = status === 'pending_rejection';

            const approveBtnClass = isApproved ? 'btn-approved' : 'btn-outline-success';
            const rejectBtnClass = isPendingRejection ? 'btn-pending-rejection' : 'btn-outline-danger';

            const approveBtnText = isApproved ? 'Approved' : 'Approve';
            const rejectBtnText = isPendingRejection ? 'Pending Deletion' : 'Reject';

            // Status badge HTML
            const statusText = status.replace('_', ' ');
            const badgeClass = `status-badge status-badge-${status.replace('_', '-')}`;

            let statusHtml = `<span class="${badgeClass}" id="status-badge-${app.id}">${statusText}`;
            if (isPendingRejection && app.scheduled_for_deletion_at) {
                statusHtml += ` <span class="countdown-timer" id="countdown-${app.id}"></span>`;
            }
            statusHtml += `</span>`;

            if (isPendingRejection) {
                statusHtml += `<button type="button" class="btn btn-warning btn-sm undo-rejection-btn" data-application-id="${app.id}" data-student-name="${escapeHtml(app.student_first_name + ' ' + app.student_last_name)}" style="display: none;">
                    <i class="bi bi-arrow-counterclockwise"></i> Undo
                </button>`;
            }

            row.innerHTML = `
                <td class="fw-semibold">
                    ${escapeHtml(app.student_first_name + ' ' + app.student_last_name)}
                    <br>
                    <small class="text-muted">Age: ${app.student_age || 'N/A'}</small>
                </td>
                <td class="mobile-hide">${escapeHtml(app.interested_program)}</td>
                <td class="mobile-hide">
                    ${escapeHtml(app.year_group)}
                    ${app.year_group_other ? '<br><small class="text-muted">(' + escapeHtml(app.year_group_other) + ')</small>' : ''}
                </td>
                <td>
                    ${escapeHtml(app.parent1_first_name + ' ' + app.parent1_last_name)}
                    <br>
                    <small class="text-muted">${escapeHtml(app.parent1_email)}</small>
                </td>
                <td>${statusHtml}</td>
                <td class="mobile-hide">${submittedDate}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button type="button" class="btn btn-outline-primary view-btn" data-application-id="${app.id}">
                            <i class="bi bi-eye"></i> View
                        </button>
                        <button type="button" class="btn ${approveBtnClass} approve-btn" data-application-id="${app.id}" data-student-name="${escapeHtml(app.student_first_name + ' ' + app.student_last_name)}" ${isApproved ? 'disabled' : ''}>
                            <i class="bi bi-check-lg"></i> ${approveBtnText}
                        </button>
                        <button type="button" class="btn ${rejectBtnClass} reject-btn" data-application-id="${app.id}" data-student-name="${escapeHtml(app.student_first_name + ' ' + app.student_last_name)}" ${isPendingRejection ? 'disabled' : ''}>
                            <i class="bi bi-x-lg"></i> ${rejectBtnText}
                        </button>
                    </div>
                </td>
            `;

            applicationsTableBody.appendChild(row);

            // Create details row
            const detailsRow = document.createElement('tr');
            detailsRow.className = 'application-details-row';
            detailsRow.style.display = 'none';
            detailsRow.innerHTML = `
                <td colspan="7">
                    <div class="application-details" id="details-${app.id}">
                        <div class="text-center text-muted py-3">
                            <i class="bi bi-info-circle"></i> Details loaded dynamically
                        </div>
                    </div>
                </td>
            `;
            applicationsTableBody.appendChild(detailsRow);
        });

        // Reattach event listeners
        attachEventListeners();

        // Update rows reference
        rows = applicationsTableBody.querySelectorAll('tr[data-student]');

        // Start countdown timers
        startCountdownTimers();

        // Apply current filters
        filterTable();
    }
    
    // Countdown timer function
    function startCountdownTimers() {
        rows.forEach(row => {
            const status = row.getAttribute('data-status');
            const deletionTime = row.getAttribute('data-deletion-time');
            const applicationId = row.getAttribute('data-application-id');

            if (status === 'pending_rejection' && deletionTime) {
                updateCountdownTimer(applicationId, deletionTime);

                // Update every minute
                setInterval(() => {
                    updateCountdownTimer(applicationId, deletionTime);
                }, 60000);
            }
        });
    }

    function updateCountdownTimer(applicationId, deletionTime) {
        const countdownElement = document.getElementById(`countdown-${applicationId}`);
        const undoButton = document.querySelector(`.undo-rejection-btn[data-application-id="${applicationId}"]`);

        if (!countdownElement) return;

        const now = new Date();
        const deletionDate = new Date(deletionTime);
        const timeLeft = deletionDate - now;

        if (timeLeft <= 0) {
            countdownElement.textContent = '(0h)';
            if (undoButton) {
                undoButton.style.display = 'none';
            }
            return;
        }

        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        countdownElement.textContent = `(${hoursLeft}h)`;

        // Show undo button if less than 1 hour remaining
        if (undoButton && hoursLeft < 1) {
            const minutesLeft = Math.floor(timeLeft / (1000 * 60));
            countdownElement.textContent = `(${minutesLeft}m)`;
            undoButton.style.display = 'inline-block';
        }
    }

    // Undo rejection functionality
    function handleUndoRejectionClick() {
        const applicationId = this.getAttribute('data-application-id');
        const studentName = this.getAttribute('data-student-name');

        const button = this;
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

        fetch('php/undo_rejection.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `application_id=${applicationId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast(`Rejection undone for ${studentName}. Application is now pending again.`, 'success');
                refreshTableData(false);
            } else {
                showToast('Error: ' + data.message, 'error');
                button.disabled = false;
                button.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i> Undo';
            }
        })
        .catch(error => {
            console.error('Undo rejection error:', error);
            showToast('Error undoing rejection', 'error');
            button.disabled = false;
            button.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i> Undo';
        });
    }

    // Helper function to escape HTML
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Enhanced refresh table data with better loading state
    function refreshTableData(shouldShowToast = false) {
        console.log('Refreshing applications data...');
        
        // Show loading state on refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.classList.add('loading');
        refreshBtn.disabled = true;
        
        fetch(`php/get_applications.php?bid=${browserInstanceId}`)
            .then(response => response.json())
            .then(data => {
                console.log('Received applications data from server:', data);
                if (data.success) {
                    updateTable(data.applications);
                    if (shouldShowToast) {
                        showToast('Applications refreshed successfully!', 'success');
                    }
                } else {
                    if (shouldShowToast) {
                        showToast('Error refreshing applications', 'error');
                    }
                }
            })
            .catch(error => {
                console.error('Error refreshing applications:', error);
                if (shouldShowToast) {
                    showToast('Error refreshing applications', 'error');
                }
            })
            .finally(() => {
                // Remove loading state
                refreshBtn.classList.remove('loading');
                refreshBtn.disabled = false;
            });
    }

    // Enhanced view application details with active state
    function handleViewClick() {
        const applicationId = this.getAttribute('data-application-id');
        const detailsRow = this.closest('tr').nextElementSibling;
        const detailsDiv = document.getElementById(`details-${applicationId}`);
        const isOpening = detailsRow.style.display === 'none';
        
        // Close all other open details first
        document.querySelectorAll('.application-details-row').forEach(row => {
            if (row !== detailsRow) {
                const otherDiv = row.querySelector('.application-details');
                if (otherDiv) {
                    otherDiv.classList.remove('show');
                    setTimeout(() => {
                        row.style.display = 'none';
                    }, 300);
                }
            }
        });
        
        // Remove active state from all view buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-outline-primary');
        });
        
        if (isOpening) {
            // Open this one
            detailsRow.style.display = 'table-row';
            setTimeout(() => {
                detailsDiv.classList.add('show');
            }, 10);
            
            // Add active state to this button
            this.classList.remove('btn-outline-primary');
            this.classList.add('btn-primary', 'active');
        } else {
            // Close this one
            detailsDiv.classList.remove('show');
            setTimeout(() => {
                detailsRow.style.display = 'none';
            }, 300);
            
            // Remove active state
            this.classList.remove('btn-primary', 'active');
            this.classList.add('btn-outline-primary');
        }
    }

    // Approve application
    function handleApproveClick() {
        const applicationId = this.getAttribute('data-application-id');
        const studentName = this.getAttribute('data-student-name');
        
        approveStudentName.textContent = studentName;
        currentActionApplicationId = applicationId;
        
        approveModal.show();
    }

    // Reject application
    function handleRejectClick() {
        const applicationId = this.getAttribute('data-application-id');
        const studentName = this.getAttribute('data-student-name');
        
        rejectStudentName.textContent = studentName;
        currentActionApplicationId = applicationId;
        
        rejectModal.show();
    }

    // Search functionality
    searchInput.addEventListener('input', function() {
        filterTable();
    });
    
    // Search option change listeners
    if (searchStudent) {
        searchStudent.addEventListener('change', function() {
            filterTable();
        });
    }
    
    if (searchParent) {
        searchParent.addEventListener('change', function() {
            filterTable();
        });
    }
    
    if (searchEmail) {
        searchEmail.addEventListener('change', function() {
            filterTable();
        });
    }
    
    // Refresh functionality
    refreshBtn.addEventListener('click', function() {
        const refreshIcon = this.querySelector('i');
        refreshIcon.classList.add('refresh-spin');
        refreshTableData(true);
        setTimeout(() => refreshIcon.classList.remove('refresh-spin'), 600);
    });
    
    // Filter modal functionality
    filterBtn.addEventListener('click', function() {
        yearGroupSelect.value = currentYearFilter;
        programSelect.value = currentProgramFilter;
        minAgeInput.value = currentMinAge !== null ? currentMinAge : '';
        maxAgeInput.value = currentMaxAge !== null ? currentMaxAge : '';
        filterModal.show();
    });

    applyFilterBtn.addEventListener('click', function() {
        currentYearFilter = yearGroupSelect.value;
        currentProgramFilter = programSelect.value;
        currentMinAge = minAgeInput.value ? parseInt(minAgeInput.value) : null;
        currentMaxAge = maxAgeInput.value ? parseInt(maxAgeInput.value) : null;
        filterTable();
        filterModal.hide();
    });

    clearFilterBtn.addEventListener('click', function() {
        currentYearFilter = 'all';
        currentProgramFilter = 'all';
        currentMinAge = null;
        currentMaxAge = null;
        yearGroupSelect.value = 'all';
        programSelect.value = 'all';
        minAgeInput.value = '';
        maxAgeInput.value = '';
        filterTable();
        filterModal.hide();
    });
    
    // Approve functionality
    confirmApprove.addEventListener('click', function() {
        const button = this;
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Approving...';

        fetch('php/approve_application.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `application_id=${currentActionApplicationId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                approveModal.hide();
                showToast('Application approved successfully!', 'success');
                refreshTableData(false);
            } else {
                showToast('Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Approve error:', error);
            showToast('Error approving application', 'error');
        })
        .finally(() => {
            button.disabled = false;
            button.innerHTML = 'Approve';
            currentActionApplicationId = null;
        });
    });

    // Reject functionality
    confirmReject.addEventListener('click', function() {
        const button = this;
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Rejecting...';

        fetch('php/reject_application.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `application_id=${currentActionApplicationId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                rejectModal.hide();
                showToast('Application rejected successfully!', 'success');
                refreshTableData(false);
            } else {
                showToast('Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Reject error:', error);
            showToast('Error rejecting application', 'error');
        })
        .finally(() => {
            button.disabled = false;
            button.innerHTML = 'Reject';
            currentActionApplicationId = null;
        });
    });

    // Attach event listeners
    function attachEventListeners() {
        // View buttons
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', handleViewClick);
        });

        // Approve buttons
        document.querySelectorAll('.approve-btn').forEach(button => {
            button.addEventListener('click', handleApproveClick);
        });

        // Reject buttons
        document.querySelectorAll('.reject-btn').forEach(button => {
            button.addEventListener('click', handleRejectClick);
        });

        // Undo rejection buttons
        document.querySelectorAll('.undo-rejection-btn').forEach(button => {
            button.addEventListener('click', handleUndoRejectionClick);
        });
    }

    // Initialize
    attachEventListeners();
    startCountdownTimers(); // Add this line
    filterTable();
    
    // Debug: Check if variables are properly set
    console.log('Applications page initialized - Browser Instance ID:', browserInstanceId);
    console.log('Search options available:', {
        student: !!searchStudent,
        parent: !!searchParent,
        email: !!searchEmail
    });
});