// admin/js/teacher-accounts.js
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
    const teacherTableBody = document.getElementById('teacherTableBody');
    const visibleCount = document.getElementById('visibleCount');
    
    // Modal elements
    const filterModal = new bootstrap.Modal(document.getElementById('filterModal'));
    const statusSelect = document.getElementById('statusSelect');
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    
    // Edit modal elements
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    const editTeacherId = document.getElementById('editTeacherId');
    const editName = document.getElementById('editName');
    const editEmail = document.getElementById('editEmail');
    const editApproved = document.getElementById('editApproved');
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    
    // Approve/Remove modal elements
    const approveModal = new bootstrap.Modal(document.getElementById('approveModal'));
    const removeModal = new bootstrap.Modal(document.getElementById('removeModal'));
    const approveTeacherName = document.getElementById('approveTeacherName');
    const approveTeacherEmail = document.getElementById('approveTeacherEmail');
    const removeTeacherName = document.getElementById('removeTeacherName');
    const removeTeacherEmail = document.getElementById('removeTeacherEmail');
    const confirmApprove = document.getElementById('confirmApprove');
    const confirmRemove = document.getElementById('confirmRemove');
    
    // Current filter state
    let currentStatusFilter = 'all';
    let originalFormData = {};
    let currentActionTeacherId = null;

    // Get all rows (will be updated on refresh)
    let rows = teacherTableBody.querySelectorAll('tr[data-name]');

    // Refresh table data
    function refreshTableData(shouldShowToast = false) {
        console.log('Refreshing teacher table data...');
        
        fetch(`../php/get_teachers.php?bid=${browserInstanceId}`)
            .then(response => response.json())
            .then(data => {
                console.log('Received data from server:', data);
                if (data.success) {
                    updateTable(data.teachers);
                    if (shouldShowToast) {
                        showToast('Table refreshed successfully!', 'success');
                    }
                } else {
                    if (shouldShowToast) {
                        showToast('Error refreshing table', 'error');
                    }
                }
            })
            .catch(error => {
                console.error('Error refreshing table:', error);
                if (shouldShowToast) {
                    showToast('Error refreshing table', 'error');
                }
            });
    }
    
    function formatUKDateTime(dateTimeString) {
        const date = new Date(dateTimeString);

        // Convert to UK timezone string
        const ukTimeString = date.toLocaleString('en-GB', {
            timeZone: 'Europe/London',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        return ukTimeString;
    }

    // Update table with new data
    function updateTable(teachers) {
        console.log('Updating table with teachers:', teachers);
        teacherTableBody.innerHTML = '';

        if (teachers.length === 0) {
            teacherTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No teacher accounts found.</td></tr>';
            // Update the counts
            visibleCount.textContent = '0';
            const totalCount = document.getElementById('totalCount');
            if (totalCount) {
                totalCount.textContent = '0';
            }
            rows = [];
            return;
        }

        // Create document fragment for efficient DOM manipulation
        var frag = document.createDocumentFragment();
        
        teachers.forEach(teacher => {
            console.log('Teacher:', teacher.name);

            const row = document.createElement('tr');
            row.setAttribute('data-name', teacher.name.toLowerCase());
            row.setAttribute('data-email', teacher.email.toLowerCase());
            // Use proper status value based on is_approved
            const statusValue = teacher.is_approved == 1 ? 'approved' : 'pending';
            row.setAttribute('data-status', statusValue);
            row.setAttribute('data-teacher-id', teacher.id);

            const statusBadge = teacher.is_approved == 1 ? 
                '<span class="badge bg-success">Approved</span>' : 
                '<span class="badge bg-danger">Pending</span>';

            const approveButton = teacher.is_approved == 0 ? 
                `<button type="button" class="btn btn-outline-success approve-btn" data-teacher-id="${teacher.id}" data-teacher-name="${teacher.name}" data-teacher-email="${teacher.email}">
                    <i class="bi bi-check-lg"></i> Approve
                </button>` : '';

            row.innerHTML = `
                <td class="fw-semibold">${teacher.name}</td>
                <td>${teacher.email}</td>
                <td class="mobile-hide">${teacher.created_at ? formatUKDateTime(teacher.created_at) : 'N/A'}</td>
                <td class="mobile-hide">
                    ${teacher.last_login ? formatUKDateTime(teacher.last_login) : '<span class="text-muted">Never</span>'}
                </td>
                <td>${statusBadge}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button type="button" class="btn btn-outline-primary edit-btn" data-teacher-id="${teacher.id}" data-teacher-name="${teacher.name}" data-teacher-email="${teacher.email}" data-teacher-approved="${teacher.is_approved}">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        ${approveButton}
                        <button type="button" class="btn btn-outline-danger remove-btn" data-teacher-id="${teacher.id}" data-teacher-name="${teacher.name}" data-teacher-email="${teacher.email}">
                            <i class="bi bi-trash"></i> Remove
                        </button>
                    </div>
                </td>
            `;

            frag.append(row);
        });
        
        // Append all rows at once using the document fragment
        document.getElementById('teacherTableBody').append(frag);

        // Reattach event listeners to new buttons
        attachEventListeners();

        // Update rows and filter
        rows = teacherTableBody.querySelectorAll('tr[data-name]');

        // Call filterTable to update the counts properly
        filterTable();
    }

    // Attach event listeners to dynamic buttons
    function attachEventListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', handleEditClick);
        });
        
        // Approve buttons
        document.querySelectorAll('.approve-btn').forEach(button => {
            button.addEventListener('click', handleApproveClick);
        });
        
        // Remove buttons
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', handleRemoveClick);
        });
    }

    // Filter function
    function filterTable() {
        const searchTerm = searchInput.value.toLowerCase();
        let visibleRows = 0;
        let totalRows = 0;

        rows.forEach(row => {
            totalRows++;
            const name = row.getAttribute('data-name');
            const email = row.getAttribute('data-email');
            const status = row.getAttribute('data-status');

            const matchesSearch = name.includes(searchTerm) || email.includes(searchTerm);
            const matchesStatus = currentStatusFilter === 'all' || status === currentStatusFilter;

            if (matchesSearch && matchesStatus) {
                row.style.display = '';
                visibleRows++;
            } else {
                row.style.display = 'none';
            }
        });

        // Update visible count
        visibleCount.textContent = visibleRows;

        // Update total count
        const totalCount = document.getElementById('totalCount');
        if (totalCount) {
            totalCount.textContent = totalRows;
        }

        // Update filter button appearance based on active filter
        if (currentStatusFilter === 'all') {
            filterBtn.classList.remove('btn-success');
            filterBtn.classList.add('btn-outline-primary');
        } else {
            filterBtn.classList.remove('btn-outline-primary');
            filterBtn.classList.add('btn-success');
        }
    }

    // Search functionality
    searchInput.addEventListener('input', filterTable);
    
    // Refresh functionality
    refreshBtn.addEventListener('click', function() {
        const refreshIcon = this.querySelector('i');
        refreshIcon.classList.add('refresh-spin');
        refreshTableData(true); // true = show toast
        setTimeout(() => refreshIcon.classList.remove('refresh-spin'), 600);
    });
    
    // Filter modal functionality
    filterBtn.addEventListener('click', function() {
        statusSelect.value = currentStatusFilter;
        filterModal.show();
    });
    
    applyFilterBtn.addEventListener('click', function() {
        currentStatusFilter = statusSelect.value;
        filterTable();
        filterModal.hide();
    });

    // Clear filter functionality
    clearFilterBtn.addEventListener('click', function() {
        currentStatusFilter = 'all';
        statusSelect.value = 'all';
        filterTable();
        filterModal.hide();
    });

    // Edit modal functionality
    function handleEditClick() {
        const teacherId = this.getAttribute('data-teacher-id');
        const teacherName = this.getAttribute('data-teacher-name');
        const teacherEmail = this.getAttribute('data-teacher-email');
        const teacherApproved = this.getAttribute('data-teacher-approved');

        // DEBUG LOGGING
        console.log('=== EDIT MODAL DEBUG ===');
        console.log('Teacher ID:', teacherId);
        console.log('Teacher Name:', teacherName);
        console.log('Teacher Email:', teacherEmail);
        console.log('Teacher Approved (raw from data attribute):', teacherApproved);

        // Populate form
        editTeacherId.value = teacherId;
        editName.value = teacherName;
        editEmail.value = teacherEmail;

        // Check what the checkbox state will be
        const checkboxWillBeChecked = teacherApproved === '1';
        console.log('Checkbox will be set to:', checkboxWillBeChecked ? 'CHECKED' : 'UNCHECKED');

        editApproved.checked = checkboxWillBeChecked;

        // Verify the actual checkbox state
        console.log('Actual checkbox state after setting:', editApproved.checked);
        console.log('=== END DEBUG ===');

        // Store original data for comparison
        originalFormData = {
            name: teacherName,
            email: teacherEmail,
            is_approved: checkboxWillBeChecked
        };

        // Reset save button
        saveChangesBtn.disabled = true;

        editModal.show();
    }

    // Form change detection
    [editName, editEmail, editApproved].forEach(element => {
        element.addEventListener('input', checkFormChanges);
        element.addEventListener('change', checkFormChanges);
    });

    function checkFormChanges() {
        const currentData = {
            name: editName.value,
            email: editEmail.value,
            is_approved: editApproved.checked
        };
        
        const hasChanges = currentData.name !== originalFormData.name ||
                          currentData.email !== originalFormData.email ||
                          currentData.is_approved !== originalFormData.is_approved;
        
        saveChangesBtn.disabled = !hasChanges;
    }

    // Save changes functionality
    saveChangesBtn.addEventListener('click', function() {
        const formData = new FormData();
        const isApproved = editApproved.checked ? '1' : '0';

        // DEBUG: What are we sending to the server?
        console.log('=== SAVE DEBUG ===');
        console.log('Teacher ID:', editTeacherId.value);
        console.log('Name:', editName.value);
        console.log('Email:', editEmail.value);
        console.log('Is Approved (checkbox checked):', editApproved.checked);
        console.log('Is Approved (value being sent):', isApproved);
        console.log('=== END SAVE DEBUG ===');

        formData.append('teacher_id', editTeacherId.value);
        formData.append('name', editName.value);
        formData.append('email', editEmail.value);
        formData.append('is_approved', isApproved);

        // Show loading state
        saveChangesBtn.disabled = true;
        saveChangesBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';

        fetch('../php/edit_teacher.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Server response:', data); // Debug server response
            if (data.success) {
                editModal.hide();
                showToast('Teacher updated successfully!', 'success');
                refreshTableData(false);
            } else {
                showToast('Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Fetch error details:', error);
            showToast('Error updating teacher: ' + error.message, 'error');
        })
        .finally(() => {
            saveChangesBtn.disabled = false;
            saveChangesBtn.innerHTML = 'Save Changes';
        });
    });

    // Approve functionality
    function handleApproveClick() {
        const teacherId = this.getAttribute('data-teacher-id');
        const teacherName = this.getAttribute('data-teacher-name');
        const teacherEmail = this.getAttribute('data-teacher-email');
        
        approveTeacherName.textContent = teacherName;
        approveTeacherEmail.textContent = teacherEmail;
        currentActionTeacherId = teacherId;
        
        approveModal.show();
    }

    confirmApprove.addEventListener('click', function() {
        const button = this;
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Approving...';

        fetch('../php/approve_teacher_action.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `teacher_id=${currentActionTeacherId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                approveModal.hide();
                showToast('Teacher approved successfully!', 'success');
                refreshTableData(false);
            } else {
                showToast('Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Approve error:', error);
            showToast('Error approving teacher', 'error');
        })
        .finally(() => {
            button.disabled = false;
            button.innerHTML = 'Approve';
            currentActionTeacherId = null;
        });
    });

    // Remove functionality
    function handleRemoveClick() {
        const teacherId = this.getAttribute('data-teacher-id');
        const teacherName = this.getAttribute('data-teacher-name');
        const teacherEmail = this.getAttribute('data-teacher-email');
        
        removeTeacherName.textContent = teacherName;
        removeTeacherEmail.textContent = teacherEmail;
        currentActionTeacherId = teacherId;
        
        removeModal.show();
    }

    confirmRemove.addEventListener('click', function() {
        const button = this;
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Removing...';

        fetch('../php/remove_teacher.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `teacher_id=${currentActionTeacherId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                removeModal.hide();
                showToast('Teacher removed successfully!', 'success');
                refreshTableData(false);
            } else {
                showToast('Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Remove error:', error);
            showToast('Error removing teacher', 'error');
        })
        .finally(() => {
            button.disabled = false;
            button.innerHTML = 'Remove';
            currentActionTeacherId = null;
        });
    });

    // Initialize
    attachEventListeners();
    filterTable();
    
    // Debug: Check if variables are properly set
    console.log('Initialization complete - Browser Instance ID:', browserInstanceId);
});