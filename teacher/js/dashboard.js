// teacher/js/dashboard.js - UPDATED SIDEBAR FUNCTIONALITY

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const content = document.getElementById("content");
    const openSidebarBtn = document.getElementById("openSidebar");
    const closeSidebarBtn = document.getElementById("closeSidebar");

    // Debug logging to verify elements exist
    console.log("Dashboard JS loaded - Teacher");
    console.log("Sidebar:", sidebar);
    console.log("Open button:", openSidebarBtn);
    console.log("Close button:", closeSidebarBtn);

    function isMobile() {
        return window.innerWidth <= 768;
    }

    // Open sidebar
    openSidebarBtn.addEventListener("click", () => {
        console.log("Open sidebar clicked");
        sidebar.classList.add("show");

        if (!isMobile()) {
            content.classList.add("shift");
        }

        openSidebarBtn.style.display = "none";
    });

    // Close sidebar
    closeSidebarBtn.addEventListener("click", () => {
        console.log("Close sidebar clicked");
        sidebar.classList.remove("show");

        if (!isMobile()) {
            content.classList.remove("shift");
        }

        openSidebarBtn.style.display = "block";
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (e) => {
        if (isMobile() && sidebar.classList.contains('show')) {
            const isClickInsideSidebar = sidebar.contains(e.target);
            const isClickOnOpenBtn = openSidebarBtn.contains(e.target);
            
            if (!isClickInsideSidebar && !isClickOnOpenBtn) {
                console.log("Click outside - closing sidebar");
                sidebar.classList.remove("show");
                openSidebarBtn.style.display = "block";
            }
        }
    });

    // Handle window resize
    window.addEventListener("resize", () => {
        console.log("Window resized - mobile:", isMobile());
        if (!isMobile() && sidebar.classList.contains('show')) {
            content.classList.add("shift");
        } else if (isMobile() && sidebar.classList.contains('show')) {
            content.classList.remove("shift");
        }
        
        // Always show open button on mobile when sidebar is closed
        if (isMobile() && !sidebar.classList.contains('show')) {
            openSidebarBtn.style.display = "block";
        }
    });

    // Session validation for AJAX requests
    function validateSession() {
        const currentSessionId = sessionStorage.getItem('teacher_current_session_id');
        const urlParams = new URLSearchParams(window.location.search);
        const urlSessionId = urlParams.get('bid');

        if (currentSessionId && urlSessionId && currentSessionId !== urlSessionId) {
            // Session inconsistency detected
            sessionStorage.removeItem('teacher_current_session_id');
            sessionStorage.removeItem('teacher_browser_instance_id');
            window.location.href = 'login.php';
            return false;
        }
        return true;
    }

    // Enhanced fetch with session validation
    function secureFetch(url, options = {}) {
        if (!validateSession()) {
            return Promise.reject(new Error('Session validation failed'));
        }

        // Add browser instance ID to all requests
        const urlParams = new URLSearchParams(window.location.search);
        const bid = urlParams.get('bid');
        
        let finalUrl = url;
        if (bid && !url.includes('?')) {
            finalUrl += '?bid=' + encodeURIComponent(bid);
        } else if (bid) {
            finalUrl += '&bid=' + encodeURIComponent(bid);
        }

        return fetch(finalUrl, options);
    }

    // Global secure fetch for teacher dashboard
    window.teacherSecureFetch = secureFetch;

    // Auto-logout timer (optional - shows warning before session expires)
    let inactivityTimer;
    const SESSION_WARNING_TIME = 50 * 60 * 1000; // 50 minutes
    const SESSION_EXPIRE_TIME = 60 * 60 * 1000; // 60 minutes

    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            // Show session expiry warning 10 minutes before actual expiry
            showSessionWarning();
        }, SESSION_WARNING_TIME);
    }

    function showSessionWarning() {
        // Create a modal or alert warning about session expiry
        const warningDiv = document.createElement('div');
        warningDiv.className = 'alert alert-warning alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
        warningDiv.style.zIndex = '9999';
        warningDiv.innerHTML = `
            <i class="bi bi-clock me-2"></i>
            <strong>Session Expiring Soon</strong> - Your session will expire in 10 minutes. Please save your work.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.appendChild(warningDiv);

        // Set final logout timer
        setTimeout(() => {
            window.location.href = 'php/logout.php?bid=' + (new URLSearchParams(window.location.search).get('bid') || '');
        }, SESSION_EXPIRE_TIME - SESSION_WARNING_TIME);
    }

    // Reset timer on user activity
    ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetInactivityTimer, { passive: true });
    });

    // Start the inactivity timer
    resetInactivityTimer();

    // Handle browser/tab close
    window.addEventListener('beforeunload', (e) => {
        // Optional: Add any cleanup logic here
    });

    // Check for pending approval status
    function checkApprovalStatus() {
        const urlParams = new URLSearchParams(window.location.search);
        const bid = urlParams.get('bid');
        
        if (bid) {
            secureFetch('php/teacher_protect.php?bid=' + bid)
                .then(response => response.json())
                .then(data => {
                    if (data.requires_login) {
                        window.location.href = 'login.php?bid=' + bid;
                    }
                })
                .catch(error => {
                    console.error('Session check failed:', error);
                });
        }
    }

    // Check session status every 5 minutes
    setInterval(checkApprovalStatus, 5 * 60 * 1000);

    // Initialize sidebar state
    console.log("Initial sidebar state - mobile:", isMobile());
    if (!isMobile()) {
        // On desktop, you might want the sidebar open by default
        // Remove this if you want it closed by default
        // sidebar.classList.add("show");
        // content.classList.add("shift");
    }
});