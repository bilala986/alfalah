// admin/js/teacher-accounts.js
document.addEventListener('DOMContentLoaded', function() {
    
    // TEMPORARY DEBUG - Add this at the very top of teacher-accounts.js
    console.log('=== TEACHER ACCOUNTS JS LOADED ===');
    console.log('Script version: 2.0 - Year Groups Debug');
    
    // Helper function to escape HTML
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

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
    const totalCount = document.getElementById('totalCount');
    
    // Modal elements
    const filterModal = new bootstrap.Modal(document.getElementById('filterModal'));
    const statusSelect = document.getElementById('statusSelect');
    const yearGroupFilterSelect = document.getElementById('yearGroupFilterSelect');
    const programFilterSelect = document.getElementById('programFilterSelect');
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    
    // Edit modal elements
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    const editTeacherId = document.getElementById('editTeacherId');
    const editName = document.getElementById('editName');
    const editEmail = document.getElementById('editEmail');
    const editYearGroup = document.getElementById('editYearGroup');
    const editProgram = document.getElementById('editProgram');
    const editApproved = document.getElementById('editApproved');
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    
    // Multi-select elements
    const yearGroupCount = document.getElementById('yearGroupCount');
    const programCount = document.getElementById('programCount');
    
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
    let currentProgramFilter = 'all';
    let originalFormData = {};
    let currentActionTeacherId = null;

    // Get all rows (will be updated on refresh)
    let rows = [];

    // Multi-select functionality - FIXED VERSION
    function initializeMultiSelect() {
        console.log('Initializing multi-select...');

        // Year group options - use specific IDs
        const yearGroupGrid = document.getElementById('yearGroupGrid');
        if (yearGroupGrid) {
            const yearGroupOptions = yearGroupGrid.querySelectorAll('.multi-select-option');
            console.log('Year group options found:', yearGroupOptions.length);

            yearGroupOptions.forEach(option => {
                option.addEventListener('click', function() {
                    console.log('Year group clicked:', this.getAttribute('data-value'));
                    this.classList.toggle('selected');
                    updateYearGroupSelection();
                });
            });
        } else {
            console.error('Year group grid not found!');
        }

        // Program options - use specific IDs
        const programGrid = document.getElementById('programGrid');
        if (programGrid) {
            const programOptions = programGrid.querySelectorAll('.multi-select-option');
            console.log('Program options found:', programOptions.length);

            programOptions.forEach(option => {
                option.addEventListener('click', function() {
                    console.log('Program clicked:', this.getAttribute('data-value'));
                    this.classList.toggle('selected');
                    updateProgramSelection();
                });
            });
        } else {
            console.error('Program grid not found!');
        }
    }

    function updateYearGroupSelection() {
        const yearGroupGrid = document.getElementById('yearGroupGrid');
        if (!yearGroupGrid) {
            console.error('Year group grid not found for selection update!');
            return;
        }

        const selectedOptions = yearGroupGrid.querySelectorAll('.multi-select-option.selected');
        const yearGroups = Array.from(selectedOptions).map(opt => opt.getAttribute('data-value'));

        console.log('Year groups selected:', yearGroups);

        editYearGroup.value = yearGroups.join(',');
        yearGroupCount.textContent = `${yearGroups.length} selected`;
        checkFormChanges();
    }

    function updateProgramSelection() {
        const programGrid = document.getElementById('programGrid');
        if (!programGrid) {
            console.error('Program grid not found for selection update!');
            return;
        }

        const selectedOptions = programGrid.querySelectorAll('.multi-select-option.selected');
        const programs = Array.from(selectedOptions).map(opt => opt.getAttribute('data-value'));

        console.log('Programs selected:', programs);

        editProgram.value = programs.join(',');
        programCount.textContent = `${programs.length} selected`;
        checkFormChanges();
    }

    function clearMultiSelectSelections() {
        console.log('Clearing multi-select selections...');

        // Clear year group selections
        const yearGroupGrid = document.getElementById('yearGroupGrid');
        if (yearGroupGrid) {
            yearGroupGrid.querySelectorAll('.multi-select-option').forEach(option => {
                option.classList.remove('selected');
            });
        }

        // Clear program selections
        const programGrid = document.getElementById('programGrid');
        if (programGrid) {
            programGrid.querySelectorAll('.multi-select-option').forEach(option => {
                option.classList.remove('selected');
            });
        }

        yearGroupCount.textContent = '0 selected';
        programCount.textContent = '0 selected';
        editYearGroup.value = '';
        editProgram.value = '';
    }

    function setMultiSelectEnabled(enabled) {
        console.log('Setting multi-select enabled:', enabled);

        const yearGroupGrid = document.getElementById('yearGroupGrid');
        const programGrid = document.getElementById('programGrid');

        if (yearGroupGrid && programGrid) {
            const allOptions = [
                ...yearGroupGrid.querySelectorAll('.multi-select-option'),
                ...programGrid.querySelectorAll('.multi-select-option')
            ];

            allOptions.forEach(option => {
                if (enabled) {
                    option.style.pointerEvents = 'auto';
                    option.style.opacity = '1';
                    option.style.cursor = 'pointer';
                } else {
                    option.style.pointerEvents = 'none';
                    option.style.opacity = '0.6';
                    option.style.cursor = 'not-allowed';
                }
            });
        }
    }

    // In the refreshTableData function - add cache buster
    function refreshTableData(shouldShowToast = false) {
        console.log('Refreshing teacher table data...');

        // Show loading state
        teacherTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <div class="spinner-border spinner-border-sm" role="status"></div>
                    <span class="ms-2">Loading teachers...</span>
                </td>
            </tr>
        `;

        // Add cache buster to prevent caching
        const timestamp = new Date().getTime();
        fetch(`../php/get_teachers.php?bid=${browserInstanceId}&_=${timestamp}`)
            .then(response => response.json())
            .then(data => {
                console.log('Received data from server:', data);
                if (data.success) {
                    updateTable(data.teachers);
                    if (shouldShowToast) {
                        showToast('Table refreshed successfully!', 'success');
                    }
                } else {
                    teacherTableBody.innerHTML = `
                        <tr>
                            <td colspan="7" class="text-center text-danger py-4">
                                <i class="bi bi-exclamation-triangle"></i> Error loading teachers
                            </td>
                        </tr>
                    `;
                    if (shouldShowToast) {
                        showToast('Error refreshing table', 'error');
                    }
                }
            })
            .catch(error => {
                console.error('Error refreshing table:', error);
                teacherTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-danger py-4">
                            <i class="bi bi-exclamation-triangle"></i> Error loading teachers
                        </td>
                    </tr>
                `;
                if (shouldShowToast) {
                    showToast('Error refreshing table', 'error');
                }
            });
    }
    
    function formatUKDateTime(dateTimeString) {
        if (!dateTimeString) return 'Never';
        
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-GB', {
            timeZone: 'Europe/London',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
    
    // Helper function to format program names for display
    function formatProgramNames(programValues) {
        const programMap = {
            'weekday_morning_hifdh': 'Weekday Morning Hifdh',
            'weekday_evening_hifdh': 'Weekday Evening Hifdh',
            'weekend_evening_islamic_studies': 'Weekend Evening Islamic Studies',
            'weekend_hifdh': 'Weekend Hifdh',
            'weekend_islamic_studies': 'Weekend Islamic Studies'
        };
        
        if (!programValues) return 'Not set';
        
        const programs = programValues.split(',');
        const formattedPrograms = programs.map(program => {
            return programMap[program.trim()] || program.trim();
        });
        
        return formattedPrograms.join(', ');
    }

    // In the updateTable function - make sure year groups are properly displayed
    function updateTable(teachers) {
        console.log('Updating table with teachers:', teachers);
        teacherTableBody.innerHTML = '';

        if (teachers.length === 0) {
            teacherTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No teacher accounts found.</td></tr>';
            visibleCount.textContent = '0';
            if (totalCount) totalCount.textContent = '0';
            rows = [];
            return;
        }

        // Create document fragment for efficient DOM manipulation
        const frag = document.createDocumentFragment();

        teachers.forEach(teacher => {
            const row = document.createElement('tr');
            row.setAttribute('data-name', teacher.name.toLowerCase());
            row.setAttribute('data-email', teacher.email.toLowerCase());
            const statusValue = teacher.is_approved == 1 ? 'approved' : 'pending';
            row.setAttribute('data-status', statusValue);
            row.setAttribute('data-teacher-id', teacher.id);

            // Set year group data attribute for filtering
            const yearGroupValue = teacher.year_group ? teacher.year_group : 'not_set';
            row.setAttribute('data-year-group', yearGroupValue);
            row.setAttribute('data-program', teacher.program || 'not_set');

            const statusBadge = teacher.is_approved == 1 ? 
                '<span class="badge bg-success">Approved</span>' : 
                '<span class="badge bg-danger">Pending</span>';

            const approveButton = teacher.is_approved == 0 ? 
                `<button type="button" class="btn btn-outline-success approve-btn" data-teacher-id="${teacher.id}" data-teacher-name="${escapeHtml(teacher.name)}" data-teacher-email="${escapeHtml(teacher.email)}">
                    <i class="bi bi-check-lg"></i> Approve
                </button>` : '';

            // DEBUG: Log the teacher data to see what we're getting
            console.log('Teacher data for display:', {
                name: teacher.name,
                year_group: teacher.year_group,
                program: teacher.program
            });

            row.innerHTML = `
                <td class="fw-semibold">${escapeHtml(teacher.name)}</td>
                <td>${escapeHtml(teacher.email)}</td>
                <td class="mobile-hide">
                    ${teacher.year_group && teacher.year_group !== '' ? `
                        <div class="year-group-badges">
                            ${teacher.year_group.split(',').map(year => 
                                `<span class="badge bg-primary me-1">Year ${escapeHtml(year.trim())}</span>`
                            ).join('')}
                        </div>
                    ` : '<span class="text-muted">Not set</span>'}
                </td>
                <td class="mobile-hide">
                    ${teacher.program && teacher.program !== '' ? `
                        <div class="program-badges">
                            ${teacher.program.split(',').map(program => {
                                const formattedProgram = formatProgramNames(program);
                                return `<span class="badge bg-info me-1 mb-1">${escapeHtml(formattedProgram)}</span>`;
                            }).join('')}
                        </div>
                    ` : '<span class="text-muted">Not set</span>'}
                </td>
                <td class="mobile-hide">
                    ${teacher.last_login ? formatUKDateTime(teacher.last_login) : '<span class="text-muted">Never</span>'}
                </td>
                <td>${statusBadge}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button type="button" class="btn btn-outline-primary edit-btn" 
                                data-teacher-id="${teacher.id}" 
                                data-teacher-name="${escapeHtml(teacher.name)}" 
                                data-teacher-email="${escapeHtml(teacher.email)}" 
                                data-teacher-approved="${teacher.is_approved}"
                                data-year-group="${teacher.year_group || ''}"
                                data-program="${teacher.program || ''}">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        ${approveButton}
                        <button type="button" class="btn btn-outline-danger remove-btn" 
                                data-teacher-id="${teacher.id}" 
                                data-teacher-name="${escapeHtml(teacher.name)}" 
                                data-teacher-email="${escapeHtml(teacher.email)}">
                            <i class="bi bi-trash"></i> Remove
                        </button>
                    </div>
                </td>
            `;

            frag.appendChild(row);
        });

        // Append all rows at once using the document fragment
        teacherTableBody.appendChild(frag);

        // Update counts
        visibleCount.textContent = teachers.length;
        if (totalCount) totalCount.textContent = teachers.length;

        // Update rows reference and attach event listeners
        rows = teacherTableBody.querySelectorAll('tr[data-name]');
        attachEventListeners();
    }

    // Attach event listeners to dynamic buttons
    function attachEventListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.removeEventListener('click', handleEditClick);
            button.addEventListener('click', handleEditClick);
        });
        
        // Approve buttons
        document.querySelectorAll('.approve-btn').forEach(button => {
            button.removeEventListener('click', handleApproveClick);
            button.addEventListener('click', handleApproveClick);
        });
        
        // Remove buttons
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.removeEventListener('click', handleRemoveClick);
            button.addEventListener('click', handleRemoveClick);
        });
    }

    // Filter table function
    function filterTable() {
        const searchTerm = searchInput.value.toLowerCase();
        let visibleRows = 0;

        rows.forEach(row => {
            const name = row.getAttribute('data-name');
            const email = row.getAttribute('data-email');
            const status = row.getAttribute('data-status');
            const yearGroup = row.getAttribute('data-year-group');
            const program = row.getAttribute('data-program') || 'not_set';

            const matchesSearch = name.includes(searchTerm) || email.includes(searchTerm);
            const matchesStatus = currentStatusFilter === 'all' || status === currentStatusFilter;
            
            // For year group filtering, check if the year group string contains the filter value
            let matchesYearGroup = currentYearGroupFilter === 'all';
            if (currentYearGroupFilter === 'not_set') {
                matchesYearGroup = yearGroup === 'not_set';
            } else if (currentYearGroupFilter !== 'all') {
                matchesYearGroup = yearGroup.includes(currentYearGroupFilter);
            }
            
            // For program filtering, check if the program string contains the filter value
            let matchesProgram = currentProgramFilter === 'all';
            if (currentProgramFilter === 'not_set') {
                matchesProgram = program === 'not_set';
            } else if (currentProgramFilter !== 'all') {
                matchesProgram = program.includes(currentProgramFilter);
            }

            if (matchesSearch && matchesStatus && matchesYearGroup && matchesProgram) {
                row.style.display = '';
                visibleRows++;
            } else {
                row.style.display = 'none';
            }
        });

        // Update visible count
        visibleCount.textContent = visibleRows;

        // Update filter button appearance
        const hasActiveFilter = currentStatusFilter !== 'all' || currentYearGroupFilter !== 'all' || currentProgramFilter !== 'all';
        filterBtn.classList.toggle('btn-success', hasActiveFilter);
        filterBtn.classList.toggle('btn-outline-primary', !hasActiveFilter);
    }

    // Search functionality
    searchInput.addEventListener('input', filterTable);
    
    // Refresh functionality
    refreshBtn.addEventListener('click', function() {
        const button = this;
        const originalHTML = button.innerHTML;

        // Show loading state on button only
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Refreshing...';

        // Add refresh animation to icon
        const refreshIcon = button.querySelector('.spinner-border') || button.querySelector('i');
        if (refreshIcon) {
            refreshIcon.classList.add('refresh-spin');
        }

        fetch(`../php/get_teachers.php?bid=${browserInstanceId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateTable(data.teachers);
                    showToast('Teachers list refreshed successfully!', 'success');
                } else {
                    showToast('Error refreshing table', 'error');
                }
            })
            .catch(error => {
                console.error('Error refreshing table:', error);
                showToast('Error refreshing table', 'error');
            })
            .finally(() => {
                // Restore button state
                setTimeout(() => {
                    button.disabled = false;
                    button.innerHTML = originalHTML;

                    // Remove refresh animation
                    if (refreshIcon) {
                        refreshIcon.classList.remove('refresh-spin');
                    }
                }, 300);
            });
    });
    
    // Filter modal functionality
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

    // Edit teacher functionality - FIXED VERSION
    function handleEditClick() {
        console.log('Edit button clicked');

        const teacherId = this.getAttribute('data-teacher-id');
        const teacherName = this.getAttribute('data-teacher-name');
        const teacherEmail = this.getAttribute('data-teacher-email');
        const teacherApproved = this.getAttribute('data-teacher-approved');
        const yearGroup = this.getAttribute('data-year-group');
        const program = this.getAttribute('data-program');

        console.log('Teacher data:', { teacherId, teacherName, teacherEmail, teacherApproved, yearGroup, program });

        // Populate basic form fields
        editTeacherId.value = teacherId;
        editName.value = teacherName;
        editEmail.value = teacherEmail;

        // Clear previous selections
        clearMultiSelectSelections();

        // Handle multiple year groups
        if (yearGroup && yearGroup !== '' && yearGroup !== 'null') {
            const yearGroups = yearGroup.split(',').map(y => y.trim());
            console.log('Setting year groups:', yearGroups);

            const yearGroupGrid = document.getElementById('yearGroupGrid');
            if (yearGroupGrid) {
                yearGroupGrid.querySelectorAll('.multi-select-option').forEach(option => {
                    const value = option.getAttribute('data-value');
                    if (yearGroups.includes(value)) {
                        option.classList.add('selected');
                    }
                });
                updateYearGroupSelection();
            }
        }

        // Handle multiple programs
        if (program && program !== '') {
            const programs = program.split(',').map(p => p.trim());
            console.log('Setting programs:', programs);

            const programGrid = document.getElementById('programGrid');
            if (programGrid) {
                programGrid.querySelectorAll('.multi-select-option').forEach(option => {
                    const value = option.getAttribute('data-value');
                    if (programs.includes(value)) {
                        option.classList.add('selected');
                    }
                });
                updateProgramSelection();
            }
        }

        // Set approval status and enable/disable multi-select
        const isApproved = teacherApproved === '1';
        editApproved.checked = isApproved;
        setMultiSelectEnabled(isApproved);

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

        // Show the modal
        console.log('Showing edit modal');
        editModal.show();
    }

    // Form change detection
    [editName, editEmail].forEach(element => {
        element.addEventListener('input', checkFormChanges);
    });

    editApproved.addEventListener('change', function() {
        setMultiSelectEnabled(this.checked);
        if (!this.checked) {
            clearMultiSelectSelections();
        }
        checkFormChanges();
    });

    // Check form changes
    function checkFormChanges() {
        const currentYearGroups = editYearGroup.value;
        const currentPrograms = editProgram.value;

        const currentData = {
            name: editName.value,
            email: editEmail.value,
            is_approved: editApproved.checked,
            year_group: currentYearGroups,
            program: currentPrograms
        };

        const hasChanges = currentData.name !== originalFormData.name ||
                          currentData.email !== originalFormData.email ||
                          currentData.is_approved !== originalFormData.is_approved ||
                          currentData.year_group !== originalFormData.year_group ||
                          currentData.program !== originalFormData.program;

        saveChangesBtn.disabled = !hasChanges;
    }

    // In the save teacher changes function - add more detailed debugging
    saveChangesBtn.addEventListener('click', function() {
        console.log('=== SAVE TEACHER DEBUG ===');

        const formData = new FormData();
        const isApproved = editApproved.checked ? '1' : '0';

        // Get selected year groups and programs
        const selectedYearGroups = editYearGroup.value ? editYearGroup.value.split(',') : [];
        const selectedPrograms = editProgram.value ? editProgram.value.split(',') : [];

        console.log('Selected Year Groups:', selectedYearGroups);
        console.log('Selected Programs:', selectedPrograms);
        console.log('Year Group Input Value:', editYearGroup.value);
        console.log('Program Input Value:', editProgram.value);

        formData.append('teacher_id', editTeacherId.value);
        formData.append('name', editName.value);
        formData.append('email', editEmail.value);
        formData.append('is_approved', isApproved);

        // Debug: Check what's being appended to FormData
        console.log('FormData contents:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        // Append year groups and programs as arrays
        selectedYearGroups.forEach(yearGroup => {
            formData.append('year_group[]', yearGroup);
            console.log('Appending year group:', yearGroup);
        });

        selectedPrograms.forEach(program => {
            formData.append('program[]', program);
            console.log('Appending program:', program);
        });

        // Show loading state
        saveChangesBtn.disabled = true;
        saveChangesBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';

        fetch('../php/edit_teacher.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Save response:', data);
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

    // Initialize everything
    function initializePage() {
        console.log('Initializing teacher accounts page...');
        initializeMultiSelect();
        refreshTableData(false);
        attachEventListeners();
    }

    // Start the page
    initializePage();
    
    // Debug: Check if variables are properly set
    console.log('Teacher accounts page initialized - Browser Instance ID:', browserInstanceId);
});