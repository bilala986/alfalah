// admin/js/attendance.js - Admin Attendance Management
document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const attendanceContainer = document.getElementById("attendanceContainer");
    const loadingIndicator = document.getElementById("loadingIndicator");
    const attendanceContent = document.getElementById("attendanceContent");
    
    // Global variables
    let allClasses = [];
    let allStudents = [];
    let selectedAttendanceDate = new Date();
    let currentClassId = null;
    let currentClassName = '';
    let currentTeacherName = '';
    let currentTeacherId = null;
    let currentClassIsWeekend = false;
    let pendingChanges = {};
    let savedAttendance = {};
    let isCalendarVisible = false;

    // --- Helper Functions ---
    function pad(n) { return String(n).padStart(2, "0"); }

    function toISODateLocal(d) {
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    function toDisplayDate(d) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const dayOfWeek = dayNames[d.getDay()];
        const day = d.getDate();
        const month = monthNames[d.getMonth()];
        const year = d.getFullYear();
        
        return `${day} ${month} ${year}`;
    }

    function getWeekdayName(d) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return dayNames[d.getDay()];
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

    function isFutureDate(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        return compareDate > today;
    }

    function isWeekendClass(className) {
        if (!className) return false;
        const lowerName = className.toLowerCase();
        return lowerName.includes('weekend') || 
               lowerName.includes('saturday') || 
               lowerName.includes('sunday') ||
               lowerName.includes('fri') ||
               lowerName.includes('sat') ||
               lowerName.includes('sun');
    }

    function shouldEnableDay(date) {
        const day = date.getDay();
        
        if (currentClassIsWeekend) {
            return day === 0 || day === 6;
        } else {
            return day >= 1 && day <= 4;
        }
    }

    function getDayStatus(date) {
        const day = date.getDay();
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        if (currentClassIsWeekend) {
            if (day === 0 || day === 6) {
                return { enabled: true, title: `${dayNames[day]} - Class day` };
            } else {
                return { enabled: false, title: `${dayNames[day]} - No weekend class` };
            }
        } else {
            if (day >= 1 && day <= 4) {
                return { enabled: true, title: `${dayNames[day]} - Class day` };
            } else {
                return { enabled: false, title: `${dayNames[day]} - Weekend - No classes` };
            }
        }
    }

    function navigateDay(direction) {
        const newDate = new Date(selectedAttendanceDate);
        newDate.setDate(newDate.getDate() + direction);
        selectedAttendanceDate = newDate;
        loadAttendance();

        if (isCalendarVisible) {
            renderCalendar(selectedAttendanceDate);
        }
    }

    // --- API Functions ---
    async function fetchAllClasses() {
        try {
            const res = await fetch(`../php/get_classes_for_admin.php?bid=${browserInstanceId}`);
            const data = await res.json();
            
            if (data.success) {
                allClasses = data.classes;
                return data.classes;
            } else {
                showToast("Failed to load classes", "danger");
                return [];
            }
        } catch (err) {
            console.error("fetchAllClasses:", err);
            showToast("Network error loading classes", "danger");
            return [];
        }
    }

    async function fetchStudentsForClass(classId) {
        try {
            const res = await fetch(`../php/get_students_for_class.php?bid=${browserInstanceId}&class_id=${classId}`);
            const data = await res.json();
            
            if (data.success) {
                allStudents = data.students;
                return data.students;
            } else {
                showToast("Failed to load students", "danger");
                return [];
            }
        } catch (err) {
            console.error("fetchStudentsForClass:", err);
            showToast("Network error loading students", "danger");
            return [];
        }
    }

    async function fetchAttendance(classId, date = null) {
        try {
            if (!date) date = toISODateLocal(selectedAttendanceDate);
            
            const res = await fetch(`../php/get_attendance_admin.php?bid=${browserInstanceId}&class_id=${classId}&date=${date}`);
            const data = await res.json();
            
            if (data.success) {
                const simpleMap = {};
                Object.entries(data.attendance).forEach(([studentId, attendanceData]) => {
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
    function renderUI() {
        if (allClasses.length === 0) {
            attendanceContent.innerHTML = `
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    No classes found. Please create classes first in the Classes management section.
                </div>`;
            loadingIndicator.style.display = 'none';
            attendanceContent.style.display = 'block';
            return;
        }

        const classSelectOptions = allClasses.map(cls => 
            `<option value="${cls.id}" data-teacher="${cls.teacher_name || 'Unassigned'}" data-teacher-id="${cls.teacher_id || ''}">
                ${cls.class_name} (${cls.year_group}) - ${cls.teacher_name || 'No Teacher'} - ${cls.student_count} students
            </option>`
        ).join('');

        attendanceContent.innerHTML = `
            <!-- Attendance Entry Section -->
            <div class="card p-3 shadow-sm">
                <!-- Mobile Optimized Controls -->
                <div class="mobile-controls">
                    <!-- Class Dropdown -->
                    <div class="class-container">
                        <select id="attendanceClassSelect" class="form-select">
                            <option value="">Select Class</option>
                            ${classSelectOptions}
                        </select>
                    </div>
                    
                    <!-- Teacher Info -->
                    <div id="teacherInfo" class="teacher-info" style="display: none;">
                        <div class="alert alert-info py-2 mb-2">
                            <i class="bi bi-person-badge me-2"></i>
                            <strong>Teacher:</strong> <span id="currentTeacherName">Not assigned</span>
                        </div>
                    </div>
                    
                    <!-- Search Bar -->
                    <div class="search-container">
                        <div class="input-group">
                            <span class="input-group-text"><i class="bi bi-search"></i></span>
                            <input id="attendanceSearchInput" type="text" class="form-control" placeholder="Search student name...">
                        </div>
                    </div>
                    
                    <!-- Action Buttons Row -->
                    <div class="button-row">
                        <button id="toggleCalendarBtn" class="btn btn-outline-success btn-sm" title="Show/Hide Calendar">
                            <i class="bi bi-calendar-week"></i> Calendar
                        </button>
                        <button id="attendanceRefreshBtn" class="btn btn-outline-secondary btn-sm" title="Refresh">
                            <i class="bi bi-arrow-clockwise"></i>
                        </button>
                        <button id="attendanceSaveBtn" class="btn btn-success-modern btn-sm" disabled>
                            <i class="bi bi-save"></i> Save
                        </button>
                    </div>
                    
                    <!-- Date Navigation Row -->
                    <div class="date-row">
                        <button id="prevDayBtn" class="btn btn-outline-secondary" title="Previous day">
                            <i class="bi bi-chevron-left"></i>
                        </button>
                        <div class="date-display text-success">
                            <span id="selectedDate"></span>
                            <br>
                            <small id="selectedWeekday" class="text-muted"></small>
                        </div>
                        <button id="nextDayBtn" class="btn btn-outline-secondary" title="Next day">
                            <i class="bi bi-chevron-right"></i>
                        </button>
                    </div>
                    
                    <!-- Today Button Row -->
                    <div class="today-row">
                        <button id="todayBtn" class="btn btn-outline-success btn-sm" title="Go to Today">
                            <i class="bi bi-calendar-day"></i> Today
                        </button>
                    </div>
                </div>

                <!-- Calendar Container -->
                <div id="calendarContainer" class="mt-2 mb-4" style="display:none;"></div>

                <!-- Attendance Table -->
                <div class="table-responsive mt-3">
                    <table class="table table-hover align-middle text-center attendance-table">
                        <thead class="table-light">
                            <tr>
                                <th>Student Name</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="attendanceTableBody">
                            <tr>
                                <td colspan="3" class="text-center text-muted py-4">
                                    Select a class to view attendance
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="text-muted mt-2">
                    <small><span id="studentCount">0</span> student(s) found</small>
                </div>
            </div>`;

        loadingIndicator.style.display = 'none';
        attendanceContent.style.display = 'block';
        
        // Initialize event listeners
        initializeEventListeners();
    }

    function initializeEventListeners() {
        const classSelect = document.getElementById("attendanceClassSelect");
        const todayBtn = document.getElementById("todayBtn");
        const toggleCalendarBtn = document.getElementById("toggleCalendarBtn");
        const selectedDateEl = document.getElementById("selectedDate");
        const selectedWeekdayEl = document.getElementById("selectedWeekday");
        const calendarContainer = document.getElementById("calendarContainer");
        const studentCountEl = document.getElementById("studentCount");
        const prevDayBtn = document.getElementById("prevDayBtn");
        const nextDayBtn = document.getElementById("nextDayBtn");
        const searchInput = document.getElementById("attendanceSearchInput");
        const refreshBtn = document.getElementById("attendanceRefreshBtn");
        const saveBtn = document.getElementById("attendanceSaveBtn");

        // Class select change
        classSelect?.addEventListener("change", function() {
            const selectedOption = this.options[this.selectedIndex];
            currentClassId = this.value;
            currentClassName = selectedOption.text;
            currentTeacherName = selectedOption.getAttribute('data-teacher') || 'Unassigned';
            currentTeacherId = selectedOption.getAttribute('data-teacher-id') || null;
            
            // Update teacher info display
            const teacherInfo = document.getElementById("teacherInfo");
            const teacherNameSpan = document.getElementById("currentTeacherName");
            if (teacherInfo && teacherNameSpan) {
                if (currentTeacherId) {
                    teacherNameSpan.textContent = currentTeacherName;
                    teacherInfo.style.display = 'block';
                } else {
                    teacherInfo.style.display = 'none';
                }
            }
            
            // Update class type
            const selectedClass = allClasses.find(cls => cls.id == currentClassId);
            if (selectedClass) {
                currentClassIsWeekend = isWeekendClass(selectedClass.class_name);
            }
            
            if (currentClassId) {
                loadAttendance();
            } else {
                // Clear table if no class selected
                document.getElementById("attendanceTableBody").innerHTML = `
                    <tr>
                        <td colspan="3" class="text-center text-muted py-4">
                            Select a class to view attendance
                        </td>
                    </tr>`;
                studentCountEl.textContent = '0';
            }
        });

        // Today button
        todayBtn?.addEventListener("click", () => {
            const today = new Date();
            const dayStatus = getDayStatus(today);
            if (!dayStatus.enabled) {
                showToast(dayStatus.title, "warning");
                return;
            }
            selectedAttendanceDate = today;
            loadAttendance();
            
            if (isCalendarVisible) {
                renderCalendar(selectedAttendanceDate);
            }
        });

        // Calendar toggle
        toggleCalendarBtn?.addEventListener("click", () => {
            isCalendarVisible = !isCalendarVisible;
            if (isCalendarVisible) {
                renderCalendar(selectedAttendanceDate);
                toggleCalendarBtn.innerHTML = '<i class="bi bi-calendar-week"></i> Hide Calendar';
            } else {
                calendarContainer.style.display = "none";
                toggleCalendarBtn.innerHTML = '<i class="bi bi-calendar-week"></i> Show Calendar';
            }
        });

        // Day navigation
        prevDayBtn?.addEventListener("click", () => navigateDay(-1));
        nextDayBtn?.addEventListener("click", () => navigateDay(1));

        // Search
        searchInput?.addEventListener("input", loadAttendance);

        // Refresh
        refreshBtn?.addEventListener("click", () => {
            searchInput.value = "";
            pendingChanges = {};
            if (saveBtn) saveBtn.disabled = true;
            loadAttendance();
        });

        // Save
        saveBtn?.addEventListener("click", saveAttendance);

        // Initial date display
        updateDateDisplay();
    }

    function updateDateDisplay() {
        const selectedDateEl = document.getElementById("selectedDate");
        const selectedWeekdayEl = document.getElementById("selectedWeekday");
        const prevDayBtn = document.getElementById("prevDayBtn");
        const nextDayBtn = document.getElementById("nextDayBtn");
        const todayBtn = document.getElementById("todayBtn");

        if (selectedDateEl && selectedWeekdayEl) {
            selectedDateEl.textContent = toDisplayDate(selectedAttendanceDate);
            selectedWeekdayEl.textContent = getWeekdayName(selectedAttendanceDate);
        }

        if (prevDayBtn) {
            prevDayBtn.disabled = false;
            prevDayBtn.title = "Previous day";
        }

        if (nextDayBtn) {
            const tomorrow = new Date(selectedAttendanceDate);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const isTomorrowFuture = isFutureDate(tomorrow);
            nextDayBtn.disabled = isTomorrowFuture;
            nextDayBtn.title = isTomorrowFuture ? "Cannot go to future dates" : "Next day";
        }

        if (todayBtn) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isTodayOrPast = selectedAttendanceDate <= today;
            todayBtn.disabled = !isTodayOrPast;
            todayBtn.title = !isTodayOrPast ? "Already viewing today or future" : "Go to today";
        }
    }

    async function loadAttendance() {
        if (!currentClassId) return;

        const attendanceTableBody = document.getElementById("attendanceTableBody");
        const studentCountEl = document.getElementById("studentCount");
        const saveBtn = document.getElementById("attendanceSaveBtn");

        attendanceTableBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-muted py-4">
                    <div class="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                    Loading attendance data...
                </td>
            </tr>`;

        pendingChanges = {};
        if (saveBtn) saveBtn.disabled = true;

        const dateStr = toISODateLocal(selectedAttendanceDate);
        updateDateDisplay();

        const [students, attendanceMap] = await Promise.all([
            fetchStudentsForClass(currentClassId),
            fetchAttendance(currentClassId, dateStr)
        ]);

        savedAttendance = { ...attendanceMap };

        let filteredStudents = students;
        const searchTerm = document.getElementById("attendanceSearchInput")?.value.trim().toLowerCase();
        if (searchTerm) {
            filteredStudents = students.filter(s => 
                s.full_name.toLowerCase().includes(searchTerm) ||
                (s.admission_id && s.admission_id.toString().includes(searchTerm))
            );
        }

        studentCountEl.textContent = filteredStudents.length;

        if (!filteredStudents.length) {
            attendanceTableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-muted py-4">
                        No students found for this class.
                    </td>
                </tr>`;
            return;
        }

        const isFuture = isFutureDate(selectedAttendanceDate);
        const dayStatus = getDayStatus(selectedAttendanceDate);
        const isDateEnabled = dayStatus.enabled;

        const frag = document.createDocumentFragment();

        filteredStudents.forEach((student) => {
            const currentStatus = getCurrentStatus(student.id);
            
            const row = document.createElement("tr");
            row.dataset.id = student.id;

            const nameCell = document.createElement("td");
            nameCell.textContent = student.full_name;
            if (student.admission_id) {
                nameCell.title = `Admission ID: ${student.admission_id}`;
            }
            row.appendChild(nameCell);

            const statusCell = document.createElement("td");
            const badge = document.createElement("span");
            badge.className = "badge attendance-badge " + getStatusBadgeClass(currentStatus);
            badge.textContent = currentStatus;
            statusCell.appendChild(badge);
            row.appendChild(statusCell);

            const actionsCell = document.createElement("td");
            const actionsDiv = document.createElement("div");
            actionsDiv.className = "d-flex gap-2 justify-content-center";

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
                
                if (isFuture || !isDateEnabled) {
                    btn.disabled = true;
                    btn.classList.add("opacity-50");
                }
                
                const icon = document.createElement("i");
                icon.className = `bi ${statusOption.icon}`;
                btn.appendChild(icon);
                
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
        
        // Add event listeners for attendance buttons
        document.querySelectorAll(".btn-attendance-toggle").forEach(btn => {
            btn.addEventListener("click", function() {
                if (isFutureDate(selectedAttendanceDate)) {
                    showToast("Cannot modify attendance for future dates", "warning");
                    return;
                }
                
                const dayStatus = getDayStatus(selectedAttendanceDate);
                if (!dayStatus.enabled) {
                    showToast(dayStatus.title, "warning");
                    return;
                }

                const row = this.closest("tr");
                const studentId = row.dataset.id;
                const newStatus = this.dataset.status;

                const currentPendingStatus = pendingChanges[studentId];
                
                if (currentPendingStatus === newStatus) {
                    delete pendingChanges[studentId];
                } else {
                    pendingChanges[studentId] = newStatus;
                }

                // Update button styles
                const allButtons = row.querySelectorAll(".btn-attendance-toggle");
                allButtons.forEach(btn => {
                    const btnStatus = btn.dataset.status;
                    const colorClass = getColorClass(btnStatus);
                    
                    btn.classList.remove(`btn-${colorClass}`);
                    btn.classList.add(`btn-outline-${colorClass}`);
                    
                    if (pendingChanges[studentId] === btnStatus) {
                        btn.classList.remove(`btn-outline-${colorClass}`);
                        btn.classList.add(`btn-${colorClass}`);
                    }
                });

                // Update badge
                const badge = row.querySelector(".badge");
                const displayStatus = getCurrentStatus(studentId);
                badge.textContent = displayStatus;
                badge.className = `badge attendance-badge ${getStatusBadgeClass(displayStatus)}`;

                // Enable/disable save button
                const saveBtn = document.getElementById("attendanceSaveBtn");
                if (saveBtn) saveBtn.disabled = Object.keys(pendingChanges).length === 0;
            });
        });
        
        if (saveBtn) {
            saveBtn.disabled = Object.keys(pendingChanges).length === 0 || isFuture || !isDateEnabled;
            if (isFuture) {
                saveBtn.title = "Cannot save attendance for future dates";
                saveBtn.classList.add("opacity-50");
            } else if (!isDateEnabled) {
                saveBtn.title = dayStatus.title;
                saveBtn.classList.add("opacity-50");
            } else {
                saveBtn.title = "";
                saveBtn.classList.remove("opacity-50");
            }
        }
    }

    function getCurrentStatus(studentId) {
        if (pendingChanges[studentId]) {
            return pendingChanges[studentId];
        }
        if (savedAttendance[studentId]) {
            return savedAttendance[studentId];
        }
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

    function getColorClass(status) {
        switch (status) {
            case "Present": return "success";
            case "Absent": return "danger";
            case "Late": return "warning";
            case "Excused": return "info";
            default: return "secondary";
        }
    }

    // Calendar rendering function
    function renderCalendar(date) {
        const calendarContainer = document.getElementById("calendarContainer");
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

        const calendarWrapper = document.createElement("div");
        calendarWrapper.style.maxWidth = "400px";
        calendarWrapper.style.margin = "0 auto";
        calendarWrapper.style.border = "1px solid #dee2e6";
        calendarWrapper.style.borderRadius = "8px";
        calendarWrapper.style.padding = "15px";
        calendarWrapper.style.backgroundColor = "white";
        calendarWrapper.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";

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

        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const weekdayRow = document.createElement("div");
        weekdayRow.className = "d-flex mb-2";

        weekdays.forEach((day, index) => {
            const dayCell = document.createElement("div");
            dayCell.className = "text-center fw-bold";
            dayCell.style.width = "14.28%";
            dayCell.style.padding = "3px";
            dayCell.style.fontSize = "0.85rem";
            dayCell.textContent = day;
            
            const dayStatus = getDayStatus(new Date(year, month, index + 1));
            if (!dayStatus.enabled) {
                dayCell.style.color = "#dc3545";
            }
            
            weekdayRow.appendChild(dayCell);
        });

        calendarWrapper.appendChild(weekdayRow);

        const grid = document.createElement("div");
        grid.style.display = "grid";
        grid.style.gridTemplateColumns = "repeat(7, 1fr)";
        grid.style.gap = "2px";

        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement("div");
            empty.style.height = "35px";
            grid.appendChild(empty);
        }

        for (let day = 1; day <= lastDay; day++) {
            const dayCell = document.createElement("button");
            const cellDate = new Date(year, month, day);
            
            const dayStatus = getDayStatus(cellDate);
            const isEnabled = dayStatus.enabled;
            
            dayCell.className = `btn ${isEnabled ? 'btn-outline-secondary' : 'btn-light'} day-cell`;
            dayCell.style.height = "35px";
            dayCell.style.padding = "0";
            dayCell.style.fontSize = "0.9rem";
            dayCell.textContent = day;
            dayCell.title = dayStatus.title;
            
            if (!isEnabled) {
                dayCell.style.color = "#dc3545";
                dayCell.style.opacity = "0.6";
                dayCell.style.cursor = "not-allowed";
                dayCell.disabled = true;
            }
            
            const today = new Date();
            if (cellDate.toDateString() === today.toDateString() && isEnabled) {
                dayCell.classList.add("btn-success", "text-white");
                dayCell.classList.remove("btn-outline-secondary", "btn-light");
            }

            if (cellDate.toDateString() === selectedAttendanceDate.toDateString()) {
                if (isEnabled) {
                    dayCell.classList.add("selected-date-btn");
                    dayCell.classList.remove("btn-outline-secondary", "btn-light");
                }
            }

            if (isEnabled) {
                dayCell.addEventListener("click", () => {
                    selectedAttendanceDate = cellDate;
                    loadAttendance();
                    renderCalendar(date);
                });
            }

            grid.appendChild(dayCell);
        }

        calendarWrapper.appendChild(grid);
        calendarContainer.appendChild(calendarWrapper);
        calendarContainer.style.display = "block";
    }

    async function saveAttendance() {
        if (!currentClassId) return;
        
        if (isFutureDate(selectedAttendanceDate)) {
            showToast("Cannot save attendance for future dates", "warning");
            return;
        }
        
        const dayStatus = getDayStatus(selectedAttendanceDate);
        if (!dayStatus.enabled) {
            showToast(dayStatus.title, "warning");
            return;
        }
        
        const changes = Object.entries(pendingChanges);
        if (!changes.length) return;

        const dateStr = toISODateLocal(selectedAttendanceDate);
        let successCount = 0;
        let errorCount = 0;

        const saveBtn = document.getElementById("attendanceSaveBtn");
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
        saveBtn.disabled = true;

        for (const [studentId, status] of changes) {
            try {
                const formData = new FormData();
                formData.append("student_id", studentId);
                formData.append("class_id", currentClassId);
                formData.append("teacher_id", currentTeacherId || '');
                formData.append("status", status);
                formData.append("date", dateStr);

                const res = await fetch(`../php/mark_attendance_admin.php?bid=${browserInstanceId}`, {
                    method: "POST",
                    body: formData
                });

                const data = await res.json();
                
                if (data.success) {
                    successCount++;
                    savedAttendance[studentId] = status;
                } else {
                    errorCount++;
                    console.error("Save error:", data);
                }
            } catch (err) {
                console.error("Error saving attendance:", err);
                errorCount++;
            }
        }

        pendingChanges = {};
        
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = true;
        
        // Update UI
        document.querySelectorAll(".btn-attendance-toggle").forEach(btn => {
            const btnStatus = btn.dataset.status;
            const colorClass = getColorClass(btnStatus);
            btn.classList.remove(`btn-${colorClass}`);
            btn.classList.add(`btn-outline-${colorClass}`);
        });

        document.querySelectorAll("tr[data-id]").forEach(row => {
            const studentId = row.dataset.id;
            const badge = row.querySelector(".badge");
            const currentStatus = getCurrentStatus(studentId);
            badge.textContent = currentStatus;
            badge.className = `badge attendance-badge ${getStatusBadgeClass(currentStatus)}`;
        });

        if (successCount > 0) {
            showToast(`Successfully saved ${successCount} attendance record(s)`, "success");
        }
        
        if (errorCount > 0) {
            showToast(`Failed to save ${errorCount} record(s)`, "danger");
        }
    }

    // Initialize
    async function init() {
        try {
            await fetchAllClasses();
            renderUI();
        } catch (error) {
            console.error("Initialization error:", error);
            showToast("Failed to load attendance system", "danger");
        }
    }

    init();
});