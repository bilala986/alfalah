// Newsletters Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navbar active state
    initNavbarActiveState();
    
    // Initialize newsletter data
    initNewsletterData();
    
    // Initialize year filter
    initYearFilter();
    
    // Initialize subscription form
    initSubscriptionForm();
    
    // Initialize modal subscription form
    initModalSubscription();
});

// Initialize navbar active state
function initNavbarActiveState() {
    // Remove active class from all nav links first
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active', 'fw-bold');
    });
    
    // Add active class to Newsletters link
    const newslettersLink = document.querySelector('.nav-link[href="newsletters"]');
    if (newslettersLink) {
        newslettersLink.classList.add('active', 'fw-bold');
    }
}

// Newsletter data - Updated with 2025 and 2026 content
const newsletterData = [
    // 2026 Newsletters
    {
        id: 26,
        month: "January",
        year: "2026",
        title: "2026 Winter Academic Update",
        description: "Academic calendar for 2026, new programs announcement, and winter term schedule for students and parents.",
        topics: ["Academic", "Schedule", "Winter 2026", "Programs"],
        featured: false,
        fileSize: "1.8 MB"
    },
    {
        id: 25,
        month: "February",
        year: "2026",
        title: "2026 Winter Qur'an Competition",
        description: "Annual Qur'an competition details, registration information, and preparation guidelines for students.",
        topics: ["Competition", "Qur'an", "Students", "Events 2026"],
        featured: false,
        fileSize: "1.9 MB"
    },
    {
        id: 24,
        month: "March",
        year: "2026",
        title: "2026 Spring Community Events",
        description: "Upcoming community iftars, family day events, and spring semester activities schedule.",
        topics: ["Community", "Spring 2026", "Events", "Family"],
        featured: false,
        fileSize: "2.1 MB"
    },
    {
        id: 23,
        month: "April",
        year: "2026",
        title: "2026 Ramadan Preparation Guide",
        description: "Complete guide to preparing for Ramadan 2026 including spiritual, physical, and community preparations.",
        topics: ["Ramadan", "Preparation", "Spiritual", "2026"],
        featured: false,
        fileSize: "2.3 MB"
    },
    {
        id: 22,
        month: "May",
        year: "2026",
        title: "2026 Summer Program Announcement",
        description: "Summer Islamic courses, outdoor activities, and maintaining spirituality during summer holidays 2026.",
        topics: ["Summer", "Programs", "Courses", "2026"],
        featured: false,
        fileSize: "1.7 MB"
    },
    {
        id: 21,
        month: "June",
        year: "2026",
        title: "2026 End of Year Review",
        description: "Academic year accomplishments, student awards ceremony, and plans for the 2026-2027 academic year.",
        topics: ["Review", "Awards", "Accomplishments", "2026"],
        featured: false,
        fileSize: "2.2 MB"
    },
    
    // 2025 Newsletters
    {
        id: 1,
        month: "Ramadan",
        year: "1446/2025",
        title: "Ramadan 2025 Special Edition",
        description: "Complete Ramadan guide with daily duas, spiritual reflections, community iftar schedules, and Qur'an study plans.",
        topics: ["Ramadan", "Spirituality", "Community", "Duas"],
        featured: true,
        fileSize: "2.4 MB"
    },
    {
        id: 2,
        month: "February",
        year: "2025",
        title: "2025 Winter Term Highlights",
        description: "Celebrating student achievements, upcoming winter events, and Islamic insights for the 2025 winter season.",
        topics: ["Achievements", "Events", "Winter 2025", "Education"],
        featured: false,
        fileSize: "1.8 MB"
    },
    {
        id: 3,
        month: "January",
        year: "2025",
        title: "2025 New Year Beginnings",
        description: "Islamic perspective on new beginnings in 2025, upcoming programs, and community news for the new year.",
        topics: ["New Year", "Beginnings", "Programs", "Community 2025"],
        featured: false,
        fileSize: "1.9 MB"
    },
    {
        id: 4,
        month: "December",
        year: "2024",
        title: "2024 Winter Spirituality",
        description: "Embracing the winter months with increased worship, community bonding, and Islamic learning activities.",
        topics: ["Winter", "Worship", "Community", "Learning"],
        featured: false,
        fileSize: "2.1 MB"
    },
    {
        id: 5,
        month: "November",
        year: "2024",
        title: "2024 Thankfulness Special",
        description: "The importance of gratitude in Islam, student accomplishments, and community events for November 2024.",
        topics: ["Gratitude", "Thankfulness", "Events", "Students"],
        featured: false,
        fileSize: "1.7 MB"
    },
    {
        id: 6,
        month: "October",
        year: "2024",
        title: "2024 Autumn Reflections",
        description: "Spiritual reflections for autumn 2024, parent-teacher meetings, and Qur'an competition results.",
        topics: ["Autumn", "Reflections", "Competition", "Parenting"],
        featured: false,
        fileSize: "2.0 MB"
    },
    {
        id: 7,
        month: "September",
        year: "2024",
        title: "2024 Back to School Special",
        description: "Welcoming new students for 2024-2025, academic calendar, and tips for successful Islamic education.",
        topics: ["New Term", "Students", "Calendar", "Education"],
        featured: false,
        fileSize: "2.2 MB"
    },
    {
        id: 8,
        month: "August",
        year: "2024",
        title: "2024 Summer Achievements",
        description: "Celebrating summer program successes 2024, student progress, and community service projects.",
        topics: ["Summer", "Achievements", "Progress", "Service"],
        featured: false,
        fileSize: "1.6 MB"
    },
    {
        id: 9,
        month: "July",
        year: "2024",
        title: "2024 Summer Learning Guide",
        description: "Summer Islamic courses 2024, outdoor activities, and maintaining spirituality during holidays.",
        topics: ["Summer", "Courses", "Activities", "Spirituality"],
        featured: false,
        fileSize: "1.8 MB"
    },
    {
        id: 10,
        month: "June",
        year: "2024",
        title: "2024 End of Year Review",
        description: "Academic year 2023-2024 accomplishments, student awards, and plans for the upcoming year.",
        topics: ["Review", "Awards", "Accomplishments", "Planning"],
        featured: false,
        fileSize: "2.3 MB"
    },
    {
        id: 11,
        month: "May",
        year: "2024",
        title: "2024 Community Bonding Special",
        description: "Strengthening community ties in 2024, family events, and Islamic parenting tips.",
        topics: ["Community", "Family", "Parenting", "Events"],
        featured: false,
        fileSize: "1.9 MB"
    },
    {
        id: 12,
        month: "April",
        year: "2024",
        title: "2024 Spring Renewal Edition",
        description: "Spiritual renewal in spring 2024, environmental awareness from Islamic perspective.",
        topics: ["Spring", "Renewal", "Environment", "Spirituality"],
        featured: false,
        fileSize: "1.7 MB"
    }
];

// Initialize newsletter data and render cards
function initNewsletterData() {
    const newsletterGrid = document.getElementById('newsletter-grid');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    // Sort newsletters by year and month (newest first)
    const sortedNewsletters = [...newsletterData].sort((a, b) => {
        // Extract year from data (handle both "2025" and "1446/2025" formats)
        const yearA = parseInt(a.year.split('/').pop() || a.year);
        const yearB = parseInt(b.year.split('/').pop() || b.year);
        
        if (yearB !== yearA) {
            return yearB - yearA;
        }
        
        // Month ordering
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
            "Ramadan"
        ];
        return months.indexOf(b.month) - months.indexOf(a.month);
    });
    
    // Simulate loading delay
    setTimeout(() => {
        renderNewsletters(sortedNewsletters);
        
        // Hide loading indicator
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }, 800);
}

// Render newsletters to the grid
function renderNewsletters(newsletters) {
    const newsletterGrid = document.getElementById('newsletter-grid');
    
    // Clear existing content
    newsletterGrid.innerHTML = '';
    
    // Create newsletter cards
    newsletters.forEach(newsletter => {
        const card = createNewsletterCard(newsletter);
        newsletterGrid.appendChild(card);
    });
}

// Create a newsletter card element
function createNewsletterCard(newsletter) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    
    // Extract year for filtering
    const year = newsletter.year.split('/').pop() || newsletter.year;
    
    // Create topics HTML
    let topicsHTML = '';
    newsletter.topics.forEach(topic => {
        topicsHTML += `<span class="topic-tag">${topic}</span>`;
    });
    
    col.innerHTML = `
        <div class="newsletter-card" data-year="${year}">
            <div class="newsletter-header">
                <div class="newsletter-month">${newsletter.month}</div>
                <div class="newsletter-year">${newsletter.year}</div>
                ${newsletter.featured ? '<div class="newsletter-badge">Featured</div>' : ''}
            </div>
            <div class="newsletter-content">
                <h3 class="newsletter-title">${newsletter.title}</h3>
                <p class="newsletter-desc">${newsletter.description}</p>
                <div class="newsletter-topics">
                    ${topicsHTML}
                </div>
                <div class="newsletter-actions">
                    <a href="#" class="btn-newsletter btn-preview" onclick="previewNewsletter(${newsletter.id})">
                        <i class="bi bi-eye me-1"></i> Preview
                    </a>
                    <a href="#" class="btn-newsletter btn-download" onclick="downloadNewsletter(${newsletter.id})">
                        <i class="bi bi-download me-1"></i> Download (${newsletter.fileSize})
                    </a>
                </div>
            </div>
        </div>
    `;
    
    // Add animation
    col.style.animation = 'fadeIn 0.5s ease';
    
    return col;
}

// Initialize year filter
function initYearFilter() {
    const filterButtons = document.querySelectorAll('.year-filter .btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get selected year
            const selectedYear = this.dataset.year;
            
            // Filter newsletters
            filterNewsletters(selectedYear);
        });
    });
}

// Filter newsletters by year
function filterNewsletters(year) {
    const newsletterGrid = document.getElementById('newsletter-grid');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    // Show loading indicator
    loadingIndicator.style.display = 'block';
    newsletterGrid.innerHTML = '';
    
    setTimeout(() => {
        let filteredNewsletters;
        
        if (year === 'all') {
            // Sort all newsletters by date (newest first)
            filteredNewsletters = [...newsletterData].sort((a, b) => {
                const yearA = parseInt(a.year.split('/').pop() || a.year);
                const yearB = parseInt(b.year.split('/').pop() || b.year);
                
                if (yearB !== yearA) {
                    return yearB - yearA;
                }
                
                const months = [
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December",
                    "Ramadan"
                ];
                return months.indexOf(b.month) - months.indexOf(a.month);
            });
        } else {
            filteredNewsletters = newsletterData.filter(newsletter => {
                const newsletterYear = newsletter.year.split('/').pop() || newsletter.year;
                return newsletterYear === year;
            }).sort((a, b) => {
                // Sort by month within the year
                const months = [
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December",
                    "Ramadan"
                ];
                return months.indexOf(b.month) - months.indexOf(a.month);
            });
        }
        
        // Render filtered newsletters
        renderNewsletters(filteredNewsletters);
        
        // Hide loading indicator
        loadingIndicator.style.display = 'none';
    }, 500);
}

// Initialize subscription form
function initSubscriptionForm() {
    const form = document.getElementById('subscriptionForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const isParent = this.querySelector('#parentCheck').checked;
            
            // Simple validation
            if (!name || !email) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Simulate subscription process
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Subscribing...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                // Success message
                alert(`Thank you ${name}! You have successfully subscribed to our newsletter. You will receive our next issue in your inbox.`);
                
                // Reset form
                form.reset();
                
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }
}

// Initialize modal subscription
function initModalSubscription() {
    const form = document.getElementById('modalSubscriptionForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            
            if (!email) {
                alert('Please enter your email address.');
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = 'Subscribing...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('subscribeModal'));
                if (modal) {
                    modal.hide();
                }
                
                // Success message
                alert('Thank you! You have been subscribed to our newsletter.');
                
                // Reset form
                form.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1000);
        });
    }
}

// Preview newsletter function
function previewNewsletter(id) {
    const newsletter = newsletterData.find(n => n.id === id);
    if (newsletter) {
        alert(`Previewing: ${newsletter.title}\n\nThis is a preview of the "${newsletter.month} ${newsletter.year}" newsletter.\n\nIn a real implementation, this would open a PDF viewer or show the newsletter content.`);
    }
}

// Download newsletter function
function downloadNewsletter(id) {
    const newsletter = newsletterData.find(n => n.id === id);
    if (newsletter) {
        alert(`Downloading: ${newsletter.title}\n\nThis would download the "${newsletter.month} ${newsletter.year}" newsletter (${newsletter.fileSize}).\n\nIn a real implementation, this would trigger a file download.`);
        
        // Simulate download (in real implementation, this would be a file download)
        const link = document.createElement('a');
        link.href = '#';
        link.download = `Al-Falah-Newsletter-${newsletter.month}-${newsletter.year.split('/').pop() || newsletter.year}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Update the year filter buttons to show correct years
function updateYearFilterButtons() {
    const yearFilterDiv = document.querySelector('.year-filter .btn-group');
    if (yearFilterDiv) {
        // Get unique years from newsletter data
        const years = [...new Set(newsletterData.map(n => {
            return n.year.split('/').pop() || n.year;
        }))].sort((a, b) => b - a);
        
        // Clear existing buttons except "All"
        const allButton = yearFilterDiv.querySelector('[data-year="all"]');
        yearFilterDiv.innerHTML = '';
        yearFilterDiv.appendChild(allButton);
        
        // Add year buttons
        years.forEach(year => {
            if (year !== 'all') {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'btn btn-outline-success';
                button.dataset.year = year;
                button.textContent = year;
                yearFilterDiv.appendChild(button);
            }
        });
        
        // Re-initialize year filter event listeners
        initYearFilter();
    }
}