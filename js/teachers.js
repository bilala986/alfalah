// Teachers Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize teacher data
    const teachersData = {
        1: {
            name: "Ustadh Muhammad Ali",
            qualification: "Qur'an & Tajweed Specialist",
            badge: "Senior Teacher",
            bio: "With over 15 years of experience in Qur'an teaching, Ustadh Muhammad specializes in Tajweed and Hifdh programs. He holds an Ijazah in Hafs 'an Asim narration and has successfully guided numerous students to complete their Hifdh. His teaching methodology combines traditional techniques with modern pedagogical approaches.",
            expertise: ["Qur'an", "Tajweed", "Hifdh", "Recitation"],
            experience: "15+ years experience",
            education: "Al-Azhar University, Cairo",
            languages: "Arabic, English, Urdu",
            classes: "Qur'an Classes, Hifdh Program",
            email: "muhammad.ali@alfalah.edu"
        },
        2: {
            name: "Ustadha Fatima Khan",
            qualification: "Islamic Studies Specialist",
            badge: "Islamic Studies",
            bio: "Specializing in Islamic jurisprudence and Prophetic biography, Ustadha Fatima makes complex concepts accessible to students of all ages. She holds a degree in Islamic Studies from the Islamic University of Madinah and focuses on practical application of Islamic principles in daily life.",
            expertise: ["Fiqh", "Seerah", "Aqeedah", "Islamic History"],
            experience: "10+ years experience",
            education: "Islamic University of Madinah",
            languages: "Arabic, English, Bengali",
            classes: "Islamic Studies, Women's Classes",
            email: "fatima.khan@alfalah.edu"
        },
        3: {
            name: "Ustadh Ahmed Hassan",
            qualification: "Arabic Language Expert",
            badge: "Arabic Language",
            bio: "A native Arabic speaker with a degree in Arabic Literature, Ustadh Ahmed specializes in teaching Qur'anic Arabic to non-native speakers. He has developed a unique curriculum that helps students understand the language of the Qur'an within 12 months.",
            expertise: ["Arabic", "Grammar", "Qur'anic Arabic", "Literature"],
            experience: "12+ years experience",
            education: "University of Damascus",
            languages: "Arabic, English, French",
            classes: "Arabic Language, Qur'anic Arabic",
            email: "ahmed.hassan@alfalah.edu"
        },
        4: {
            name: "Ustadh Yusuf Rahman",
            qualification: "Qur'an Recitation Expert",
            badge: "Qur'an Teacher",
            bio: "An expert in the rules of Tajweed, Ustadh Yusuf helps students perfect their Qur'an recitation with proper pronunciation and melody. He holds multiple Ijazahs in different Qira'at and focuses on developing beautiful recitation while maintaining proper rules.",
            expertise: ["Qur'an", "Tajweed", "Recitation", "Qira'at"],
            experience: "8+ years experience",
            education: "Darul Uloom Karachi",
            languages: "Arabic, English, Urdu",
            classes: "Tajweed Classes, Qur'an Recitation",
            email: "yusuf.rahman@alfalah.edu"
        },
        5: {
            name: "Ustadha Aisha Mohammed",
            qualification: "Hifdh Program Coordinator",
            badge: "Hifdh Program",
            bio: "As our Hifdh program coordinator, Ustadha Aisha guides students through their memorization journey with proven techniques and spiritual support. She has personally memorized the Qur'an and uses her experience to help others achieve this noble goal.",
            expertise: ["Hifdh", "Memorization", "Revision", "Muraja'ah"],
            experience: "9+ years experience",
            education: "Darul Qur'an London",
            languages: "Arabic, English, Somali",
            classes: "Hifdh Program, Revision Classes",
            email: "aisha.mohammed@alfalah.edu"
        },
        6: {
            name: "Ustadh Ibrahim Malik",
            qualification: "Islamic Sciences Scholar",
            badge: "Islamic Sciences",
            bio: "With advanced studies in Islamic sciences, Ustadh Ibrahim teaches Tafseer and Hadith studies to advanced students and adults. He holds a Master's degree in Islamic Studies and focuses on connecting classical knowledge with contemporary issues.",
            expertise: ["Tafseer", "Hadith", "Usul al-Fiqh", "Islamic Law"],
            experience: "14+ years experience",
            education: "University of Jordan",
            languages: "Arabic, English, Urdu",
            classes: "Tafseer Classes, Hadith Studies",
            email: "ibrahim.malik@alfalah.edu"
        }
    };

    // Initialize search and filter functionality
    function initSearchFilter() {
        const searchInput = document.getElementById('teacher-search');
        const filterTags = document.querySelectorAll('.filter-tag');
        const teacherCards = document.querySelectorAll('.teacher-card');
        const teachersGrid = document.getElementById('teachers-grid');

        // Search functionality
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            filterTeachers(searchTerm);
        });

        // Filter tag functionality
        filterTags.forEach(tag => {
            tag.addEventListener('click', function() {
                // Remove active class from all tags
                filterTags.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tag
                this.classList.add('active');
                
                const filter = this.dataset.filter;
                filterTeachers('', filter);
            });
        });

        function filterTeachers(searchTerm = '', filter = 'all') {
            let visibleCount = 0;

            teacherCards.forEach(card => {
                const categories = card.dataset.category;
                const teacherName = card.querySelector('.teacher-name').textContent.toLowerCase();
                const teacherQualification = card.querySelector('.teacher-qualification').textContent.toLowerCase();
                const teacherBio = card.querySelector('.teacher-bio').textContent.toLowerCase();

                const matchesSearch = !searchTerm || 
                    teacherName.includes(searchTerm) ||
                    teacherQualification.includes(searchTerm) ||
                    teacherBio.includes(searchTerm);

                // FIXED: Check if filter is "all" OR if categories includes the filter
                const matchesFilter = filter === 'all' || (categories && categories.includes(filter));

                if (matchesSearch && matchesFilter) {
                    card.style.display = 'block';
                    visibleCount++;
                    // Add animation
                    card.style.animation = 'none';
                    setTimeout(() => {
                        card.style.animation = 'fadeIn 0.5s ease';
                    }, 10);
                } else {
                    card.style.display = 'none';
                }
            });

            // Show no results message if needed
            showNoResultsMessage(visibleCount === 0);
        }

        function showNoResultsMessage(show) {
            let noResultsDiv = document.getElementById('no-results-message');
            
            if (show && !noResultsDiv) {
                noResultsDiv = document.createElement('div');
                noResultsDiv.id = 'no-results-message';
                noResultsDiv.className = 'no-results';
                noResultsDiv.innerHTML = `
                    <i class="bi bi-search"></i>
                    <h4>No teachers found</h4>
                    <p>Try adjusting your search or filter criteria</p>
                `;
                teachersGrid.appendChild(noResultsDiv);
            } else if (!show && noResultsDiv) {
                noResultsDiv.remove();
            }
        }
    }

    // Initialize teacher modal
    function initTeacherModal() {
        const viewProfileButtons = document.querySelectorAll('.btn-view-profile');
        const teacherModal = new bootstrap.Modal(document.getElementById('teacherModal'));
        
        viewProfileButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const teacherId = this.dataset.teacher;
                const teacher = teachersData[teacherId];
                
                if (teacher) {
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
                    teacherModal.show();
                }
            });
        });
    }

    // Initialize load more functionality
    function initLoadMore() {
        const loadMoreBtn = document.getElementById('load-more-teachers');
        
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', function() {
                // Show loading state
                this.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Loading...';
                this.disabled = true;
                
                // Simulate loading more teachers
                setTimeout(() => {
                    // In a real implementation, this would fetch more teachers from a server
                    alert('More teachers would be loaded from the server in a real implementation.');
                    
                    // Reset button
                    this.innerHTML = '<i class="bi bi-people-fill me-2"></i>View All Teaching Staff';
                    this.disabled = false;
                }, 1000);
            });
        }
    }

    // Initialize animations
    function initAnimations() {
        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .teacher-card {
                animation: fadeIn 0.6s ease;
            }
            
            .teacher-card:nth-child(1) { animation-delay: 0.1s; }
            .teacher-card:nth-child(2) { animation-delay: 0.2s; }
            .teacher-card:nth-child(3) { animation-delay: 0.3s; }
            .teacher-card:nth-child(4) { animation-delay: 0.4s; }
            .teacher-card:nth-child(5) { animation-delay: 0.5s; }
            .teacher-card:nth-child(6) { animation-delay: 0.6s; }
            
            .teacher-card:hover {
                animation: none;
            }
            
            .point-item {
                opacity: 0;
                transform: translateX(-20px);
                animation: slideIn 0.5s ease forwards;
            }
            
            .point-item:nth-child(1) { animation-delay: 0.1s; }
            .point-item:nth-child(2) { animation-delay: 0.2s; }
            .point-item:nth-child(3) { animation-delay: 0.3s; }
            .point-item:nth-child(4) { animation-delay: 0.4s; }
            
            @keyframes slideIn {
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize all functionality
    function init() {
        initSearchFilter();
        initTeacherModal();
        initLoadMore();
        initAnimations();
        
        // Add smooth scrolling for anchor links
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
    }

    // Start initialization
    init();
});