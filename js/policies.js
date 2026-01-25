// Policies Page JavaScript
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
                
                // Update active state in navigation
                document.querySelectorAll('.policy-nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });

    // Update active nav link based on scroll position
    const policySections = document.querySelectorAll('.policy-section');
    const navLinks = document.querySelectorAll('.policy-nav-link');
    
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '-100px 0px -100px 0px'
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    policySections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Add hover effect to policy cards
    const policyCards = document.querySelectorAll('.policy-card');
    policyCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Add CSS for additional animations
const style = document.createElement('style');
style.textContent = `
    .policy-card {
        transition: all 0.3s ease;
    }
    
    .policy-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
    }
    
    .policy-nav-link {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);