// admin/js/teacher-accounts.js
document.addEventListener('DOMContentLoaded', function() {
    
    console.log('=== TEACHER ACCOUNTS JS LOADED ===');
    
    // Helper function to escape HTML
    function escapeHtml(unsafe) {
        if (!unsafe) return '';
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

        toastEl.className = `toast align-items-center ${type === 'success' ? 'bg-success' : 'bg-danger'}`;
        toastBody.textContent = message;

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
    let rows = [];

    // Refresh table data
    function refreshTableData(shouldShowToast = false) {
        console.log('Refreshing teacher table data...');

        teacherTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <div class="spinner-border spinner-border-sm" role="status"></div>
                    <span class="ms-2">Loading teachers...</span>
                </td>
            </tr>
        `;

        const timestamp = new Date().getTime();
        fetch(`../php/get_teachers.php?bid=${browserInstanceId}&_=${timestamp}`)
            .then(response => response.json())
            .then(data => {
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
    
    // Initialize multi-select functionality
    function initMultiSelect() {
        const options = document.querySelectorAll('.multi-select-option');
        options.forEach(option => {
            option.addEventListener('click', function() {
                this.classList.toggle('selected');
                updateClassSelection();
                checkFormChanges();
            });
        });
        updateClassSelection();
    }

    // Update class selection count
    function updateClassSelection() {
        const selectedCount = document.querySelectorAll('.multi-select-option.selected').length;
        const classCount = document.getElementById('classCount');
        if (classCount) {
            classCount.textContent = `${selectedCount} selected`;
        }
        
        // Update hidden input with selected class IDs
        const selectedClasses = Array.from(document.querySelectorAll('.multi-select-option.selected'))
            .map(option => option.getAttribute('data-value'));

        const editClassesInput = document.getElementById('editClasses');
        if (editClassesInput) {
            editClassesInput.value = selectedClasses.join(',');
        }
    }

    // Clear all selections
    function clearMultiSelectSelections() {
        document.querySelectorAll('.multi-select-option.selected').forEach(option => {
            option.classList.remove('selected');
        });
        updateClassSelection();
    }
    
    // Enable/disable multi-select based on approval status
    function setMultiSelectEnabled(enabled) {
        const classGrid = document.getElementById('classGrid');
        if (!classGrid) return;

        if (enabled) {
            classGrid.classList.remove('disabled');
            classGrid.querySelectorAll('.multi-select-option').forEach(option => {
                option.style.pointerEvents = 'auto';
                option.style.opacity = '1';
            });
        } else {
            classGrid.classList.add('disabled');
            classGrid.querySelectorAll('.multi-select-option').forEach(option => {
                option.style.pointerEvents = 'none';
                option.style.opacity = '0.5';
            });
            clearMultiSelectSelections();
        }
    }
    
    // Function to load classes for the edit modal
    function loadClassesForModal() {
        return new Promise((resolve, reject) => {
            const classGrid = document.getElementById('classGrid');
            if (!classGrid) {
                reject('Class grid element not found');
                return;
            }

            classGrid.innerHTML = '<div class="text-center py-3"><div class="spinner-border spinner-border-sm" role="status"></div><span class="ms-2">Loading classes...</span></div>';

            fetch(`../php/get_classes_for_dropdown.php?bid=${browserInstanceId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        classGrid.innerHTML = '';

                        if (data.classes && data.classes.length > 0) {
                            data.classes.forEach(cls => {
                                const option = document.createElement('div');
                                option.className = 'multi-select-option';
                                option.setAttribute('data-value', cls.id);
                                option.innerHTML = `
                                    <div class="option-checkbox">
                                        <i class="bi bi-check-lg"></i>
                                    </div>
                                    <span class="option-label">${escapeHtml(cls.class_name)}</span>
                                `;
                                classGrid.appendChild(option);
                            });

                            initMultiSelect();
                            setMultiSelectEnabled(editApproved.checked);
                            console.log('Loaded classes:', data.classes.length);
                            resolve();
                        } else {
                            classGrid.innerHTML = '<div class="text-center text-muted py-3">No classes available</div>';
                            resolve();
                        }
                    } else {
                        classGrid.innerHTML = '<div class="text-center text-danger py-3">Error loading classes</div>';
                        reject(data.message || 'Failed to load classes');
                    }
                })
                .catch(error => {
                    console.error('Error loading classes:', error);
                    classGrid.innerHTML = '<div class="text-center text-danger py-3">Error loading classes</div>';
                    reject(error);
                });
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

    // Update table with teachers data
    function updateTable(teachers) {
        console.log('Updating table with teachers:', teachers);
        teacherTableBody.innerHTML = '';

        if (teachers.length === 0) {
            teacherTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No teacher accounts found.</td></tr>';
            visibleCount.textContent = '0';
            if (totalCount) totalCount.textContent = '0';
            rows = [];
            return;
        }

        const frag = document.createDocumentFragment();

        teachers.forEach(teacher => {
            const row = document.createElement('tr');
            row.setAttribute('data-name', teacher.name.toLowerCase());
            row.setAttribute('data-email', teacher.email.toLowerCase());
            const statusValue = teacher.is_approved == 1 ? 'approved' : 'pending';
            row.setAttribute('data-status', statusValue);
            row.setAttribute('data-teacher-id', teacher.id);

            const statusBadge = teacher.is_approved == 1 ? 
                '<span class="badge bg-success">Approved</span>' : 
                '<span class="badge bg-danger">Pending</span>';

            const approveButton = teacher.is_approved == 0 ? 
                `<button type="button" class="btn btn-outline-success approve-btn" data-teacher-id="${teacher.id}" data-teacher-name="${escapeHtml(teacher.name)}" data-teacher-email="${escapeHtml(teacher.email)}">
                    <i class="bi bi-check-lg"></i> Approve
                </button>` : '';

            row.innerHTML = `
                <td class="fw-semibold">${escapeHtml(teacher.name)}</td>
                <td>${escapeHtml(teacher.email)}</td>
                <td class="mobile-hide">
                    ${teacher.classes && teacher.classes.length > 0 ? `
                        <div class="class-badges">
                            ${teacher.classes.map(className => 
                                `<span class="badge bg-info me-1 mb-1">${escapeHtml(className)}</span>`
                            ).join('')}
                        </div>
                    ` : '<span class="text-muted">No classes assigned</span>'}
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
                                data-teacher-approved="${teacher.is_approved}">
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

        teacherTableBody.appendChild(frag);
        visibleCount.textContent = teachers.length;
        if (totalCount) totalCount.textContent = teachers.length;
        rows = teacherTableBody.querySelectorAll('tr[data-name]');
        attachEventListeners();
    }

    // Attach event listeners to dynamic buttons
    function attachEventListeners() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', handleEditClick);
        });
        
        document.querySelectorAll('.approve-btn').forEach(button => {
            button.addEventListener('click', handleApproveClick);
        });
        
        document.querySelectorAll('.remove-btn').forEach(button => {
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

            const matchesSearch = name.includes(searchTerm) || email.includes(searchTerm);
            const matchesStatus = currentStatusFilter === 'all' || status === currentStatusFilter;

            if (matchesSearch && matchesStatus) {
                row.style.display = '';
                visibleRows++;
            } else {
                row.style.display = 'none';
            }
        });

        visibleCount.textContent = visibleRows;
        const hasActiveFilter = currentStatusFilter !== 'all';
        filterBtn.classList.toggle('btn-success', hasActiveFilter);
        filterBtn.classList.toggle('btn-outline-primary', !hasActiveFilter);
    }

    // Search functionality
    searchInput.addEventListener('input', filterTable);
    
    // Refresh functionality
    refreshBtn.addEventListener('click', function() {
        refreshTableData(true);
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

    clearFilterBtn.addEventListener('click', function() {
        currentStatusFilter = 'all';
        statusSelect.value = 'all';
        filterTable();
        filterModal.hide();
    });

    // Edit teacher functionality
    function handleEditClick() {
        console.log('Edit button clicked');

        const teacherId = this.getAttribute('data-teacher-id');
        const teacherName = this.getAttribute('data-teacher-name');
        const teacherEmail = this.getAttribute('data-teacher-email');
        const teacherApproved = this.getAttribute('data-teacher-approved');

        console.log('Teacher data:', { teacherId, teacherName, teacherEmail, teacherApproved });

        // Populate basic form fields
        editTeacherId.value = teacherId;
        editName.value = teacherName;
        editEmail.value = teacherEmail;

        // Set approval status
        const isApproved = teacherApproved === '1';
        editApproved.checked = isApproved;

        // Set multi-select enabled/disabled based on approval
        setMultiSelectEnabled(isApproved);

        // Reset save button
        saveChangesBtn.disabled = true;
        saveChangesBtn.innerHTML = 'Save Changes';

        // Clear existing form data
        originalFormData = {
            name: teacherName,
            email: teacherEmail,
            is_approved: isApproved,
            classes: []
        };

        // Load classes and then fetch teacher's assigned classes
        loadClassesForModal().then(() => {
            // After classes are loaded, fetch teacher's assigned classes
            fetch(`../php/get_teacher_classes.php?teacher_id=${teacherId}&bid=${browserInstanceId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Clear existing selections
                        clearMultiSelectSelections();

                        // Select classes this teacher is assigned to
                        if (data.classes && data.classes.length > 0) {
                            console.log('Selecting classes:', data.classes);
                            data.classes.forEach(classId => {
                                const option = document.querySelector(`.multi-select-option[data-value="${classId}"]`);
                                if (option) {
                                    option.classList.add('selected');
                                }
                            });
                            updateClassSelection();
                            
                            // Update original form data with classes
                            originalFormData.classes = data.classes.sort();
                        }
                        
                        // Update form change detection
                        checkFormChanges();
                    }
                })
                .catch(error => {
                    console.error('Error fetching teacher classes:', error);
                });
        }).catch(error => {
            console.error('Error loading classes:', error);
        });

        // Show the modal
        console.log('Showing edit modal');
        editModal.show();
    }

    // Form change detection
    editName.addEventListener('input', checkFormChanges);
    editEmail.addEventListener('input', checkFormChanges);
    editApproved.addEventListener('change', function() {
        // Enable/disable multi-select based on approval status
        setMultiSelectEnabled(this.checked);
        checkFormChanges();
    });

    // Check form changes
    function checkFormChanges() {
        // Get selected classes
        const selectedClasses = Array.from(document.querySelectorAll('.multi-select-option.selected'))
            .map(option => option.getAttribute('data-value'))
            .sort();

        // Get current form values
        const currentData = {
            name: editName.value.trim(),
            email: editEmail.value.trim(),
            is_approved: editApproved.checked,
            classes: selectedClasses
        };

        // Compare with original data
        const hasChanges = 
            currentData.name !== originalFormData.name ||
            currentData.email !== originalFormData.email ||
            currentData.is_approved !== originalFormData.is_approved ||
            JSON.stringify(currentData.classes) !== JSON.stringify(originalFormData.classes);

        console.log('Form changes check:', {
            currentData,
            originalFormData,
            hasChanges
        });

        saveChangesBtn.disabled = !hasChanges;
    }

    // Save teacher changes
    saveChangesBtn.addEventListener('click', function() {
        console.log('=== SAVE TEACHER DEBUG ===');

        // Validate form
        if (!editName.value.trim() || !editEmail.value.trim()) {
            showToast('Name and email are required', 'error');
            return;
        }

        // Collect selected class IDs
        const selectedClasses = Array.from(document.querySelectorAll('.multi-select-option.selected'))
            .map(option => option.getAttribute('data-value'));

        console.log('Selected classes:', selectedClasses);

        const formData = new FormData();
        formData.append('teacher_id', editTeacherId.value);
        formData.append('name', editName.value.trim());
        formData.append('email', editEmail.value.trim());
        formData.append('is_approved', editApproved.checked ? '1' : '0');
        
        // Add each class individually
        selectedClasses.forEach(classId => {
            formData.append('classes[]', classId);
        });

        console.log('FormData contents:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

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
                saveChangesBtn.disabled = false;
                saveChangesBtn.innerHTML = 'Save Changes';
            }
        })
        .catch(error => {
            console.error('Fetch error details:', error);
            showToast('Error updating teacher', 'error');
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
    
    // When edit modal is hidden, clear selections
    document.getElementById('editModal').addEventListener('hidden.bs.modal', function() {
        // Re-enable multi-select when modal closes (for next time)
        setMultiSelectEnabled(true);
        clearMultiSelectSelections();
        originalFormData = {};
    });

    // When edit modal is hidden, clear selections
    document.getElementById('editModal').addEventListener('hidden.bs.modal', function() {
        clearMultiSelectSelections();
        originalFormData = {};
    });

    // Initialize page
    function initializePage() {
        console.log('Initializing teacher accounts page...');
        refreshTableData(false);
    }

    // Start the page
    initializePage();
    
    console.log('Teacher accounts page initialized - Browser Instance ID:', browserInstanceId);
});