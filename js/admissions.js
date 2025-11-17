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
                textarea.setAttribute("required", "required"); // make required when visible
            } else {
                wrapper.classList.add("d-none");
                textarea.removeAttribute("required"); // remove required when hidden
                textarea.value = ""; // optional: clear field when hidden
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
            } else if (value === "Brother" || value === "Sister") {
                siblingAgeInput.classList.remove("d-none");
                otherInput.classList.add("d-none");
            } else {
                otherInput.classList.add("d-none");
                siblingAgeInput.classList.add("d-none");
            }
        }

        updateRelationshipFields();
        select.addEventListener("change", updateRelationshipFields);
    }

    // Apply to both parents
    setupRelationshipDropdown("parent1_relationship_select", "parent1_relationship_other", "parent1_sibling_age");
    setupRelationshipDropdown("parent2_relationship_select", "parent2_relationship_other", "parent2_sibling_age");



    // ==========================
    // ISLAMIC EDUCATION HISTORY
    // ==========================
    const islamicSelect = document.getElementById("islamic_select");
    const islamicYears = document.getElementById("islamic_years_wrapper");
    const islamicDetails = document.getElementById("islamic_details_wrapper");

    function updateIslamicFields() {
        if (islamicSelect.value === "Yes") {
            islamicYears.classList.remove("d-none");
            islamicDetails.classList.remove("d-none");
        } else {
            islamicYears.classList.add("d-none");
            islamicDetails.classList.add("d-none");
        }
    }

    updateIslamicFields();
    islamicSelect.addEventListener("change", updateIslamicFields);


    // ==========================
    // AGE CALCULATOR (existing)
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
    (function () {
        const select = document.getElementById("year_group_select");
        const wrapper = document.getElementById("year_group_other_wrapper");

        if (!select || !wrapper) return;

        function updateYearGroup() {
            if (select.value === "Other") {
                wrapper.classList.remove("d-none");
            } else {
                wrapper.classList.add("d-none");
            }
        }

        updateYearGroup();
        select.addEventListener("change", updateYearGroup);
    })();

    
    
    
    
    
    // Bootstrap 5 custom validation
    (function () {
        'use strict';
        const forms = document.querySelectorAll('form');

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
    
    
    // ==========================
    // CONDITIONAL VALIDATION FOR YEAR GROUP "OTHER"
    // ==========================
    (function () {
        const yearSelect = document.getElementById("year_group_select");
        const yearOtherWrapper = document.getElementById("year_group_other_wrapper");
        const yearOtherInput = document.getElementById("year_group_other");

        if (!yearSelect || !yearOtherWrapper || !yearOtherInput) return;

        function updateYearOtherRequired() {
            if (yearSelect.value === "Other") {
                yearOtherWrapper.classList.remove("d-none");
                yearOtherInput.setAttribute("required", "required");
            } else {
                yearOtherWrapper.classList.add("d-none");
                yearOtherInput.removeAttribute("required");
                yearOtherInput.value = ""; // optional: clear field when hidden
            }
        }

        updateYearOtherRequired();
        yearSelect.addEventListener("change", updateYearOtherRequired);
    })();

    
    
    // ==========================
    // CONDITIONAL VALIDATION FOR PARENT RELATIONSHIPS WITH AGE CHECK
    // ==========================
    function setupConditionalParentValidation(selectId, otherInputId, siblingInputId, otherFeedbackId, siblingFeedbackId) {
        const select = document.getElementById(selectId);
        const otherInput = document.getElementById(otherInputId);
        const siblingInput = document.getElementById(siblingInputId);

        if (!select || !otherInput || !siblingInput) return;

        function updateRequired() {
            const value = select.value;

            // Reset custom validity
            otherInput.setCustomValidity("");
            siblingInput.setCustomValidity("");

            if (value === "Other") {
                otherInput.classList.remove("d-none");
                otherInput.setAttribute("required", "required");

                siblingInput.classList.add("d-none");
                siblingInput.removeAttribute("required");
                siblingInput.value = "";
            } else if (value === "Brother" || value === "Sister") {
                siblingInput.classList.remove("d-none");
                siblingInput.setAttribute("required", "required");

                otherInput.classList.add("d-none");
                otherInput.removeAttribute("required");
                otherInput.value = "";
            } else {
                otherInput.classList.add("d-none");
                otherInput.removeAttribute("required");
                otherInput.value = "";

                siblingInput.classList.add("d-none");
                siblingInput.removeAttribute("required");
                siblingInput.value = "";
            }
        }

        // Custom sibling validation
        siblingInput.addEventListener("input", function () {
            // Only validate if the sibling input is visible
            if (!siblingInput.classList.contains("d-none")) {
                const val = siblingInput.value;
                if (!val) {
                    siblingInput.setCustomValidity("Please enter the sibling's age.");
                } else if (parseInt(val) < 18) {
                    siblingInput.setCustomValidity("Sibling is under 18. Please select another guardian.");
                } else {
                    siblingInput.setCustomValidity("");
                }
            } else {
                // Reset custom validity if hidden
                siblingInput.setCustomValidity("");
            }
        });


        updateRequired();
        select.addEventListener("change", updateRequired);
    }


    // Apply to both parents
    setupConditionalParentValidation(
        "parent1_relationship_select",
        "parent1_relationship_other",
        "parent1_sibling_age",
        "parent1_other_feedback",
        "parent1_sibling_feedback"
    );

    setupConditionalParentValidation(
        "parent2_relationship_select",
        "parent2_relationship_other",
        "parent2_sibling_age",
        "parent2_other_feedback",
        "parent2_sibling_feedback"
    );


});
