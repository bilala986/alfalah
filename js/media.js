// Media Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize media tabs (using program-tab-btn style)
    initMediaTabs();
    
    // Initialize Fancybox for image lightbox
    initFancybox();
    
    // Initialize newsletter form
    initNewsletterForm();
    
    // Initialize active state for navigation
    initActiveState();
});

// Media Page Tab Functionality (using same function as programs)
function initMediaTabs() {
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

// Fancybox Initialization for Image Lightbox
function initFancybox() {
    if (typeof Fancybox !== 'undefined') {
        Fancybox.bind("[data-fancybox]", {
            Thumbs: {
                type: "modern",
            },
            Toolbar: {
                display: {
                    left: [],
                    middle: [],
                    right: ["close"],
                },
            },
        });
    }
}

// Newsletter Form Functionality
function initNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = this.querySelector('input[type="email"]');
        const submitBtn = this.querySelector('button[type="submit"]');
        
        if (!emailInput.value) {
            showAlert('Please enter your email address.', 'error');
            return;
        }
        
        if (!isValidEmail(emailInput.value)) {
            showAlert('Please enter a valid email address.', 'error');
            return;
        }
        
        // Show loading state
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bi bi-arrow-clockwise me-2"></i>Subscribing...';
        
        // Simulate API call
        setTimeout(() => {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            
            // Show success message
            showAlert('Successfully subscribed to our newsletter!', 'success');
            
            // Clear input
            emailInput.value = '';
        }, 1500);
    });
    
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    function showAlert(message, type) {
        // Remove existing alerts
        const existingAlert = document.querySelector('.newsletter-alert');
        if (existingAlert) existingAlert.remove();
        
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `newsletter-alert alert alert-${type === 'success' ? 'success' : 'danger'} mt-3`;
        alertDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'} me-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Style the alert
        alertDiv.style.borderRadius = '50px';
        alertDiv.style.padding = '0.75rem 1.5rem';
        alertDiv.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        
        // Add to form
        const form = document.querySelector('.newsletter-form');
        form.appendChild(alertDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            alertDiv.style.transition = 'opacity 0.5s ease';
            alertDiv.style.opacity = '0';
            setTimeout(() => alertDiv.remove(), 500);
        }, 5000);
    }
}

// Initialize active state for navigation
function initActiveState() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop();
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active', 'fw-bold');
    });
    
    // Add active class to current page
    const mediaLink = document.querySelector('.nav-link[href="media"]');
    if (mediaLink) {
        mediaLink.classList.add('active', 'fw-bold');
    }
}