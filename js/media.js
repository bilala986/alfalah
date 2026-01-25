// Media Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add animation to the in-progress icon
    const progressIcon = document.querySelector('.media-in-progress-icon');
    if (progressIcon) {
        setInterval(() => {
            progressIcon.style.transform = 'scale(1.05)';
            setTimeout(() => {
                progressIcon.style.transform = 'scale(1)';
            }, 300);
        }, 2000);
    }

    // Button hover effect
    const watchButton = document.querySelector('.btn-success-modern');
    if (watchButton) {
        watchButton.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        watchButton.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    }
});

// Add CSS for additional animations
const style = document.createElement('style');
style.textContent = `
    .media-in-progress-card {
        transition: all 0.3s ease;
    }
    
    .media-in-progress-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    }
    
    .media-in-progress-icon {
        transition: transform 0.3s ease;
    }
    
    .btn-success-modern {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);