<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admissions – Al Falah Educational Centre</title>

    <!-- Bootstrap CSS -->
    <link href="bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/admissions.css">
</head>

<body class="bg-light">

<!-- Navbar -->
<nav class="navbar navbar-expand-lg navbar-custom">
    <div class="container">
        <a class="navbar-brand d-flex align-items-center" href="index.html">
            <img src="img/logo.png" alt="Al Falah Logo" height="50" class="me-2">
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
                <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
                <li class="nav-item"><a class="nav-link" href="#">Curriculum</a></li>
                <li class="nav-item"><a class="nav-link" href="#">Hifdh</a></li>
                <li class="nav-item"><a class="nav-link" href="#">Fees</a></li>
                <li class="nav-item"><a class="nav-link active" href="admissions.php">Admissions</a></li>
            </ul>
        </div>
    </div>
</nav>

<!-- HEADER SECTION -->
<section class="admissions-header">
    <div class="container">
        <h1>Madrasah Admissions</h1>
        <p>
            Submit your application below. A member of our staff will contact you shortly.<br>
            <strong class="text-warning">Please note: Submitting this form does NOT guarantee admission.</strong>
        </p>
    </div>
    <div class="wave"></div>
</section>


<!-- ADMISSIONS FORM -->
<section class="py-5">
    <div class="container">
        <div class="col-lg-8 mx-auto form-card">

            <form action="process_admissions.php" method="POST">

                <!-- CHILD DETAILS -->
                <h3 class="section-title"><i class="bi bi-person-fill"></i> Child’s Details</h3>

                <div class="mb-3">
                    <label class="form-label fw-semibold">Full Name</label>
                    <input type="text" class="form-control" name="child_name" required>
                </div>

                <div class="mb-3">
                    <label class="form-label fw-semibold">Date of Birth</label>
                    <input type="date" class="form-control" name="child_dob" required>
                </div>

                <div class="mb-3">
                    <label class="form-label fw-semibold">Gender</label>
                    <select class="form-select" name="child_gender" required>
                        <option disabled selected>Select gender</option>
                        <option>Male</option>
                        <option>Female</option>
                    </select>
                </div>

                <div class="mb-3">
                    <label class="form-label fw-semibold">School Year</label>
                    <input type="number" class="form-control" min="1" max="13" name="child_school_year" required>
                </div>

                <div class="mb-3">
                    <label class="form-label fw-semibold">Interested Program</label>
                    <select class="form-select" name="child_program" required>
                        <option disabled selected>Select a program</option>
                        <option>Weekday Morning Hifdh</option>
                        <option>Weekday Evening Hifdh</option>
                        <option>Weekend Hifdh</option>
                        <option>Weekend Islamic Studies</option>
                    </select>
                </div>


                <div class="form-divider"></div>


                <!-- PARENT DETAILS -->
                <h3 class="section-title"><i class="bi bi-people-fill"></i> Parent/Guardian Details</h3>

                <div class="mb-3">
                    <label class="form-label fw-semibold">Full Name</label>
                    <input type="text" class="form-control" name="parent_name" required>
                </div>

                <div class="mb-3">
                    <label class="form-label fw-semibold">Phone Number</label>
                    <input type="text" class="form-control" name="parent_phone" required>
                </div>

                <div class="mb-3">
                    <label class="form-label fw-semibold">Email</label>
                    <input type="email" class="form-control" name="parent_email" required>
                </div>

                <div class="mb-4">
                    <label class="form-label fw-semibold">Relationship to Student</label>
                    <input type="text" class="form-control" name="parent_relationship" required>
                </div>

                <div class="text-center mt-4">
                    <button type="submit" class="btn-submit">
                        Submit Application
                    </button>
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
</body>
</html>
