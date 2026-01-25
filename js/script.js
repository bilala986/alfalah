// Programs Tab Functionality
function initProgramTabs() {
    const tabButtons = document.querySelectorAll('.program-tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding tab pane
            const tabId = button.getAttribute('data-tab');
            const targetPane = document.getElementById(tabId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

// Add this function to handle active states in dropdowns
function initDropdownActiveStates() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop();
    
    // Remove active class from all nav links first
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active', 'fw-bold');
    });
    
    // Remove active class from all dropdown items
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to current page
    const currentLink = document.querySelector(`.nav-link[href="${currentPage}"], .nav-link[href="./${currentPage}"]`);
    if (currentLink) {
        currentLink.classList.add('active', 'fw-bold');
        
        // If it's a dropdown item, also activate the parent dropdown
        if (currentLink.classList.contains('dropdown-item')) {
            const dropdownToggle = currentLink.closest('.dropdown').querySelector('.dropdown-toggle');
            if (dropdownToggle) {
                dropdownToggle.classList.add('active', 'fw-bold');
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize program tabs
    initProgramTabs();
    
    // Initialize dropdown active states
    initDropdownActiveStates();
    
    const rows = document.querySelectorAll('.mission-row');
    const bar = document.getElementById('mission-bar');
    const barContainer = document.querySelector('#mission-bar-bg');
    const section = document.getElementById('mission');

    // Only initialize progress bar features on desktop
    if (window.innerWidth > 768) {
        // Animate mission rows on scroll
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('animate');
            });
        }, { threshold: 0.2 });
        rows.forEach(row => observer.observe(row));

        // Create tick markers inside the progress bar
        const ticks = [];
        rows.forEach((row, index) => {
            const icon = row.querySelector('.rounded-circle');
            const tick = document.createElement('div');
            tick.classList.add('mission-tick');
            
            // Calculate tick position relative to the progress bar container
            const iconRect = icon.getBoundingClientRect();
            const barContainerRect = barContainer.getBoundingClientRect();
            const sectionRect = section.getBoundingClientRect();
            
            // Position tick relative to the icon's vertical center, aligned with progress bar
            const topPos = iconRect.top + iconRect.height / 2 - barContainerRect.top - 7; // 7px is half of tick height
            
            tick.style.top = `${topPos}px`;
            barContainer.appendChild(tick);
            ticks.push({ el: tick, top: topPos, icon: icon });
        });

        window.addEventListener('scroll', () => {
            const sectionRect = section.getBoundingClientRect();
            const sectionHeight = section.offsetHeight;
            const viewportHeight = window.innerHeight;

            // How much the section has entered the viewport
            const scrollProgress = Math.min(
                Math.max((viewportHeight - sectionRect.top) / (sectionHeight + viewportHeight / 2), 0),
                1
            );

            // Limit bar fill to its own height
            const maxBarHeight = barContainer.offsetHeight;
            const barHeight = scrollProgress * maxBarHeight;
            bar.style.height = `${barHeight}px`;

            // Activate ticks and circles
            ticks.forEach(({ el, top, icon }) => {
                if (barHeight >= top) {
                    el.classList.add('active');
                    el.innerHTML = '✔';
                    icon.classList.add('filled');
                } else {
                    el.classList.remove('active');
                    el.innerHTML = '';
                    icon.classList.remove('filled');
                }
            });
        });

        // Recalculate positions on resize
        window.addEventListener('resize', () => {
            ticks.forEach(({ el, icon }) => {
                const iconRect = icon.getBoundingClientRect();
                const barContainerRect = barContainer.getBoundingClientRect();
                const topPos = iconRect.top + iconRect.height / 2 - barContainerRect.top - 7;
                el.style.top = `${topPos}px`;
            });
        });
    } else {
        // Mobile: Just animate the rows without progress bar
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('animate');
            });
        }, { threshold: 0.2 });
        rows.forEach(row => observer.observe(row));
    }
});