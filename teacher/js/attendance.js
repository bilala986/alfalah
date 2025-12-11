// teacher/js/attendance.js - FIXED VERSION
document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const attendanceTableBody = document.getElementById("attendanceTableBody");
    const classSelect = document.getElementById("attendanceClassSelect");
    const summaryClassSelect = document.getElementById("summaryClassSelect");
    const datePicker = document.getElementById("datePicker");
    const todayBtn = document.getElementById("todayBtn");
    const toggleCalendarBtn = document.getElementById("toggleCalendarBtn");
    const selectedDateEl = document.getElementById("selectedDate");
    const calendarContainer = document.getElementById("calendarContainer");
    const studentCountEl = document.getElementById("studentCount");

    // Top controls
    const searchInput = document.getElementById("attendanceSearchInput");
    const refreshBtn = document.getElementById("attendanceRefreshBtn");
    const filterBtn = document.getElementById("attendanceFilterBtn");
    const saveBtn = document.getElementById("attendanceSaveBtn");

    // Filter modal elements
    const filterModalEl = document.getElementById("attendanceFilterModal");
    const filterModal = filterModalEl ? new bootstrap.Modal(filterModalEl) : null;
    const filterStatusSelect = document.getElementById("attendanceFilterStatus");
    const applyFiltersBtn = document.getElementById("attendanceApplyFilters");
    const clearFiltersBtn = document.getElementById("attendanceClearFilters");
    
    // Section toggle elements
    const entrySection = document.getElementById("attendanceEntrySection");
    const summarySection = document.getElementById("attendanceSummarySection");
    const entryBtn = document.getElementById("attendanceEntryBtn");
    const summaryBtn = document.getElementById("attendanceSummaryBtn");

    const summaryTableContainer = document.getElementById("summaryTableContainer");
    const summaryStatsContainer = document.getElementById("summaryStatsContainer");
    const summaryChartsContainer = document.getElementById("summaryChartsContainer");

    // Global variables
    let allStudents = [];
    let allClasses = [];
    let selectedAttendanceDate = new Date();
    let isCalendarVisible = false;
    let pendingChanges = {}; // {studentId: "status"}
    let savedAttendance = {}; // Track saved attendance for current date/class
    let currentChart = null;
    let summaryMonth = new Date();

    // --- Helper Functions ---
    function pad(n) { return String(n).padStart(2, "0"); }

    function toISODateLocal(d) {
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    function toDisplayDate(d) {
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    }

    function showToast(msg, type = "success") {
        const div = document.createElement("div");
        div.className = "position-fixed bottom-0 end-0 p-3";
        div.innerHTML = `
            <div class="toast align-items-center text-bg-${type} border-0 show" role="alert">
                <div class="d-flex">
                    <div class="toast-body">${msg}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3200);
    }

    // --- API Functions ---
    async function fetchTeacherClasses() {
        try {
            const res = await fetch(`../php/get_teacher_classes.php?bid=${getBrowserInstanceId()}`);
            const data = await res.json();
            
            if (data.success) {
                allClasses = data.classes;
                updateClassSelects();
                return data.classes;
            } else {
                showToast("Failed to load classes", "danger");
                return [];
            }
        } catch (err) {
            console.error("fetchTeacherClasses:", err);
            showToast("Network error loading classes", "danger");
            return [];
        }
    }

    async function fetchTeacherStudents(classId = null) {
        try {
            let url = `../php/get_teacher_students.php?bid=${getBrowserInstanceId()}`;
            if (classId) {
                url += `&class_id=${classId}`;
            }
            
            const res = await fetch(url);
            const data = await res.json();
            
            if (data.success) {
                allStudents = data.students;
                return data.students;
            } else {
                showToast("Failed to load students", "danger");
                return [];
            }
        } catch (err) {
            console.error("fetchTeacherStudents:", err);
            showToast("Network error loading students", "danger");
            return [];
        }
    }

    async function fetchAttendance(classId = null, date = null) {
        try {
            if (!date) date = toISODateLocal(selectedAttendanceDate);
            
            let url = `../php/get_attendance.php?bid=${getBrowserInstanceId()}&date=${date}`;
            if (classId) {
                url += `&class_id=${classId}`;
            }
            
            const res = await fetch(url);
            const data = await res.json();
            
            if (data.success) {
                // Convert attendance map to simple status strings
                const simpleMap = {};
                Object.entries(data.attendance).forEach(([studentId, attendanceData]) => {
                    // Handle both string status and object with status property
                    if (typeof attendanceData === 'string') {
                        simpleMap[studentId] = attendanceData;
                    } else if (attendanceData && attendanceData.status) {
                        simpleMap[studentId] = attendanceData.status;
                    }
                });
                return simpleMap;
            } else {
                showToast("Failed to load attendance", "warning");
                return {};
            }
        } catch (err) {
            console.error("fetchAttendance:", err);
            return {};
        }
    }

    // --- UI Functions ---
    function getBrowserInstanceId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('bid') || '';
    }

    function updateClassSelects() {
        // Clear options
        classSelect.innerHTML = '<option value="">Select Class</option>';
        summaryClassSelect.innerHTML = '<option value="">Select Class</option>';
        
        // Add classes
        allClasses.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = `${cls.class_name} (${cls.year_group})`;
            
            const option2 = option.cloneNode(true);
            
            classSelect.appendChild(option);
            summaryClassSelect.appendChild(option2);
        });
        
        // Auto-select first class if available
        if (allClasses.length > 0) {
            classSelect.value = allClasses[0].id;
            summaryClassSelect.value = allClasses[0].id;
        }
    }

    async function loadAttendance() {
        if (!attendanceTableBody) return;

        // Show loading
        attendanceTableBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-muted py-4">
                    <div class="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                    Loading attendance data...
                </td>
            </tr>`;

        // Clear pending changes when loading new data
        pendingChanges = {};
        if (saveBtn) saveBtn.disabled = true;

        const classId = classSelect.value;
        const dateStr = toISODateLocal(selectedAttendanceDate);
        
        // Update date displays
        selectedDateEl.textContent = toDisplayDate(selectedAttendanceDate);
        if (datePicker) datePicker.value = dateStr;

        // Fetch data
        const [students, attendanceMap] = await Promise.all([
            fetchTeacherStudents(classId),
            fetchAttendance(classId, dateStr)
        ]);

        // Store saved attendance for reference
        savedAttendance = { ...attendanceMap };

        // Filter students by search
        let filteredStudents = students;
        const searchTerm = searchInput?.value.trim().toLowerCase();
        if (searchTerm) {
            filteredStudents = students.filter(s => 
                s.full_name.toLowerCase().includes(searchTerm) ||
                (s.admission_id && s.admission_id.toString().includes(searchTerm))
            );
        }

        // Filter by status if set
        const filterStatus = filterStatusSelect?.value;
        if (filterStatus) {
            filteredStudents = filteredStudents.filter(s => {
                const currentStatus = getCurrentStatus(s.id);
                return currentStatus === filterStatus;
            });
        }

        // Update student count
        studentCountEl.textContent = filteredStudents.length;

        if (!filteredStudents.length) {
            attendanceTableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-muted py-4">
                        No students found for the selected criteria.
                    </td>
                </tr>`;
            return;
        }

        // Render table (NO # column, NO class column)
        const frag = document.createDocumentFragment();

        filteredStudents.forEach((student) => {
            const currentStatus = getCurrentStatus(student.id);
            
            const row = document.createElement("tr");
            row.dataset.id = student.id;
            row.dataset.classId = student.class_id;

            // Student Name ONLY
            const nameCell = document.createElement("td");
            nameCell.textContent = student.full_name;
            if (student.admission_id) {
                nameCell.title = `Admission ID: ${student.admission_id}`;
            }
            row.appendChild(nameCell);

            // Status badge
            const statusCell = document.createElement("td");
            const badge = document.createElement("span");
            badge.className = "badge attendance-badge " + getStatusBadgeClass(currentStatus);
            badge.textContent = currentStatus;
            statusCell.appendChild(badge);
            row.appendChild(statusCell);

            // Actions (buttons are always outline/stroked, not filled)
            const actionsCell = document.createElement("td");
            const actionsDiv = document.createElement("div");
            actionsDiv.className = "d-flex gap-2 justify-content-center";

            // Action buttons - always outline style
            const statuses = [
                { value: "Present", class: "success", icon: "bi-check-circle" },
                { value: "Absent", class: "danger", icon: "bi-x-circle" },
                { value: "Late", class: "warning", icon: "bi-clock" },
                { value: "Excused", class: "info", icon: "bi-clipboard-check" }
            ];

            statuses.forEach(statusOption => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = `btn btn-sm btn-outline-${statusOption.class} btn-attendance-toggle`;
                btn.dataset.status = statusOption.value;
                btn.title = `Mark as ${statusOption.value}`;
                
                const icon = document.createElement("i");
                icon.className = `bi ${statusOption.icon}`;
                btn.appendChild(icon);
                
                // Highlight if this is the PENDING status for this student
                if (pendingChanges[student.id] === statusOption.value) {
                    btn.classList.add(`btn-${statusOption.class}`);
                    btn.classList.remove(`btn-outline-${statusOption.class}`);
                }
                
                actionsDiv.appendChild(btn);
            });

            actionsCell.appendChild(actionsDiv);
            row.appendChild(actionsCell);

            frag.appendChild(row);
        });

        attendanceTableBody.innerHTML = "";
        attendanceTableBody.appendChild(frag);
        
        // Update save button state
        if (saveBtn) {
            saveBtn.disabled = Object.keys(pendingChanges).length === 0;
        }
    }

    // Helper to get current status (pending or saved)
    function getCurrentStatus(studentId) {
        // First check pending changes
        if (pendingChanges[studentId]) {
            return pendingChanges[studentId];
        }
        // Then check saved attendance
        if (savedAttendance[studentId]) {
            return savedAttendance[studentId];
        }
        // Default to dash
        return "–";
    }

    function getStatusBadgeClass(status) {
        switch (status) {
            case "Present": return "text-bg-success";
            case "Absent": return "text-bg-danger";
            case "Late": return "text-bg-warning";
            case "Excused": return "text-bg-info";
            case "–": return "text-bg-secondary";
            default: return "text-bg-secondary";
        }
    }

    // --- Calendar Functions (Smaller Calendar) ---
    function renderCalendar(date) {
        if (!calendarContainer) return;
        calendarContainer.innerHTML = "";

        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDay = new Date(year, month + 1, 0).getDate();

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        // Container for calendar with max width
        const calendarWrapper = document.createElement("div");
        calendarWrapper.style.maxWidth = "400px";
        calendarWrapper.style.margin = "0 auto";
        calendarWrapper.style.border = "1px solid #dee2e6";
        calendarWrapper.style.borderRadius = "8px";
        calendarWrapper.style.padding = "15px";
        calendarWrapper.style.backgroundColor = "white";
        calendarWrapper.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";

        // Header with navigation (centered)
        const header = document.createElement("div");
        header.className = "d-flex justify-content-between align-items-center mb-3";

        const prevBtn = document.createElement("button");
        prevBtn.className = "btn btn-outline-secondary btn-sm";
        prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
        prevBtn.addEventListener("click", () => {
            renderCalendar(new Date(year, month - 1, 1));
        });

        const nextBtn = document.createElement("button");
        nextBtn.className = "btn btn-outline-secondary btn-sm";
        nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';
        nextBtn.addEventListener("click", () => {
            renderCalendar(new Date(year, month + 1, 1));
        });

        const monthLabel = document.createElement("span");
        monthLabel.className = "fw-bold";
        monthLabel.textContent = `${monthNames[month]} ${year}`;

        header.appendChild(prevBtn);
        header.appendChild(monthLabel);
        header.appendChild(nextBtn);
        calendarWrapper.appendChild(header);

        // Weekday headers (smaller)
        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const weekdayRow = document.createElement("div");
        weekdayRow.className = "d-flex mb-2";

        weekdays.forEach(day => {
            const dayCell = document.createElement("div");
            dayCell.className = "text-center fw-bold";
            dayCell.style.width = "14.28%";
            dayCell.style.padding = "3px";
            dayCell.style.fontSize = "0.85rem";
            dayCell.textContent = day;
            weekdayRow.appendChild(dayCell);
        });

        calendarWrapper.appendChild(weekdayRow);

        // Days grid (smaller cells)
        const grid = document.createElement("div");
        grid.style.display = "grid";
        grid.style.gridTemplateColumns = "repeat(7, 1fr)";
        grid.style.gap = "2px";

        // Empty cells for days before the first of the month
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement("div");
            empty.style.height = "35px";
            grid.appendChild(empty);
        }

        // Day cells (smaller)
        for (let day = 1; day <= lastDay; day++) {
            const dayCell = document.createElement("button");
            dayCell.className = "btn btn-outline-secondary day-cell";
            dayCell.style.height = "35px";
            dayCell.style.padding = "0";
            dayCell.style.fontSize = "0.9rem";
            dayCell.textContent = day;

            const cellDate = new Date(year, month, day);
            
            // Highlight today
            const today = new Date();
            if (cellDate.toDateString() === today.toDateString()) {
                dayCell.classList.add("btn-success", "text-white");
                dayCell.classList.remove("btn-outline-secondary");
            }

            // Highlight selected date
            if (cellDate.toDateString() === selectedAttendanceDate.toDateString()) {
                dayCell.classList.add("selected-date-btn");
                dayCell.classList.remove("btn-outline-secondary");
            }

            dayCell.addEventListener("click", () => {
                selectedAttendanceDate = cellDate;
                loadAttendance();
                renderCalendar(date); // Re-render to update highlight
            });

            grid.appendChild(dayCell);
        }

        calendarWrapper.appendChild(grid);
        calendarContainer.appendChild(calendarWrapper);
        calendarContainer.style.display = "block";
    }

    // --- Attendance Marking ---
    document.addEventListener("click", (e) => {
        const toggleBtn = e.target.closest(".btn-attendance-toggle");
        if (!toggleBtn) return;

        const row = toggleBtn.closest("tr");
        const studentId = row.dataset.id;
        const newStatus = toggleBtn.dataset.status;

        // Get current pending status (if any)
        const currentPendingStatus = pendingChanges[studentId];
        
        // If clicking the same status, remove the pending change
        if (currentPendingStatus === newStatus) {
            delete pendingChanges[studentId];
        } else {
            // Set the new pending status
            pendingChanges[studentId] = newStatus;
        }

        // Update ALL buttons in this row to show pending status visually
        const allButtons = row.querySelectorAll(".btn-attendance-toggle");
        allButtons.forEach(btn => {
            const btnStatus = btn.dataset.status;
            const colorClass = getColorClass(btnStatus);
            
            // Reset all buttons to outline style first
            btn.classList.remove(`btn-${colorClass}`);
            btn.classList.add(`btn-outline-${colorClass}`);
            
            // Then fill the button if it matches the pending status
            if (pendingChanges[studentId] === btnStatus) {
                btn.classList.remove(`btn-outline-${colorClass}`);
                btn.classList.add(`btn-${colorClass}`);
            }
        });

        // Update the status badge
        const badge = row.querySelector(".badge");
        const displayStatus = getCurrentStatus(studentId);
        badge.textContent = displayStatus;
        badge.className = `badge attendance-badge ${getStatusBadgeClass(displayStatus)}`;

        // Update save button state
        if (saveBtn) saveBtn.disabled = Object.keys(pendingChanges).length === 0;
    });

    function getColorClass(status) {
        switch (status) {
            case "Present": return "success";
            case "Absent": return "danger";
            case "Late": return "warning";
            case "Excused": return "info";
            default: return "secondary";
        }
    }

    // Save attendance
    saveBtn?.addEventListener("click", async () => {
        const changes = Object.entries(pendingChanges);
        if (!changes.length) return;

        const dateStr = toISODateLocal(selectedAttendanceDate);
        const classId = classSelect.value;
        let successCount = 0;
        let errorCount = 0;

        // Show loading on save button
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
        saveBtn.disabled = true;

        for (const [studentId, status] of changes) {
            try {
                // Get student data
                const student = allStudents.find(s => s.id == studentId);
                if (!student) {
                    console.error(`Student ${studentId} not found`);
                    errorCount++;
                    continue;
                }

                const formData = new FormData();
                formData.append("student_id", studentId);
                formData.append("class_id", student.class_id || classId);
                formData.append("status", status);
                formData.append("date", dateStr);

                const res = await fetch(`../php/mark_attendance.php?bid=${getBrowserInstanceId()}`, {
                    method: "POST",
                    body: formData
                });

                const data = await res.json();
                
                if (data.success) {
                    successCount++;
                    // Update saved attendance
                    savedAttendance[studentId] = status;
                } else {
                    errorCount++;
                    console.error("Save error:", data);
                    if (data.requires_approval) {
                        showToast("Your account needs approval to modify attendance", "warning");
                        break;
                    }
                }
            } catch (err) {
                console.error("Error saving attendance:", err);
                errorCount++;
            }
        }

        // Clear pending changes
        pendingChanges = {};
        
        // Restore save button
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = true;
        
        // Reset all action buttons to outline style
        document.querySelectorAll(".btn-attendance-toggle").forEach(btn => {
            const btnStatus = btn.dataset.status;
            const colorClass = getColorClass(btnStatus);
            btn.classList.remove(`btn-${colorClass}`);
            btn.classList.add(`btn-outline-${colorClass}`);
        });

        // Update status badges to show saved values
        document.querySelectorAll("tr[data-id]").forEach(row => {
            const studentId = row.dataset.id;
            const badge = row.querySelector(".badge");
            const currentStatus = getCurrentStatus(studentId);
            badge.textContent = currentStatus;
            badge.className = `badge attendance-badge ${getStatusBadgeClass(currentStatus)}`;
        });

        // Show results
        if (successCount > 0) {
            showToast(`Successfully saved ${successCount} attendance record(s)`, "success");
        }
        
        if (errorCount > 0) {
            showToast(`Failed to save ${errorCount} record(s)`, "danger");
        }
    });

    // --- Summary View Functions ---
    function showEntrySection() {
        entrySection.classList.remove("d-none");
        summarySection.classList.add("d-none");
        entryBtn.classList.replace("btn-outline-secondary", "btn-success-modern");
        summaryBtn.classList.replace("btn-success-modern", "btn-outline-secondary");
    }

    function showSummarySection() {
        entrySection.classList.add("d-none");
        summarySection.classList.remove("d-none");
        entryBtn.classList.replace("btn-success-modern", "btn-outline-secondary");
        summaryBtn.classList.replace("btn-outline-secondary", "btn-success-modern");
        loadSummaryView();
    }

    async function loadSummaryView() {
        const classId = summaryClassSelect.value;
        if (!classId) {
            summaryTableContainer.innerHTML = `
                <div class="text-center py-4 text-muted">
                    <p>Please select a class to view attendance summary</p>
                </div>`;
            return;
        }

        const monthStr = `${summaryMonth.getFullYear()}-${pad(summaryMonth.getMonth() + 1)}`;
        const monthLabel = summaryMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        document.getElementById("summaryMonthLabel").textContent = monthLabel;

        try {
            const url = `../php/get_monthly_attendance.php?bid=${getBrowserInstanceId()}&month=${monthStr}&class_id=${classId}`;
            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
                summaryTableContainer.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        ${data.message || 'Failed to load summary data'}
                    </div>`;
                return;
            }

            renderSummaryTable(data.data, monthStr);
        } catch (err) {
            console.error("Error loading summary:", err);
            summaryTableContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-x-circle me-2"></i>
                    Network error loading attendance summary
                </div>`;
        }
    }

    function renderSummaryTable(data, monthStr) {
        if (!data || data.length === 0) {
            summaryTableContainer.innerHTML = `
                <div class="text-center py-4 text-muted">
                    <i class="bi bi-calendar-x display-6"></i>
                    <p class="mt-2">No attendance records found for this month</p>
                </div>`;
            return;
        }

        // Get days in month
        const [year, month] = monthStr.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        // Create table
        let html = `
            <div class="table-responsive">
                <table class="table table-bordered table-sm">
                    <thead class="table-light">
                        <tr>
                            <th>Student</th>`;
        
        // Add day headers
        days.forEach(day => {
            const date = new Date(year, month - 1, day);
            const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
            html += `<th class="text-center">${day}<br><small class="text-muted">${weekday}</small></th>`;
        });
        
        html += `<th class="text-center">Total</th></tr></thead><tbody>`;

        // Add student rows
        data.forEach(student => {
            let presents = 0;
            let absents = 0;
            let totalClasses = 0;
            
            html += `<tr><td class="fw-semibold">${student.student_name}</td>`;
            
            days.forEach(day => {
                const status = student.attendance && student.attendance[day] ? student.attendance[day] : '';
                let cellClass = '';
                let cellTitle = 'No record';
                
                if (status === 'Present') {
                    cellClass = 'bg-success bg-opacity-25';
                    cellTitle = 'Present';
                    presents++;
                    totalClasses++;
                } else if (status === 'Absent') {
                    cellClass = 'bg-danger bg-opacity-25';
                    cellTitle = 'Absent';
                    absents++;
                    totalClasses++;
                } else if (status === 'Late') {
                    cellClass = 'bg-warning bg-opacity-25';
                    cellTitle = 'Late';
                    totalClasses++;
                } else if (status === 'Excused') {
                    cellClass = 'bg-info bg-opacity-25';
                    cellTitle = 'Excused';
                    totalClasses++;
                }
                
                html += `<td class="text-center ${cellClass}" title="${cellTitle}">`;
                if (status) {
                    html += `<i class="bi ${getStatusIcon(status)}"></i>`;
                }
                html += `</td>`;
            });
            
            // Total column
            const attendanceRate = totalClasses > 0 ? Math.round((presents / totalClasses) * 100) : 0;
            html += `<td class="text-center fw-bold ${attendanceRate >= 80 ? 'text-success' : attendanceRate >= 60 ? 'text-warning' : 'text-danger'}">
                ${attendanceRate}%
                <br><small class="text-muted">${presents}/${totalClasses}</small>
            </td></tr>`;
        });
        
        html += `</tbody></table></div>`;
        
        summaryTableContainer.innerHTML = html;
        
        // Hide student detail section
        document.getElementById("studentDetailSection").classList.add("d-none");
    }

    function getStatusIcon(status) {
        switch (status) {
            case 'Present': return 'bi-check-circle-fill text-success';
            case 'Absent': return 'bi-x-circle-fill text-danger';
            case 'Late': return 'bi-clock-fill text-warning';
            case 'Excused': return 'bi-clipboard-check-fill text-info';
            default: return '';
        }
    }

    // --- Event Listeners ---
    // Date picker
    if (datePicker) {
        datePicker.addEventListener("change", (e) => {
            selectedAttendanceDate = new Date(e.target.value);
            loadAttendance();
        });
    }

    // Today button
    if (todayBtn) {
        todayBtn.addEventListener("click", () => {
            selectedAttendanceDate = new Date();
            loadAttendance();
        });
    }

    // Calendar toggle
    if (toggleCalendarBtn) {
        toggleCalendarBtn.addEventListener("click", () => {
            isCalendarVisible = !isCalendarVisible;
            if (isCalendarVisible) {
                renderCalendar(selectedAttendanceDate);
                toggleCalendarBtn.innerHTML = '<i class="bi bi-calendar-week"></i> Hide Calendar';
            } else {
                calendarContainer.style.display = "none";
                toggleCalendarBtn.innerHTML = '<i class="bi bi-calendar-week"></i> Show Calendar';
            }
        });
    }

    // Class select change
    if (classSelect) {
        classSelect.addEventListener("change", loadAttendance);
    }

    // Search input
    if (searchInput) {
        searchInput.addEventListener("input", loadAttendance);
    }

    // Refresh button (also clears pending changes)
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            searchInput.value = "";
            if (filterStatusSelect) filterStatusSelect.value = "";
            pendingChanges = {};
            if (saveBtn) saveBtn.disabled = true;
            loadAttendance();
        });
    }

    // Filter button
    if (filterBtn) {
        filterBtn.addEventListener("click", () => filterModal?.show());
    }

    // Apply filters
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener("click", () => {
            loadAttendance();
            filterModal?.hide();
        });
    }

    // Clear filters
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", () => {
            if (filterStatusSelect) filterStatusSelect.value = "";
            loadAttendance();
            filterModal?.hide();
        });
    }

    // Section toggles
    if (entryBtn) entryBtn.addEventListener("click", showEntrySection);
    if (summaryBtn) summaryBtn.addEventListener("click", showSummarySection);

    // Summary view controls
    if (summaryClassSelect) {
        summaryClassSelect.addEventListener("change", loadSummaryView);
    }

    if (document.getElementById("prevMonthBtn")) {
        document.getElementById("prevMonthBtn").addEventListener("click", () => {
            summaryMonth.setMonth(summaryMonth.getMonth() - 1);
            loadSummaryView();
        });
    }

    if (document.getElementById("nextMonthBtn")) {
        document.getElementById("nextMonthBtn").addEventListener("click", () => {
            summaryMonth.setMonth(summaryMonth.getMonth() + 1);
            loadSummaryView();
        });
    }

    // Initialize
    async function init() {
        // Set today's date
        selectedAttendanceDate = new Date();
        selectedDateEl.textContent = toDisplayDate(selectedAttendanceDate);
        if (datePicker) datePicker.value = toISODateLocal(selectedAttendanceDate);
        
        // Load classes
        await fetchTeacherClasses();
        
        // Load initial attendance
        await loadAttendance();
        
        // Set summary month label
        const monthLabel = summaryMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
        document.getElementById("summaryMonthLabel").textContent = monthLabel;
    }

    init();
});