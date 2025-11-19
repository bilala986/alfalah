// admin/js/login.js - WITH CUSTOM VALIDATION

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const alertBox = document.getElementById("alertBox") || createAlertBox();
    const inputs = form.querySelectorAll('input[required]');

    // Remove browser validation
    form.setAttribute('novalidate', '');

    // Create alert box if it doesn't exist
    function createAlertBox() {
        const alertDiv = document.createElement('div');
        alertDiv.id = 'alertBox';
        form.parentNode.insertBefore(alertDiv, form.nextSibling);
        return alertDiv;
    }

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
        const email = form.querySelector('[name="email"]');
        const password = form.querySelector('[name="password"]');

        // Clear previous errors
        inputs.forEach(input => hideFieldError(input));

        // Validate Email
        if (!email.value.trim()) {
            showFieldError(email, 'Please enter your email address');
            isValid = false;
        } else if (!isValidEmail(email.value)) {
            showFieldError(email, 'Please enter a valid email address');
            isValid = false;
        }

        // Validate Password
        if (!password.value) {
            showFieldError(password, 'Please enter your password');
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
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;

        const formData = new FormData(form);

        try {
            const response = await fetch("php/admin_login.php", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                window.location.href = "dashboard.php";
            } else {
                showAlert(data.message, "danger");
            }
        } catch (error) {
            console.error("Login error:", error);
            showAlert("Network or server error. Please try again later.");
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
});