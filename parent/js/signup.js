// parent/js/signup.js - WITH TAB ISOLATION, PASSWORD STRENGTH METER & CSRF

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signupForm");
    const alertBox = document.getElementById("alertBox");
    const inputs = form.querySelectorAll('input[required]');
    const passwordStrength = document.getElementById('passwordStrength');
    const passwordProgress = document.getElementById('passwordProgress');
    const passwordRequirements = document.getElementById('passwordRequirements');
    const csrfTokenInput = document.getElementById('csrf_token');

    // Remove browser validation
    form.setAttribute('novalidate', '');

    // Generate unique browser instance ID PER TAB (using sessionStorage)
    function getBrowserInstanceId() {
        let instanceId = sessionStorage.getItem('parent_browser_instance_id');
        
        if (!instanceId) {
            const hexChars = '0123456789abcdef';
            let hexString = 'p'; // Start with 'p' for parent
            for (let i = 0; i < 32; i++) {
                hexString += hexChars[Math.floor(Math.random() * 16)];
            }
            instanceId = hexString;
            
            sessionStorage.setItem('parent_browser_instance_id', instanceId);
            localStorage.setItem('parent_tab_' + Date.now(), instanceId);
        }
        return instanceId;
    }

    // Generate CSRF token for this tab
    function generateCsrfToken() {
        const token = 'csrf_' + Math.random().toString(36).substr(2, 16) + '_' + Date.now();
        sessionStorage.setItem('parent_csrf_token', token);
        return token;
    }

    // Set CSRF token in form
    function setCsrfToken() {
        let token = sessionStorage.getItem('parent_csrf_token');
        if (!token) {
            token = generateCsrfToken();
        }
        if (csrfTokenInput) {
            csrfTokenInput.value = token;
        }
        return token;
    }

    // Initialize CSRF token
    setCsrfToken();

    function showAlert(message, type = "danger") {
        alertBox.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show mt-3" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }

    function showFieldError(input, message) {
        hideFieldError(input);
        input.classList.add('is-invalid');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback d-block';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
    }

    function hideFieldError(input) {
        input.classList.remove('is-invalid');
        const existingError = input.parentNode.querySelector('.invalid-feedback');
        if (existingError) {
            existingError.remove();
        }
    }

    function validatePassword(password) {
        const requirements = {
            length: password.length >= 12,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };

        return requirements;
    }

    function updatePasswordStrength(password) {
        const requirements = validatePassword(password);
        const metRequirements = Object.values(requirements).filter(Boolean).length;
        const totalRequirements = Object.keys(requirements).length;
        const strengthPercentage = (metRequirements / totalRequirements) * 100;

        // Update progress bar
        passwordProgress.style.width = `${strengthPercentage}%`;
        
        // Update progress bar color based on strength
        if (strengthPercentage <= 25) {
            passwordProgress.className = 'progress-bar bg-danger';
        } else if (strengthPercentage <= 50) {
            passwordProgress.className = 'progress-bar bg-warning';
        } else if (strengthPercentage <= 75) {
            passwordProgress.className = 'progress-bar bg-info';
        } else {
            passwordProgress.className = 'progress-bar bg-success';
        }

        // Update requirement checkmarks
        Object.keys(requirements).forEach(req => {
            const requirementElement = passwordRequirements.querySelector(`[data-requirement="${req}"]`);
            const icon = requirementElement.querySelector('.requirement-icon');
            
            if (requirements[req]) {
                icon.textContent = '✅';
                requirementElement.style.color = '#198754';
                requirementElement.style.fontWeight = '600';
            } else {
                icon.textContent = '❌';
                requirementElement.style.color = '#6c757d';
                requirementElement.style.fontWeight = 'normal';
            }
        });

        return requirements;
    }

    function getPasswordErrorMessage(requirements) {
        const missing = [];
        if (!requirements.length) missing.push('at least 12 characters');
        if (!requirements.uppercase) missing.push('one uppercase letter');
        if (!requirements.lowercase) missing.push('one lowercase letter');
        if (!requirements.number) missing.push('one number');
        if (!requirements.special) missing.push('one special character');

        return `Password must contain: ${missing.join(', ')}`;
    }

    function validateForm() {
        let isValid = true;
        const parentName = form.querySelector('[name="parent_name"]');
        const parentEmail = form.querySelector('[name="parent_email"]');
        const parentPassword = form.querySelector('[name="parent_password"]');
        const parentConfirmPassword = form.querySelector('[name="parent_password_confirm"]');

        // Clear previous errors
        inputs.forEach(input => hideFieldError(input));

        // Validate Full Name
        if (!parentName.value.trim()) {
            showFieldError(parentName, 'Please enter your full name');
            isValid = false;
        } else if (!/^[a-zA-Z\s\.\-\']{2,100}$/.test(parentName.value)) {
            showFieldError(parentName, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods');
            isValid = false;
        }

        // Validate Email
        if (!parentEmail.value.trim()) {
            showFieldError(parentEmail, 'Please enter your email address');
            isValid = false;
        } else if (!isValidEmail(parentEmail.value)) {
            showFieldError(parentEmail, 'Please enter a valid email address');
            isValid = false;
        }

        // Validate Password
        if (!parentPassword.value) {
            showFieldError(parentPassword, 'Please enter a password');
            isValid = false;
        } else {
            const passwordRequirements = validatePassword(parentPassword.value);
            if (!passwordRequirements.length || !passwordRequirements.uppercase || 
                !passwordRequirements.lowercase || !passwordRequirements.number || !passwordRequirements.special) {
                showFieldError(parentPassword, getPasswordErrorMessage(passwordRequirements));
                isValid = false;
            }
        }

        // Validate Confirm Password
        if (!parentConfirmPassword.value) {
            showFieldError(parentConfirmPassword, 'Please confirm your password');
            isValid = false;
        } else if (parentPassword.value !== parentConfirmPassword.value) {
            showFieldError(parentConfirmPassword, 'Passwords do not match');
            isValid = false;
        }

        return isValid;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Real-time password strength indicator
    const passwordInput = form.querySelector('[name="parent_password"]');
    passwordInput.addEventListener('input', function() {
        hideFieldError(this);

        if (this.value.length > 0) {
            passwordStrength.style.display = 'block';
            updatePasswordStrength(this.value);
        } else {
            passwordStrength.style.display = 'none';
        }
    });

    // Real-time validation for other fields
    inputs.forEach(input => {
        if (input.name !== 'parent_password') {
            input.addEventListener('blur', () => {
                if (!input.value.trim()) {
                    showFieldError(input, `Please enter ${input.placeholder.toLowerCase()}`);
                } else {
                    hideFieldError(input);
                }
            });

            input.addEventListener('input', () => {
                hideFieldError(input);
            });
        }
    });
    
    function validateSessionConsistency() {
        const currentSessionId = sessionStorage.getItem('parent_current_session_id');
        const urlParams = new URLSearchParams(window.location.search);
        const urlSessionId = urlParams.get('bid');

        if (currentSessionId && urlSessionId && currentSessionId !== urlSessionId) {
            sessionStorage.removeItem('parent_current_session_id');
            sessionStorage.removeItem('parent_browser_instance_id');
            window.location.href = 'login.php';
            return false;
        }
        return true;
    }

    // Call this on dashboard pages
    if (window.location.pathname.includes('/parent/dashboard.php')) {
        document.addEventListener('DOMContentLoaded', validateSessionConsistency);
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        alertBox.innerHTML = "";

        if (!validateForm()) {
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;

        const formData = new FormData(form);

        // Add browser instance ID to form data (tab-specific)
        const browserId = getBrowserInstanceId();
        formData.append('browser_instance_id', browserId);

        // Ensure CSRF token is included
        if (!formData.get('csrf_token')) {
            formData.append('csrf_token', setCsrfToken());
        }

        try {
            const response = await fetch(form.action, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                // Store the browser instance ID for this session in sessionStorage
                if (data.browser_instance_id) {
                    sessionStorage.setItem('parent_current_session_id', data.browser_instance_id);
                }

                // Redirect with browser instance ID
                window.location.href = "../dashboard.php?bid=" + (data.browser_instance_id || getBrowserInstanceId());
            } else {
                showAlert(data.message, "danger");
            }
        } catch (error) {
            console.error("Signup error:", error);
            showAlert("Network or server error. Please try again later.");
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
});