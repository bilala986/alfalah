document.addEventListener("DOMContentLoaded", function () {
    // ==========================
    // TOGGLE FUNCTION WITH REQUIRED ATTRIBUTE
    // ==========================
    function toggleField(selectId, wrapperId) {
        const select = document.getElementById(selectId);
        const wrapper = document.getElementById(wrapperId);
        const textarea = wrapper.querySelector("textarea");

        if (!select || !wrapper || !textarea) return;

        const updateVisibility = () => {
            if (select.value === "Yes") {
                wrapper.classList.remove("d-none");
                textarea.setAttribute("required", "required");
            } else {
                wrapper.classList.add("d-none");
                textarea.removeAttribute("required");
                textarea.value = "";
            }
        };

        updateVisibility();
        select.addEventListener("change", updateVisibility);
    }

    // ==========================
    // APPLY TO MEDICAL SECTIONS
    // ==========================
    toggleField("illness_select", "illness_details_wrapper");
    toggleField("special_needs_select", "special_needs_details_wrapper");
    toggleField("allergies_select", "allergies_details_wrapper");

    // ==========================
    // PARENT RELATIONSHIP "OTHER" OR SIBLING AGE
    // ==========================
    function setupRelationshipDropdown(selectId, otherInputId, siblingAgeId) {
        const select = document.getElementById(selectId);
        const otherInput = document.getElementById(otherInputId);
        const siblingAgeInput = document.getElementById(siblingAgeId);

        if (!select || !otherInput || !siblingAgeInput) return;

        function updateRelationshipFields() {
            const value = select.value;

            if (value === "Other") {
                otherInput.classList.remove("d-none");
                siblingAgeInput.classList.add("d-none");
                otherInput.setAttribute("required", "required");
                siblingAgeInput.removeAttribute("required");
            } else if (value === "Brother" || value === "Sister") {
                siblingAgeInput.classList.remove("d-none");
                otherInput.classList.add("d-none");
                siblingAgeInput.setAttribute("required", "required");
                otherInput.removeAttribute("required");
            } else {
                otherInput.classList.add("d-none");
                siblingAgeInput.classList.add("d-none");
                otherInput.removeAttribute("required");
                siblingAgeInput.removeAttribute("required");
            }
        }

        updateRelationshipFields();
        select.addEventListener("change", updateRelationshipFields);
    }

    // Apply to both parents
    setupRelationshipDropdown("parent1_relationship_select", "parent1_relationship_other", "parent1_sibling_age");
    setupRelationshipDropdown("parent2_relationship_select", "parent2_relationship_other", "parent2_sibling_age");

    // ==========================
    // ISLAMIC EDUCATION HISTORY (ENHANCED)
    // ==========================
    const islamicSelect = document.getElementById("islamic_select");
    const islamicYears = document.getElementById("islamic_years_wrapper");
    const islamicYearsInput = document.querySelector('input[name="islamic_years"]');
    const islamicDetails = document.getElementById("islamic_details_wrapper");
    const islamicDetailsTextarea = document.querySelector('textarea[name="islamic_education_details"]');

    function updateIslamicFields() {
        if (islamicSelect.value === "Yes") {
            islamicYears.classList.remove("d-none");
            islamicDetails.classList.remove("d-none");
            islamicYearsInput.setAttribute("required", "required");
            islamicDetailsTextarea.setAttribute("required", "required");
        } else {
            islamicYears.classList.add("d-none");
            islamicDetails.classList.add("d-none");
            islamicYearsInput.removeAttribute("required");
            islamicDetailsTextarea.removeAttribute("required");
            islamicYearsInput.value = "";
            islamicDetailsTextarea.value = "";
        }
    }

    updateIslamicFields();
    islamicSelect.addEventListener("change", updateIslamicFields);

    // ==========================
    // PRIVACY POLICY VALIDATION
    // ==========================
    const privacyPolicyCheckbox = document.getElementById("privacyPolicy");

    privacyPolicyCheckbox.addEventListener("change", function() {
        if (!this.checked) {
            this.setCustomValidity("You must agree to the terms and conditions before submitting.");
        } else {
            this.setCustomValidity("");
        }
    });

    // ==========================
    // AGE CALCULATOR
    // ==========================
    document.getElementById("student_dob").addEventListener("change", function () {
        const dob = new Date(this.value);
        const today = new Date();

        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        document.getElementById("student_age").value = age > 0 ? age : "";
    });
    
    // ==========================
    // YEAR GROUP "OTHER" TOGGLE
    // ==========================
    const yearSelect = document.getElementById("year_group_select");
    const yearOtherWrapper = document.getElementById("year_group_other_wrapper");
    const yearOtherInput = document.getElementById("year_group_other");

    if (yearSelect && yearOtherWrapper && yearOtherInput) {
        function updateYearGroup() {
            if (yearSelect.value === "Other") {
                yearOtherWrapper.classList.remove("d-none");
                yearOtherInput.setAttribute("required", "required");
            } else {
                yearOtherWrapper.classList.add("d-none");
                yearOtherInput.removeAttribute("required");
                yearOtherInput.value = "";
            }
        }

        updateYearGroup();
        yearSelect.addEventListener("change", updateYearGroup);
    }

    // ==========================
    // CUSTOM VALIDATION FUNCTIONS
    // ==========================
    
    // Date validation
    function validateDate(dateInput) {
        if (!dateInput.value) return false;
        
        const date = new Date(dateInput.value);
        const today = new Date();
        const minDate = new Date('1900-01-01');
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            dateInput.setCustomValidity("Please enter a valid date.");
            return false;
        }
        
        // Check if date is not in future and not before 1900
        if (date > today) {
            dateInput.setCustomValidity("Date of birth cannot be in the future.");
            return false;
        }
        
        if (date < minDate) {
            dateInput.setCustomValidity("Date of birth must be after 1900.");
            return false;
        }
        
        dateInput.setCustomValidity("");
        return true;
    }

    // Phone number validation (UK format)
    function validatePhone(phoneInput) {
        if (!phoneInput.value) return false;
        
        // Remove all non-digit characters
        const cleanNumber = phoneInput.value.replace(/[^\d+]/g, '');
        
        // Check if it's a valid phone number
        const simpleRegex = /^[\d\+\s\-\(\)]{10,15}$/;
        
        if (!simpleRegex.test(phoneInput.value) || cleanNumber.length < 10) {
            phoneInput.setCustomValidity("Please enter a valid phone number (minimum 10 digits).");
            return false;
        }
        
        phoneInput.setCustomValidity("");
        return true;
    }

    // Email validation
    function validateEmail(emailInput) {
        if (!emailInput.value) return false;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(emailInput.value)) {
            emailInput.setCustomValidity("Please enter a valid email address.");
            return false;
        }
        
        emailInput.setCustomValidity("");
        return true;
    }

    // Age validation for siblings
    function validateSiblingAge(ageInput) {
        if (!ageInput.value || ageInput.classList.contains("d-none")) return true;
        
        const age = parseInt(ageInput.value);
        
        if (isNaN(age) || age < 0) {
            ageInput.setCustomValidity("Please enter a valid age (0 or above).");
            return false;
        }
        
        if (age < 18) {
            ageInput.setCustomValidity("Sibling is under 18. Please select another guardian.");
            return false;
        }
        
        ageInput.setCustomValidity("");
        return true;
    }

    // ==========================
    // SETUP VALIDATION EVENT LISTENERS
    // ==========================
    
    // Date validation
    const dobInput = document.getElementById("student_dob");
    if (dobInput) {
        dobInput.addEventListener("change", function() {
            validateDate(this);
        });
        
        dobInput.addEventListener("input", function() {
            this.setCustomValidity("");
        });
    }

    // Phone validation for all phone fields
    const phoneFields = [
        document.querySelector('input[name="parent1_mobile"]'),
        document.querySelector('input[name="emergency_contact"]'),
        document.querySelector('input[name="parent2_mobile"]')
    ];
    
    phoneFields.forEach(field => {
        if (field) {
            field.addEventListener("blur", function() {
                validatePhone(this);
            });
            
            field.addEventListener("input", function() {
                this.setCustomValidity("");
            });
        }
    });

    // Email validation
    const emailFields = [
        document.querySelector('input[name="parent1_email"]'),
        document.querySelector('input[name="parent2_email"]')
    ];
    
    emailFields.forEach(field => {
        if (field) {
            field.addEventListener("blur", function() {
                validateEmail(this);
            });
            
            field.addEventListener("input", function() {
                this.setCustomValidity("");
            });
        }
    });

    // Sibling age validation
    const siblingAgeFields = [
        document.getElementById("parent1_sibling_age"),
        document.getElementById("parent2_sibling_age")
    ];
    
    siblingAgeFields.forEach(field => {
        if (field) {
            field.addEventListener("blur", function() {
                validateSiblingAge(this);
            });
            
            field.addEventListener("input", function() {
                this.setCustomValidity("");
            });
        }
    });

    // ==========================
    // FORM SUBMISSION HANDLER
    // ==========================
    const form = document.getElementById("admissionForm");
    const generalError = document.getElementById("generalError");

    if (form) {
        form.addEventListener("submit", async function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            // Hide general error at start
            if (generalError) {
                generalError.classList.add("d-none");
            }
            
            // Validate all fields
            let isValid = true;
            
            // Validate date
            if (dobInput && !validateDate(dobInput)) {
                isValid = false;
            }
            
            // Validate phone numbers
            phoneFields.forEach(field => {
                if (field && field.value && !validatePhone(field)) {
                    isValid = false;
                }
            });
            
            // Validate emails
            emailFields.forEach(field => {
                if (field && field.value && !validateEmail(field)) {
                    isValid = false;
                }
            });
            
            // Validate sibling ages
            siblingAgeFields.forEach(field => {
                if (field && !validateSiblingAge(field)) {
                    isValid = false;
                }
            });
            
            // Validate privacy policy
            if (privacyPolicyCheckbox && !privacyPolicyCheckbox.checked) {
                privacyPolicyCheckbox.setCustomValidity("You must agree to the terms and conditions before submitting.");
                isValid = false;
            } else if (privacyPolicyCheckbox) {
                privacyPolicyCheckbox.setCustomValidity("");
            }
            
            // Check form validity
            if (!isValid || !form.checkValidity()) {
                form.classList.add("was-validated");
                
                // Show general error
                if (generalError) {
                    generalError.classList.remove("d-none");
                    
                    // Scroll to error
                    setTimeout(() => {
                        generalError.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                    }, 100);
                }
                
                // Scroll to first invalid field
                const firstInvalid = form.querySelector(':invalid');
                if (firstInvalid) {
                    setTimeout(() => {
                        firstInvalid.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                        firstInvalid.focus();
                    }, 300);
                }
                
                return false;
            }
            
            // All validations passed - submit the form
            form.classList.add("was-validated");
            
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Submitting...";
            submitBtn.disabled = true;
            
            try {
                // Convert form data to URL-encoded format
                const formData = new URLSearchParams();
                const formElements = form.elements;
                
                // Collect all form data
                for (let i = 0; i < formElements.length; i++) {
                    const element = formElements[i];
                    if (element.name && !element.disabled) {
                        if (element.type === 'checkbox' || element.type === 'radio') {
                            if (element.checked) {
                                formData.append(element.name, element.value);
                            }
                        } else {
                            formData.append(element.name, element.value);
                        }
                    }
                }
                
                // Send the form data
                const response = await fetch(form.action, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString()
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Redirect to success page
                    window.location.href = result.redirect;
                } else {
                    // Show error message
                    if (generalError) {
                        generalError.textContent = result.error;
                        generalError.classList.remove("d-none");
                        generalError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        
                        // If there's a specific field error, focus on it
                        if (result.field) {
                            const errorField = form.querySelector(`[name="${result.field}"]`);
                            if (errorField) {
                                errorField.focus();
                                errorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }
                    }
                    
                    // Reset button
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
                
            } catch (error) {
                // Show error message
                if (generalError) {
                    generalError.textContent = "An error occurred: " + error.message;
                    generalError.classList.remove("d-none");
                    generalError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
        
        // Hide general error when user starts correcting fields
        form.addEventListener("input", function() {
            if (generalError) {
                generalError.classList.add("d-none");
            }
        });
        
        form.addEventListener("change", function() {
            if (generalError) {
                generalError.classList.add("d-none");
            }
        });
    }

    // Bootstrap 5 validation styling
    (function () {
        'use strict';
        const forms = document.querySelectorAll('.needs-validation');
        
        forms.forEach(form => {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    })();
});