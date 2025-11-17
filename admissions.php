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
        <nav class="navbar navbar-expand-lg navbar-custom">
            <div class="container">
                <a class="navbar-brand d-flex align-items-center" href="index.html">
                    <img src="img/logo.png" alt="Al Falah Logo" height="50" class="me-2" />
                </a>

                <button
                  class="navbar-toggler"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#navbarNav"
                >
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
                        <li class="nav-item"><a class="nav-link" href="#">Curriculum</a></li>
                        <li class="nav-item"><a class="nav-link" href="#">Hifdh</a></li>
                        <li class="nav-item"><a class="nav-link" href="#">Fees</a></li>
                        <li class="nav-item">
                            <a class="nav-link active" href="admissions.php">Admissions</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        <!-- HEADER SECTION -->
        <section class="admissions-header">
            <div class="header-card">
                <h1>Madrasah Admissions</h1>
                <p>
                    Submit your application below. A member of our staff will contact you shortly.<br>
                    <strong class="text-warning">
                        Please note: Submitting this form does NOT guarantee admission.
                    </strong>
                </p>
            </div>
        </section>



        <!-- ADMISSIONS FORM -->
        <section class="py-5">
            <div class="container">
                <div class="col-lg-10 mx-auto form-card">
                    <form action="php/process_admissions.php" method="POST" novalidate>
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
                            </div>

                            <div class="col-md-4 mb-3">
                                <input
                                    type="text"
                                    class="form-control"
                                    name="student_last_name"
                                    placeholder="Last Name"
                                    required
                                />
                            </div>

                            <div class="col-md-4 mb-3">
                                <select class="form-select" name="student_gender" required>
                                    <option disabled selected>Gender</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Prefer not to say</option>
                                </select>
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
                                    <option disabled selected>Select Year Group / Education Level</option>
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
                            </div>

                        </div>

                        <div class="row">
                            <div class="col-md-8 mb-3">
                                <input
                                    type="text"
                                    class="form-control"
                                    name="student_school"
                                    placeholder="School"
                                />
                            </div>

                            <div class="col-md-4 mb-3">
                                <select class="form-select" name="interested_program" required>
                                    <option disabled selected>Interested Program</option>
                                    <option>Weekday Morning Hifdh</option>
                                    <option>Weekday Evening Hifdh</option>
                                    <option>Weekday Evening Islamic Studies</option>
                                    <option>Weekend Hifdh</option>
                                    <option>Weekend Islamic Studies</option>
                                </select>
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
                                <input
                                    type="text"
                                    class="form-control"
                                    name="parent1_first_name"
                                    placeholder="Parent First Name"
                                    required
                                />
                            </div>

                            <div class="col-md-4 mb-3">
                                <input
                                    type="text"
                                    class="form-control"
                                    name="parent1_last_name"
                                    placeholder="Parent Last Name"
                                    required
                                />
                            </div>

                            <!-- Main Parent Relationship -->
                            <div class="col-md-4 mb-3">
                                <select class="form-select" id="parent1_relationship_select" name="parent1_relationship" required>
                                    <option disabled selected>Relationship</option>
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
                                <input type="text" id="parent1_relationship_other" name="parent1_relationship_other" class="form-control mt-2 d-none" placeholder="Please specify relationship">
                                <input type="number" id="parent1_sibling_age" name="parent1_sibling_age" class="form-control mt-2 d-none" placeholder="Sibling age" min="0">
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <input
                                    type="text"
                                    class="form-control"
                                    name="parent1_mobile"
                                    placeholder="Mobile Number (Primary Contact)"
                                    required
                                />
                            </div>

                            <div class="col-md-4 mb-3">
                                <input
                                    type="email"
                                    class="form-control"
                                    name="parent1_email"
                                    placeholder="Email ID (Used for DD Mandate)"
                                    required
                                />
                                <small class="text-muted d-block mb-3">Use the same email when signing the DD mandate for monthly fees.</small>
                            </div>

                            <div class="col-md-4 mb-3">
                                <input
                                    type="text"
                                    class="form-control"
                                    name="emergency_contact"
                                    placeholder="Emergency Phone Number"
                                    required
                                />
                            </div>
                        </div>

                        

                        <!-- Additional Parent -->
                        <h5 class="fw-bold mt-2">Additional Parent / Guardian (Optional)</h5>

                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <input
                                    type="text"
                                    class="form-control"
                                    name="parent2_first_name"
                                    placeholder="Additional First Name"
                                />
                            </div>

                            <div class="col-md-4 mb-3">
                                <input
                                    type="text"
                                    class="form-control"
                                    name="parent2_last_name"
                                    placeholder="Additional Last Name"
                                />
                            </div>

                            <!-- Additional Parent Relationship -->
                            <div class="col-md-4 mb-3">
                                <select class="form-select" id="parent2_relationship_select" name="parent2_relationship">
                                    <option disabled selected>Relationship</option>
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
                                <input type="number" id="parent2_sibling_age" name="parent2_sibling_age" class="form-control mt-2 d-none" placeholder="Sibling age" min="0">
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <input
                                    type="text"
                                    class="form-control"
                                    name="parent2_mobile"
                                    placeholder="Additional Mobile Number"
                                />
                            </div>

                            <div class="col-md-6 mb-3">
                                <input
                                    type="email"
                                    class="form-control"
                                    name="parent2_email"
                                    placeholder="Additional Email Address"
                                />
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
                            </div>

                            <div class="col-md-4 mb-3">
                                <input
                                    type="text"
                                    class="form-control"
                                    name="county"
                                    placeholder="County"
                                />
                            </div>

                            <div class="col-md-4 mb-3">
                                <input
                                    type="text"
                                    class="form-control"
                                    name="postal_code"
                                    placeholder="Postal Code"
                                    required
                                />
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
                                    <option value="No" selected>No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>

                            <div class="col-md-8 d-none" id="illness_details_wrapper">
                                <textarea
                                    class="form-control"
                                    name="illness_details"
                                    rows="2"
                                    placeholder="If yes, please provide details (e.g. epilepsy, bronchitis, medication)..."
                                ></textarea>
                            </div>
                        </div>

                        <!-- Special educational needs -->
                        <div class="row align-items-start mb-3">
                            <div class="col-md-4">
                                <label class="form-label fw-semibold">Special educational / other needs?</label>
                                <select class="form-select" id="special_needs_select" name="special_needs" required>
                                    <option value="No" selected>No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>

                            <div class="col-md-8 d-none" id="special_needs_details_wrapper">
                                <textarea
                                    class="form-control"
                                    name="special_needs_details"
                                    rows="2"
                                    placeholder="If yes, please provide details (e.g. support, SEN statements)..."
                                ></textarea>
                            </div>
                        </div>

                        <!-- Allergies -->
                        <div class="row align-items-start mb-3">
                            <div class="col-md-4">
                                <label class="form-label fw-semibold">Any allergies?</label>
                                <select class="form-select" id="allergies_select" name="allergies" required>
                                    <option value="No" selected>No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>

                            <div class="col-md-8 d-none" id="allergies_details_wrapper">
                                <textarea
                                    class="form-control"
                                    name="allergies_details"
                                    rows="2"
                                    placeholder="If yes, please list allergies and reactions..."
                                ></textarea>
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
                                <select class="form-select" name="knows_swimming">
                                    <option>No</option>
                                    <option>Yes</option>
                                </select>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Travel sickness</label>
                                <select class="form-select" name="travel_sickness">
                                    <option>No</option>
                                    <option>Yes</option>
                                </select>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Travel permission</label>
                                <select class="form-select" name="travel_permission">
                                    <option>No</option>
                                    <option>Yes</option>
                                </select>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Photo permission</label>
                                <select class="form-select" name="photo_permission">
                                    <option>No</option>
                                    <option>Yes</option>
                                </select>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Mode of transport to/from Madrasah</label>
                                <input type="text" class="form-control" name="transport_mode" placeholder="e.g. Walk / Car / Bus" />
                            </div>

                            <div class="col-md-6">
                                <label class="form-label fw-semibold">Do you permit your child to go home alone?</label>
                                <select class="form-select" name="go_home_alone">
                                    <option>No</option>
                                    <option>Yes</option>
                                </select>
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
                                <select class="form-select" id="islamic_select" name="attended_islamic_education">
                                    <option>No</option>
                                    <option>Yes</option>
                                </select>
                            </div>

                            <div class="col-md-6 d-none" id="islamic_years_wrapper">
                                <label class="form-label fw-semibold">If yes, approximate years attended</label>
                                <input type="text" class="form-control" name="islamic_years" placeholder="e.g. 2 years" />
                            </div>
                        </div>

                        <div class="mb-4 d-none" id="islamic_details_wrapper">
                            <textarea class="form-control" name="islamic_education_details" rows="3" placeholder="If yes, please provide details (e.g. institute, syllabus, level)"></textarea>
                        </div>

                        <!-- PRIVACY POLICY -->
                        <div class="mb-4 form-check">
                            <input class="form-check-input" type="checkbox" id="privacyPolicy" />
                            <label class="form-check-label" for="privacyPolicy">
                                I agree to the
                                <a href="alfalah-privacy-policy.html" target="_blank" class="text-decoration-underline text-success">
                                    Terms and Conditions
                                </a>
                            </label>
                        </div>

                        <div class="text-center mt-4">
                            <button type="submit" class="btn-submit">Submit Application</button>
                        </div>
                    </form>
                </div>
            </div>
        </section>

        <!-- FOOTER -->
        <footer class="py-3 text-center text-white" style="background-color:#006d32;">
            <p class="mb-0">© 2025 Al Falah Educational Centre</p>
        </footer>

        <script src="bootstrap/js/bootstrap.bundle.min.js"></script>
        <script src="js/admissions.js"></script>
    </body>
</html>
