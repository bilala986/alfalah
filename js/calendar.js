// Calendar Data and Configuration
class CalendarManager {
    constructor() {
        this.currentDate = new Date(2026, 0, 1); // Start at Jan 2026
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.events = this.generateSampleEvents();
        this.filteredEvents = [...this.events];
        this.hijriMonths = [
            'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
            'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
            'Ramadan', 'Shawwal', 'Dhu al-Qidah', 'Dhu al-Hijjah'
        ];
    }

    // Generate sample events for the calendar (NO regular classes)
    generateSampleEvents() {
        const currentYear = this.currentYear;
        
        return [
            // January 2026
            {
                id: 1,
                title: 'New Year\'s Day',
                date: new Date(currentYear, 0, 1),
                type: 'holiday',
                description: 'Madrassah closed for New Year\'s Day.',
                time: 'All Day',
                location: 'Closed',
                important: true
            },
            {
                id: 2,
                title: 'Spring Term Begins',
                date: new Date(currentYear, 0, 12),
                type: 'academic',
                description: 'Start of Spring Term. All students return.',
                time: '9:00 AM',
                location: 'All Classrooms',
                important: true
            },
            {
                id: 3,
                title: 'INSET Day - Staff Training',
                date: new Date(currentYear, 0, 20),
                type: 'academic',
                description: 'Staff training day - No classes for students.',
                time: '9:00 AM - 4:00 PM',
                location: 'Staff Room',
                important: false
            },
            {
                id: 26,
                title: 'Special Assembley',
                date: new Date(currentYear, 0, 30),
                type: 'event',
                description: 'Special assembley for all students with guest speaker',
                time: '10:00AM - 11:30AM',
                location: 'Main Hall',
                important: false
            },

            // February 2026
            {
                id: 4,
                title: 'Qur\'an Competition Registration Opens',
                date: new Date(currentYear, 1, 1),
                type: 'event',
                description: 'Registration opens for annual Qur\'an competition.',
                time: 'All Day',
                location: 'Office',
                important: false
            },
            {
                id: 5,
                title: 'Mid-Term Break Starts',
                date: new Date(currentYear, 1, 15),
                type: 'holiday',
                description: 'Half-term break for all students.',
                time: 'All Day',
                location: 'Closed',
                important: true
            },
            {
                id: 6,
                title: 'Mid-Term Break Ends',
                date: new Date(currentYear, 1, 22),
                type: 'academic',
                description: 'Classes resume after half-term break.',
                time: '9:00 AM',
                location: 'All Classrooms',
                important: false
            },

            // March 2026
            {
                id: 7,
                title: 'Ramadan Begins',
                date: new Date(currentYear, 2, 1),
                type: 'holiday',
                description: 'Start of Ramadan. Special timetable applies.',
                time: 'All Day',
                location: 'Madrassah',
                important: true
            },
            {
                id: 8,
                title: 'Qur\'an Competition',
                date: new Date(currentYear, 2, 15),
                type: 'event',
                description: 'Annual Qur\'an recitation competition finals.',
                time: '10:00 AM - 2:00 PM',
                location: 'Main Hall',
                important: true
            },
            {
                id: 9,
                title: 'Parent-Teacher Meetings',
                date: new Date(currentYear, 2, 20),
                type: 'event',
                description: 'Scheduled meetings to discuss student progress.',
                time: '4:00 PM - 7:00 PM',
                location: 'Classrooms',
                important: false
            },

            // April 2026
            {
                id: 10,
                title: 'Eid al-Fitr Holiday',
                date: new Date(currentYear, 3, 10),
                type: 'holiday',
                description: 'Eid celebrations. Madrassah closed.',
                time: 'All Day',
                location: 'Closed',
                important: true
            },
            {
                id: 11,
                title: 'Spring Term Ends',
                date: new Date(currentYear, 3, 11),
                type: 'academic',
                description: 'End of Spring Term.',
                time: '1:00 PM',
                location: 'All Classrooms',
                important: true
            },
            {
                id: 12,
                title: 'Spring Holidays Start',
                date: new Date(currentYear, 3, 12),
                type: 'holiday',
                description: 'Spring holidays begin.',
                time: 'All Day',
                location: 'Closed',
                important: false
            },
            {
                id: 13,
                title: 'Summer Term Begins',
                date: new Date(currentYear, 3, 28),
                type: 'academic',
                description: 'Start of Summer Term.',
                time: '9:00 AM',
                location: 'All Classrooms',
                important: true
            },

            // May 2026
            {
                id: 14,
                title: 'Final Exams Begin',
                date: new Date(currentYear, 4, 15),
                type: 'exam',
                description: 'Final examinations for the academic year.',
                time: '9:00 AM - 1:00 PM',
                location: 'All Classrooms',
                important: true
            },
            {
                id: 15,
                title: 'Hifdh Graduation Ceremony',
                date: new Date(currentYear, 4, 25),
                type: 'event',
                description: 'Graduation ceremony for Hifdh (Qur\'an memorization) students.',
                time: '5:00 PM - 7:00 PM',
                location: 'Main Hall',
                important: true
            },
            {
                id: 16,
                title: 'Final Exams End',
                date: new Date(currentYear, 4, 29),
                type: 'exam',
                description: 'Last day of final examinations.',
                time: '9:00 AM - 1:00 PM',
                location: 'All Classrooms',
                important: false
            },

            // June 2026
            {
                id: 17,
                title: 'Results Day',
                date: new Date(currentYear, 5, 5),
                type: 'academic',
                description: 'Academic results announced.',
                time: '4:00 PM - 6:00 PM',
                location: 'Classrooms',
                important: true
            },
            {
                id: 18,
                title: 'Summer Holidays Start',
                date: new Date(currentYear, 5, 30),
                type: 'holiday',
                description: 'Summer holidays begin.',
                time: 'All Day',
                location: 'Closed',
                important: true
            },

            // July 2026
            {
                id: 19,
                title: 'Summer Qur\'an Intensive',
                date: new Date(currentYear, 6, 15),
                endDate: new Date(currentYear, 6, 26),
                type: 'event',
                description: 'Two-week intensive Qur\'an program.',
                time: '10:00 AM - 3:00 PM',
                location: 'Classrooms',
                important: false
            },

            // August 2026
            {
                id: 20,
                title: 'Eid al-Adha Holiday',
                date: new Date(currentYear, 7, 20),
                type: 'holiday',
                description: 'Eid al-Adha celebrations.',
                time: 'All Day',
                location: 'Closed',
                important: true
            },

            // September 2026
            {
                id: 21,
                title: 'Autumn Term Begins',
                date: new Date(currentYear, 8, 7),
                type: 'academic',
                description: 'Start of Autumn Term.',
                time: '9:00 AM',
                location: 'All Classrooms',
                important: true
            },

            // October 2026
            {
                id: 22,
                title: 'Mid-Term Break',
                date: new Date(currentYear, 9, 26),
                type: 'holiday',
                description: 'Half-term break.',
                time: 'All Day',
                location: 'Closed',
                important: false
            },

            // November 2026
            {
                id: 23,
                title: 'Islamic History Day',
                date: new Date(currentYear, 10, 15),
                type: 'event',
                description: 'Special activities and workshops on Islamic history.',
                time: '10:00 AM - 2:00 PM',
                location: 'Main Hall',
                important: false
            },

            // December 2026
            {
                id: 24,
                title: 'Winter Holidays Start',
                date: new Date(currentYear, 11, 21),
                type: 'holiday',
                description: 'Winter holidays begin.',
                time: 'All Day',
                location: 'Closed',
                important: true
            },
            {
                id: 25,
                title: 'Autumn Term Ends',
                date: new Date(currentYear, 11, 20),
                type: 'academic',
                description: 'End of Autumn Term.',
                time: '1:00 PM',
                location: 'All Classrooms',
                important: false
            }
        ];
    }

    // Apply filters to events
    applyFilters(filters) {
        this.filteredEvents = this.events.filter(event => {
            return filters[event.type] !== false;
        });
    }

    // Get events for a specific date
    getEventsForDate(date) {
        return this.filteredEvents.filter(event => {
            if (event.startDate && event.endDate) {
                // Handle date range events
                return date >= event.startDate && date <= event.endDate;
            } else {
                // Handle single day events
                return event.date.getDate() === date.getDate() &&
                       event.date.getMonth() === date.getMonth() &&
                       event.date.getFullYear() === date.getFullYear();
            }
        });
    }

    // Get events for a specific month
    getEventsForMonth(month, year) {
        const monthEvents = [];
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        this.filteredEvents.forEach(event => {
            if (event.startDate && event.endDate) {
                // Check if event range overlaps with month
                if (!(event.endDate < firstDay || event.startDate > lastDay)) {
                    monthEvents.push(event);
                }
            } else if (event.date >= firstDay && event.date <= lastDay) {
                monthEvents.push(event);
            }
        });
        
        return monthEvents.sort((a, b) => a.date - b.date);
    }

    // Get upcoming events (next 30 days)
    getUpcomingEvents() {
        const today = new Date();
        const next30Days = new Date(today);
        next30Days.setDate(today.getDate() + 30);
        
        const upcoming = [];
        this.filteredEvents.forEach(event => {
            if (event.date >= today && event.date <= next30Days) {
                upcoming.push(event);
            }
        });
        
        return upcoming.sort((a, b) => a.date - b.date).slice(0, 8);
    }

    // Convert Gregorian to Hijri (simplified approximation)
    getHijriDate(gregorianDate) {
        const gregorianYear = gregorianDate.getFullYear();
        const hijriYear = Math.floor((gregorianYear - 622) * (33/32));
        const hijriMonthIndex = (gregorianDate.getMonth() + Math.floor(Math.random() * 2)) % 12;
        const hijriMonth = this.hijriMonths[hijriMonthIndex];
        const hijriDay = (gregorianDate.getDate() % 29) + 1;
        
        return {
            year: hijriYear,
            month: hijriMonth,
            day: hijriDay,
            formatted: `${hijriDay} ${hijriMonth} ${hijriYear} AH`
        };
    }

    // Format date for display
    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Format time for display
    formatTime(timeString) {
        return timeString || 'All Day';
    }
}

// Calendar UI Manager
class CalendarUI {
    constructor() {
        this.calendar = new CalendarManager();
        this.filters = {
            holiday: true,
            exam: true,
            event: true,
            academic: true
        };
        this.initializeElements();
        this.setupEventListeners();
        this.renderCalendar();
    }

    initializeElements() {
        this.elements = {
            calendarGrid: document.getElementById('calendarGrid'),
            currentMonthYear: document.getElementById('currentMonthYear'),
            hijriDate: document.getElementById('hijriDate'),
            prevMonth: document.getElementById('prevMonth'),
            nextMonth: document.getElementById('nextMonth'),
            today: document.getElementById('today'),
            viewCurrentMonth: document.getElementById('viewCurrentMonth'),
            viewToggles: document.querySelectorAll('.view-toggle'),
            monthView: document.getElementById('monthView'),
            listView: document.getElementById('listView'),
            upcomingView: document.getElementById('upcomingView'),
            eventsList: document.getElementById('eventsList'),
            upcomingEvents: document.getElementById('upcomingEvents'),
            eventModal: new bootstrap.Modal(document.getElementById('eventModal')),
            eventModalLabel: document.getElementById('eventModalLabel'),
            eventTitle: document.getElementById('eventTitle'),
            eventDateBadge: document.getElementById('eventDateBadge'),
            eventTime: document.getElementById('eventTime'),
            eventLocation: document.getElementById('eventLocation'),
            eventType: document.getElementById('eventType'),
            eventDescription: document.getElementById('eventDescription'),
            addToCalendar: document.getElementById('addToCalendar'),
            filterCheckboxes: document.querySelectorAll('.filter-checkbox')
        };
    }

    setupEventListeners() {
        // Navigation
        this.elements.prevMonth.addEventListener('click', () => this.navigateMonth(-1));
        this.elements.nextMonth.addEventListener('click', () => this.navigateMonth(1));
        this.elements.today.addEventListener('click', () => this.goToToday());
        this.elements.viewCurrentMonth.addEventListener('click', () => this.goToToday());

        // View toggles
        this.elements.viewToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
        });

        // Filter checkboxes
        this.elements.filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.filters[e.target.dataset.type] = e.target.checked;
                this.calendar.applyFilters(this.filters);
                this.updateAllViews();
            });
        });

        // Modal actions
        this.elements.addToCalendar.addEventListener('click', () => this.addToGoogleCalendar());
    }

    navigateMonth(direction) {
        this.calendar.currentMonth += direction;
        
        if (this.calendar.currentMonth < 0) {
            this.calendar.currentMonth = 11;
            this.calendar.currentYear--;
        } else if (this.calendar.currentMonth > 11) {
            this.calendar.currentMonth = 0;
            this.calendar.currentYear++;
        }
        
        this.updateAllViews();
    }

    goToToday() {
        this.calendar.currentDate = new Date();
        this.calendar.currentMonth = this.calendar.currentDate.getMonth();
        this.calendar.currentYear = this.calendar.currentDate.getFullYear();
        this.updateAllViews();
        this.switchView('month');
    }

    switchView(view) {
        // Update active button
        this.elements.viewToggles.forEach(toggle => {
            if (toggle.dataset.view === view) {
                toggle.classList.remove('btn-outline-success');
                toggle.classList.add('btn-success');
            } else {
                toggle.classList.remove('btn-success');
                toggle.classList.add('btn-outline-success');
            }
        });

        // Show selected view
        this.elements.monthView.classList.add('d-none');
        this.elements.listView.classList.add('d-none');
        this.elements.upcomingView.classList.add('d-none');

        switch (view) {
            case 'month':
                this.elements.monthView.classList.remove('d-none');
                break;
            case 'list':
                this.elements.listView.classList.remove('d-none');
                this.renderListView();
                break;
            case 'upcoming':
                this.elements.upcomingView.classList.remove('d-none');
                this.renderUpcomingView();
                break;
        }
    }

    updateAllViews() {
        this.renderCalendar();
        if (!this.elements.listView.classList.contains('d-none')) {
            this.renderListView();
        }
        if (!this.elements.upcomingView.classList.contains('d-none')) {
            this.renderUpcomingView();
        }
    }

    renderCalendar() {
        const firstDay = new Date(this.calendar.currentYear, this.calendar.currentMonth, 1);
        const lastDay = new Date(this.calendar.currentYear, this.calendar.currentMonth + 1, 0);
        const startingDay = firstDay.getDay();
        const monthLength = lastDay.getDate();
        
        // Update month/year display
        const monthYear = firstDay.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
        this.elements.currentMonthYear.textContent = monthYear;
        
        // Update Hijri date
        const hijriDate = this.calendar.getHijriDate(firstDay);
        this.elements.hijriDate.textContent = `${hijriDate.month} ${hijriDate.year} AH`;
        
        // Clear calendar grid
        this.elements.calendarGrid.innerHTML = '';
        
        // Add previous month's days
        const prevMonthLastDay = new Date(this.calendar.currentYear, this.calendar.currentMonth, 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            const date = new Date(this.calendar.currentYear, this.calendar.currentMonth - 1, day);
            this.addCalendarDay(date, true);
        }
        
        // Add current month's days
        const today = new Date();
        for (let i = 1; i <= monthLength; i++) {
            const date = new Date(this.calendar.currentYear, this.calendar.currentMonth, i);
            const isToday = date.getDate() === today.getDate() &&
                           date.getMonth() === today.getMonth() &&
                           date.getFullYear() === today.getFullYear();
            this.addCalendarDay(date, false, isToday);
        }
        
        // Add next month's days
        const totalCells = Math.ceil((startingDay + monthLength) / 7) * 7;
        const nextMonthDays = totalCells - (startingDay + monthLength);
        for (let i = 1; i <= nextMonthDays; i++) {
            const date = new Date(this.calendar.currentYear, this.calendar.currentMonth + 1, i);
            this.addCalendarDay(date, true);
        }
    }

    addCalendarDay(date, isOtherMonth, isToday = false) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';

        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }

        if (isToday) {
            dayElement.classList.add('today');
        }

        // Add day number
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        dayElement.appendChild(dayNumber);

        // Add Hijri date
        const hijriDate = this.calendar.getHijriDate(date);
        const hijriElement = document.createElement('div');
        hijriElement.className = 'day-hijri';
        hijriElement.textContent = hijriDate.day;
        dayElement.appendChild(hijriElement);

        // Add events
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'day-events';

        const events = this.calendar.getEventsForDate(date);
        const isMobile = window.innerWidth < 768;

        // For mobile: show only colored dots
        if (isMobile && events.length > 0) {
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'mobile-dots';
            dotsContainer.style.display = 'flex';
            dotsContainer.style.gap = '2px';
            dotsContainer.style.position = 'absolute';
            dotsContainer.style.bottom = '5px';
            dotsContainer.style.left = '5px';

            // Limit to max 3 dots on mobile
            events.slice(0, 3).forEach(event => {
                const dot = document.createElement('span');
                dot.className = `event-indicator ${event.type}`;
                dot.style.width = '8px';
                dot.style.height = '8px';
                dot.style.borderRadius = '50%';
                dot.style.display = 'inline-block';
                dotsContainer.appendChild(dot);
            });

            dayElement.appendChild(dotsContainer);
        }
        // For desktop/tablet: show event text
        else if (!isMobile) {
            const maxEvents = 3; // Show max 3 event texts on desktop

            events.slice(0, maxEvents).forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = `event-item ${event.type}`;
                eventElement.innerHTML = `
                    <span class="event-indicator ${event.type}"></span>
                    ${event.title}
                `;
                eventElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showEventModal(event);
                });
                eventsContainer.appendChild(eventElement);
            });

            // Add "more events" indicator if needed (desktop only)
            if (events.length > maxEvents) {
                const moreElement = document.createElement('div');
                moreElement.className = 'event-item';
                moreElement.textContent = `+${events.length - maxEvents} more`;
                moreElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showDayEvents(date, events);
                });
                eventsContainer.appendChild(moreElement);
            }
        }

        // Only append eventsContainer if we have content (for desktop)
        if (!isMobile && events.length > 0) {
            dayElement.appendChild(eventsContainer);
        }

        // Add click handler for day (works for both mobile and desktop)
        dayElement.addEventListener('click', () => {
            if (events.length > 0) {
                this.showDayEvents(date, events);
            }
        });

        this.elements.calendarGrid.appendChild(dayElement);
    }

    renderListView() {
        const monthEvents = this.calendar.getEventsForMonth(
            this.calendar.currentMonth,
            this.calendar.currentYear
        );
        
        this.elements.eventsList.innerHTML = '';
        
        if (monthEvents.length === 0) {
            this.elements.eventsList.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-calendar-x display-1 text-muted mb-3"></i>
                    <h5 class="text-muted">No events found for this month</h5>
                    <p class="text-muted">Try adjusting your filters</p>
                </div>
            `;
            return;
        }
        
        monthEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'list-event';
            eventElement.innerHTML = `
                <div class="list-event-header">
                    <div class="list-event-date">
                        <i class="bi bi-calendar-event me-1"></i>
                        ${this.calendar.formatDate(event.date)}
                    </div>
                    <span class="badge bg-${this.getEventTypeColor(event.type)}">
                        ${event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </span>
                </div>
                <h5 class="list-event-title">${event.title}</h5>
                <p class="list-event-description">${event.description}</p>
                <div class="list-event-meta">
                    <span><i class="bi bi-clock me-1"></i>${this.calendar.formatTime(event.time)}</span>
                    <span><i class="bi bi-geo-alt me-1"></i>${event.location}</span>
                </div>
            `;
            
            eventElement.addEventListener('click', () => this.showEventModal(event));
            this.elements.eventsList.appendChild(eventElement);
        });
    }

    renderUpcomingView() {
        const upcomingEvents = this.calendar.getUpcomingEvents();
        
        this.elements.upcomingEvents.innerHTML = '';
        
        if (upcomingEvents.length === 0) {
            this.elements.upcomingEvents.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-calendar-x display-1 text-muted mb-3"></i>
                    <h5 class="text-muted">No upcoming events</h5>
                    <p class="text-muted">Try adjusting your filters</p>
                </div>
            `;
            return;
        }
        
        upcomingEvents.forEach(event => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-3';
            col.innerHTML = `
                <div class="upcoming-event-card">
                    <div class="upcoming-event-header">
                        <div class="upcoming-event-date">
                            ${event.date.toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                            })}
                        </div>
                        <span class="upcoming-event-type">
                            ${event.type}
                        </span>
                    </div>
                    <h5 class="upcoming-event-title">${event.title}</h5>
                    <p class="upcoming-event-description">${event.description}</p>
                    <div class="upcoming-event-meta">
                        <span><i class="bi bi-clock me-1"></i>${this.calendar.formatTime(event.time)}</span>
                    </div>
                </div>
            `;
            
            col.querySelector('.upcoming-event-card').addEventListener('click', 
                () => this.showEventModal(event)
            );
            
            this.elements.upcomingEvents.appendChild(col);
        });
    }

    showEventModal(event) {
        this.elements.eventTitle.textContent = event.title;
        this.elements.eventModalLabel.textContent = event.title;
        this.elements.eventDateBadge.innerHTML = `
            <i class="bi bi-calendar-event me-1"></i>
            ${this.calendar.formatDate(event.date)}
        `;
        this.elements.eventTime.textContent = this.calendar.formatTime(event.time);
        this.elements.eventLocation.textContent = event.location;
        this.elements.eventType.textContent = event.type.charAt(0).toUpperCase() + event.type.slice(1);
        this.elements.eventDescription.textContent = event.description;
        
        // Store current event for add to calendar function
        this.currentEvent = event;
        
        this.elements.eventModal.show();
    }

    showDayEvents(date, events) {
        // Create a custom modal for day events
        const modalHtml = `
            <div class="modal fade" id="dayEventsModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi bi-calendar-day me-2"></i>
                                ${this.calendar.formatDate(date)}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="events-list">
                                ${events.map(event => `
                                    <div class="list-event" style="cursor: pointer;">
                                        <div class="list-event-header">
                                            <h6 class="mb-0">${event.title}</h6>
                                            <span class="badge bg-${this.getEventTypeColor(event.type)}">
                                                ${event.type}
                                            </span>
                                        </div>
                                        <p class="mb-1 text-muted">${event.description}</p>
                                        <small class="text-muted">
                                            <i class="bi bi-clock me-1"></i>${this.calendar.formatTime(event.time)} |
                                            <i class="bi bi-geo-alt ms-2 me-1"></i>${event.location}
                                        </small>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if present
        const existingModal = document.getElementById('dayEventsModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('dayEventsModal'));
        modal.show();
        
        // Add click handlers to events in the modal
        setTimeout(() => {
            document.querySelectorAll('#dayEventsModal .list-event').forEach((element, index) => {
                element.addEventListener('click', () => {
                    modal.hide();
                    this.showEventModal(events[index]);
                });
            });
        }, 100);
    }

    getEventTypeColor(type) {
        const colors = {
            holiday: 'danger',
            exam: 'warning',
            event: 'primary',
            academic: 'success',
            important: 'purple'
        };
        return colors[type] || 'secondary';
    }

    addToGoogleCalendar() {
        if (!this.currentEvent) return;
        
        const event = this.currentEvent;
        const startDate = event.date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endDate = new Date(event.date.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
        const endDateStr = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDateStr}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
        
        window.open(googleCalendarUrl, '_blank');
    }
}

// Initialize calendar when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.calendarUI = new CalendarUI();
});