// Curriculum Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dropdown active states
    initDropdownActiveStates();
    
    // Initialize journey animations
    initJourneyAnimations();
    
    // Initialize year selection
    initYearSelection();
    
    // Initialize curriculum data
    initCurriculumData();
});

// Initialize dropdown active states
function initDropdownActiveStates() {
    // Remove active class from all nav links first
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active', 'fw-bold');
    });
    
    // Add active class to Curriculum in dropdown
    const curriculumLink = document.querySelector('.dropdown-item[href="curriculum"]');
    if (curriculumLink) {
        curriculumLink.classList.add('active');
        
        // Also activate the parent dropdown
        const dropdownToggle = curriculumLink.closest('.dropdown').querySelector('.dropdown-toggle');
        if (dropdownToggle) {
            dropdownToggle.classList.add('active', 'fw-bold');
        }
    }
}

// Initialize journey animations
function initJourneyAnimations() {
    const stages = document.querySelectorAll('.journey-stage');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animate');
                }, index * 200);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    });
    
    stages.forEach(stage => observer.observe(stage));
}

// Initialize year selection
function initYearSelection() {
    const yearBtns = document.querySelectorAll('.year-btn');
    
    yearBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            yearBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get the year from data attribute
            const year = this.dataset.year;
            
            // Show selected content
            showYearContent(year);
        });
    });
}

// Function to show year content
function showYearContent(year) {
    // Remove all existing content first
    const contentContainer = document.getElementById('curriculum-content');
    contentContainer.innerHTML = '';
    
    // Create and add the selected year content
    const content = createYearContent(year, curriculumData[year]);
    content.classList.add('active');
    content.style.animation = 'fadeIn 0.5s ease';
    contentContainer.appendChild(content);
}

// Curriculum data for all years
const curriculumData = {
    '1': {
        title: 'Year 1 Curriculum',
        subtitle: 'Foundation Stage | Age 5-6',
        level: 'Beginner',
        subjects: {
            'Qur\'an & Recitation': [
                'Arabic Alphabet recognition',
                'Basic letter sounds and pronunciation',
                'Introduction to Harakat (vowels)',
                'Short Surah memorization (Al-Fatihah, Al-Ikhlas)',
                'Proper sitting posture for Qur\'an reading'
            ],
            'Islamic Studies': [
                'Five pillars of Islam',
                'Basic duas and daily prayers',
                'Islamic manners and etiquette',
                'Stories of the Prophets (simplified)',
                'Allah\'s names and attributes'
            ],
            'Tajweed': [
                'Introduction to Makhaarij (articulation points)',
                'Basic pronunciation rules',
                'Practice with teacher guidance',
                'Listening and repetition exercises'
            ],
            'Character Building': [
                'Respect for parents and elders',
                'Sharing and caring in class',
                'Cleanliness and hygiene',
                'Truthfulness and honesty',
                'Love for learning'
            ]
        }
    },
    '2': {
        title: 'Year 2 Curriculum',
        subtitle: 'Foundation Stage | Age 6-7',
        level: 'Beginner+',
        subjects: {
            'Qur\'an & Recitation': [
                'Joining letters to form words',
                'Long vowel recognition (Madd)',
                'Juz Amma short surahs',
                'Daily dua memorization',
                'Reading fluency practice'
            ],
            'Islamic Studies': [
                'Wudu and Salah steps',
                'Prophet Muhammad\'s life (simplified)',
                'Islamic calendar and important dates',
                'Basic fiqh for children',
                'Islamic stories with moral lessons'
            ],
            'Tajweed': [
                'Noon Sakinah and Tanween rules',
                'Meem Sakinah rules introduction',
                'Ghunnah practice',
                'Pronunciation correction exercises'
            ],
            'Arabic Language': [
                'Basic Arabic vocabulary',
                'Simple Arabic phrases',
                'Writing practice (letter formation)',
                'Colors, numbers, family names in Arabic'
            ]
        }
    },
    '3': {
        title: 'Year 3 Curriculum',
        subtitle: 'Foundation Stage | Age 7-8',
        level: 'Intermediate',
        subjects: {
            'Qur\'an & Recitation': [
                'Complete Juz Amma reading',
                'Tajweed rules application',
                'Memorization of selected surahs',
                'Reading with proper rhythm',
                'Understanding basic meanings'
            ],
            'Islamic Studies': [
                'Detailed Salah procedure',
                'Islamic beliefs (Aqeedah basics)',
                'Seerah of Prophet Muhammad (detailed)',
                'Islamic ethics and values',
                'Muslim contributions to civilization'
            ],
            'Tajweed': [
                'Qalqalah rules',
                'Madd types introduction',
                'Silent letters and stops',
                'Recitation with teacher feedback'
            ],
            'Islamic History': [
                'Stories of the Prophets',
                'Companions of the Prophet',
                'Early Islamic history',
                'Important Islamic figures'
            ]
        }
    },
    '4': {
        title: 'Year 4 Curriculum',
        subtitle: 'Development Stage | Age 8-9',
        level: 'Intermediate+',
        subjects: {
            'Qur\'an & Recitation': [
                'Juz Tabarak and Amma completion',
                'Advanced Tajweed rules',
                'Memorization of daily prayers',
                'Reading comprehension',
                'Weekly recitation tests'
            ],
            'Islamic Studies': [
                'Fiqh of purification and prayer',
                'Islamic family values',
                'Economic principles in Islam',
                'Social responsibilities',
                'Environmental stewardship in Islam'
            ],
            'Tajweed': [
                'Idgham rules',
                'Ikhfa rules',
                'Madd Lazim and Munfasil',
                'Recitation speed control'
            ],
            'Islamic Jurisprudence': [
                'Basic halal and haram',
                'Islamic manners (Adab)',
                'Transactions in Islam',
                'Islamic inheritance basics'
            ]
        }
    },
    '5': {
        title: 'Year 5 Curriculum',
        subtitle: 'Development Stage | Age 9-10',
        level: 'Advanced',
        subjects: {
            'Qur\'an & Recitation': [
                'Selected surahs from longer chapters',
                'Memorization with understanding',
                'Tafsir of short surahs',
                'Recitation competitions',
                'Monthly progress assessments'
            ],
            'Islamic Studies': [
                'Advanced Aqeedah',
                'Islamic philosophy and thought',
                'Comparative religion basics',
                'Islamic law principles',
                'Contemporary Islamic issues'
            ],
            'Tajweed': [
                'Advanced Qira\'at rules',
                'Stopping rules (Waqf)',
                'Proper breath control',
                'Recitation with emotion'
            ],
            'Seerah & History': [
                'Detailed life of Prophet Muhammad',
                'Rightly Guided Caliphs',
                'Islamic golden age',
                'Muslim scientists and scholars'
            ]
        }
    },
    '6': {
        title: 'Year 6 Curriculum',
        subtitle: 'Development Stage | Age 10-11',
        level: 'Advanced+',
        subjects: {
            'Qur\'an & Recitation': [
                'First 10 Juz with understanding',
                'Hifdh preparation program',
                'Tafsir of selected verses',
                'Recitation in congregation',
                'Annual recitation evaluation'
            ],
            'Islamic Studies': [
                'Usul al-Fiqh basics',
                'Hadith studies introduction',
                'Islamic spirituality (Tasawwuf)',
                'Dawah methodology',
                'Islamic community leadership'
            ],
            'Tajweed': [
                'Expert level Tajweed',
                'Qira\'at variations',
                'Advanced recitation techniques',
                'Teaching basic Tajweed to peers'
            ],
            'Islamic Sciences': [
                'Hadith methodology',
                'Tafsir methodology',
                'Islamic economics',
                'Islamic political system'
            ]
        }
    },
    '7': {
        title: 'Year 7 Curriculum',
        subtitle: 'Mastery Stage | Age 11-12',
        level: 'Mastery',
        subjects: {
            'Qur\'an & Recitation': [
                'First 15 Juz memorization',
                'Advanced Tafsir studies',
                'Thematic Qur\'an study',
                'Recitation leadership',
                'Hifdh program preparation'
            ],
            'Islamic Studies': [
                'Advanced Fiqh',
                'Hadith sciences',
                'Islamic theology',
                'Islamic philosophy',
                'Contemporary Islamic thought'
            ],
            'Tajweed': [
                'Qira\'at mastery',
                'Professional recitation',
                'Tajweed instruction methods',
                'Recitation correction skills'
            ],
            'Islamic Research': [
                'Research methodology',
                'Critical thinking in Islam',
                'Islamic problem solving',
                'Community project planning'
            ]
        }
    },
    '8': {
        title: 'Year 8 Curriculum',
        subtitle: 'Mastery Stage | Age 12-13',
        level: 'Expert',
        subjects: {
            'Qur\'an & Recitation': [
                'Complete 20 Juz memorization',
                'In-depth Tafsir studies',
                'Qur\'anic sciences',
                'Recitation as Imam',
                'Hifdh program advancement'
            ],
            'Islamic Studies': [
                'Specialized Fiqh areas',
                'Advanced Hadith studies',
                'Islamic jurisprudence',
                'Islamic ethics philosophy',
                'Islamic educational methods'
            ],
            'Tajweed': [
                'Qira\'at expert level',
                'Teaching Tajweed methodology',
                'Recitation evaluation skills',
                'Advanced pronunciation techniques'
            ],
            'Islamic Leadership': [
                'Community leadership',
                'Islamic counseling',
                'Dawah strategies',
                'Youth mentorship'
            ]
        }
    },
    '9': {
        title: 'Year 9 Curriculum',
        subtitle: 'Mastery Stage | Age 13-14',
        level: 'Scholar Prep',
        subjects: {
            'Qur\'an & Recitation': [
                'Complete Qur\'an memorization option',
                'Advanced Qur\'anic sciences',
                'Tafsir mastery',
                'Professional recitation',
                'Teaching methodology'
            ],
            'Islamic Studies': [
                'Comprehensive Islamic knowledge',
                'Advanced Islamic sciences',
                'Islamic research methods',
                'Contemporary fiqh issues',
                'Islamic education planning'
            ],
            'Tajweed': [
                'Master Qira\'at',
                'Expert teaching skills',
                'Curriculum development',
                'Advanced student assessment'
            ],
            'Islamic Teaching': [
                'Pedagogy in Islamic education',
                'Classroom management',
                'Curriculum design',
                'Student assessment methods'
            ]
        }
    },
    'hifdh': {
        title: 'Hifdh Program',
        subtitle: 'Complete Qur\'an Memorization',
        level: 'Specialized',
        subjects: {
            'Memorization Program': [
                'Complete Qur\'an memorization schedule',
                'Daily revision system',
                'Memorization techniques and methods',
                'Retention strategies',
                'Progress tracking and assessment'
            ],
            'Tajweed Mastery': [
                'Perfect pronunciation of every letter',
                'Advanced Tajweed application',
                'Recitation with proper rhythm',
                'Correction of common mistakes',
                'Preparation for Ijazah'
            ],
            'Understanding & Reflection': [
                'Meaning of memorized portions',
                'Thematic understanding',
                'Practical application of verses',
                'Reflection and contemplation',
                'Connection with daily life'
            ],
            'Practical Application': [
                'Leading prayers with memorization',
                'Teaching memorized portions',
                'Recitation in gatherings',
                'Preparation for competitions',
                'Community service through Qur\'an'
            ]
        }
    }
};

// Initialize curriculum data
function initCurriculumData() {
    // We don't need to create all content at once anymore
    // Content will be created dynamically when needed
}

// Create year content dynamically
function createYearContent(year, data) {
    const div = document.createElement('div');
    div.className = 'year-content';
    div.id = `year-${year}`;
    
    // Create subject cards
    let subjectCards = '';
    for (const [subjectName, items] of Object.entries(data.subjects)) {
        let icon = 'bi-book';
        if (subjectName.includes('Qur\'an')) icon = 'bi-book';
        else if (subjectName.includes('Studies')) icon = 'bi-star';
        else if (subjectName.includes('Tajweed')) icon = 'bi-mic';
        else if (subjectName.includes('Character')) icon = 'bi-heart';
        else if (subjectName.includes('Arabic')) icon = 'bi-translate';
        else if (subjectName.includes('History')) icon = 'bi-clock-history';
        else if (subjectName.includes('Jurisprudence')) icon = 'bi-scale';
        else if (subjectName.includes('Sciences')) icon = 'bi-lightbulb';
        else if (subjectName.includes('Leadership')) icon = 'bi-people';
        else if (subjectName.includes('Teaching')) icon = 'bi-mortarboard';
        else if (subjectName.includes('Memorization')) icon = 'bi-journal-check';
        else if (subjectName.includes('Understanding')) icon = 'bi-eye';
        else if (subjectName.includes('Practical')) icon = 'bi-check-circle';
        
        subjectCards += `
            <div class="col-md-6">
                <div class="subject-card">
                    <h5 class="fw-bold text-success mb-3">
                        <i class="bi ${icon} me-2"></i>${subjectName}
                    </h5>
                    <ul class="subject-list">
                        ${items.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
    
    div.innerHTML = `
        <div class="curriculum-card bg-white rounded-4 shadow-sm p-5">
            <div class="d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h3 class="text-success fw-bold mb-2">${data.title}</h3>
                    <p class="text-muted mb-0">${data.subtitle}</p>
                </div>
                <span class="badge bg-success fs-6">${data.level}</span>
            </div>
            <div class="row g-4">
                ${subjectCards}
            </div>
        </div>
    `;
    
    return div;
}