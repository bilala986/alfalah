// admin/js/login.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const alertBox = document.getElementById("alertBox") || createAlertBox();

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

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        alertBox.innerHTML = "";

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
                // ✅ IMMEDIATE redirect to dashboard
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