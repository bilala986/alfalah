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
    const yearGroupFilterSelect = document.getElementById('yearGroupFilterSelect');
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    
    // Edit modal elements
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    const editTeacherId = document.getElementById('editTeacherId');
    const editName = document.getElementById('editName');
    const editEmail = document.getElementById('editEmail');
    const editYearGroup = document.getElementById('editYearGroup');
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
    let currentYearGroupFilter = 'all';
    let originalFormData = {};
    let currentActionTeacherId = null;
    
    // Add these new elements to your JavaScript
    const editProgram = document.getElementById('editProgram');
    const programFilterSelect = document.getElementById('programFilterSelect');

    // Add program filter to current filter state
    let currentProgramFilter = 'all';

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

        // Debug: Check what we're getting
        console.log('Original:', dateTimeString, 'UK Time:', ukTimeString);

        return ukTimeString;
    }

    // Update table with new data - FIXED VERSION with correct column order
    function updateTable(teachers) {
        console.log('Updating table with teachers:', teachers);
        teacherTableBody.innerHTML = '';

        if (teachers.length === 0) {
            teacherTableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">No teacher accounts found.</td></tr>';
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
            console.log('Year Group:', teacher.year_group);
            console.log('Program:', teacher.program);

            const row = document.createElement('tr');
            row.setAttribute('data-name', teacher.name.toLowerCase());
            row.setAttribute('data-email', teacher.email.toLowerCase());
            // Use proper status value based on is_approved
            const statusValue = teacher.is_approved == 1 ? 'approved' : 'pending';
            row.setAttribute('data-status', statusValue);
            row.setAttribute('data-teacher-id', teacher.id);
            
            // Set year group data attribute for filtering
            const yearGroupValue = teacher.year_group ? teacher.year_group.toString() : 'not_set';
            row.setAttribute('data-year-group', yearGroupValue);
            
            row.setAttribute('data-program', teacher.program || 'not_set');

            const statusBadge = teacher.is_approved == 1 ? 
                '<span class="badge bg-success">Approved</span>' : 
                '<span class="badge bg-danger">Pending</span>';

            const approveButton = teacher.is_approved == 0 ? 
                `<button type="button" class="btn btn-outline-success approve-btn" data-teacher-id="${teacher.id}" data-teacher-name="${teacher.name}" data-teacher-email="${teacher.email}">
                    <i class="bi bi-check-lg"></i> Approve
                </button>` : '';

            // FIXED: Correct column order matching the table headers
            row.innerHTML = `
                <td class="fw-semibold">${teacher.name}</td>
                <td>${teacher.email}</td>
                <td class="mobile-hide">
                    ${teacher.year_group ? 'Year ' + teacher.year_group : '<span class="text-muted">Not set</span>'}
                </td>
                <td class="mobile-hide">
                    ${teacher.program ? formatProgramName(teacher.program) : '<span class="text-muted">Not set</span>'}
                </td>
                <td class="mobile-hide">
                    ${teacher.assigned_students ? 
                        (JSON.parse(teacher.assigned_students).length + ' student(s)') : 
                        '<span class="text-muted">No students</span>'}
                </td>
                <td class="mobile-hide">
                    ${teacher.last_login ? formatUKDateTime(teacher.last_login) : '<span class="text-muted">Never</span>'}
                </td>
                <td>${statusBadge}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button type="button" class="btn btn-outline-primary edit-btn" 
                                data-teacher-id="${teacher.id}" 
                                data-teacher-name="${teacher.name}" 
                                data-teacher-email="${teacher.email}" 
                                data-teacher-approved="${teacher.is_approved}"
                                data-year-group="${teacher.year_group || ''}"
                                data-program="${teacher.program || ''}">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        ${approveButton}
                        <button type="button" class="btn btn-outline-danger remove-btn" 
                                data-teacher-id="${teacher.id}" 
                                data-teacher-name="${teacher.name}" 
                                data-teacher-email="${teacher.email}">
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

    // Helper function to format program names for display
    function formatProgramName(programValue) {
        const programMap = {
            'weekday_morning_hifdh': 'Weekday Morning Hifdh',
            'weekday_evening_hifdh': 'Weekday Evening Hifdh',
            'weekend_evening_islamic_studies': 'Weekend Evening Islamic Studies',
            'weekend_hifdh': 'Weekend Hifdh',
            'weekend_islamic_studies': 'Weekend Islamic Studies'
        };
        return programMap[programValue] || programValue;
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

    // Update filterTable function to include program filtering
    function filterTable() {
        const searchTerm = searchInput.value.toLowerCase();
        let visibleRows = 0;
        let totalRows = 0;

        rows.forEach(row => {
            totalRows++;
            const name = row.getAttribute('data-name');
            const email = row.getAttribute('data-email');
            const status = row.getAttribute('data-status');
            const yearGroup = row.getAttribute('data-year-group');
            const program = row.getAttribute('data-program') || 'not_set';

            const matchesSearch = name.includes(searchTerm) || email.includes(searchTerm);
            const matchesStatus = currentStatusFilter === 'all' || status === currentStatusFilter;
            const matchesYearGroup = currentYearGroupFilter === 'all' || 
                                   (currentYearGroupFilter === 'not_set' && yearGroup === 'not_set') ||
                                   yearGroup === currentYearGroupFilter;
            const matchesProgram = currentProgramFilter === 'all' || 
                                 (currentProgramFilter === 'not_set' && program === 'not_set') ||
                                 program === currentProgramFilter;

            if (matchesSearch && matchesStatus && matchesYearGroup && matchesProgram) {
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
        const hasActiveFilter = currentStatusFilter !== 'all' || currentYearGroupFilter !== 'all' || currentProgramFilter !== 'all';
        if (hasActiveFilter) {
            filterBtn.classList.remove('btn-outline-primary');
            filterBtn.classList.add('btn-success');
        } else {
            filterBtn.classList.remove('btn-success');
            filterBtn.classList.add('btn-outline-primary');
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
    
    // Update filter modal functionality
    filterBtn.addEventListener('click', function() {
        statusSelect.value = currentStatusFilter;
        yearGroupFilterSelect.value = currentYearGroupFilter;
        programFilterSelect.value = currentProgramFilter;
        filterModal.show();
    });

    applyFilterBtn.addEventListener('click', function() {
        currentStatusFilter = statusSelect.value;
        currentYearGroupFilter = yearGroupFilterSelect.value;
        currentProgramFilter = programFilterSelect.value;
        filterTable();
        filterModal.hide();
    });

    // Update clear filter functionality
    clearFilterBtn.addEventListener('click', function() {
        currentStatusFilter = 'all';
        currentYearGroupFilter = 'all';
        currentProgramFilter = 'all';
        statusSelect.value = 'all';
        yearGroupFilterSelect.value = 'all';
        programFilterSelect.value = 'all';
        filterTable();
        filterModal.hide();
    });

    // Update the handleEditClick function to include program
    function handleEditClick() {
        const teacherId = this.getAttribute('data-teacher-id');
        const teacherName = this.getAttribute('data-teacher-name');
        const teacherEmail = this.getAttribute('data-teacher-email');
        const teacherApproved = this.getAttribute('data-teacher-approved');
        const yearGroup = this.getAttribute('data-year-group');
        const program = this.getAttribute('data-program');

        console.log('Edit clicked - Program:', program); // Debug

        // Populate form
        editTeacherId.value = teacherId;
        editName.value = teacherName;
        editEmail.value = teacherEmail;
        editYearGroup.value = yearGroup || '';
        editProgram.value = program || '';

        // Disable year group and program dropdowns if teacher is not approved
        const isApproved = teacherApproved === '1';
        if (isApproved) {
            editYearGroup.disabled = false;
            editYearGroup.title = '';
            editProgram.disabled = false;
            editProgram.title = '';
        } else {
            editYearGroup.disabled = true;
            editYearGroup.title = 'Year group can only be set after teacher is approved';
            editProgram.disabled = true;
            editProgram.title = 'Program can only be set after teacher is approved';
        }

        editApproved.checked = isApproved;

        // Store original data for comparison
        originalFormData = {
            name: teacherName,
            email: teacherEmail,
            is_approved: isApproved,
            year_group: yearGroup || '',
            program: program || ''
        };

        // Reset save button
        saveChangesBtn.disabled = true;

        editModal.show();
    }

    // Update form change detection to include program
    [editName, editEmail, editApproved, editYearGroup, editProgram].forEach(element => {
        element.addEventListener('input', checkFormChanges);
        element.addEventListener('change', checkFormChanges);
    });

    // Update approval checkbox handler to enable/disable both year group and program
    editApproved.addEventListener('change', function() {
        if (this.checked) {
            // When approved, enable year group and program dropdowns
            editYearGroup.disabled = false;
            editYearGroup.title = '';
            editProgram.disabled = false;
            editProgram.title = '';
        } else {
            // When not approved, disable year group and program and clear them
            editYearGroup.disabled = true;
            editYearGroup.title = 'Year group can only be set after teacher is approved';
            editYearGroup.value = '';
            editProgram.disabled = true;
            editProgram.title = 'Program can only be set after teacher is approved';
            editProgram.value = '';
        }
        checkFormChanges();
    });

    // Update checkFormChanges function - FIXED to detect program changes
    function checkFormChanges() {
        const currentData = {
            name: editName.value,
            email: editEmail.value,
            is_approved: editApproved.checked,
            year_group: editYearGroup.value,
            program: editProgram.value
        };

        const hasChanges = currentData.name !== originalFormData.name ||
                          currentData.email !== originalFormData.email ||
                          currentData.is_approved !== originalFormData.is_approved ||
                          currentData.year_group !== originalFormData.year_group ||
                          currentData.program !== originalFormData.program;

        saveChangesBtn.disabled = !hasChanges;
    }

    // Update save functionality to include program
    saveChangesBtn.addEventListener('click', function() {
        const formData = new FormData();
        const isApproved = editApproved.checked ? '1' : '0';

        formData.append('teacher_id', editTeacherId.value);
        formData.append('name', editName.value);
        formData.append('email', editEmail.value);
        formData.append('year_group', editYearGroup.value);
        formData.append('program', editProgram.value);
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
            console.log('Server response:', data);
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