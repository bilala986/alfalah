// teacher/js/attendance.js - OPTIMIZED VERSION FOR MULTIPLE TEACHERS
document.addEventListener("DOMContentLoaded", () => {
    // === CACHE FOR PERFORMANCE ===
    const cache = {
        calendar: {}, // Cache calendar HTML by month
        monthlyAttendance: {}, // Cache monthly attendance data
        students: {} // Cache students by class
    };

    // Elements
    const attendanceTableBody = document.getElementById("attendanceTableBody");
    const classSelect = document.getElementById("attendanceClassSelect");
    const todayBtn = document.getElementById("todayBtn");
    const toggleCalendarBtn = document.getElementById("toggleCalendarBtn");
    const selectedDateEl = document.getElementById("selectedDate");
    const selectedWeekdayEl = document.getElementById("selectedWeekday");
    const calendarContainer = document.getElementById("calendarContainer");
    const studentCountEl = document.getElementById("studentCount");
    const entryTabBtn = document.getElementById("entryTabBtn");
    const summaryTabBtn = document.getElementById("summaryTabBtn");
    const attendanceEntrySection = document.getElementById("attendanceEntrySection");
    const attendanceSummarySection = document.getElementById("attendanceSummarySection");
    const prevMonthBtn = document.getElementById("prevMonthBtn");
    const nextMonthBtn = document.getElementById("nextMonthBtn");
    const monthYearDisplay = document.getElementById("monthYearDisplay");
    const summaryClassSelect = document.getElementById("summaryClassSelect");
    const summaryTable = document.getElementById("summaryTable");
    const summaryTableBody = document.getElementById("summaryTableBody");
    const totalPresentEl = document.getElementById("totalPresent");
    const totalAbsentEl = document.getElementById("totalAbsent");
    const attendanceRateEl = document.getElementById("attendanceRate");

    // Navigation buttons
    const prevDayBtn = document.getElementById("prevDayBtn");
    const nextDayBtn = document.getElementById("nextDayBtn");

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

    // Global variables
    let allStudents = [];
    let allClasses = [];
    let selectedAttendanceDate = new Date();
    let isCalendarVisible = false;
    let pendingChanges = {};
    let savedAttendance = {};
    let currentClassIsWeekend = false;
    
    let summaryCurrentMonth = new Date();
    let summaryCurrentClassId = null;
    let summaryIsWeekendClass = false;
    
        // Pie chart elements
    const studentDetailsSection = document.getElementById("studentDetailsSection");
    const selectedStudentName = document.getElementById("selectedStudentName");
    const closeStudentDetails = document.getElementById("closeStudentDetails");
    const attendancePieChartCanvas = document.getElementById("attendancePieChart");
    const pieChartCenterText = document.getElementById("pieChartCenterText");
    const pieChartPercentage = document.getElementById("pieChartPercentage");
    const totalClassDays = document.getElementById("totalClassDays");
    
    // Statistics elements
    const presentDays = document.getElementById("presentDays");
    const absentDays = document.getElementById("absentDays");
    const lateDays = document.getElementById("lateDays");
    const excusedDays = document.getElementById("excusedDays");
    const noRecordDays = document.getElementById("noRecordDays");
    const nonClassDays = document.getElementById("nonClassDays");
    
    const presentPercentage = document.getElementById("presentPercentage");
    const absentPercentage = document.getElementById("absentPercentage");
    const latePercentage = document.getElementById("latePercentage");
    const excusedPercentage = document.getElementById("excusedPercentage");
    const noRecordPercentage = document.getElementById("noRecordPercentage");
    const nonClassPercentage = document.getElementById("nonClassPercentage");
    
    const attendanceSummaryRate = document.getElementById("attendanceSummaryRate");
    const mostCommonStatus = document.getElementById("mostCommonStatus");
    
    let attendancePieChart = null;
    let currentSelectedStudent = null;
    let currentAttendanceData = null;

    // === OPTIMIZED HELPER FUNCTIONS ===
    const pad = n => String(n).padStart(2, "0");

    const toISODateLocal = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const toDisplayDate = d => {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    };

    const getWeekdayName = d => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];

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

    const isFutureDate = date => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        return compareDate > today;
    };

    const isWeekendClass = className => {
        if (!className) return false;
        const lowerName = className.toLowerCase();
        return lowerName.includes('weekend') || 
               lowerName.includes('saturday') || 
               lowerName.includes('sunday') ||
               lowerName.includes('fri') ||
               lowerName.includes('sat') ||
               lowerName.includes('sun');
    };

    const shouldEnableDay = date => {
        const day = date.getDay();
        return currentClassIsWeekend ? (day === 0 || day === 6) : (day >= 1 && day <= 4);
    };

    function getDayStatus(date) {
        const day = date.getDay();
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        if (currentClassIsWeekend) {
            if (day === 0 || day === 6) {
                return { enabled: true, title: `${dayNames[day]} - Class day` };
            }
            return { enabled: false, title: `${dayNames[day]} - No weekend class` };
        }
        
        if (day >= 1 && day <= 4) {
            return { enabled: true, title: `${dayNames[day]} - Class day` };
        }
        return { enabled: false, title: `${dayNames[day]} - Weekend - No classes` };
    }

    function navigateDay(direction) {
        const newDate = new Date(selectedAttendanceDate);
        newDate.setDate(newDate.getDate() + direction);
        selectedAttendanceDate = newDate;
        loadAttendance();

        if (isCalendarVisible) {
            // Clear and re-render calendar to update highlight
            calendarContainer.innerHTML = '';
            renderCalendar(selectedAttendanceDate);
        }
    }

    // === OPTIMIZED API FUNCTIONS ===
    async function fetchTeacherClasses() {
        try {
            const cacheKey = 'teacher_classes';
            if (cache[cacheKey]) return cache[cacheKey];
            
            const res = await fetch(`../php/get_teacher_classes.php?bid=${getBrowserInstanceId()}`);
            const data = await res.json();
            
            if (data.success) {
                allClasses = data.classes;
                cache[cacheKey] = data.classes;
                updateClassSelect();
                populateSummaryClassSelect();
                return data.classes;
            }
            showToast("Failed to load classes", "danger");
            return [];
        } catch (err) {
            console.error("fetchTeacherClasses:", err);
            showToast("Network error loading classes", "danger");
            return [];
        }
    }

    async function fetchTeacherStudents(classId = null) {
        try {
            const cacheKey = `students_${classId || 'all'}`;
            if (cache[cacheKey]) {
                allStudents = cache[cacheKey];
                return cache[cacheKey];
            }
            
            let url = `../php/get_teacher_students.php?bid=${getBrowserInstanceId()}`;
            if (classId) url += `&class_id=${classId}`;
            
            const res = await fetch(url);
            const data = await res.json();
            
            if (data.success) {
                allStudents = data.students;
                cache[cacheKey] = data.students;
                return data.students;
            }
            showToast("Failed to load students", "danger");
            return [];
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
            if (classId) url += `&class_id=${classId}`;
            
            const res = await fetch(url);
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
            }
            return {};
        } catch (err) {
            console.error("fetchAttendance:", err);
            return {};
        }
    }

    // === OPTIMIZED UI FUNCTIONS ===
    function getBrowserInstanceId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('bid') || '';
    }

    function updateClassSelect() {
        if (!classSelect) return;
        
        classSelect.innerHTML = '<option value="">Select Class</option>';
        
        allClasses.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = `${cls.class_name} (${cls.year_group})`;
            classSelect.appendChild(option);
        });
        
        if (allClasses.length > 0) {
            classSelect.value = allClasses[0].id;
            updateCurrentClassType();
        }
    }

    function updateCurrentClassType() {
        const selectedClassId = classSelect ? classSelect.value : null;
        if (!selectedClassId) {
            currentClassIsWeekend = false;
            return;
        }
        
        const selectedClass = allClasses.find(cls => cls.id == selectedClassId);
        currentClassIsWeekend = selectedClass ? isWeekendClass(selectedClass.class_name) : false;
    }

    function updateDateDisplay() {
        if (!selectedDateEl || !selectedWeekdayEl) return;
        
        selectedDateEl.textContent = toDisplayDate(selectedAttendanceDate);
        selectedWeekdayEl.textContent = getWeekdayName(selectedAttendanceDate);

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

    // === OPTIMIZED ATTENDANCE LOADING ===
    async function loadAttendance() {
        if (!attendanceTableBody) return;

        attendanceTableBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-muted py-4">
                    <div class="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                    Loading attendance data...
                </td>
            </tr>`;

        pendingChanges = {};
        if (saveBtn) saveBtn.disabled = true;

        const classId = classSelect ? classSelect.value : null;
        const dateStr = toISODateLocal(selectedAttendanceDate);
        
        updateCurrentClassType();
        updateDateDisplay();

        const [students, attendanceMap] = await Promise.all([
            fetchTeacherStudents(classId),
            fetchAttendance(classId, dateStr)
        ]);

        savedAttendance = { ...attendanceMap };

        // Pre-compute current statuses for optimization
        const currentStatusMap = {};
        students.forEach(student => {
            currentStatusMap[student.id] = getCurrentStatus(student.id);
        });

        let filteredStudents = students;
        const searchTerm = searchInput?.value.trim().toLowerCase();
        if (searchTerm) {
            filteredStudents = students.filter(s => 
                s.full_name.toLowerCase().includes(searchTerm) ||
                (s.admission_id && s.admission_id.toString().includes(searchTerm))
            );
        }

        const filterStatus = filterStatusSelect?.value;
        if (filterStatus) {
            filteredStudents = filteredStudents.filter(s => 
                currentStatusMap[s.id] === filterStatus
            );
        }

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

        const isFuture = isFutureDate(selectedAttendanceDate);
        const dayStatus = getDayStatus(selectedAttendanceDate);
        const isDateEnabled = dayStatus.enabled;

        const frag = document.createDocumentFragment();

        filteredStudents.forEach((student) => {
            const currentStatus = currentStatusMap[student.id];
            
            const row = document.createElement("tr");
            row.dataset.id = student.id;
            row.dataset.classId = student.class_id;

            // Name cell
            const nameCell = document.createElement("td");
            nameCell.textContent = student.full_name;
            if (student.admission_id) {
                nameCell.title = `Admission ID: ${student.admission_id}`;
            }
            row.appendChild(nameCell);

            // Status cell
            const statusCell = document.createElement("td");
            const badge = document.createElement("span");
            badge.className = "badge attendance-badge " + getStatusBadgeClass(currentStatus);
            badge.textContent = currentStatus;
            statusCell.appendChild(badge);
            row.appendChild(statusCell);

            // Actions cell
            const actionsCell = document.createElement("td");
            const actionsDiv = document.createElement("div");
            actionsDiv.className = "d-flex gap-2 justify-content-center";

            const statusButtons = [
                { value: "Present", class: "success", icon: "bi-check-circle" },
                { value: "Absent", class: "danger", icon: "bi-x-circle" },
                { value: "Late", class: "warning", icon: "bi-clock" },
                { value: "Excused", class: "info", icon: "bi-clipboard-check" }
            ];

            statusButtons.forEach(statusOption => {
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

            // Clear button
            const clearBtn = document.createElement("button");
            clearBtn.type = "button";
            clearBtn.className = `btn btn-sm btn-outline-secondary btn-clear-attendance`;
            clearBtn.dataset.studentId = student.id;
            clearBtn.title = "Clear status (set to –)";
            
            if (isFuture || !isDateEnabled) {
                clearBtn.disabled = true;
                clearBtn.classList.add("opacity-50");
            }
            
            const clearIcon = document.createElement("i");
            clearIcon.className = "bi bi-eraser";
            clearBtn.appendChild(clearIcon);
            
            actionsDiv.appendChild(clearBtn);
            actionsCell.appendChild(actionsDiv);
            row.appendChild(actionsCell);

            frag.appendChild(row);
        });

        attendanceTableBody.innerHTML = "";
        attendanceTableBody.appendChild(frag);
        
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
            return pendingChanges[studentId] === "–" ? "–" : pendingChanges[studentId];
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

    // === OPTIMIZED CALENDAR - FIXED VERSION ===
    function renderCalendar(date) {
        if (!calendarContainer) return;

        const year = date.getFullYear();
        const month = date.getMonth();
        const cacheKey = `${year}-${month}`;

        // Always clear the container first
        calendarContainer.innerHTML = '';

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

            // HIGHLIGHT SELECTED DATE - FIXED
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
                    renderCalendar(new Date(year, month, 1)); // Re-render to update highlight
                });
            }

            grid.appendChild(dayCell);
        }

        calendarWrapper.appendChild(grid);
        calendarContainer.appendChild(calendarWrapper);
        calendarContainer.style.display = "block";
    }

    // === ATTENDANCE MARKING ===
    document.addEventListener("click", (e) => {
        const clearBtn = e.target.closest(".btn-clear-attendance");
        if (clearBtn) {
            const studentId = clearBtn.dataset.studentId;
            
            if (isFutureDate(selectedAttendanceDate)) {
                showToast("Cannot modify attendance for future dates", "warning");
                return;
            }
            
            const dayStatus = getDayStatus(selectedAttendanceDate);
            if (!dayStatus.enabled) {
                showToast(dayStatus.title, "warning");
                return;
            }
            
            pendingChanges[studentId] = "–";
            
            const row = clearBtn.closest("tr");
            const allButtons = row.querySelectorAll(".btn-attendance-toggle");
            allButtons.forEach(btn => {
                const btnStatus = btn.dataset.status;
                const colorClass = getColorClass(btnStatus);
                btn.classList.remove(`btn-${colorClass}`);
                btn.classList.add(`btn-outline-${colorClass}`);
            });
            
            const badge = row.querySelector(".badge");
            badge.textContent = "–";
            badge.className = `badge attendance-badge text-bg-secondary`;
            
            if (saveBtn) saveBtn.disabled = Object.keys(pendingChanges).length === 0;
            return;
        }
        
        const toggleBtn = e.target.closest(".btn-attendance-toggle");
        if (!toggleBtn) return;
        
        if (isFutureDate(selectedAttendanceDate)) {
            showToast("Cannot modify attendance for future dates", "warning");
            return;
        }
        
        const dayStatus = getDayStatus(selectedAttendanceDate);
        if (!dayStatus.enabled) {
            showToast(dayStatus.title, "warning");
            return;
        }

        const row = toggleBtn.closest("tr");
        const studentId = row.dataset.id;
        const newStatus = toggleBtn.dataset.status;

        const currentPendingStatus = pendingChanges[studentId];
        
        if (currentPendingStatus === newStatus) {
            delete pendingChanges[studentId];
        } else {
            pendingChanges[studentId] = newStatus;
        }

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

        const badge = row.querySelector(".badge");
        const displayStatus = getCurrentStatus(studentId);
        badge.textContent = displayStatus;
        badge.className = `badge attendance-badge ${getStatusBadgeClass(displayStatus)}`;

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
        const classId = classSelect ? classSelect.value : null;
        let successCount = 0;
        let errorCount = 0;

        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
        saveBtn.disabled = true;

        for (const [studentId, status] of changes) {
            try {
                const student = allStudents.find(s => s.id == studentId);
                if (!student) {
                    console.error(`Student ${studentId} not found`);
                    errorCount++;
                    continue;
                }

                const formData = new FormData();
                formData.append("student_id", studentId);
                formData.append("class_id", student.class_id || classId);
                
                if (status === "–") {
                    formData.append("status", "remove");
                } else {
                    formData.append("status", status);
                }
                
                formData.append("date", dateStr);

                const res = await fetch(`../php/mark_attendance.php?bid=${getBrowserInstanceId()}`, {
                    method: "POST",
                    body: formData
                });

                const data = await res.json();
                
                if (data.success) {
                    successCount++;
                    if (status === "–") {
                        delete savedAttendance[studentId];
                    } else {
                        savedAttendance[studentId] = status;
                    }
                } else {
                    errorCount++;
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

        pendingChanges = {};
        
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = true;
        
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
    });

    // === EVENT LISTENERS ===
    if (prevDayBtn) prevDayBtn.addEventListener("click", () => navigateDay(-1));
    if (nextDayBtn) nextDayBtn.addEventListener("click", () => navigateDay(1));
    
    if (todayBtn) todayBtn.addEventListener("click", () => {
        const today = new Date();
        const dayStatus = getDayStatus(today);
        if (!dayStatus.enabled) {
            showToast(dayStatus.title, "warning");
            return;
        }
        selectedAttendanceDate = today;
        loadAttendance();

        if (isCalendarVisible) {
            // Clear and re-render calendar
            calendarContainer.innerHTML = '';
            renderCalendar(selectedAttendanceDate);
        }
    });

    if (toggleCalendarBtn) toggleCalendarBtn.addEventListener("click", () => {
        isCalendarVisible = !isCalendarVisible;
        if (isCalendarVisible) {
            calendarContainer.innerHTML = '';
            renderCalendar(selectedAttendanceDate);
            toggleCalendarBtn.innerHTML = '<i class="bi bi-calendar-week"></i> Hide Calendar';
        } else {
            calendarContainer.style.display = "none";
            toggleCalendarBtn.innerHTML = '<i class="bi bi-calendar-week"></i> Show Calendar';
        }
    });

    if (classSelect) classSelect.addEventListener("change", () => {
        updateCurrentClassType();
        loadAttendance();
    });

    if (searchInput) searchInput.addEventListener("input", loadAttendance);
    if (refreshBtn) refreshBtn.addEventListener("click", () => {
        searchInput.value = "";
        if (filterStatusSelect) filterStatusSelect.value = "";
        pendingChanges = {};
        if (saveBtn) saveBtn.disabled = true;
        loadAttendance();
    });
    if (filterBtn) filterBtn.addEventListener("click", () => filterModal?.show());
    if (applyFiltersBtn) applyFiltersBtn.addEventListener("click", () => {
        loadAttendance();
        filterModal?.hide();
    });
    if (clearFiltersBtn) clearFiltersBtn.addEventListener("click", () => {
        if (filterStatusSelect) filterStatusSelect.value = "";
        loadAttendance();
        filterModal?.hide();
    });

    // === SUMMARY TAB FUNCTIONS ===
    const shouldEnableDayForSummary = (date, isWeekendClass) => {
        const day = date.getDay();
        return isWeekendClass ? (day === 0 || day === 6) : (day >= 1 && day <= 4);
    };

    const getStatusBadgeClassForSummary = status => {
        switch (status) {
            case "Present": return "bg-success";
            case "Absent": return "bg-danger";
            case "Late": return "bg-warning";
            case "Excused": return "bg-info";
            default: return "bg-secondary";
        }
    };

    function renderSummaryHeaders(year, month) {
        if (!summaryTable) return;
        const thead = summaryTable.querySelector("thead");
        const headerRow = thead.querySelector("tr");

        while (headerRow.children.length > 1) {
            headerRow.removeChild(headerRow.lastChild);
        }

        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const th = document.createElement("th");
            th.textContent = day;
            th.style.width = "35px";
            th.style.fontSize = "0.85rem";
            th.style.padding = "5px 2px";

            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();

            if (dayOfWeek === 0 || dayOfWeek === 6) {
                th.style.backgroundColor = "#f8f9fa";
            }

            if (!shouldEnableDayForSummary(date, summaryIsWeekendClass)) {
                th.style.opacity = "0.5";
                th.style.backgroundColor = "#f5f5f5";
                th.title = "No classes on this day";
            }

            headerRow.appendChild(th);
        }
    }

    async function fetchMonthlyAttendance(year, month, classId) {
        try {
            const cacheKey = `monthly_${year}-${month + 1}-${classId || 'all'}`;
            if (cache.monthlyAttendance[cacheKey]) {
                return cache.monthlyAttendance[cacheKey];
            }
            
            const firstDay = `${year}-${String(month + 1).padStart(2, '0')}-01`;
            const lastDay = new Date(year, month + 1, 0);
            const lastDayStr = lastDay.toISOString().split('T')[0];

            let url = `../php/get_monthly_attendance.php?bid=${getBrowserInstanceId()}&start_date=${firstDay}&end_date=${lastDayStr}`;
            if (classId) url += `&class_id=${classId}`;

            const res = await fetch(url);
            const data = await res.json();

            if (data.success) {
                cache.monthlyAttendance[cacheKey] = data.attendance;
                return data.attendance;
            }
            console.error("Failed to load monthly attendance:", data.message);
            return {};
        } catch (err) {
            console.error("Error fetching monthly attendance:", err);
            return {};
        }
    }

    async function renderSummaryTable() {
        if (!summaryTableBody || !monthYearDisplay) return;

        const year = summaryCurrentMonth.getFullYear();
        const month = summaryCurrentMonth.getMonth();
        const classId = summaryClassSelect ? summaryClassSelect.value : null;

        if (!classId) {
            summaryTableBody.innerHTML = `
                <tr>
                    <td colspan="32" class="text-center text-muted py-4">
                        Please select a class to view summary.
                    </td>
                </tr>`;
            return;
        }

        summaryTableBody.innerHTML = `
            <tr>
                <td colspan="32" class="text-center text-muted py-4">
                    <div class="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                    Loading attendance summary...
                </td>
            </tr>`;

        const monthNames = ["January", "February", "March", "April", "May", "June",
                           "July", "August", "September", "October", "November", "December"];
        monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

        const selectedClass = allClasses.find(c => c.id == classId);
        summaryIsWeekendClass = selectedClass ? isWeekendClass(selectedClass.class_name) : false;

        renderSummaryHeaders(year, month);

        const [students, attendanceData] = await Promise.all([
            fetchTeacherStudents(classId),
            fetchMonthlyAttendance(year, month, classId)
        ]);

        if (!students.length) {
            summaryTableBody.innerHTML = `
                <tr>
                    <td colspan="32" class="text-center text-muted py-4">
                        No students found for this class.
                    </td>
                </tr>`;
            updateSummaryStats({});
            return;
        }

        summaryTableBody.innerHTML = "";
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let totalPresent = 0;
        let totalAbsent = 0;
        let totalDays = 0;

        const frag = document.createDocumentFragment();

        students.forEach(student => {
            const row = document.createElement("tr");

            // Name cell - MADE CLICKABLE
            const nameCell = document.createElement("td");
            const nameLink = document.createElement("a");
            nameLink.href = "#";
            nameLink.className = "student-name-link text-decoration-none text-dark";
            nameLink.style.cursor = "pointer";
            nameLink.dataset.studentId = student.id;
            nameLink.textContent = student.full_name;
            nameLink.title = `Click to view ${student.full_name}'s attendance breakdown`;

            // Add hover effect
            nameLink.addEventListener('mouseenter', () => {
                nameLink.classList.add('text-success', 'fw-medium');
            });
            nameLink.addEventListener('mouseleave', () => {
                nameLink.classList.remove('text-success', 'fw-medium');
            });

            // Add click handler
            nameLink.addEventListener('click', (e) => {
                e.preventDefault();
                showStudentDetails(student.id, student.full_name, attendanceData);
            });

            nameCell.appendChild(nameLink);
            nameCell.style.fontWeight = "500";
            row.appendChild(nameCell);

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dateStr = date.toISOString().split('T')[0];
                const cell = document.createElement("td");
                cell.style.padding = "5px 2px";
                cell.style.fontSize = "0.85rem";

                if (shouldEnableDayForSummary(date, summaryIsWeekendClass)) {
                    totalDays++;

                    const studentAttendance = attendanceData[student.id] || {};
                    const status = studentAttendance[dateStr] || "–";

                    if (status !== "–") {
                        const badge = document.createElement("span");
                        badge.className = `badge ${getStatusBadgeClassForSummary(status)}`;
                        badge.style.width = "20px";
                        badge.style.height = "20px";
                        badge.style.display = "inline-block";
                        badge.title = `${status} - ${dateStr}`;
                        cell.appendChild(badge);

                        if (status === "Present") totalPresent++;
                        if (status === "Absent") totalAbsent++;
                    } else {
                        cell.innerHTML = "–";
                        cell.style.color = "#6c757d";
                    }
                } else {
                    cell.innerHTML = "–";
                    cell.style.color = "#dee2e6";
                    cell.style.backgroundColor = "#f5f5f5";
                    cell.title = "No classes on this day";
                }

                row.appendChild(cell);
            }

            frag.appendChild(row);
        });

        summaryTableBody.appendChild(frag);
        updateSummaryStats({ totalPresent, totalAbsent, totalDays });
    }

    function updateSummaryStats(stats) {
        const { totalPresent = 0, totalAbsent = 0, totalDays = 0 } = stats;

        if (totalPresentEl) totalPresentEl.textContent = totalPresent;
        if (totalAbsentEl) totalAbsentEl.textContent = totalAbsent;

        if (totalDays > 0 && attendanceRateEl) {
            const rate = Math.round((totalPresent / totalDays) * 100);
            attendanceRateEl.textContent = `${rate}%`;
        } else if (attendanceRateEl) {
            attendanceRateEl.textContent = "0%";
        }
    }

    // === PIE CHART FUNCTIONS ===
    function showStudentDetails(studentId, studentName, attendanceData) {
        currentSelectedStudent = studentId;
        currentAttendanceData = attendanceData;
        
        // Update student name
        selectedStudentName.textContent = studentName;
        
        // Calculate statistics
        const year = summaryCurrentMonth.getFullYear();
        const month = summaryCurrentMonth.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        let presentCount = 0;
        let absentCount = 0;
        let lateCount = 0;
        let excusedCount = 0;
        let noRecordCount = 0;
        let nonClassCount = 0;
        let totalEnabledDays = 0;
        
        const studentAttendance = attendanceData[studentId] || {};
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            
            if (shouldEnableDayForSummary(date, summaryIsWeekendClass)) {
                totalEnabledDays++;
                const status = studentAttendance[dateStr] || "–";
                
                switch (status) {
                    case "Present": presentCount++; break;
                    case "Absent": absentCount++; break;
                    case "Late": lateCount++; break;
                    case "Excused": excusedCount++; break;
                    default: noRecordCount++; break;
                }
            } else {
                nonClassCount++;
            }
        }
        
        // Update statistics
        totalClassDays.textContent = totalEnabledDays;
        presentDays.textContent = `${presentCount} day${presentCount !== 1 ? 's' : ''}`;
        absentDays.textContent = `${absentCount} day${absentCount !== 1 ? 's' : ''}`;
        lateDays.textContent = `${lateCount} day${lateCount !== 1 ? 's' : ''}`;
        excusedDays.textContent = `${excusedCount} day${excusedCount !== 1 ? 's' : ''}`;
        noRecordDays.textContent = `${noRecordCount} day${noRecordCount !== 1 ? 's' : ''}`;
        nonClassDays.textContent = `${nonClassCount} day${nonClassCount !== 1 ? 's' : ''}`;
        
        // Calculate percentages
        const totalDays = daysInMonth;
        const presentPct = totalEnabledDays > 0 ? Math.round((presentCount / totalEnabledDays) * 100) : 0;
        const absentPct = totalEnabledDays > 0 ? Math.round((absentCount / totalEnabledDays) * 100) : 0;
        const latePct = totalEnabledDays > 0 ? Math.round((lateCount / totalEnabledDays) * 100) : 0;
        const excusedPct = totalEnabledDays > 0 ? Math.round((excusedCount / totalEnabledDays) * 100) : 0;
        const noRecordPct = totalEnabledDays > 0 ? Math.round((noRecordCount / totalEnabledDays) * 100) : 0;
        const nonClassPct = Math.round((nonClassCount / totalDays) * 100);
        
        presentPercentage.textContent = `${presentPct}%`;
        absentPercentage.textContent = `${absentPct}%`;
        latePercentage.textContent = `${latePct}%`;
        excusedPercentage.textContent = `${excusedPct}%`;
        noRecordPercentage.textContent = `${noRecordPct}%`;
        nonClassPercentage.textContent = `${nonClassPct}%`;
        
        // Update pie chart center text
        pieChartPercentage.textContent = `${presentPct}%`;
        
        // Find most common status
        const statusCounts = { Present: presentCount, Absent: absentCount, Late: lateCount, Excused: excusedCount, "No Record": noRecordCount };
        let mostCommon = "No Record";
        let highestCount = noRecordCount;
        
        Object.entries(statusCounts).forEach(([status, count]) => {
            if (count > highestCount) {
                highestCount = count;
                mostCommon = status;
            }
        });
        
        mostCommonStatus.textContent = mostCommon;
        attendanceSummaryRate.textContent = `${presentPct}%`;
        
        // Create or update pie chart
        if (attendancePieChart) {
            attendancePieChart.destroy();
        }
        
        const ctx = attendancePieChartCanvas.getContext('2d');
        attendancePieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Present', 'Absent', 'Late', 'Excused', 'No Record'],
                datasets: [{
                    data: [presentCount, absentCount, lateCount, excusedCount, noRecordCount],
                    backgroundColor: [
                        '#28a745', // Green
                        '#dc3545', // Red
                        '#ffc107', // Yellow
                        '#17a2b8', // Blue
                        '#6c757d'  // Gray
                    ],
                    borderWidth: 1,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} days (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        // Show the section
        studentDetailsSection.style.display = 'block';
        
        // Scroll to the details section
        setTimeout(() => {
            studentDetailsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    function hideStudentDetails() {
        studentDetailsSection.style.display = 'none';
        currentSelectedStudent = null;
        currentAttendanceData = null;
        
        if (attendancePieChart) {
            attendancePieChart.destroy();
            attendancePieChart = null;
        }
    }

    function switchTab(tabName) {
        if (tabName === "entry") {
            entryTabBtn.classList.add("active", "btn-success-modern");
            entryTabBtn.classList.remove("btn-outline-success");
            summaryTabBtn.classList.remove("active", "btn-success-modern");
            summaryTabBtn.classList.add("btn-outline-success");
            attendanceEntrySection.style.display = "block";
            attendanceSummarySection.style.display = "none";
            
            // Hide student details when switching away from summary
            hideStudentDetails();
        } else {
            summaryTabBtn.classList.add("active", "btn-success-modern");
            summaryTabBtn.classList.remove("btn-outline-success");
            entryTabBtn.classList.remove("active", "btn-success-modern");
            entryTabBtn.classList.add("btn-outline-success");
            attendanceEntrySection.style.display = "none";
            attendanceSummarySection.style.display = "block";

            if (summaryClassSelect && summaryClassSelect.options.length <= 1) {
                populateSummaryClassSelect();
            }

            if (classSelect && classSelect.value && summaryClassSelect) {
                summaryClassSelect.value = classSelect.value;
                summaryCurrentClassId = classSelect.value;
            }

            renderSummaryTable();
        }
    }

    function populateSummaryClassSelect() {
        if (!summaryClassSelect) return;

        summaryClassSelect.innerHTML = '<option value="">Select Class</option>';

        allClasses.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = `${cls.class_name} (${cls.year_group})`;
            summaryClassSelect.appendChild(option);
        });

        if (classSelect && classSelect.value) {
            summaryClassSelect.value = classSelect.value;
            summaryCurrentClassId = classSelect.value;
        } else if (allClasses.length > 0 && !summaryCurrentClassId) {
            summaryCurrentClassId = allClasses[0].id;
            summaryClassSelect.value = summaryCurrentClassId;
        }
    }

    // === EVENT LISTENERS FOR SUMMARY TAB ===
    if (entryTabBtn) entryTabBtn.addEventListener("click", () => switchTab("entry"));
    if (summaryTabBtn) summaryTabBtn.addEventListener("click", () => switchTab("summary"));
    if (prevMonthBtn) prevMonthBtn.addEventListener("click", () => {
        summaryCurrentMonth.setMonth(summaryCurrentMonth.getMonth() - 1);
        renderSummaryTable();
    });
    if (nextMonthBtn) nextMonthBtn.addEventListener("click", () => {
        summaryCurrentMonth.setMonth(summaryCurrentMonth.getMonth() + 1);
        renderSummaryTable();
    });
    if (summaryClassSelect) summaryClassSelect.addEventListener("change", () => {
        summaryCurrentClassId = summaryClassSelect.value;
        renderSummaryTable();
    });

    // ADD THE CLOSE BUTTON EVENT LISTENER HERE:
    if (closeStudentDetails) {
        closeStudentDetails.addEventListener('click', hideStudentDetails);
    }

    // === INITIALIZE ===
    async function init() {
        selectedAttendanceDate = new Date();
        await fetchTeacherClasses();
        
        if (classSelect && classSelect.value) {
            await loadAttendance();
        }
        
        populateSummaryClassSelect();
    }

    init();
});