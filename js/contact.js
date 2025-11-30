// Auto-expanding textarea
function initAutoExpandTextarea() {
    const textareas = document.querySelectorAll('.auto-expand');
    
    textareas.forEach(textarea => {
        // Set initial height based on min-height
        const computedStyle = window.getComputedStyle(textarea);
        const minHeight = parseInt(computedStyle.minHeight) || 200;
        textarea.style.height = minHeight + 'px';
        
        // Auto-expand on input
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            const newHeight = Math.max(this.scrollHeight, minHeight);
            this.style.height = newHeight + 'px';
        });
        
        // Also expand on focus for better UX
        textarea.addEventListener('focus', function() {
            this.style.height = 'auto';
            const newHeight = Math.max(this.scrollHeight, minHeight);
            this.style.height = newHeight + 'px';
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
            textarea.style.height = 'auto';
            const newHeight = Math.max(textarea.scrollHeight, minHeight);
            textarea.style.height = newHeight + 'px';
        });
    });
}

// Contact Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize auto-expanding textarea
    initAutoExpandTextarea();
    
    // Directions button click handler
    const directionsBtn = document.getElementById('directions-btn');
    if (directionsBtn) {
        directionsBtn.addEventListener('click', function(e) {
            // You can add any pre-click functionality here
            console.log('Directions button clicked');
            // The actual Google Maps link will be added to the href attribute
        });
    }
    
    // Add smooth scrolling for any anchor links
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
    
    // Add loading state to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function() {
            // Add loading spinner for any async operations
            if (this.classList.contains('async-action')) {
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="bi bi-arrow-repeat spinner"></i> Loading...';
                this.disabled = true;
                
                // Reset after 2 seconds (for demo)
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.disabled = false;
                }, 2000);
            }
        });
    });
    
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
    document.querySelectorAll('.contact-details-card, .map-card, .connect-card').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
});

// Add CSS for fade-in animations
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
    
    .spinner {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);