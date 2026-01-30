// About Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    
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