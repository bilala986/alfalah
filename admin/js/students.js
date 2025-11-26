// admin/js/students.js
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
    const studentsTableBody = document.getElementById('studentsTableBody');
    const visibleCount = document.getElementById('visibleCount');
    const totalCount = document.getElementById('totalCount');
    
    // Modal elements
    const removeModal = new bootstrap.Modal(document.getElementById('removeModal'));
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    const filterModal = new bootstrap.Modal(document.getElementById('filterModal'));
    const removeStudentName = document.getElementById('removeStudentName');
    const confirmRemove = document.getElementById('confirmRemove');
    const confirmEdit = document.getElementById('confirmEdit');
    const editStudentForm = document.getElementById('editStudentForm');
    
    // Filter elements
    const programSelect = document.getElementById('programSelect');
    const yearGroupSelect = document.getElementById('yearGroupSelect');
    const teacherSelect = document.getElementById('teacherSelect');
    const minAgeInput = document.getElementById('minAge');
    const maxAgeInput = document.getElementById('maxAge');
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    const clearFilterBtn = document.getElementById('clearFilterBtn');

    // Current filter state
    let currentProgramFilter = 'all';
    let currentYearGroupFilter = 'all';
    let currentTeacherFilter = 'all';
    let currentMinAge = null;
    let currentMaxAge = null;

    // Current action state
    let currentActionStudentId = null;

    // Get all rows
    let rows = studentsTableBody.querySelectorAll('tr[data-student]');

    // Enhanced search function with filtering
    function searchAndFilterStudents(searchTerm) {
        let visibleRows = 0;

        rows.forEach(row => {
            const studentName = row.getAttribute('data-student');
            const program = row.getAttribute('data-program');
            const yearGroup = row.getAttribute('data-year-group');
            const teacher = row.getAttribute('data-teacher');
            const age = parseInt(row.getAttribute('data-age')) || 0;

            // Search matching
            const matchesSearch = searchTerm === '' || 
                studentName.includes(searchTerm) ||
                program.includes(searchTerm) ||
                yearGroup.includes(searchTerm) ||
                teacher.includes(searchTerm);

            // Filter matching
            const programFilter = currentProgramFilter === 'all' || program === currentProgramFilter.toLowerCase();
            const yearGroupFilter = currentYearGroupFilter === 'all' || yearGroup === currentYearGroupFilter.toLowerCase();
            
            let teacherFilter = true;
            if (currentTeacherFilter === 'unassigned') {
                teacherFilter = teacher === 'unassigned';
            } else if (currentTeacherFilter !== 'all') {
                // For specific teacher, we need to check the teacher ID from the data attribute
                const teacherId = row.querySelector('.edit-btn')?.getAttribute('data-teacher-id');
                teacherFilter = teacherId === currentTeacherFilter;
            }

            const ageFilter = (currentMinAge === null || age >= currentMinAge) && 
                             (currentMaxAge === null || age <= currentMaxAge);

            const shouldShow = matchesSearch && programFilter && yearGroupFilter && teacherFilter && ageFilter;
            row.style.display = shouldShow ? '' : 'none';

            if (shouldShow) {
                visibleRows++;
            }
        });

        // Update visible count
        visibleCount.textContent = visibleRows;

        // Update filter button appearance
        const isAnyFilterActive = currentProgramFilter !== 'all' || 
                                 currentYearGroupFilter !== 'all' || 
                                 currentTeacherFilter !== 'all' ||
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

    // Refresh table data
    function refreshTableData(shouldShowToast = false) {
        console.log('Refreshing students data...');
        
        // Show loading state on refresh button
        refreshBtn.classList.add('loading');
        refreshBtn.disabled = true;
        
        fetch(`../php/get_students.php?bid=${browserInstanceId}`)
            .then(response => response.json())
            .then(data => {
                console.log('Received students data from server:', data);
                if (data.success) {
                    updateTable(data.students);
                    if (shouldShowToast) {
                        showToast('Students list refreshed successfully!', 'success');
                    }
                } else {
                    if (shouldShowToast) {
                        showToast('Error refreshing students list', 'error');
                    }
                }
            })
            .catch(error => {
                console.error('Error refreshing students:', error);
                if (shouldShowToast) {
                    showToast('Error refreshing students list', 'error');
                }
            })
            .finally(() => {
                // Remove loading state
                refreshBtn.classList.remove('loading');
                refreshBtn.disabled = false;
            });
    }

    // Update table with new data
    function updateTable(students) {
        console.log('Updating table with students:', students);
        studentsTableBody.innerHTML = '';

        // Update total count element
        if (totalCount) {
            totalCount.textContent = students.length;
        }

        if (students.length === 0) {
            studentsTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No students found.</td></tr>';
            visibleCount.textContent = '0';
            rows = [];
            return;
        }

        // Create document fragment for efficient DOM manipulation
        var frag = document.createDocumentFragment();

        students.forEach(student => {
            const row = document.createElement('tr');
            row.setAttribute('data-student', student.student_first_name.toLowerCase() + ' ' + student.student_last_name.toLowerCase());
            row.setAttribute('data-program', (student.interested_program || '').toLowerCase());
            row.setAttribute('data-year-group', (student.year_group || '').toLowerCase());
            row.setAttribute('data-teacher', (student.teacher_name || 'Unassigned').toLowerCase());
            row.setAttribute('data-age', student.student_age || '0');

            row.innerHTML = `
                <td class="fw-semibold">
                    ${escapeHtml(student.student_first_name + ' ' + student.student_last_name)}
                </td>
                <td>${student.student_age || 'N/A'}</td>
                <td class="mobile-hide">${escapeHtml(student.interested_program || 'N/A')}</td>
                <td class="mobile-hide">
                    ${escapeHtml(student.year_group || 'N/A')}
                    ${student.year_group_other ? '<br><small class="text-muted">(' + escapeHtml(student.year_group_other) + ')</small>' : ''}
                </td>
                <td>
                    ${student.teacher_name ? escapeHtml(student.teacher_name) : '<span class="text-muted">Unassigned</span>'}
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button type="button" 
                                class="btn btn-outline-primary edit-btn" 
                                data-student-id="${student.id}"
                                data-student-name="${escapeHtml(student.student_first_name + ' ' + student.student_last_name)}"
                                data-teacher-id="${student.teacher_id || ''}">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        <button type="button" 
                                class="btn btn-outline-danger remove-btn" 
                                data-student-id="${student.id}"
                                data-student-name="${escapeHtml(student.student_first_name + ' ' + student.student_last_name)}">
                            <i class="bi bi-person-dash"></i> Remove
                        </button>
                    </div>
                </td>
            `;

            frag.append(row);
        });
        
        // Append all rows at once using the document fragment
        document.getElementById('studentsTableBody').append(frag);

        // Reattach event listeners
        attachEventListeners();

        // Update rows reference
        rows = studentsTableBody.querySelectorAll('tr[data-student]');

        // Apply current search and filters
        searchAndFilterStudents(searchInput.value.toLowerCase());
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

    // Edit student
    function handleEditClick() {
        const studentId = this.getAttribute('data-student-id');
        const studentName = this.getAttribute('data-student-name');
        
        currentActionStudentId = studentId;

        // Fetch student details and populate form
        fetch(`../php/get_student_details.php?id=${studentId}&bid=${browserInstanceId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const student = data.student;
                    document.getElementById('editStudentId').value = student.id;
                    document.getElementById('editFirstName').value = student.student_first_name;
                    document.getElementById('editLastName').value = student.student_last_name;
                    document.getElementById('editAge').value = student.student_age || '';
                    document.getElementById('editProgram').value = student.interested_program || '';
                    document.getElementById('editYearGroup').value = student.year_group || '';
                    document.getElementById('editTeacher').value = student.teacher_id || '';
                    
                    editModal.show();
                } else {
                    showToast('Error loading student details', 'error');
                }
            })
            .catch(error => {
                console.error('Error loading student details:', error);
                showToast('Error loading student details', 'error');
            });
    }

    // Remove student
    function handleRemoveClick() {
        const studentId = this.getAttribute('data-student-id');
        const studentName = this.getAttribute('data-student-name');
        
        removeStudentName.textContent = studentName;
        currentActionStudentId = studentId;
        
        removeModal.show();
    }

    // Search functionality
    searchInput.addEventListener('input', function() {
        searchAndFilterStudents(this.value.toLowerCase());
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
        programSelect.value = currentProgramFilter;
        yearGroupSelect.value = currentYearGroupFilter;
        teacherSelect.value = currentTeacherFilter;
        minAgeInput.value = currentMinAge !== null ? currentMinAge : '';
        maxAgeInput.value = currentMaxAge !== null ? currentMaxAge : '';
        filterModal.show();
    });

    applyFilterBtn.addEventListener('click', function() {
        currentProgramFilter = programSelect.value;
        currentYearGroupFilter = yearGroupSelect.value;
        currentTeacherFilter = teacherSelect.value;
        currentMinAge = minAgeInput.value ? parseInt(minAgeInput.value) : null;
        currentMaxAge = maxAgeInput.value ? parseInt(maxAgeInput.value) : null;
        searchAndFilterStudents(searchInput.value.toLowerCase());
        filterModal.hide();
    });

    clearFilterBtn.addEventListener('click', function() {
        currentProgramFilter = 'all';
        currentYearGroupFilter = 'all';
        currentTeacherFilter = 'all';
        currentMinAge = null;
        currentMaxAge = null;

        programSelect.value = 'all';
        yearGroupSelect.value = 'all';
        teacherSelect.value = 'all';
        minAgeInput.value = '';
        maxAgeInput.value = '';

        searchAndFilterStudents(searchInput.value.toLowerCase());
        filterModal.hide();
    });

    // Remove functionality
    confirmRemove.addEventListener('click', function() {
        const button = this;
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Removing...';

        fetch('../php/remove_student.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `student_id=${currentActionStudentId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                removeModal.hide();
                showToast('Student removed successfully!', 'success');
                refreshTableData(false);
            } else {
                showToast('Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Remove error:', error);
            showToast('Error removing student', 'error');
        })
        .finally(() => {
            button.disabled = false;
            button.innerHTML = 'Remove';
            currentActionStudentId = null;
        });
    });

    // Edit functionality
    confirmEdit.addEventListener('click', function() {
        const button = this;
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';

        const formData = new FormData(editStudentForm);
        formData.append('student_id', currentActionStudentId);

        fetch('../php/update_student.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                editModal.hide();
                showToast('Student updated successfully!', 'success');
                refreshTableData(false);
            } else {
                showToast('Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Update error:', error);
            showToast('Error updating student', 'error');
        })
        .finally(() => {
            button.disabled = false;
            button.innerHTML = 'Save Changes';
            currentActionStudentId = null;
        });
    });

    // Attach event listeners
    function attachEventListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', handleEditClick);
        });

        // Remove buttons
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', handleRemoveClick);
        });
    }

    // Initialize
    attachEventListeners();
    
    // Debug: Check if variables are properly set
    console.log('Students page initialized - Browser Instance ID:', browserInstanceId);
});