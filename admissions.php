<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Admissions – Al Falah Educational Centre</title>

        <!-- Bootstrap CSS -->
        <link href="bootstrap/css/bootstrap.min.css" rel="stylesheet" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
        />
        <link rel="stylesheet" href="css/style.css" />
        <link rel="stylesheet" href="css/admissions.css" />
    </head>

    <body class="bg-light">
        <!-- Navbar -->
        <nav class="navbar navbar-expand-lg navbar-custom fixed-top">
            <div class="container">
                <!-- Brand Logo -->
                <a class="navbar-brand d-flex align-items-center" href="index.html">
                    <img src="img/logo.png" alt="Al Falah Logo" height="50" class="me-2">
                </a>

                <!-- Toggler -->
                <button
                        class="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                        >
                    <span class="navbar-toggler-icon"></span>
                </button>

                <!-- Nav Links -->
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="index.html">Home</a>
                        </li>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Our Madrassah <i class="bi bi-chevron-down dropdown-arrow"></i>
                            </a>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item active" href="about.html">About Us</a></li>
                                <li><a class="dropdown-item" href="management.html">Management</a></li>
                                <li><a class="dropdown-item" href="teachers.html">Teachers</a></li>
                                <li><a class="dropdown-item" href="policies.html">Policies</a></li>
                                <li><a class="dropdown-item" href="#">Calendar</a></li>
                                <li><a class="dropdown-item" href="#">Curriculum</a></li>
                            </ul>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#">Newsletters</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="media.html">Media</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="donations.html">Donations</a></li>
                        <li class="nav-item">
                            <a class="nav-link" href="contact.html">Contact Us</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link active fw-bold" href="admissions.php">Admissions</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        <!-- Admissions Hero Section (EXACTLY like contact page structure) -->
        <section class="admissions-hero-section">
            <div class="hero-content">
                <div class="container">
                    <div class="row justify-content-center text-center">
                        <div class="col-lg-8">
                            <a href="#application-form">
                                <div class="hero-badge text-white">Apply Now</div>
                            </a>
                            <h1 class="hero-title">Madrasah Admissions</h1>
                            <p class="hero-subtitle">
                                Submit your application below. A member of our staff will contact you shortly.
                                <br>
                                <span class="warning-text">
                                    <strong>Please note:</strong> Submitting this form does NOT guarantee admission.
                                </span>
                            </p>
                            <div class="hero-scroll-indicator">
                                <i class="bi bi-chevron-down"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="hero-background">
                <div class="hero-shape-1"></div>
                <div class="hero-shape-2"></div>
                <div class="hero-shape-3"></div>
            </div>
        </section>

        <!-- ADMISSIONS FORM -->
        <section class="py-5" id="application-form">
            <div class="container">
                <div class="col-lg-10 mx-auto form-card">
                    <form action="php/process_admissions.php" method="POST" novalidate id="admissionForm">
                        <!-- ========================= -->
                        <!-- STUDENT DETAILS (3-col) -->
                        <!-- ========================= -->
                        <h3 class="section-title"><i class="bi bi-person-fill"></i> Student Details</h3>

                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <input
                                    type="text"
                                    class="form-control"
                                    name="student_first_name"
                                    placeholder="First Name"
                                    required
                                />
                                <div class="invalid-feedback">Please enter the student's first name.</div>
                            </div>

                            <div class="col-md-4 mb-3">
                                <input
                                    type="text"
                                    class="form-control"
                                    name="student_last_name"
                                    placeholder="Last Name"
                                    required
                                />
                                <div class="invalid-feedback">Please enter the student's last name.</div>
                            </div>

                            <div class="col-md-4 mb-3">
                                <select class="form-select" name="student_gender" required>
                                    <option value="" disabled selected>Gender</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Prefer not to say</option>
                                </select>
                                <div class="invalid-feedback">Please select the student's gender.</div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label class="visually-hidden" for="student_dob">Date of Birth</label>
                                <input
                                    id="student_dob"
                                    type="date"
                                    class="form-control"
                                    name="student_dob"
                                    required
                                />
                                <div class="invalid-feedback">Please select the student's date of birth.</div>
                            </div>

                            <div class="col-md-4 mb-3">
                                <input
                                    id="student_age"
                                    type="text"
                                    class="form-control"
                                    name="student_age"
                                    placeholder="Age"
                                    readonly
                                    style="background:#f7f7f7; cursor:not-allowed;"
                                />
                            </div>

                            <div class="col-md-4 mb-3">
                                <select class="form-select" name="year_group" id="year_group_select" required>
                                    <option value="" disabled selected>Select Year Group / Education Level</option>
                                    <option>Nursery</option>
                                    <option>Reception</option>
                                    <option>Year 1</option>
                                    <option>Year 2</option>
                                    <option>Year 3</option>
                                    <option>Year 4</option>
                                    <option>Year 5</option>
                                    <option>Year 6</option>
                                    <option>Year 7</option>
                                    <option>Year 8</option>
                                    <option>Year 9</option>
                                    <option>Year 10</option>
                                    <option>Year 11</option>
                                    <option>College / Sixth Form</option>
                                    <option>University</option>
                                    <option value="Other">Other</option>
                                </select>
                                <div class="invalid-feedback">Please select a year group.</div>
                            </div>

                            <!-- Hidden text input for "Other" -->
                            <div class="col-md-4 mb-3 d-none" id="year_group_other_wrapper">
                                <input
                                    type="text"
                                    class="form-control"
                                    name="year_group_other"
                                    id="year_group_other"
                                    placeholder="Please specify"
                                />
                                <div class="invalid-feedback">Please specify the year group.</div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-8 mb-3">
                                <input
                                    type="text"
                                    class="form-control"
                                    name="student_school"
                                    placeholder="School"
                                    required
                                />
                                <div class="invalid-feedback">Please enter the student's school.</div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <select class="form-select" name="interested_program" required>
                                    <option value="" disabled selected>Interested Program</option>
                                    <option>Weekday Morning Hifdh</option>
                                    <option>Weekday Evening Hifdh</option>
                                    <option>Weekday Evening Islamic Studies</option>
                                    <option>Weekend Hifdh</option>
                                    <option>Weekend Islamic Studies</option>
                                </select>
                                <div class="invalid-feedback">Please select an interested program.</div>
                            </div>
                        </div>

                        <div class="form-divider"></div>


                        <!-- ========================= -->
                        <!-- PARENT / GUARDIAN (compact) -->
                        <!-- ========================= -->
                        <h3 class="section-title"><i class="bi bi-people-fill"></i> Parent / Guardian Details</h3>

                        <!-- Main Parent -->
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <input type="text" class="form-control" name="parent1_first_name" placeholder="Parent First Name" required />
                                <div class="invalid-feedback">Please enter the first name of the primary parent/guardian.</div>
                            </div>

                            <div class="col-md-4 mb-3">
                                <input type="text" class="form-control" name="parent1_last_name" placeholder="Parent Last Name" required />
                                <div class="invalid-feedback">Please enter the last name of the primary parent/guardian.</div>
                            </div>

                            <!-- Main Parent Relationship -->
                            <div class="col-md-4 mb-3">
                                <select class="form-select" id="parent1_relationship_select" name="parent1_relationship" required>
                                    <option value="" disabled selected>Relationship</option>
                                    <option>Mother</option>
                                    <option>Father</option>
                                    <option>Grandparent</option>
                                    <option>Aunt</option>
                                    <option>Uncle</option>
                                    <option>Brother</option>
                                    <option>Sister</option>
                                    <option>Other</option>
                                </select>
                                <div class="invalid-feedback">Please select the relationship of the primary parent/guardian.</div>

                                <!-- Hidden inputs -->
                                <input type="text" id="parent1_relationship_other" name="parent1_relationship_other" class="form-control mt-2 d-none" placeholder="Please specify relationship">
                                <div class="invalid-feedback" id="parent1_other_feedback">Please specify the relationship.</div>

                                <input type="number" id="parent1_sibling_age" name="parent1_sibling_age" class="form-control mt-2 d-none" placeholder="Sibling age" min="0">
                                <div class="invalid-feedback" id="parent1_sibling_feedback">Sibling is under 18. Please select another guardian.</div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <input type="text" class="form-control" name="parent1_mobile" placeholder="Mobile Number (Primary Contact)" required />
                                <div class="invalid-feedback">Please enter the mobile number of the primary parent/guardian.</div>
                            </div>

                            <div class="col-md-4 mb-3">
                                <input type="email" class="form-control" name="parent1_email" placeholder="Email ID (Used for DD Mandate)" required />
                                <div class="invalid-feedback">Please enter a valid email for the primary parent/guardian.</div>
                                <small class="text-muted d-block mb-3">Use the same email when signing the DD mandate for monthly fees.</small>
                            </div>

                            <div class="col-md-4 mb-3">
                                <input type="text" class="form-control" name="emergency_contact" placeholder="Emergency Phone Number" required />
                                <div class="invalid-feedback">Please enter an emergency contact number.</div>
                            </div>
                        </div>

                        <!-- Additional Parent (Optional) -->
                        <h5 class="fw-bold mt-2">Additional Parent / Guardian (Optional)</h5>

                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <input type="text" class="form-control" name="parent2_first_name" placeholder="Additional First Name" />
                            </div>

                            <div class="col-md-4 mb-3">
                                <input type="text" class="form-control" name="parent2_last_name" placeholder="Additional Last Name" />
                            </div>

                            <!-- Additional Parent Relationship -->
                            <div class="col-md-4 mb-3">
                                <select class="form-select" id="parent2_relationship_select" name="parent2_relationship">
                                    <option value="" disabled selected>Relationship</option>
                                    <option>Mother</option>
                                    <option>Father</option>
                                    <option>Grandparent</option>
                                    <option>Aunt</option>
                                    <option>Uncle</option>
                                    <option>Brother</option>
                                    <option>Sister</option>
                                    <option>Other</option>
                                </select>

                                <!-- Hidden inputs -->
                                <input type="text" id="parent2_relationship_other" name="parent2_relationship_other" class="form-control mt-2 d-none" placeholder="Please specify relationship">
                                <div class="invalid-feedback" id="parent2_other_feedback">Please specify the relationship.</div>

                                <input type="number" id="parent2_sibling_age" name="parent2_sibling_age" class="form-control mt-2 d-none" placeholder="Sibling age" min="0">
                                <div class="invalid-feedback" id="parent2_sibling_feedback">Sibling is under 18. Please select another guardian.</div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <input type="text" class="form-control" name="parent2_mobile" placeholder="Additional Mobile Number" />
                            </div>

                            <div class="col-md-6 mb-3">
                                <input type="email" class="form-control" name="parent2_email" placeholder="Additional Email Address" />
                            </div>
                        </div>

                        <div class="form-divider"></div>




                        <!-- ========================= -->
                        <!-- PRESENT ADDRESS          -->
                        <!-- ========================= -->
                        <h3 class="section-title"><i class="bi bi-geo-alt-fill"></i> Present Address</h3>

                        <div class="mb-3">
                            <input
                                type="text"
                                class="form-control"
                                name="address"
                                placeholder="Address"
                                required
                            />
                            <div class="invalid-feedback">Please enter the address.</div>
                        </div>

                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <input
                                    type="text"
                                    class="form-control"
                                    name="city"
                                    placeholder="City"
                                    required
                                />
                                <div class="invalid-feedback">Please enter the city.</div>
                            </div>

                            <div class="col-md-4 mb-3">
                                <input
                                    type="text"
                                    class="form-control"
                                    name="county"
                                    placeholder="County"
                                />
                                <!-- Optional, no invalid-feedback needed -->
                            </div>

                            <div class="col-md-4 mb-3">
                                <input
                                    type="text"
                                    class="form-control"
                                    name="postal_code"
                                    placeholder="Postal Code"
                                    required
                                />
                                <div class="invalid-feedback">Please enter the postal code.</div>
                            </div>
                        </div>

                        <div class="form-divider"></div>


                        <!-- ========================= -->
                        <!-- MEDICAL INFORMATION -->
                        <!-- ========================= -->
                        <h3 class="section-title"><i class="bi bi-heart-pulse-fill"></i> Medical Information</h3>

                        <!-- Serious / long-term illness -->
                        <div class="row align-items-start mb-3">
                            <div class="col-md-4">
                                <label class="form-label fw-semibold">Serious / long-term illness?</label>
                                <select class="form-select" id="illness_select" name="illness" required>
                                    <option value="" disabled selected>Select an option</option>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                                <div class="invalid-feedback">Please indicate if the student has any serious/long-term illness.</div>
                            </div>

                            <div class="col-md-8 d-none" id="illness_details_wrapper">
                                <textarea
                                    class="form-control"
                                    name="illness_details"
                                    rows="2"
                                    placeholder="If yes, please provide details (e.g. epilepsy, bronchitis, medication)..."
                                    required
                                ></textarea>
                                <div class="invalid-feedback">Please provide details about the illness.</div>
                            </div>
                        </div>

                        <!-- Special educational needs -->
                        <div class="row align-items-start mb-3">
                            <div class="col-md-4">
                                <label class="form-label fw-semibold">Special educational / other needs?</label>
                                <select class="form-select" id="special_needs_select" name="special_needs" required>
                                    <option value="" disabled selected>Select an option</option>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                                <div class="invalid-feedback">Please indicate if the student has any special educational/other needs.</div>
                            </div>

                            <div class="col-md-8 d-none" id="special_needs_details_wrapper">
                                <textarea
                                    class="form-control"
                                    name="special_needs_details"
                                    rows="2"
                                    placeholder="If yes, please provide details (e.g. support, SEN statements)..."
                                    required
                                ></textarea>
                                <div class="invalid-feedback">Please provide details about special needs.</div>
                            </div>
                        </div>

                        <!-- Allergies -->
                        <div class="row align-items-start mb-3">
                            <div class="col-md-4">
                                <label class="form-label fw-semibold">Any allergies?</label>
                                <select class="form-select" id="allergies_select" name="allergies" required>
                                    <option value="" disabled selected>Select an option</option>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                                <div class="invalid-feedback">Please indicate if the student has any allergies.</div>
                            </div>

                            <div class="col-md-8 d-none" id="allergies_details_wrapper">
                                <textarea
                                    class="form-control"
                                    name="allergies_details"
                                    rows="2"
                                    placeholder="If yes, please list allergies and reactions..."
                                    required
                                ></textarea>
                                <div class="invalid-feedback">Please provide details of allergies.</div>
                            </div>
                        </div>

                        <div class="form-divider"></div>


                        <!-- ========================= -->
                        <!-- ADDITIONAL PERMISSIONS (two-column grid) -->
                        <!-- ========================= -->
                        <h3 class="section-title"><i class="bi bi-shield-lock-fill"></i> Permissions & Additional Info</h3>

                        <div class="row gy-3 mb-3">
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Does student know swimming?</label>
                                <select class="form-select" name="knows_swimming" required>
                                    <option value="" disabled selected>Select an option</option>
                                    <option>No</option>
                                    <option>Yes</option>
                                </select>
                                <div class="invalid-feedback">Please indicate if the student knows swimming.</div>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Travel sickness</label>
                                <select class="form-select" name="travel_sickness" required>
                                    <option value="" disabled selected>Select an option</option>
                                    <option>No</option>
                                    <option>Yes</option>
                                </select>
                                <div class="invalid-feedback">Please indicate if the student has travel sickness.</div>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Travel permission</label>
                                <select class="form-select" name="travel_permission" required>
                                    <option value="" disabled selected>Select an option</option>
                                    <option>No</option>
                                    <option>Yes</option>
                                </select>
                                <div class="invalid-feedback">Please indicate travel permission.</div>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Photo permission</label>
                                <select class="form-select" name="photo_permission" required>
                                    <option value="" disabled selected>Select an option</option>
                                    <option>No</option>
                                    <option>Yes</option>
                                </select>
                                <div class="invalid-feedback">Please indicate photo permission.</div>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Mode of transport to/from Madrasah</label>
                                <input type="text" class="form-control" name="transport_mode" placeholder="e.g. Walk / Car / Bus" required />
                                <div class="invalid-feedback">Please specify the mode of transport.</div>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Do you permit your child to go home alone?</label>
                                <select class="form-select" name="go_home_alone" required>
                                    <option value="" disabled selected>Select an option</option>
                                    <option>No</option>
                                    <option>Yes</option>
                                </select>
                                <div class="invalid-feedback">Please indicate if the child can go home alone.</div>
                            </div>
                        </div>

                        <div class="form-divider"></div>

                        <!-- ========================= -->
                        <!-- ISLAMIC EDUCATION HISTORY -->
                        <!-- ========================= -->
                        <h3 class="section-title"><i class="bi bi-book-half"></i> Islamic Education History</h3>

                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Already attended Islamic education?</label>
                                <select class="form-select" id="islamic_select" name="attended_islamic_education" required>
                                    <option value="" disabled selected>Select an option</option>
                                    <option>No</option>
                                    <option>Yes</option>
                                </select>
                                <div class="invalid-feedback">Please indicate if the student has attended Islamic education.</div>
                            </div>

                            <div class="col-md-6 d-none" id="islamic_years_wrapper">
                                <label class="form-label fw-semibold">If yes, approximate years attended</label>
                                <input type="text" class="form-control" name="islamic_years" placeholder="e.g. 2 years" />
                                <div class="invalid-feedback">Please specify approximate years attended.</div>
                            </div>
                        </div>

                        <div class="mb-4 d-none" id="islamic_details_wrapper">
                            <textarea class="form-control" name="islamic_education_details" rows="3" placeholder="If yes, please provide details (e.g. institute, syllabus, level)"></textarea>
                            <div class="invalid-feedback">Please provide details about Islamic education history.</div>
                        </div>

                        <!-- PRIVACY POLICY -->
                        <div class="mb-4 form-check">
                            <input class="form-check-input" type="checkbox" id="privacyPolicy" required />
                            <label class="form-check-label" for="privacyPolicy">
                                I agree to the
                                <a href="alfalah-privacy-policy.html" target="_blank" class="text-decoration-underline text-success">
                                    Terms and Conditions
                                </a>
                            </label>
                            <div class="invalid-feedback">You must agree to the terms and conditions before submitting.</div>
                        </div>

                        <div class="text-center mt-4">
                            <button type="submit" class="btn-submit">Submit Application</button>

                            <!-- ADD THIS GENERAL ERROR MESSAGE -->
                            <div class="alert alert-danger mt-3 d-none" id="generalError" role="alert">
                                <i class="bi bi-exclamation-triangle-fill"></i>
                                Please fix the errors highlighted in red above before submitting.
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer-section bg-dark text-light pt-5">
            <div class="container">
                <div class="row g-4">
                    <!-- Brand Column -->
                    <div class="col-lg-4 col-md-6">
                        <div class="footer-brand mb-4">
                            <img src="img/logo.png" alt="Al Falah Logo" height="50" class="mb-3">
                            <h5 class="text-success fw-bold">Al Falah Educational Centre</h5>
                            <p class="text-light opacity-75 mt-3">
                                Dedicated to nurturing faith, knowledge, and character through Qur'an, Hifdh, and Islamic education.
                            </p>
                            <div class="social-links mt-4">
                                <a href="#" class="social-link me-3">
                                    <i class="bi bi-facebook"></i>
                                </a>
                                <a href="#" class="social-link me-3">
                                    <i class="bi bi-twitter"></i>
                                </a>
                                <a href="#" class="social-link me-3">
                                    <i class="bi bi-instagram"></i>
                                </a>
                                <a href="#" class="social-link">
                                    <i class="bi bi-youtube"></i>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Links -->
                    <div class="col-lg-2 col-md-6">
                        <h6 class="text-success fw-bold mb-3">Quick Links</h6>
                        <ul class="list-unstyled">
                            <li class="mb-2"><a href="index.html" class="footer-link">Home</a></li>
                            <li class="mb-2"><a href="about.html" class="footer-link">About Us</a></li>
                            <li class="mb-2"><a href="admissions.php" class="footer-link">Admissions</a></li>
                            <li class="mb-2"><a href="#" class="footer-link">Calendar</a></li>
                            <li class="mb-2"><a href="contact.html" class="footer-link">Contact</a></li>
                            <li class="mb-2"><a href="admin/" class="footer-link">Admin</a></li>
                        </ul>
                    </div>

                    <!-- Programs -->
                    <div class="col-lg-3 col-md-6">
                        <h6 class="text-success fw-bold mb-3">Our Programs</h6>
                        <ul class="list-unstyled">
                            <li class="mb-2"><a href="#" class="footer-link">Qur'an Classes</a></li>
                            <li class="mb-2"><a href="#" class="footer-link">Hifdh Program</a></li>
                            <li class="mb-2"><a href="#" class="footer-link">Islamic Studies</a></li>
                            <li class="mb-2"><a href="#" class="footer-link">Weekend Madrasah</a></li>
                            <li class="mb-2"><a href="#" class="footer-link">Adult Education</a></li>
                        </ul>
                    </div>

                    <!-- Contact Info -->
                    <div class="col-lg-3 col-md-6">
                        <h6 class="text-success fw-bold mb-3">Contact Info</h6>
                        <div class="contact-info">
                            <div class="d-flex align-items-start mb-3">
                                <i class="bi bi-geo-alt-fill text-success me-3 mt-1"></i>
                                <div>
                                    <p class="mb-0 text-light opacity-75">2 Whitefriars Avenue,</p>
                                    <p class="mb-0 text-light opacity-75">Harrow, Middlesex, HA3 5RN</p>
                                </div>
                            </div>
                            <div class="d-flex align-items-center mb-3">
                                <i class="bi bi-telephone-fill text-success me-3"></i>
                                <span class="text-light opacity-75">(+44) 208 427 3113</span>
                            </div>
                            <div class="d-flex align-items-center mb-3">
                                <i class="bi bi-envelope-fill text-success me-3"></i>
                                <span class="text-light opacity-75">info@slmcc.co.uk</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <i class="bi bi-clock-fill text-success me-3"></i>
                                <div>
                                    <p class="mb-0 text-light opacity-75">Mon-Thu: 5:30pm – 7:30pm</p>
                                    <p class="mb-0 text-light opacity-75">Sat-Sun: 9:00am – 1:00pm</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Divider -->
                <div class="border-top border-secondary my-4"></div>

                <!-- Bottom Bar -->
                <div class="row align-items-center py-3">
                    <div class="col-md-6">
                        <p class="mb-0 text-light opacity-75">
                            © 2025 Al Falah Educational Centre. All rights reserved.
                        </p>
                    </div>
                    <div class="col-md-6 text-md-end">
                        <div class="footer-links">
                            <a href="#" class="footer-link me-3">Privacy Policy</a>
                            <a href="#" class="footer-link">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>

        <script src="bootstrap/js/bootstrap.bundle.min.js"></script>
        <script src="js/admissions.js"></script>
    </body>
</html>
