// admin/js/login.js - TAB-SPECIFIC SESSION ISOLATION

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const alertBox = document.getElementById("alertBox") || createAlertBox();
    const inputs = form.querySelectorAll('input[required]');

    // Remove browser validation
    form.setAttribute('novalidate', '');

    // Generate unique browser instance ID PER TAB (using sessionStorage)
    function getBrowserInstanceId() {
        // Try to get existing ID from sessionStorage (tab-specific)
        let instanceId = sessionStorage.getItem('admin_browser_instance_id');
        
        if (!instanceId) {
            // Generate PHP-compatible session ID: 'a' + 32 hex chars = 33 chars total
            const hexChars = '0123456789abcdef';
            let hexString = 'a'; // Start with 'a' to ensure it's valid
            for (let i = 0; i < 32; i++) {
                hexString += hexChars[Math.floor(Math.random() * 16)];
            }
            instanceId = hexString;
            
            // Store in sessionStorage (tab-specific) AND localStorage (as backup)
            sessionStorage.setItem('admin_browser_instance_id', instanceId);
            localStorage.setItem('admin_tab_' + Date.now(), instanceId); // Store with timestamp for uniqueness
        }
        return instanceId;
    }
    
    

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

    function validateForm() {
        let isValid = true;
        const email = form.querySelector('[name="email"]');
        const password = form.querySelector('[name="password"]');

        inputs.forEach(input => hideFieldError(input));

        if (!email.value.trim()) {
            showFieldError(email, 'Please enter your email address');
            isValid = false;
        } else if (!isValidEmail(email.value)) {
            showFieldError(email, 'Please enter a valid email address');
            isValid = false;
        }

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
    
    // Add this function to login.js
    function validateSessionConsistency() {
        const currentSessionId = sessionStorage.getItem('admin_current_session_id');
        const urlParams = new URLSearchParams(window.location.search);
        const urlSessionId = urlParams.get('bid');

        // If we have both URL session ID and stored session ID, they must match
        if (currentSessionId && urlSessionId && currentSessionId !== urlSessionId) {
            // Session inconsistency detected - likely tab mixing
            sessionStorage.removeItem('admin_current_session_id');
            sessionStorage.removeItem('admin_browser_instance_id');
            window.location.href = 'login.php';
            return false;
        }
        return true;
    }

    // Call this on dashboard pages
    if (window.location.pathname.includes('dashboard.php')) {
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
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;

        const formData = new FormData(form);
        
        // Add browser instance ID to form data (tab-specific)
        formData.append('browser_instance_id', getBrowserInstanceId());

        try {
            const response = await fetch("php/admin_login.php", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                // Store the browser instance ID for this session in sessionStorage
                if (data.browser_instance_id) {
                    sessionStorage.setItem('admin_current_session_id', data.browser_instance_id);
                }
                
                // Redirect with browser instance ID
                window.location.href = "dashboard.php?bid=" + (data.browser_instance_id || getBrowserInstanceId());
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