// About Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
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
    document.querySelectorAll('.stats-section .card, .vision-card, .mission-card, .approach-card, .team-card').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    // Add to the existing observer in about.js
    document.querySelectorAll('.vision-content, .mission-content').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
});

// Add CSS for animations
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
`;
document.head.appendChild(style);