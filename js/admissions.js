document.addEventListener("DOMContentLoaded", function () {

    // ==========================
    // TOGGLE FUNCTION
    // ==========================
    function toggleField(selectId, wrapperId) {
        const select = document.getElementById(selectId);
        const wrapper = document.getElementById(wrapperId);

        if (!select || !wrapper) return;

        const updateVisibility = () => {
            if (select.value === "Yes") {
                wrapper.classList.remove("d-none");
            } else {
                wrapper.classList.add("d-none");
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

});
