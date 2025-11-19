// admin/js/signup.js - WITH CUSTOM VALIDATION

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signupForm");
    const alertBox = document.getElementById("alertBox");
    const inputs = form.querySelectorAll('input[required]');

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
        } else if (adminPassword.value.length < 6) {
            showFieldError(adminPassword, 'Password must be at least 6 characters long');
            isValid = false;
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

    // Real-time validation
    inputs.forEach(input => {
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