// navbar.js - Unified Navbar Active State Handling
document.addEventListener('DOMContentLoaded', function() {
    // Function to set active state
    function setActiveNavState() {
        // Get current page path
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        
        // Remove active classes from all nav items
        document.querySelectorAll('.nav-link, .dropdown-item').forEach(item => {
            item.classList.remove('active', 'fw-bold');
        });
        
        // Find and activate the current page link
        const currentLink = document.querySelector(`.nav-link[href*="${currentPage}"], .dropdown-item[href*="${currentPage}"]`);
        
        if (currentLink) {
            currentLink.classList.add('active');
            
            // If it's a dropdown item, also activate the parent dropdown
            if (currentLink.classList.contains('dropdown-item')) {
                const dropdownToggle = currentLink.closest('.dropdown').querySelector('.dropdown-toggle');
                if (dropdownToggle) {
                    dropdownToggle.classList.add('active', 'fw-bold');
                    
                    // Open dropdown menu
                    const dropdown = currentLink.closest('.dropdown');
                    dropdown.classList.add('show');
                    dropdownToggle.setAttribute('aria-expanded', 'true');
                    
                    // Force dropdown menu to show
                    const dropdownMenu = dropdown.querySelector('.dropdown-menu');
                    if (dropdownMenu) {
                        dropdownMenu.classList.add('show');
                    }
                }
            } else {
                // It's a regular nav link
                currentLink.classList.add('active', 'fw-bold');
            }
        }
    }
    
    // Initialize
    setActiveNavState();
});