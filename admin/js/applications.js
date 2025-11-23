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
    
    // Current filter state
    let currentYearFilter = 'all';
    let currentProgramFilter = 'all';
    let currentActionApplicationId = null;

    // Get all rows
    let rows = applicationsTableBody.querySelectorAll('tr[data-student]');

    // Enhanced search function - searches student names, parent names, emails, phones
    function searchApplications(searchTerm) {
        let visibleRows = 0;
        
        rows.forEach(row => {
            const studentName = row.getAttribute('data-student');
            const parentName = row.getAttribute('data-parent');
            const program = row.getAttribute('data-program');
            const applicationId = row.getAttribute('data-application-id');
            
            // Get additional data from the row cells for more comprehensive search
            const studentCell = row.cells[0];
            const parentCell = row.cells[3];
            
            const studentFullText = studentCell.textContent.toLowerCase();
            const parentFullText = parentCell.textContent.toLowerCase();
            
            // Search in: student names, parent names, parent emails (from cell text)
            const matchesSearch = studentName.includes(searchTerm) || 
                                parentName.includes(searchTerm) ||
                                studentFullText.includes(searchTerm) ||
                                parentFullText.includes(searchTerm);

            // Apply both search and filter
            const matchesYear = currentYearFilter === 'all' || program === currentYearFilter || row.querySelector('.mobile-hide:nth-child(3)')?.textContent.includes(currentYearFilter);
            const matchesProgram = currentProgramFilter === 'all' || program === currentProgramFilter || row.querySelector('.mobile-hide:nth-child(2)')?.textContent.includes(currentProgramFilter);

            if (matchesSearch && matchesYear && matchesProgram) {
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
        
        // Update filter button appearance
        if (currentYearFilter === 'all' && currentProgramFilter === 'all') {
            filterBtn.classList.remove('btn-success');
            filterBtn.classList.add('btn-outline-primary');
        } else {
            filterBtn.classList.remove('btn-outline-primary');
            filterBtn.classList.add('btn-success');
        }
    }

    // Dynamic table update function (like admin-accounts.js)
    function updateTable(applications) {
        console.log('Updating table with applications:', applications);
        applicationsTableBody.innerHTML = '';

        if (applications.length === 0) {
            applicationsTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No admission applications found.</td></tr>';
            visibleCount.textContent = '0';
            const totalCount = document.getElementById('totalCount');
            if (totalCount) {
                totalCount.textContent = '0';
            }
            rows = [];
            return;
        }

        applications.forEach(app => {
            const row = document.createElement('tr');
            row.setAttribute('data-student', app.student_first_name.toLowerCase() + ' ' + app.student_last_name.toLowerCase());
            row.setAttribute('data-parent', app.parent1_first_name.toLowerCase() + ' ' + app.parent1_last_name.toLowerCase());
            row.setAttribute('data-program', app.interested_program.toLowerCase());
            row.setAttribute('data-application-id', app.id);

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
                <td class="mobile-hide">${submittedDate}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button type="button" class="btn btn-outline-primary view-btn" data-application-id="${app.id}">
                            <i class="bi bi-eye"></i> View
                        </button>
                        <button type="button" class="btn btn-outline-success approve-btn" data-application-id="${app.id}" data-student-name="${escapeHtml(app.student_first_name + ' ' + app.student_last_name)}">
                            <i class="bi bi-check-lg"></i> Approve
                        </button>
                        <button type="button" class="btn btn-outline-danger reject-btn" data-application-id="${app.id}" data-student-name="${escapeHtml(app.student_first_name + ' ' + app.student_last_name)}">
                            <i class="bi bi-x-lg"></i> Reject
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
                <td colspan="6">
                    <div class="application-details" id="details-${app.id}">
                        <!-- Details content would go here - same as PHP generated -->
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
        
        // Apply current filters
        filterTable();
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

    // Refresh table data without page reload
    function refreshTableData(shouldShowToast = false) {
        console.log('Refreshing applications data...');
        
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
            });
    }

    // View application details
    function handleViewClick() {
        const applicationId = this.getAttribute('data-application-id');
        const detailsRow = this.closest('tr').nextElementSibling;
        const detailsDiv = document.getElementById(`details-${applicationId}`);
        
        if (detailsRow.style.display === 'none') {
            detailsRow.style.display = 'table-row';
            detailsDiv.classList.add('show');
            
            // Load details content if not already loaded
            if (detailsDiv.innerHTML.includes('Details loaded dynamically')) {
                // You could implement AJAX loading of details here if needed
                detailsDiv.innerHTML = '<div class="text-center py-3"><div class="spinner-border text-primary" role="status"></div><div class="mt-2">Loading details...</div></div>';
                
                // Simulate loading - in real implementation, you'd fetch the details
                setTimeout(() => {
                    detailsDiv.innerHTML = '<div class="text-center text-muted py-3"><i class="bi bi-check-circle text-success"></i> Details loaded</div>';
                }, 500);
            }
        } else {
            detailsDiv.classList.remove('show');
            setTimeout(() => {
                detailsRow.style.display = 'none';
            }, 300);
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
        filterModal.show();
    });
    
    applyFilterBtn.addEventListener('click', function() {
        currentYearFilter = yearGroupSelect.value;
        currentProgramFilter = programSelect.value;
        filterTable();
        filterModal.hide();
    });

    clearFilterBtn.addEventListener('click', function() {
        currentYearFilter = 'all';
        currentProgramFilter = 'all';
        yearGroupSelect.value = 'all';
        programSelect.value = 'all';
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
    }

    // Initialize
    attachEventListeners();
    filterTable();
    
    // Debug: Check if variables are properly set
    console.log('Applications page initialized - Browser Instance ID:', browserInstanceId);
});