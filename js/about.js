// About Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // DROPDOWN ACTIVE STATE HANDLING
    // ============================================
    
    const dropdownToggle = document.querySelector('.navbar-custom .dropdown-toggle');
    const aboutLink = document.querySelector('.dropdown-item.active');
    
    if (aboutLink && dropdownToggle) {
        // Add show class to parent dropdown when About is active
        const dropdown = dropdownToggle.closest('.dropdown');
        dropdown.classList.add('show');
        
        // Also set aria-expanded to true
        dropdownToggle.setAttribute('aria-expanded', 'true');
        
        // Force dropdown menu to show (for mobile/tablet)
        const dropdownMenu = dropdown.querySelector('.dropdown-menu');
        if (dropdownMenu) {
            dropdownMenu.classList.add('show');
        }
    }
    
    // Add CSS for dropdown active styling
    const dropdownStyle = document.createElement('style');
    dropdownStyle.textContent = `
        /* Style for active dropdown item */
        .navbar-custom .dropdown-item.active {
            background-color: #003900 !important;
            color: white !important;
            border-left: 3px solid #28a745;
        }
        
        /* Add underline to "Our Madrassah" when About is active */
        .navbar-custom .dropdown.show .dropdown-toggle {
            position: relative;
        }
        
        .navbar-custom .dropdown.show .dropdown-toggle::after {
            content: "";
            position: absolute;
            left: 50%;
            bottom: 0;
            width: 90%;
            height: 3px;
            background-color: #003900;
            transform: translateX(-50%);
            animation: slideIn 0.3s ease-out;
            border-radius: 2px;
        }
        
        /* Make the underline slightly longer than regular links */
        .navbar-custom .dropdown.show .dropdown-toggle::after {
            width: 90% !important;
        }
        
        @keyframes slideIn {
            from {
                width: 0;
                opacity: 0;
            }
            to {
                width: 90%;
                opacity: 1;
            }
        }
        
        /* Style for dropdown when About is active - for desktop */
        @media (min-width: 992px) {
            .navbar-custom .dropdown.show .dropdown-menu {
                display: block;
                animation: rollDown 0.3s ease-out;
            }
            
            .navbar-custom .dropdown.show .dropdown-toggle {
                background-color: rgba(0, 57, 0, 0.1);
                color: #003900 !important;
                font-weight: 700 !important;
            }
        }
        
        @keyframes rollDown {
            0% {
                opacity: 0;
                transform: translateY(-15px) scaleY(0.8);
                transform-origin: top;
            }
            100% {
                opacity: 1;
                transform: translateY(0) scaleY(1);
                transform-origin: top;
            }
        }
    `;
    document.head.appendChild(dropdownStyle);
    
    // ============================================
    // FADE-IN ANIMATIONS FOR PAGE CONTENT
    // ============================================
    
    // Add intersection observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
            }
        });
    }, observerOptions);
    
    // Observe elements for fade-in animation
    const elementsToAnimate = [
        '.stats-section .card',
        '.vision-card',
        '.mission-card',
        '.approach-card',
        '.team-card',
        '.vision-content',
        '.mission-content',
        '.history-section .col-lg-6',
        '.history-img'
    ];
    
    elementsToAnimate.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.add('fade-in');
            observer.observe(el);
        });
    });
    
    // Add special animation for stats cards with staggered delay
    document.querySelectorAll('.stats-section .card').forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });
    
    // ============================================
    // ADDITIONAL INTERACTIVITY
    // ============================================
    
    // Add hover effects for vision and mission cards
    const visionMissionCards = document.querySelectorAll('.vision-card, .mission-card');
    visionMissionCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add animation for separator icon
    const separatorIcon = document.querySelector('.separator-icon');
    if (separatorIcon) {
        separatorIcon.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) rotate(10deg)';
        });
        
        separatorIcon.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    }
    
    // ============================================
    // CSS FOR ANIMATIONS
    // ============================================
    
    const style = document.createElement('style');
    style.textContent = `
        .fade-in {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .fade-in-visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* Smooth transitions for cards */
        .vision-card, .mission-card {
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        /* Smooth hover for approach cards */
        .approach-card {
            transition: all 0.3s ease;
        }
        
        .approach-card:hover {
            transform: translateY(-5px);
        }
        
        /* Smooth image hover */
        .image-wrapper img {
            transition: transform 0.5s ease;
        }
        
        /* Stat card animations */
        .vision-stat-card, .mission-stat-card {
            transition: all 0.3s ease;
        }
        
        .vision-stat-card:hover, .mission-stat-card:hover {
            transform: translateY(-5px) scale(1.05);
        }
        
        /* Feature item hover effects */
        .feature-item {
            transition: all 0.2s ease;
        }
    `;
    document.head.appendChild(style);
});