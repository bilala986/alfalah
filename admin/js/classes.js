// admin/js/classes.js
document.addEventListener('DOMContentLoaded', function() {
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
    const classesTableBody = document.getElementById('classesTableBody');
    const visibleCount = document.getElementById('visibleCount');
    const totalCount = document.getElementById('totalCount');
    
    // Modal elements
    const filterModal = new bootstrap.Modal(document.getElementById('filterModal'));
    const yearGroupFilter = document.getElementById('yearGroupFilter');
    const teacherFilter = document.getElementById('teacherFilter');
    const programFilter = document.getElementById('programFilter');
    const minStudents = document.getElementById('minStudents');
    const maxStudents = document.getElementById('maxStudents');
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    
    // Add class modal elements
    const addClassBtn = document.getElementById('addClassBtn');
    const addClassModal = new bootstrap.Modal(document.getElementById('addClassModal'));
    const addClassForm = document.getElementById('addClassForm');
    const autoClassName = document.getElementById('autoClassName');
    const classNameInput = document.getElementById('className');
    const classProgram = document.getElementById('classProgram');
    const classYearGroup = document.getElementById('classYearGroup');
    const classGender = document.getElementById('classGender');
    const classTeacher = document.getElementById('classTeacher');
    const confirmAddClass = document.getElementById('confirmAddClass');

    // Edit class modal elements
    const editClassModal = new bootstrap.Modal(document.getElementById('editClassModal'));
    const editClassForm = document.getElementById('editClassForm');
    const currentClassName = document.getElementById('currentClassName');
    const newAutoClassName = document.getElementById('newAutoClassName');
    const editClassName = document.getElementById('editClassName');
    const editClassProgram = document.getElementById('editClassProgram');
    const editClassYearGroup = document.getElementById('editClassYearGroup');
    const editClassGender = document.getElementById('editClassGender');
    const editClassTeacher = document.getElementById('editClassTeacher');
    const editClassId = document.getElementById('editClassId');
    const confirmEditClass = document.getElementById('confirmEditClass');

    // Current filter state
    let currentYearGroupFilter = 'all';
    let currentTeacherFilter = 'all';
    let currentProgramFilter = 'all';
    let currentMinStudents = null;
    let currentMaxStudents = null;

    // Get all rows
    let rows = classesTableBody.querySelectorAll('.class-row');

    // Helper function to get student count from a row
    function getStudentCountFromRow(row) {
        const studentBadge = row.querySelector('.badge-students');
        if (studentBadge) {
            const text = studentBadge.textContent;
            const match = text.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
        }
        return 0;
    }

    // Enhanced search function with filtering
    function searchAndFilterClasses(searchTerm) {
        let visibleRows = 0;

        rows.forEach(row => {
            const className = row.getAttribute('data-class-name');
            const program = row.getAttribute('data-program');
            const yearGroup = row.getAttribute('data-year-group');
            const teacher = row.getAttribute('data-teacher');
            const students = row.getAttribute('data-students');
            const studentCount = getStudentCountFromRow(row);

            // Search matching
            const matchesSearch = searchTerm === '' || 
                className.includes(searchTerm) ||
                program.includes(searchTerm) ||
                yearGroup.includes(searchTerm) ||
                teacher.includes(searchTerm) ||
                students.includes(searchTerm);

            // Filter matching
            const yearGroupFilter = currentYearGroupFilter === 'all' || 
                                  yearGroup === currentYearGroupFilter.toLowerCase();
            
            let teacherFilterMatch = true;
            if (currentTeacherFilter === 'unassigned') {
                teacherFilterMatch = teacher === 'unassigned';
            } else if (currentTeacherFilter !== 'all') {
                // For specific teacher, check teacher name
                const teacherCell = row.cells[3];
                if (teacherCell) {
                    const teacherText = teacherCell.textContent.toLowerCase().trim();
                    teacherFilterMatch = teacherText.includes(currentTeacherFilter.toLowerCase());
                }
            }

            const programFilterMatch = currentProgramFilter === 'all' || 
                                program === currentProgramFilter.toLowerCase();

            const studentFilter = (currentMinStudents === null || studentCount >= currentMinStudents) && 
                                 (currentMaxStudents === null || studentCount <= currentMaxStudents);

            const shouldShow = matchesSearch && yearGroupFilter && teacherFilterMatch && programFilterMatch && studentFilter;
            row.style.display = shouldShow ? '' : 'none';

            if (shouldShow) {
                visibleRows++;
            }
        });

        // Update visible count
        visibleCount.textContent = visibleRows;

        // Update filter button appearance
        const isAnyFilterActive = currentYearGroupFilter !== 'all' || 
                                 currentTeacherFilter !== 'all' || 
                                 currentProgramFilter !== 'all' ||
                                 currentMinStudents !== null || 
                                 currentMaxStudents !== null;

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
        console.log('Refreshing classes data...');
        
        // Show loading state
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Refreshing...';
        
        // Add cache buster to prevent caching
        const timestamp = new Date().getTime();
        fetch(`../php/get_classes.php?bid=${browserInstanceId}&_=${timestamp}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateTable(data.classes);
                    if (shouldShowToast) {
                        showToast('Classes list refreshed successfully!', 'success');
                    }
                } else {
                    if (shouldShowToast) {
                        showToast('Error refreshing classes list', 'error');
                    }
                }
            })
            .catch(error => {
                console.error('Error refreshing classes:', error);
                if (shouldShowToast) {
                    showToast('Error refreshing classes list', 'error');
                }
            })
            .finally(() => {
                // Remove loading state
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Refresh';
            });
    }

    // Function to generate class name for add modal
    function generateAddClassName() {
        const yearGroup = classYearGroup.value;
        const gender = classGender.value;
        const program = classProgram.value;

        if (yearGroup && gender && program) {
            const className = `${yearGroup}, ${gender}, ${program}`;
            autoClassName.value = className;
            classNameInput.value = className;
        } else {
            autoClassName.value = '';
            classNameInput.value = '';
        }
    }

    // Function to generate class name for edit modal
    function generateEditClassName() {
        const yearGroup = editClassYearGroup.value;
        const gender = editClassGender.value;
        const program = editClassProgram.value;

        if (yearGroup && gender && program) {
            const className = `${yearGroup}, ${gender}, ${program}`;
            newAutoClassName.value = className;
            editClassName.value = className;
        } else {
            newAutoClassName.value = '';
            editClassName.value = '';
        }
    }

    // Update table with new data
    function updateTable(classes) {
        console.log('Updating table with classes:', classes);
        classesTableBody.innerHTML = '';

        // Update total count element
        if (totalCount) {
            totalCount.textContent = classes.length;
        }

        if (classes.length === 0) {
            classesTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No classes found.</td></tr>';
            visibleCount.textContent = '0';
            rows = [];
            return;
        }

        const frag = document.createDocumentFragment();

        classes.forEach(cls => {
            const row = document.createElement('tr');
            row.className = 'class-row';
            row.setAttribute('data-class-id', cls.class_id);
            row.setAttribute('data-class-name', (cls.class_name || '').toLowerCase());
            row.setAttribute('data-program', (cls.program || '').toLowerCase());
            row.setAttribute('data-year-group', (cls.year_group || '').toLowerCase());
            row.setAttribute('data-gender', (cls.gender || 'Mixed').toLowerCase());
            row.setAttribute('data-teacher', (cls.teacher_name || 'Unassigned').toLowerCase());
            row.setAttribute('data-teacher-id', cls.teacher_id || '');
            row.setAttribute('data-students', (cls.student_names || '').toLowerCase());

            // Format student list
            let studentListHTML = '';
            if (cls.student_names && cls.student_names.trim() !== '') {
                const student_names = cls.student_names.split(', ');
                studentListHTML = `
                    <div class="student-list">
                        ${student_names.map(student => 
                            `<div class="student-list-item">${escapeHtml(student)}</div>`
                        ).join('')}
                    </div>
                `;
            } else {
                studentListHTML = '<span class="text-muted">No students</span>';
            }

            row.innerHTML = `
                <td class="fw-semibold">
                    <span class="badge badge-class me-2">${escapeHtml(cls.class_name || 'Unnamed Class')}</span>
                </td>
                <td class="mobile-hide">${escapeHtml(cls.program || 'N/A')}</td>
                <td>
                    <span class="badge badge-year">${escapeHtml(cls.year_group || 'N/A')}</span>
                </td>
                <td>
                    ${cls.teacher_name ? escapeHtml(cls.teacher_name) : '<span class="text-muted">Unassigned</span>'}
                </td>
                <td>
                    <span class="badge badge-students">
                        <i class="bi bi-people"></i> ${cls.student_count || 0} students
                    </span>
                </td>
                <td class="mobile-hide">
                    ${studentListHTML}
                </td>
                <td class="actions-column">
                    <div class="btn-group btn-group-sm">
                        <button type="button" 
                                class="btn btn-outline-primary edit-class-btn"
                                data-class-id="${cls.class_id}"
                                data-class-name="${escapeHtml(cls.class_name)}"
                                data-year-group="${escapeHtml(cls.year_group)}"
                                data-program="${escapeHtml(cls.program || '')}"
                                data-gender="${escapeHtml(cls.gender || 'Mixed')}"
                                data-teacher-id="${cls.teacher_id || ''}">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                    </div>
                </td>
            `;

            frag.appendChild(row);
        });

        classesTableBody.appendChild(frag);
        
        // Update rows reference
        rows = classesTableBody.querySelectorAll('.class-row');

        // Apply current search and filters
        searchAndFilterClasses(searchInput.value.toLowerCase());

        // No need to attach event listeners here - using event delegation instead
    }

    // FIX 1: Use event delegation for edit buttons (works after F5 refresh)
    classesTableBody.addEventListener('click', function(event) {
        // Check if the clicked element is an edit button or inside an edit button
        const editButton = event.target.closest('.edit-class-btn');
        
        if (editButton) {
            event.preventDefault();
            event.stopPropagation();
            
            console.log('Edit button clicked via event delegation');
            
            // Get the data from the button's attributes
            const classId = editButton.getAttribute('data-class-id');
            const className = editButton.getAttribute('data-class-name');
            const yearGroup = editButton.getAttribute('data-year-group');
            const program = editButton.getAttribute('data-program');
            const gender = editButton.getAttribute('data-gender');
            const teacherId = editButton.getAttribute('data-teacher-id');
            
            console.log('Editing class data:', { 
                classId, 
                className, 
                yearGroup, 
                program, 
                gender,  // DEBUG: Check what value is coming through
                teacherId 
            });
            
            // Populate the edit form
            editClassId.value = classId;
            currentClassName.value = className;
            editClassYearGroup.value = yearGroup;
            editClassProgram.value = program;
            
            // FIX 2: Set the gender correctly (case-sensitive match)
            if (gender) {
                // Convert to proper case for the select option
                const genderValue = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
                editClassGender.value = genderValue;
                console.log('Setting gender to:', genderValue);
            } else {
                editClassGender.value = 'Mixed';
                console.log('Gender not found, defaulting to Mixed');
            }
            
            editClassTeacher.value = teacherId || '';
            
            // Generate the new class name
            generateEditClassName();
            
            // Show the modal
            editClassModal.show();
        }
    });

    // Search functionality
    searchInput.addEventListener('input', function() {
        searchAndFilterClasses(this.value.toLowerCase());
    });
    
    // Refresh functionality
    refreshBtn.addEventListener('click', function() {
        refreshTableData(true);
    });

    // Filter modal functionality
    filterBtn.addEventListener('click', function() {
        yearGroupFilter.value = currentYearGroupFilter;
        teacherFilter.value = currentTeacherFilter;
        programFilter.value = currentProgramFilter;
        minStudents.value = currentMinStudents !== null ? currentMinStudents : '';
        maxStudents.value = currentMaxStudents !== null ? currentMaxStudents : '';
        filterModal.show();
    });

    applyFilterBtn.addEventListener('click', function() {
        currentYearGroupFilter = yearGroupFilter.value;
        currentTeacherFilter = teacherFilter.value;
        currentProgramFilter = programFilter.value;
        currentMinStudents = minStudents.value ? parseInt(minStudents.value) : null;
        currentMaxStudents = maxStudents.value ? parseInt(maxStudents.value) : null;
        searchAndFilterClasses(searchInput.value.toLowerCase());
        filterModal.hide();
    });

    clearFilterBtn.addEventListener('click', function() {
        currentYearGroupFilter = 'all';
        currentTeacherFilter = 'all';
        currentProgramFilter = 'all';
        currentMinStudents = null;
        currentMaxStudents = null;

        yearGroupFilter.value = 'all';
        teacherFilter.value = 'all';
        programFilter.value = 'all';
        minStudents.value = '';
        maxStudents.value = '';

        searchAndFilterClasses(searchInput.value.toLowerCase());
        filterModal.hide();
    });
    
    // Event listeners for add class name generation
    classProgram.addEventListener('change', generateAddClassName);
    classYearGroup.addEventListener('change', generateAddClassName);
    classGender.addEventListener('change', generateAddClassName);

    // Event listeners for edit class name generation
    editClassProgram.addEventListener('change', generateEditClassName);
    editClassYearGroup.addEventListener('change', generateEditClassName);
    editClassGender.addEventListener('change', generateEditClassName);

    // Add Class button functionality
    addClassBtn.addEventListener('click', function() {
        // Reset form
        addClassForm.reset();
        autoClassName.value = '';
        classNameInput.value = '';
        addClassModal.show();
    });

    // Confirm add class
    confirmAddClass.addEventListener('click', function() {
        const button = this;
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating...';

        const formData = new FormData(addClassForm);

        fetch('../php/add_class.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                addClassModal.hide();
                showToast('Class created successfully!', 'success');
                refreshTableData(false);
            } else {
                showToast('Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Create class error:', error);
            showToast('Error creating class', 'error');
        })
        .finally(() => {
            button.disabled = false;
            button.innerHTML = 'Create Class';
        });
    });
    
    // Confirm edit class
    confirmEditClass.addEventListener('click', function() {
        const button = this;
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Updating...';

        const formData = new FormData(editClassForm);

        fetch('../php/update_class_details.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                editClassModal.hide();
                showToast('Class updated successfully!', 'success');
                refreshTableData(false);
            } else {
                showToast('Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Update class error:', error);
            showToast('Error updating class', 'error');
        })
        .finally(() => {
            button.disabled = false;
            button.innerHTML = 'Update Class';
        });
    });

    // Initialize
    searchAndFilterClasses('');
    
    // Debug: Check if variables are properly set
    console.log('Classes page initialized - Browser Instance ID:', browserInstanceId);
});