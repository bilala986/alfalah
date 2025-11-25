// teacher/js/dashboard.js
document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const content = document.getElementById("content");
    const openSidebarBtn = document.getElementById("openSidebar");
    const closeSidebarBtn = document.getElementById("closeSidebar");

    // Toggle sidebar
    function toggleSidebar() {
        sidebar.classList.toggle("active");
        content.classList.toggle("shifted");
    }

    // Event listeners
    openSidebarBtn.addEventListener("click", toggleSidebar);
    closeSidebarBtn.addEventListener("click", toggleSidebar);

    // Close sidebar when clicking on content (on mobile)
    content.addEventListener("click", () => {
        if (window.innerWidth <= 768 && sidebar.classList.contains("active")) {
            toggleSidebar();
        }
    });

    // Session validation
    function validateSession() {
        const currentSessionId = sessionStorage.getItem('teacher_current_session_id');
        const urlParams = new URLSearchParams(window.location.search);
        const urlSessionId = urlParams.get('bid');

        if (currentSessionId && urlSessionId && currentSessionId !== urlSessionId) {
            sessionStorage.removeItem('teacher_current_session_id');
            sessionStorage.removeItem('teacher_browser_instance_id');
            window.location.href = 'login.php';
            return false;
        }
        return true;
    }

    validateSession();

    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
});