// parent/js/dashboard.js - SMOOTH SIDEBAR FUNCTIONALITY

const sidebar = document.getElementById("sidebar");
const content = document.getElementById("content");
const openBtn = document.getElementById("openSidebar");
const closeBtn = document.getElementById("closeSidebar");

function isMobile() {
    return window.innerWidth <= 768;
}

// Open sidebar
openBtn.onclick = function () {
    sidebar.classList.add("show");

    if (!isMobile()) {
        content.classList.add("shift");
    }

    openBtn.style.display = "none";
};

// Close sidebar
closeBtn.onclick = function () {
    sidebar.classList.remove("show");

    if (!isMobile()) {
        content.classList.remove("shift");
    }

    openBtn.style.display = "block";
};

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(event) {
    if (isMobile() && sidebar.classList.contains('show')) {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnOpenBtn = openBtn.contains(event.target);
        
        if (!isClickInsideSidebar && !isClickOnOpenBtn) {
            sidebar.classList.remove("show");
            openBtn.style.display = "block";
        }
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    if (!isMobile() && sidebar.classList.contains('show')) {
        content.classList.add("shift");
    } else if (isMobile() && sidebar.classList.contains('show')) {
        content.classList.remove("shift");
    }
});