// Media Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize media tabs
    initMediaTabs();
    
    // Initialize Fancybox for image lightbox
    initFancybox();
    
    // Initialize load more button
    initLoadMore();
    
    // Initialize newsletter form
    initNewsletterForm();
    
    // Initialize active state for navigation
    initActiveState();
});

// Add this at the end of your initMediaTabs() function:
function initMediaTabs() {
    const tabButtons = document.querySelectorAll('.media-tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                // Remove inline white color from all buttons
                btn.style.color = ''; // Keep this to clear inline styles
                const span = btn.querySelector('span');
                const icon = btn.querySelector('i');
                if (span) span.style.color = '';
                if (icon) icon.style.color = '';
            });
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding tab pane WITHOUT scrolling
            const tabId = button.getAttribute('data-tab');
            const targetPane = document.getElementById(tabId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

// Fancybox Initialization
function initFancybox() {
    Fancybox.bind("[data-fancybox]", {
        // Custom options
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

// Load More Button Functionality
function initLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;
    
    let currentTab = 'videos';
    let loadedItems = {
        videos: 6,
        images: 9
    };
    const totalItems = {
        videos: 12,
        images: 18
    };
    
    // Update current tab when switching tabs
    document.querySelectorAll('.media-tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            currentTab = button.getAttribute('data-tab');
            updateLoadMoreButton();
        });
    });
    
    function updateLoadMoreButton() {
        if (loadedItems[currentTab] >= totalItems[currentTab]) {
            loadMoreBtn.disabled = true;
            loadMoreBtn.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>All Content Loaded';
        } else {
            loadMoreBtn.disabled = false;
            loadMoreBtn.innerHTML = '<i class="bi bi-plus-circle-fill me-2"></i>Load More';
        }
    }
    
    loadMoreBtn.addEventListener('click', function() {
        // Show loading state
        const originalText = loadMoreBtn.innerHTML;
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = '<i class="bi bi-arrow-clockwise me-2"></i>Loading...';
        
        // Simulate loading delay
        setTimeout(() => {
            // Add more items based on current tab
            if (currentTab === 'videos') {
                loadedItems.videos += 3;
                addVideoItems();
            } else {
                loadedItems.images += 3;
                addImageItems();
            }
            
            // Update button state
            updateLoadMoreButton();
            
            // Restore button text
            if (!loadMoreBtn.disabled) {
                loadMoreBtn.innerHTML = originalText;
            }
            
            // Re-initialize Fancybox for new images
            initFancybox();
        }, 800);
    });
    
    function addVideoItems() {
        const videoGrid = document.querySelector('#videos .row');
        
        // Sample video data
        const videoData = [
            {
                title: "Islamic Art Workshop",
                description: "Students explore their creativity through Islamic art and calligraphy sessions.",
                duration: "07:45",
                date: "July 2024"
            },
            {
                title: "Ramadan Special Program",
                description: "Special activities and lessons during the blessed month of Ramadan.",
                duration: "10:22",
                date: "June 2024"
            },
            {
                title: "Summer Quran Camp",
                description: "Fun and educational summer camp focused on Quran memorization.",
                duration: "13:15",
                date: "May 2024"
            }
        ];
        
        // Add new video items
        videoData.forEach(video => {
            const col = document.createElement('div');
            col.className = 'col-lg-4 col-md-6';
            col.innerHTML = `
                <div class="video-card">
                    <div class="video-thumbnail">
                        <div class="ratio ratio-16x9">
                            <iframe src="https://www.youtube.com/embed/luxI78vgkR4?rel=0" 
                                    title="${video.title}" 
                                    allowfullscreen
                                    style="border: none;"></iframe>
                        </div>
                        <div class="video-overlay">
                            <i class="bi bi-play-circle-fill"></i>
                        </div>
                    </div>
                    <div class="video-content">
                        <h4 class="video-title">${video.title}</h4>
                        <p class="video-description">${video.description}</p>
                        <div class="video-meta">
                            <span class="video-duration">
                                <i class="bi bi-clock-fill me-1"></i>
                                ${video.duration}
                            </span>
                            <span class="video-date">
                                <i class="bi bi-calendar-fill me-1"></i>
                                ${video.date}
                            </span>
                        </div>
                    </div>
                </div>
            `;
            
            // Add animation
            col.style.opacity = '0';
            col.style.transform = 'translateY(20px)';
            videoGrid.appendChild(col);
            
            // Animate in
            setTimeout(() => {
                col.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                col.style.opacity = '1';
                col.style.transform = 'translateY(0)';
            }, 100);
        });
    }
    
    function addImageItems() {
        const imageGrid = document.querySelector('#images .row');
        
        // Sample image data
        const imageData = [
            {
                title: "Science & Islam",
                description: "Exploring scientific concepts mentioned in the Quran through experiments."
            },
            {
                title: "Field Trip",
                description: "Educational visits to local Islamic landmarks and museums."
            },
            {
                title: "Cultural Day",
                description: "Celebrating diverse Islamic cultures from around the world."
            }
        ];
        
        // Add new image items
        imageData.forEach(image => {
            const col = document.createElement('div');
            col.className = 'col-lg-4 col-md-6';
            col.innerHTML = `
                <div class="image-card">
                    <div class="image-container">
                        <img src="img/hero2.jpeg" alt="${image.title}" class="img-fluid">
                        <div class="image-overlay">
                            <a href="img/hero2.jpeg" class="image-enlarge" data-fancybox="gallery" data-caption="${image.title}">
                                <i class="bi bi-zoom-in"></i>
                            </a>
                        </div>
                    </div>
                    <div class="image-content">
                        <h4 class="image-title">${image.title}</h4>
                        <p class="image-description">${image.description}</p>
                    </div>
                </div>
            `;
            
            // Add animation
            col.style.opacity = '0';
            col.style.transform = 'translateY(20px)';
            imageGrid.appendChild(col);
            
            // Animate in
            setTimeout(() => {
                col.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                col.style.opacity = '1';
                col.style.transform = 'translateY(0)';
            }, 100);
        });
    }
    
    // Initial button state
    updateLoadMoreButton();
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

// Card hover effects
function initCardHoverEffects() {
    const cards = document.querySelectorAll('.video-card, .image-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Initialize on window load
window.addEventListener('load', function() {
    initCardHoverEffects();
});