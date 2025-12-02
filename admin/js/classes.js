// admin/js/classes.js
document.addEventListener('DOMContentLoaded', function() {
    // Helper function to escape HTML - MOVED TO TOP
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
    
    // Add these elements to the top of your classes.js
    const addClassBtn = document.getElementById('addClassBtn');
    const addClassModal = new bootstrap.Modal(document.getElementById('addClassModal'));
    const addClassForm = document.getElementById('addClassForm');
    const autoClassName = document.getElementById('autoClassName');
    const classNameInput = document.getElementById('className');
    const classProgram = document.getElementById('classProgram');
    const classYearGroup = document.getElementById('classYearGroup');
    const classGender = document.getElementById('classGender');
    const confirmAddClass = document.getElementById('confirmAddClass');


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
            
            let teacherFilter = true;
            if (currentTeacherFilter === 'unassigned') {
                teacherFilter = teacher === 'unassigned';
            } else if (currentTeacherFilter !== 'all') {
                // For specific teacher, check teacher name
                const teacherCell = row.cells[3];
                if (teacherCell) {
                    const teacherText = teacherCell.textContent.toLowerCase().trim();
                    teacherFilter = teacherText.includes(currentTeacherFilter.toLowerCase());
                }
            }

            const programFilter = currentProgramFilter === 'all' || 
                                program === currentProgramFilter.toLowerCase();

            const studentFilter = (currentMinStudents === null || studentCount >= currentMinStudents) && 
                                 (currentMaxStudents === null || studentCount <= currentMaxStudents);

            const shouldShow = matchesSearch && yearGroupFilter && teacherFilter && programFilter && studentFilter;
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

    // Update table with new data
    function updateTable(classes) {
        console.log('Updating table with classes:', classes);
        classesTableBody.innerHTML = '';

        // Update total count element
        if (totalCount) {
            totalCount.textContent = classes.length;
        }

        if (classes.length === 0) {
            classesTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No classes found.</td></tr>';
            visibleCount.textContent = '0';
            rows = [];
            return;
        }

        // Create document fragment for efficient DOM manipulation
        var frag = document.createDocumentFragment();

        classes.forEach(cls => {
            const row = document.createElement('tr');
            row.className = 'class-row';
            row.setAttribute('data-class-id', cls.class_id); // ADD THIS LINE
            row.setAttribute('data-class-name', (cls.class_name || '').toLowerCase());
            row.setAttribute('data-program', (cls.program || '').toLowerCase());
            row.setAttribute('data-year-group', (cls.year_group || '').toLowerCase());
            row.setAttribute('data-teacher', (cls.teacher_name || 'Unassigned').toLowerCase());
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
                    <div class="mt-2">
                        <button type="button" class="btn btn-sm btn-outline-primary edit-class-btn">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                    </div>
                </td>
            `;

            frag.append(row);
        });

        // Append all rows at once using the document fragment
        classesTableBody.append(frag);

        // Update rows reference
        rows = classesTableBody.querySelectorAll('.class-row');

        // Apply current search and filters
        searchAndFilterClasses(searchInput.value.toLowerCase());

        // ADD THIS LINE: Initialize class assignment functionality
        addClassAssignmentFunctionality();
    }

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
    
    // Function to generate class name
    function generateClassName() {
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

    // Event listeners for class name generation
    classProgram.addEventListener('change', generateClassName);
    classYearGroup.addEventListener('change', generateClassName);
    classGender.addEventListener('change', generateClassName);

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
    
    // Add this function to classes.js
    function addClassAssignmentFunctionality() {
        // Add edit button functionality to all edit buttons
        document.querySelectorAll('.edit-class-btn').forEach(button => {
            // Remove existing listeners to prevent duplicates
            button.removeEventListener('click', handleEditClassClick);
            button.addEventListener('click', handleEditClassClick);
        });
    }

    function handleEditClassClick() {
        const row = this.closest('tr.class-row');
        if (!row) return;

        const classId = row.getAttribute('data-class-id');
        const className = row.querySelector('.badge-class').textContent;
        const yearGroup = row.querySelector('.badge-year').textContent;
        const program = row.cells[1].textContent;
        const teacherCell = row.cells[3];
        const currentTeacher = teacherCell.textContent.trim();

        console.log('Edit class clicked:', { classId, className, yearGroup, program, currentTeacher });

        // TODO: Implement a proper edit modal
        // For now, show a basic prompt
        const newTeacher = prompt(`Edit Class: ${className}\nYear Group: ${yearGroup}\nProgram: ${program}\n\nEnter new teacher name (leave blank to unassign):`, currentTeacher);

        if (newTeacher !== null) {
            updateClassTeacher(classId, newTeacher);
        }
    }

    function updateClassTeacher(classId, teacherName) {
        // This is a placeholder - you need to implement this properly
        console.log(`Updating class ${classId} with teacher: ${teacherName}`);

        // You'll need to:
        // 1. Create an edit class modal (similar to add class modal)
        // 2. Make an API call to update_class.php
        // 3. Refresh the table after successful update
        alert('Edit class functionality not fully implemented yet. Need to create edit modal.');
    }

    function openEditClassModal(row) {
        const classId = row.getAttribute('data-class-id') || row.cells[0].querySelector('.badge-class').textContent;
        const className = row.cells[0].querySelector('.badge-class').textContent;
        const yearGroup = row.cells[2].querySelector('.badge-year').textContent;
        const teacherCell = row.cells[3];
        const currentTeacher = teacherCell.textContent.trim();
        const currentTeacherId = teacherCell.querySelector('select')?.value || '';

        // You'll need to create an edit modal similar to the add modal
        // This is a simplified version - you should create a proper modal

        console.log('Edit class:', { classId, className, yearGroup, currentTeacher });

        // For now, show an alert - you should implement a proper modal
        alert(`Edit Class: ${className}\nYear Group: ${yearGroup}\nCurrent Teacher: ${currentTeacher}`);
    }

    // Initialize
    searchAndFilterClasses('');
    
    // Debug: Check if variables are properly set
    console.log('Classes page initialized - Browser Instance ID:', browserInstanceId);
});