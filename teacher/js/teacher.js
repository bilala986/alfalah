document.addEventListener("DOMContentLoaded", () => {

    const sidebar = document.getElementById("sidebar");
    const openBtn = document.getElementById("openSidebar");
    const closeBtn = document.getElementById("closeSidebar");

    openBtn.addEventListener("click", () => {
        sidebar.classList.add("show");
    });

    closeBtn.addEventListener("click", () => {
        sidebar.classList.remove("show");
    });

});
