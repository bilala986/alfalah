// Teachers Page JavaScript - All Teachers Displayed
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

    // DOM Elements
    const teachersGrid = document.getElementById('teachers-grid');
    const totalCountElement = document.getElementById('total-count');

    // Initialize the page
    function init() {
        // Initialize statistics animations
        initStats();
        
        // Render all teacher cards
        renderAllTeachers();
        
        // Initialize modal functionality
        initTeacherModal();
        
        // Update total count
        updateTotalCount();
        
        // Initialize scroll animations
        initScrollAnimations();
        
        // Initialize hover effects
        initHoverEffects();
        
        console.log('Teachers page initialized successfully');
    }

    // Render all teacher cards
    function renderAllTeachers() {
        // Clear existing cards
        teachersGrid.innerHTML = '';
        
        // Render all teacher cards with staggered animation
        teachersData.forEach((teacher, index) => {
            const card = createTeacherCard(teacher, index);
            teachersGrid.appendChild(card);
            
            // Add scroll animation
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
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
                const teacher = teachersData.find(t => t.id === teacherId);
                
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

    // Initialize statistics animations
    function initStats() {
        const statItems = document.querySelectorAll('.stat-item');
        
        statItems.forEach((item, index) => {
            // Initial hidden state
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            // Animate in with delay
            setTimeout(() => {
                item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 300 + (index * 200));
        });
    }

    // Update total count display
    function updateTotalCount() {
        if (totalCountElement) {
            totalCountElement.textContent = teachersData.length;
        }
    }

    // Initialize scroll animations
    function initScrollAnimations() {
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
        document.querySelectorAll('.teacher-card-container').forEach(card => {
            observer.observe(card);
        });
    }

    // Add hover effect enhancement
    function initHoverEffects() {
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints;
        
        if (!isTouchDevice) {
            document.body.classList.add('has-hover');
            
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

    // Error handling
    function handleError(error, context) {
        console.error(`Error in ${context}:`, error);
        
        if (context === 'renderAllTeachers') {
            teachersGrid.innerHTML = `
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