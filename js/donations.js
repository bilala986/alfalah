// Donations Page JavaScript
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

    // Add copy to clipboard functionality for bank details
    const bankInfoItems = document.querySelectorAll('.bank-info-item');
    bankInfoItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function() {
            const value = this.querySelector('.bank-info-value').textContent;
            navigator.clipboard.writeText(value).then(() => {
                // Show temporary feedback
                const originalHTML = this.innerHTML;
                this.innerHTML = '<div class="text-success"><i class="bi bi-check-circle-fill me-2"></i>Copied!</div>';
                
                setTimeout(() => {
                    this.innerHTML = originalHTML;
                }, 2000);
            });
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
    document.querySelectorAll('.impact-card, .bank-details-card, .donation-method-card, .hadith-card').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // Simulate donation button clicks
    document.querySelectorAll('.btn-success, .btn-outline-success').forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.textContent.includes('Donation') || this.textContent.includes('Zakat')) {
                e.preventDefault();
                
                // Show loading state
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="bi bi-arrow-repeat spinner"></i> Processing...';
                this.disabled = true;
                
                // Simulate processing
                setTimeout(() => {
                    alert('Thank you for your generosity! You will be redirected to our secure payment portal.');
                    this.innerHTML = originalText;
                    this.disabled = false;
                }, 1500);
            }
        });
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
    
    .spinner {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .bank-info-item {
        transition: background-color 0.3s ease;
    }
    
    .bank-info-item:hover {
        background-color: rgba(25, 135, 84, 0.05);
        border-radius: 0.5rem;
    }
`;
document.head.appendChild(style);