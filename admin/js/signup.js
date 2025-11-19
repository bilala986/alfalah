// admin/js/signup.js - WITH PASSWORD STRENGTH METER

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signupForm");
    const alertBox = document.getElementById("alertBox");
    const inputs = form.querySelectorAll('input[required]');
    const passwordStrength = document.getElementById('passwordStrength');
    const passwordProgress = document.getElementById('passwordProgress');
    const passwordRequirements = document.getElementById('passwordRequirements');

    // Remove browser validation
    form.setAttribute('novalidate', '');

    function showAlert(message, type = "danger") {
        alertBox.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show mt-3" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }

    function showFieldError(input, message) {
        // Remove any existing error
        hideFieldError(input);
        
        // Add error styling
        input.classList.add('is-invalid');
        
        // Create error message
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
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
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
        if (!requirements.length) missing.push('at least 8 characters');
        if (!requirements.uppercase) missing.push('one uppercase letter');
        if (!requirements.number) missing.push('one number');
        if (!requirements.special) missing.push('one special character');

        return `Password must contain: ${missing.join(', ')}`;
    }

    function validateForm() {
        let isValid = true;
        const adminName = form.querySelector('[name="admin_name"]');
        const adminEmail = form.querySelector('[name="admin_email"]');
        const adminPassword = form.querySelector('[name="admin_password"]');
        const adminConfirmPassword = form.querySelector('[name="admin_confirm_password"]');

        // Clear previous errors
        inputs.forEach(input => hideFieldError(input));

        // Validate Full Name
        if (!adminName.value.trim()) {
            showFieldError(adminName, 'Please enter your full name');
            isValid = false;
        }

        // Validate Email
        if (!adminEmail.value.trim()) {
            showFieldError(adminEmail, 'Please enter your email address');
            isValid = false;
        } else if (!isValidEmail(adminEmail.value)) {
            showFieldError(adminEmail, 'Please enter a valid email address');
            isValid = false;
        }

        // Validate Password
        if (!adminPassword.value) {
            showFieldError(adminPassword, 'Please enter a password');
            isValid = false;
        } else {
            const passwordRequirements = validatePassword(adminPassword.value);
            if (!passwordRequirements.length || !passwordRequirements.uppercase || 
                !passwordRequirements.number || !passwordRequirements.special) {
                showFieldError(adminPassword, getPasswordErrorMessage(passwordRequirements));
                isValid = false;
            }
        }

        // Validate Confirm Password
        if (!adminConfirmPassword.value) {
            showFieldError(adminConfirmPassword, 'Please confirm your password');
            isValid = false;
        } else if (adminPassword.value !== adminConfirmPassword.value) {
            showFieldError(adminConfirmPassword, 'Passwords do not match');
            isValid = false;
        }

        return isValid;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Real-time password strength indicator
    const passwordInput = form.querySelector('[name="admin_password"]');
    passwordInput.addEventListener('input', function() {
        hideFieldError(this);
        
        if (this.value.length > 0) {
            // Show password strength meter
            passwordStrength.style.display = 'block';
            
            // Update strength meter
            updatePasswordStrength(this.value);
        } else {
            // Hide password strength meter when empty
            passwordStrength.style.display = 'none';
        }
    });

    // Real-time validation for other fields
    inputs.forEach(input => {
        if (input.name !== 'admin_password') {
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

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        alertBox.innerHTML = "";

        // Validate form before submission
        if (!validateForm()) {
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;

        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                window.location.href = "../dashboard.php";
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