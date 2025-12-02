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
            // Add class data attribute
            const classCell = row.cells[5]; // Class column is index 5
            const className = classCell ? classCell.textContent.toLowerCase() : '';

            // Search matching - ADD CLASS TO SEARCH
            const matchesSearch = searchTerm === '' || 
                studentName.includes(searchTerm) ||
                program.includes(searchTerm) ||
                yearGroup.includes(searchTerm) ||
                teacher.includes(searchTerm) ||
                className.includes(searchTerm);

            // ... rest of your filter logic stays the same
            const programFilter = currentProgramFilter === 'all' || program === currentProgramFilter.toLowerCase();
            const yearGroupFilter = currentYearGroupFilter === 'all' || yearGroup === currentYearGroupFilter.toLowerCase();

            let teacherFilter = true;
            if (currentTeacherFilter === 'unassigned') {
                teacherFilter = teacher === 'unassigned';
            } else if (currentTeacherFilter !== 'all') {
                const teacherId = row.querySelector('.edit-btn')?.getAttribute('data-teacher-id');
                teacherFilter = teacherId === currentTeacherFilter;
            }

            const ageFilter = (currentMinAge === null || age >= currentMinAge) && 
                             (currentMaxAge === null || age <= currentMaxAge);

            const shouldShow = matchesSearch && programFilter && yearGroupFilter && teacherFilter && ageFilter;
            row.style.display = shouldShow ? '' : 'none';

            if (shouldShow) {
                visibleRows++;

                // Hide details row
                const detailsRow = row.nextElementSibling;
                if (detailsRow && detailsRow.classList.contains('student-details-row')) {
                    detailsRow.style.display = 'none';
                    const detailsDiv = detailsRow.querySelector('.student-details');
                    if (detailsDiv) {
                        detailsDiv.classList.remove('show');
                    }
                }
            } else {
                // Also hide the details row
                const detailsRow = row.nextElementSibling;
                if (detailsRow && detailsRow.classList.contains('student-details-row')) {
                    detailsRow.style.display = 'none';
                    const detailsDiv = detailsRow.querySelector('.student-details');
                    if (detailsDiv) {
                        detailsDiv.classList.remove('show');
                    }
                }
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
            // Fix colspan to 7
            studentsTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No students found.</td></tr>';
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
            row.setAttribute('data-student-id', student.id);

            // Get class name for this student
            const className = student.class_name || 'Unassigned';
            const classBadge = student.class_name ? 
                `<span class="badge bg-info">${escapeHtml(student.class_name)}</span>` : 
                '<span class="text-muted">Unassigned</span>';

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
                <td> <!-- ADDED CLASS COLUMN -->
                    ${classBadge}
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button type="button" 
                                class="btn btn-outline-primary view-btn" 
                                data-student-id="${student.id}">
                            <i class="bi bi-eye"></i> View
                        </button>
                        <button type="button" 
                                class="btn btn-outline-primary edit-btn" 
                                data-student-id="${student.id}"
                                data-student-name="${escapeHtml(student.student_first_name + ' ' + student.student_last_name)}"
                                data-teacher-id="${student.teacher_id || ''}"
                                data-class-id="${student.class_id || ''}"> <!-- Added class_id -->
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

            // Create details row
            const detailsRow = document.createElement('tr');
            detailsRow.className = 'student-details-row';
            detailsRow.style.display = 'none';
            detailsRow.innerHTML = `
                <td colspan="7"> <!-- Fix colspan to 7 -->
                    <div class="student-details" id="details-${student.id}">
                        <div class="text-center text-muted py-3">
                            <i class="bi bi-hourglass-split"></i> Click "View" to load details
                        </div>
                    </div>
                </td>
            `;
            frag.append(detailsRow);
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

    // View student details - EXACT SAME FUNCTIONALITY AS APPLICATIONS PAGE
    function handleViewClick() {
        const studentId = this.getAttribute('data-student-id');
        const detailsRow = this.closest('tr').nextElementSibling;
        const detailsDiv = document.getElementById(`details-${studentId}`);
        const isOpening = detailsRow.style.display === 'none';

        // Close all other open details first
        document.querySelectorAll('.student-details-row').forEach(row => {
            if (row !== detailsRow) {
                const otherDiv = row.querySelector('.student-details');
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
            // Load details content dynamically
            loadStudentDetails(studentId, detailsDiv);

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

    // Function to load student details - EXACT SAME AS APPLICATIONS
    function loadStudentDetails(studentId, detailsDiv) {
        // Show loading state
        detailsDiv.innerHTML = '<div class="text-center text-muted py-3"><i class="bi bi-hourglass-split"></i> Loading details...</div>';

        fetch(`../php/get_student_full_details.php?id=${studentId}&bid=${browserInstanceId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    detailsDiv.innerHTML = generateDetailsHTML(data.student);
                } else {
                    detailsDiv.innerHTML = '<div class="text-center text-danger py-3"><i class="bi bi-exclamation-triangle"></i> Error loading details</div>';
                }
            })
            .catch(error => {
                console.error('Error loading student details:', error);
                detailsDiv.innerHTML = '<div class="text-center text-danger py-3"><i class="bi bi-exclamation-triangle"></i> Error loading details</div>';
            });
    }

    // Function to generate detailed HTML from student data - EXACT SAME DESIGN AS APPLICATIONS
    function generateDetailsHTML(student) {
        // Helper function to check if medical info should be shown
        const hasMedicalInfo = (student.illness === 'Yes' && student.illness_details) || 
                              (student.special_needs === 'Yes' && student.special_needs_details) || 
                              (student.allergies === 'Yes' && student.allergies_details);

        return `
            <!-- Student & Program Header -->
            <div class="detail-section">
                <div class="row compact-layout">
                    <div class="col-md-8">
                        <h5 class="detail-label">
                            <i class="bi bi-person-badge"></i>
                            Student Information - ${escapeHtml(student.student_first_name + ' ' + student.student_last_name)}
                        </h5>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <strong>Full Name</strong>
                                <span>${escapeHtml(student.student_first_name + ' ' + student.student_last_name)}</span>
                            </div>
                            <div class="detail-item">
                                <strong>Age</strong>
                                <span>${student.student_age || 'N/A'}</span>
                            </div>
                            <div class="detail-item">
                                <strong>Gender</strong>
                                <span>${escapeHtml(student.student_gender || 'N/A')}</span>
                            </div>
                            <div class="detail-item">
                                <strong>Date of Birth</strong>
                                <span>${student.student_dob ? escapeHtml(student.student_dob) : 'N/A'}</span>
                            </div>
                            <div class="detail-item">
                                <strong>Current School</strong>
                                <span>${escapeHtml(student.student_school || 'N/A')}</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="parent-card">
                            <h6><i class="bi bi-info-circle"></i> Program Details</h6>
                            <div class="contact-info">
                                <div class="contact-item">
                                    <i class="bi bi-book"></i>
                                    <span><strong>Program:</strong> ${escapeHtml(student.interested_program || 'N/A')}</span>
                                </div>
                                <div class="contact-item">
                                    <i class="bi bi-mortarboard"></i>
                                    <span><strong>Year Group:</strong> ${escapeHtml(student.year_group || 'N/A')}</span>
                                </div>
                                ${student.year_group_other ? `
                                <div class="contact-item">
                                    <i class="bi bi-pencil"></i>
                                    <span><strong>Other:</strong> ${escapeHtml(student.year_group_other)}</span>
                                </div>
                                ` : ''}
                                ${student.teacher_name ? `
                                <div class="contact-item">
                                    <i class="bi bi-person-badge"></i>
                                    <span><strong>Assigned Teacher:</strong> ${escapeHtml(student.teacher_name)}</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Parent Information -->
            <div class="detail-section">
                <h6 class="detail-label"><i class="bi bi-people"></i> Parent/Guardian Information</h6>
                <div class="row">
                    <div class="col-md-6">
                        <div class="parent-card">
                            <h6><i class="bi bi-person-check"></i> Primary Parent</h6>
                            <div class="contact-info">
                                <div class="contact-item">
                                    <i class="bi bi-person"></i>
                                    <span>${escapeHtml(student.parent1_first_name + ' ' + student.parent1_last_name)}</span>
                                </div>
                                <div class="contact-item">
                                    <i class="bi bi-diagram-3"></i>
                                    <span>${escapeHtml(student.parent1_relationship || 'N/A')}</span>
                                    ${student.parent1_relationship_other ? `
                                    <br><small class="text-muted">(${escapeHtml(student.parent1_relationship_other)})</small>
                                    ` : ''}
                                </div>
                                <div class="contact-item">
                                    <i class="bi bi-phone"></i>
                                    <span>${escapeHtml(student.parent1_mobile || 'N/A')}</span>
                                </div>
                                <div class="contact-item">
                                    <i class="bi bi-envelope"></i>
                                    <span>${escapeHtml(student.parent1_email || 'N/A')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    ${student.parent2_first_name ? `
                    <div class="col-md-6">
                        <div class="parent-card">
                            <h6><i class="bi bi-person-plus"></i> Additional Parent</h6>
                            <div class="contact-info">
                                <div class="contact-item">
                                    <i class="bi bi-person"></i>
                                    <span>${escapeHtml(student.parent2_first_name + ' ' + student.parent2_last_name)}</span>
                                </div>
                                <div class="contact-item">
                                    <i class="bi bi-diagram-3"></i>
                                    <span>${escapeHtml(student.parent2_relationship || 'N/A')}</span>
                                    ${student.parent2_relationship_other ? `
                                    <br><small class="text-muted">(${escapeHtml(student.parent2_relationship_other)})</small>
                                    ` : ''}
                                </div>
                                ${student.parent2_mobile ? `
                                <div class="contact-item">
                                    <i class="bi bi-phone"></i>
                                    <span>${escapeHtml(student.parent2_mobile)}</span>
                                </div>
                                ` : ''}
                                ${student.parent2_email ? `
                                <div class="contact-item">
                                    <i class="bi bi-envelope"></i>
                                    <span>${escapeHtml(student.parent2_email)}</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>
                <div class="mt-3">
                    <div class="parent-card emergency-contact-card">
                        <h6><i class="bi bi-exclamation-triangle"></i> Emergency Contact</h6>
                        <div class="contact-item">
                            <i class="bi bi-telephone-forward"></i>
                            <span class="fw-bold">${escapeHtml(student.emergency_contact || 'N/A')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Address -->
            <div class="detail-section">
                <h6 class="detail-label"><i class="bi bi-geo-alt"></i> Address</h6>
                <div class="parent-card">
                    <div class="contact-info">
                        <div class="contact-item">
                            <i class="bi bi-house"></i>
                            <span>${escapeHtml(student.address || 'N/A')}</span>
                        </div>
                        <div class="contact-item">
                            <i class="bi bi-building"></i>
                            <span>${escapeHtml(student.city || 'N/A')}${student.county ? ', ' + escapeHtml(student.county) : ''}</span>
                        </div>
                        <div class="contact-item">
                            <i class="bi bi-mailbox"></i>
                            <span>${escapeHtml(student.postal_code || 'N/A')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Medical & Additional Info -->
            ${hasMedicalInfo ? `
            <div class="detail-section">
                <h6 class="detail-label"><i class="bi bi-heart-pulse"></i> Health Information</h6>
                <div class="row">
                    ${student.illness === 'Yes' && student.illness_details ? `
                    <div class="col-md-4">
                        <div class="parent-card medical-info">
                            <h6><i class="bi bi-heart-pulse"></i> Medical Conditions</h6>
                            <p class="mb-0 small">${escapeHtml(student.illness_details)}</p>
                        </div>
                    </div>
                    ` : ''}

                    ${student.special_needs === 'Yes' && student.special_needs_details ? `
                    <div class="col-md-4">
                        <div class="parent-card special-needs-info">
                            <h6><i class="bi bi-person-badge"></i> Special Needs</h6>
                            <p class="mb-0 small">${escapeHtml(student.special_needs_details)}</p>
                        </div>
                    </div>
                    ` : ''}

                    ${student.allergies === 'Yes' && student.allergies_details ? `
                    <div class="col-md-4">
                        <div class="parent-card allergy-info">
                            <h6><i class="bi bi-exclamation-triangle"></i> Allergies</h6>
                            <p class="mb-0 small">${escapeHtml(student.allergies_details)}</p>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}

            <!-- Permissions -->
            <div class="detail-section">
                <h6 class="detail-label"><i class="bi bi-shield-check"></i> Permissions & Information</h6>
                <div class="permissions-grid">
                    <div class="permission-item">
                        <i class="bi bi-water"></i>
                        <span>Swimming: ${escapeHtml(student.knows_swimming || 'N/A')}</span>
                    </div>
                    <div class="permission-item">
                        <i class="bi bi-car-front"></i>
                        <span>Travel Sickness: ${escapeHtml(student.travel_sickness || 'N/A')}</span>
                    </div>
                    <div class="permission-item">
                        <i class="bi bi-geo-alt"></i>
                        <span>Travel Permission: ${escapeHtml(student.travel_permission || 'N/A')}</span>
                    </div>
                    <div class="permission-item">
                        <i class="bi bi-camera"></i>
                        <span>Photo Permission: ${escapeHtml(student.photo_permission || 'N/A')}</span>
                    </div>
                    <div class="permission-item">
                        <i class="bi bi-bus-front"></i>
                        <span>Transport: ${escapeHtml(student.transport_mode || 'N/A')}</span>
                    </div>
                    <div class="permission-item">
                        <i class="bi bi-house-door"></i>
                        <span>Home Alone: ${escapeHtml(student.go_home_alone || 'N/A')}</span>
                    </div>
                </div>
            </div>

            <!-- Islamic Education -->
            ${student.attended_islamic_education === 'Yes' ? `
            <div class="detail-section">
                <h6 class="detail-label"><i class="bi bi-book-half"></i> Islamic Education History</h6>
                <div class="parent-card">
                    <div class="contact-info">
                        ${student.islamic_years ? `
                        <div class="contact-item">
                            <i class="bi bi-calendar"></i>
                            <span><strong>Years Attended:</strong> ${escapeHtml(student.islamic_years)}</span>
                        </div>
                        ` : ''}
                        ${student.islamic_education_details ? `
                        <div class="contact-item">
                            <i class="bi bi-journal-text"></i>
                            <span><strong>Details:</strong> ${escapeHtml(student.islamic_education_details)}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- Submission Date -->
            <div class="text-center mt-3">
                <small class="text-muted">Application submitted on: ${student.submitted_at ? new Date(student.submitted_at).toLocaleString() : 'N/A'}</small>
            </div>
        `;
    }
        
    function handleUrlSearchParam() {
        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('search');
        const viewStudent = urlParams.get('view_student');

        if (searchParam && searchInput) {
            searchInput.value = searchParam;
            searchAndFilterStudents(searchParam.toLowerCase());

            // If we're viewing a specific student, scroll to them after a brief delay
            if (viewStudent) {
                setTimeout(() => {
                    const studentRow = document.querySelector(`tr[data-student-id="${viewStudent}"]`);
                    if (studentRow) {
                        studentRow.scrollIntoView({ behavior: 'smooth', block: 'center' });

                        // Add highlight effect
                        studentRow.style.backgroundColor = '#e7f1ff';
                        setTimeout(() => {
                            studentRow.style.backgroundColor = '';
                        }, 2000);
                    }
                }, 500);
            }
        }
    }

    // Edit student
    function handleEditClick() {
        const studentId = this.getAttribute('data-student-id');
        const studentName = this.getAttribute('data-student-name');

        console.log('Edit clicked - Student ID:', studentId, 'Student Name:', studentName);

        currentActionStudentId = studentId;

        // First, fetch student details
        fetch(`../php/get_student_details.php?id=${studentId}&bid=${browserInstanceId}`)
            .then(response => response.json())
            .then(studentData => {
                console.log('Student data response:', studentData);

                if (studentData.success) {
                    const student = studentData.student;
                    console.log('Student details:', student);

                    // Populate the form with student data
                    document.getElementById('editStudentId').value = student.id;
                    document.getElementById('editFirstName').value = student.student_first_name;
                    document.getElementById('editLastName').value = student.student_last_name;
                    document.getElementById('editAge').value = student.student_age || '';
                    document.getElementById('editProgram').value = student.interested_program || '';
                    document.getElementById('editYearGroup').value = student.year_group || '';
                    document.getElementById('editTeacher').value = student.teacher_id || '';

                    // Store student data for later use
                    const currentStudentClassId = student.class_id;

                    // Now fetch classes
                    return fetch(`../php/get_classes_for_dropdown.php?bid=${browserInstanceId}`)
                        .then(response => response.json())
                        .then(classesData => {
                            console.log('Classes data response:', classesData);

                            if (classesData.success) {
                                const classSelect = document.getElementById('editClass');
                                if (classSelect) {
                                    classSelect.innerHTML = '<option value="">Unassigned</option>';

                                    classesData.classes.forEach(cls => {
                                        const option = document.createElement('option');
                                        option.value = cls.id;
                                        option.textContent = cls.class_name;

                                        // Compare with the student's class_id we stored earlier
                                        if (cls.id == currentStudentClassId) {
                                            option.selected = true;
                                        }

                                        classSelect.appendChild(option);
                                    });

                                    console.log('Class dropdown populated. Student class ID:', currentStudentClassId);
                                }
                            }

                            return studentData; // Return student data for the next .then()
                        });
                } else {
                    showToast('Error loading student details: ' + studentData.message, 'error');
                    throw new Error('Failed to load student details');
                }
            })
            .then(() => {
                // Show the modal after everything is loaded
                console.log('Showing edit modal');
                editModal.show();
            })
            .catch(error => {
                console.error('Error in handleEditClick:', error);
                showToast('Error loading student details: ' + error.message, 'error');
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
        // View buttons
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', handleViewClick);
        });

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
        
    handleUrlSearchParam();
    
    // Debug: Check if variables are properly set
    console.log('Students page initialized - Browser Instance ID:', browserInstanceId);
});