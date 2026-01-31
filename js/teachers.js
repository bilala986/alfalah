// Teachers Page JavaScript - Simplified (No Filters/Search)
document.addEventListener('DOMContentLoaded', function() {
    // Teacher data
    const teachersData = [
        {
            id: 1,
            name: "Ustadh Muhammad Ali",
            qualification: "Qur'an & Tajweed Specialist",
            badge: "Senior Teacher",
            bio: "With over 15 years of experience in Qur'an teaching, Ustadh Muhammad specializes in Tajweed and Hifdh programs. He holds an Ijazah in Hafs 'an Asim narration and has successfully guided numerous students to complete their Hifdh.",
            expertise: ["Qur'an", "Tajweed", "Hifdh", "Recitation"],
            experience: "15+ years experience",
            education: "Al-Azhar University, Cairo",
            languages: "Arabic, English, Urdu",
            classes: "Qur'an Classes, Hifdh Program",
            email: "muhammad.ali@alfalah.edu"
        },
        {
            id: 2,
            name: "Ustadha Fatima Khan",
            qualification: "Islamic Studies Specialist",
            badge: "Islamic Studies",
            bio: "Specializing in Islamic jurisprudence and Prophetic biography, Ustadha Fatima makes complex concepts accessible to students of all ages. She holds a degree in Islamic Studies from the Islamic University of Madinah.",
            expertise: ["Fiqh", "Seerah", "Aqeedah", "Islamic History"],
            experience: "10+ years experience",
            education: "Islamic University of Madinah",
            languages: "Arabic, English, Bengali",
            classes: "Islamic Studies, Women's Classes",
            email: "fatima.khan@alfalah.edu"
        },
        {
            id: 3,
            name: "Ustadh Ahmed Hassan",
            qualification: "Arabic Language Expert",
            badge: "Arabic Language",
            bio: "A native Arabic speaker with a degree in Arabic Literature, Ustadh Ahmed specializes in teaching Qur'anic Arabic to non-native speakers. He has developed a unique curriculum that helps students understand the language of the Qur'an.",
            expertise: ["Arabic", "Grammar", "Qur'anic Arabic", "Literature"],
            experience: "12+ years experience",
            education: "University of Damascus",
            languages: "Arabic, English, French",
            classes: "Arabic Language, Qur'anic Arabic",
            email: "ahmed.hassan@alfalah.edu"
        },
        {
            id: 4,
            name: "Ustadh Yusuf Rahman",
            qualification: "Qur'an Recitation Expert",
            badge: "Qur'an Teacher",
            bio: "An expert in the rules of Tajweed, Ustadh Yusuf helps students perfect their Qur'an recitation with proper pronunciation and melody. He holds multiple Ijazahs in different Qira'at.",
            expertise: ["Qur'an", "Tajweed", "Recitation", "Qira'at"],
            experience: "8+ years experience",
            education: "Darul Uloom Karachi",
            languages: "Arabic, English, Urdu",
            classes: "Tajweed Classes, Qur'an Recitation",
            email: "yusuf.rahman@alfalah.edu"
        },
        {
            id: 5,
            name: "Ustadha Aisha Mohammed",
            qualification: "Hifdh Program Coordinator",
            badge: "Hifdh Program",
            bio: "As our Hifdh program coordinator, Ustadha Aisha guides students through their memorization journey with proven techniques and spiritual support. She has personally memorized the Qur'an.",
            expertise: ["Hifdh", "Memorization", "Revision", "Muraja'ah"],
            experience: "9+ years experience",
            education: "Darul Qur'an London",
            languages: "Arabic, English, Somali",
            classes: "Hifdh Program, Revision Classes",
            email: "aisha.mohammed@alfalah.edu"
        },
        {
            id: 6,
            name: "Ustadh Ibrahim Malik",
            qualification: "Islamic Sciences Scholar",
            badge: "Islamic Sciences",
            bio: "With advanced studies in Islamic sciences, Ustadh Ibrahim teaches Tafseer and Hadith studies to advanced students and adults. He holds a Master's degree in Islamic Studies.",
            expertise: ["Tafseer", "Hadith", "Usul al-Fiqh", "Islamic Law"],
            experience: "14+ years experience",
            education: "University of Jordan",
            languages: "Arabic, English, Urdu",
            classes: "Tafseer Classes, Hadith Studies",
            email: "ibrahim.malik@alfalah.edu"
        },
        // Additional teachers for "Load More" functionality
        {
            id: 7,
            name: "Ustadh Abdullah Khan",
            qualification: "Qur'an Memorization Expert",
            badge: "Hifdh Teacher",
            bio: "Specializing in Qur'an memorization techniques, Ustadh Abdullah has helped over 100 students complete their Hifdh. His systematic approach makes memorization achievable for all ages.",
            expertise: ["Hifdh", "Memorization", "Tajweed", "Revision"],
            experience: "11+ years experience",
            education: "Islamic University of Islamabad",
            languages: "Arabic, English, Urdu, Pashto",
            classes: "Hifdh Program, Tajweed Classes",
            email: "abdullah.khan@alfalah.edu"
        },
        {
            id: 8,
            name: "Ustadha Zainab Ahmed",
            qualification: "Women's Studies Specialist",
            badge: "Women's Program",
            bio: "Focusing on Islamic studies for women and girls, Ustadha Zainab creates a comfortable learning environment. She specializes in Fiqh and Seerah studies tailored for female students.",
            expertise: ["Fiqh", "Seerah", "Women's Studies", "Islamic Ethics"],
            experience: "7+ years experience",
            education: "Islamic Online University",
            languages: "Arabic, English, Somali",
            classes: "Women's Classes, Islamic Studies",
            email: "zainab.ahmed@alfalah.edu"
        },
        {
            id: 9,
            name: "Ustadh Hamza Yusuf",
            qualification: "Islamic History Scholar",
            badge: "History Teacher",
            bio: "With a deep passion for Islamic history, Ustadh Hamza brings historical events to life. His engaging teaching style helps students connect with the rich heritage of Islam.",
            expertise: ["Islamic History", "Seerah", "Civilization", "Geography"],
            experience: "6+ years experience",
            education: "University of London",
            languages: "Arabic, English, French",
            classes: "Islamic History, Seerah Studies",
            email: "hamza.yusuf@alfalah.edu"
        }
    ];

    // State management
    const state = {
        visibleTeachers: 6,
        isLoading: false,
        allTeachers: teachersData
    };

    // DOM Elements Cache
    const dom = {
        grid: document.getElementById('teachers-grid'),
        loadMoreBtn: document.getElementById('load-more-teachers'),
        visibleCount: document.getElementById('visible-count'),
        totalCount: document.getElementById('total-count'),
        loadMoreBadge: document.querySelector('.btn-badge'),
        statItems: document.querySelectorAll('.stat-item')
    };

    // Initialize the page
    function init() {
        // Initialize statistics animations
        initStats();
        
        // Render initial teacher cards
        renderTeacherCards();
        
        // Initialize modal functionality
        initTeacherModal();
        
        // Initialize load more functionality
        initLoadMore();
        
        // Update counts display
        updateCounts();
        
        // Initialize scroll animations
        initScrollAnimations();
        
        console.log('Teachers page initialized successfully');
    }

    // Render teacher cards
    function renderTeacherCards() {
        // Determine which teachers to show
        const teachersToShow = state.allTeachers.slice(0, state.visibleTeachers);
        
        // Clear existing cards
        dom.grid.innerHTML = '';
        
        // Render teacher cards with staggered animation
        teachersToShow.forEach((teacher, index) => {
            const card = createTeacherCard(teacher, index);
            dom.grid.appendChild(card);
            
            // Add scroll animation
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        // Update counts
        updateCounts();
    }

    // Create teacher card HTML
    function createTeacherCard(teacher, index) {
        const card = document.createElement('div');
        card.className = 'col-lg-4 col-md-6 teacher-card-container';
        card.dataset.id = teacher.id;
        
        // Initial hidden state for animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        card.style.transitionDelay = `${index * 0.1}s`;
        
        // Generate expertise tags HTML
        const expertiseTags = teacher.expertise.map(exp => 
            `<span class="expertise-tag">${exp}</span>`
        ).join('');
        
        card.innerHTML = `
            <div class="teacher-card">
                <div class="teacher-image">
                    <img src="img/contact.png" alt="${teacher.name}" class="teacher-img">
                    <div class="teacher-badge">${teacher.badge}</div>
                    <div class="teacher-social">
                        <a href="mailto:${teacher.email}" class="social-icon" title="Email ${teacher.name}">
                            <i class="bi bi-envelope"></i>
                        </a>
                    </div>
                </div>
                <div class="teacher-info">
                    <h3 class="teacher-name">${teacher.name}</h3>
                    <p class="teacher-qualification">${teacher.qualification}</p>
                    <div class="teacher-expertise">
                        ${expertiseTags}
                    </div>
                    <p class="teacher-bio">${teacher.bio}</p>
                    <div class="teacher-experience">
                        <i class="bi bi-award"></i>
                        <span>${teacher.experience}</span>
                    </div>
                    <a href="#" class="btn-view-profile" data-teacher="${teacher.id}">
                        View Profile <i class="bi bi-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
        
        return card;
    }

    // Initialize teacher modal
    function initTeacherModal() {
        const teacherModal = new bootstrap.Modal(document.getElementById('teacherModal'));
        
        // Use event delegation for teacher cards
        document.addEventListener('click', function(e) {
            const viewProfileBtn = e.target.closest('.btn-view-profile');
            if (viewProfileBtn) {
                e.preventDefault();
                const teacherId = parseInt(viewProfileBtn.dataset.teacher);
                const teacher = state.allTeachers.find(t => t.id === teacherId);
                
                if (teacher) {
                    openTeacherModal(teacher, teacherModal);
                }
            }
        });
    }

    // Open teacher modal with data
    function openTeacherModal(teacher, modal) {
        // Populate modal with teacher data
        document.getElementById('modal-teacher-name').textContent = teacher.name;
        document.getElementById('modal-teacher-qualification').textContent = teacher.qualification;
        document.getElementById('modal-teacher-bio').textContent = teacher.bio;
        document.getElementById('modal-badge').textContent = teacher.badge;
        document.getElementById('modal-experience').textContent = teacher.experience;
        document.getElementById('modal-education').textContent = teacher.education;
        document.getElementById('modal-languages').textContent = teacher.languages;
        document.getElementById('modal-classes').textContent = teacher.classes;
        document.getElementById('modal-email').textContent = teacher.email;
        
        // Populate expertise tags
        const expertiseContainer = document.getElementById('modal-expertise');
        expertiseContainer.innerHTML = '';
        teacher.expertise.forEach(expertise => {
            const tag = document.createElement('span');
            tag.className = 'expertise-tag';
            tag.textContent = expertise;
            expertiseContainer.appendChild(tag);
        });
        
        // Show modal
        modal.show();
    }

    // Initialize load more functionality
    function initLoadMore() {
        if (!dom.loadMoreBtn) return;
        
        dom.loadMoreBtn.addEventListener('click', function() {
            if (state.isLoading) return;
            
            state.isLoading = true;
            state.visibleTeachers += 3; // Load 3 more teachers
            
            // Add loading state to button
            this.classList.add('loading');
            this.disabled = true;
            const originalHTML = this.innerHTML;
            this.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Loading...';
            
            // Simulate loading delay
            setTimeout(() => {
                // Render more teachers
                const newTeachers = state.allTeachers.slice(state.visibleTeachers - 3, state.visibleTeachers);
                
                newTeachers.forEach((teacher, index) => {
                    const card = createTeacherCard(teacher, state.visibleTeachers - 3 + index);
                    dom.grid.appendChild(card);
                    
                    // Animate in
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 100);
                });
                
                // Update counts and button state
                updateCounts();
                state.isLoading = false;
                this.classList.remove('loading');
                this.disabled = false;
                this.innerHTML = originalHTML;
                
                // If all teachers are visible, change button text
                if (state.visibleTeachers >= state.allTeachers.length) {
                    this.innerHTML = '<i class="bi bi-check-circle me-2"></i>All Teachers Loaded';
                    this.disabled = true;
                    this.style.opacity = '0.7';
                }
                
                // Smooth scroll to new cards
                const newCards = document.querySelectorAll('.teacher-card-container');
                if (newCards.length > 6) { // Only scroll if we have more than initial 6
                    newCards[newCards.length - 3].scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                }
            }, 800);
        });
    }

    // Initialize statistics animations
    function initStats() {
        dom.statItems.forEach((item, index) => {
            // Initial hidden state
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            // Animate in with delay
            setTimeout(() => {
                item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 300 + (index * 200)); // Start after hero section animation
        });
    }

    // Update counts display
    function updateCounts() {
        if (dom.visibleCount) {
            const visibleCount = Math.min(state.visibleTeachers, state.allTeachers.length);
            dom.visibleCount.textContent = visibleCount;
        }
        
        if (dom.totalCount) {
            dom.totalCount.textContent = state.allTeachers.length;
        }
        
        if (dom.loadMoreBadge) {
            const remaining = Math.max(0, state.allTeachers.length - state.visibleTeachers);
            dom.loadMoreBadge.textContent = remaining;
            
            // Update button text based on remaining teachers
            if (remaining === 0 && dom.loadMoreBtn) {
                dom.loadMoreBtn.querySelector('span').textContent = 'All Teachers Loaded';
                dom.loadMoreBtn.disabled = true;
                dom.loadMoreBtn.style.opacity = '0.7';
                dom.loadMoreBtn.querySelector('.btn-badge').style.display = 'none';
            }
        }
    }

    // Initialize scroll animations
    function initScrollAnimations() {
        // Add scroll-based animations for teacher cards
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, observerOptions);
        
        // Observe all teacher cards
        const observeCards = () => {
            document.querySelectorAll('.teacher-card-container').forEach(card => {
                observer.observe(card);
            });
        };
        
        // Initial observation
        observeCards();
        
        // Re-observe when new cards are loaded
        const originalLoadMore = dom.loadMoreBtn?.onclick;
        if (dom.loadMoreBtn) {
            dom.loadMoreBtn.addEventListener('click', function() {
                setTimeout(observeCards, 900); // Observe after loading animation
            });
        }
    }

    // Add hover effect enhancement
    function initHoverEffects() {
        // Add touch device detection for hover effects
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints;
        
        if (!isTouchDevice) {
            // Add hover class to body for CSS targeting
            document.body.classList.add('has-hover');
            
            // Enhance card hover on desktop
            document.addEventListener('mouseover', function(e) {
                const card = e.target.closest('.teacher-card');
                if (card) {
                    card.classList.add('hover-active');
                }
            });
            
            document.addEventListener('mouseout', function(e) {
                const card = e.target.closest('.teacher-card');
                if (card) {
                    card.classList.remove('hover-active');
                }
            });
        }
    }

    // Initialize hover effects
    initHoverEffects();

    // Error handling
    function handleError(error, context) {
        console.error(`Error in ${context}:`, error);
        
        // Show fallback message if grid fails to load
        if (context === 'renderTeacherCards') {
            dom.grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle me-2"></i>
                        <strong>Unable to load teachers.</strong> Please refresh the page or try again later.
                    </div>
                </div>
            `;
        }
    }

    // Start initialization with error handling
    try {
        init();
    } catch (error) {
        handleError(error, 'initialization');
    }
});