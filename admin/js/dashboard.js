const sidebar = document.getElementById("sidebar");
const content = document.getElementById("content");
const openBtn = document.getElementById("openSidebar");
const closeBtn = document.getElementById("closeSidebar");

function isMobile() {
    return window.innerWidth <= 768;
}

openBtn.onclick = function () {
    sidebar.classList.add("show");

    if (!isMobile()) {
        content.classList.add("shift");
    }

    openBtn.style.display = "none";
};

closeBtn.onclick = function () {
    sidebar.classList.remove("show");

    if (!isMobile()) {
        content.classList.remove("shift");
    }

    openBtn.style.display = "block";
};
