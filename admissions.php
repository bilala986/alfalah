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
</head>

<body class="bg-light">

<!-- Navbar -->
<nav class="navbar navbar-expand-lg navbar-custom">
    <div class="container">
        <a class="navbar-brand d-flex align-items-center" href="index.html">
            <img src="img/logo.png" alt="Al Falah Logo" height="50" class="me-2">
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarNav" aria-controls="navbarNav"
                aria-expanded="false" aria-label="Toggle navigation">
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


<!-- Header -->
<section class="py-5 text-center">
    <div class="container">
        <h1 class="fw-bold text-success mb-3">Admissions Form</h1>
        <p class="text-muted fs-5">
            Please complete the form below to submit your interest in joining our Madrasah.
            <br>
            <strong class="text-danger">
                Note: Completing this form does NOT confirm admission. You must visit the office to finalise registration.
            </strong>
        </p>
    </div>
</section>


<!-- Admissions Form -->
<section class="pb-5">
    <div class="container">
        <div class="col-lg-8 mx-auto bg-white shadow-sm p-4 p-md-5 rounded">

            <form action="process_admissions.php" method="POST">

                <!-- CHILD DETAILS -->
                <h4 class="text-success fw-bold mb-3">Child’s Details</h4>

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
                        <option value="" selected disabled>Select gender</option>
                        <option>Male</option>
                        <option>Female</option>
                    </select>
                </div>

                <div class="mb-3">
                    <label class="form-label fw-semibold">School Year</label>
                    <input type="number" min="1" max="13" class="form-control" name="child_school_year" required>
                </div>

                <div class="mb-4">
                    <label class="form-label fw-semibold">Program Interested In</label>
                    <select class="form-select" name="child_program" required>
                        <option value="" disabled selected>Select program</option>
                        <option>Weekday Morning Hifdh</option>
                        <option>Weekday Evening Hifdh</option>
                        <option>Weekend Hifdh</option>
                        <option>Weekend Islamic Studies</option>
                    </select>
                </div>

                <hr class="my-4">

                <!-- PARENT DETAILS -->
                <h4 class="text-success fw-bold mb-3">Parent / Guardian Details</h4>

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

                <div class="text-center">
                    <button type="submit" class="btn btn-success-modern btn-lg px-5">
                        Submit Application
                    </button>
                </div>

            </form>
        </div>
    </div>
</section>


<!-- Footer -->
<footer class="py-3 text-center text-white" style="background-color: #006d32;">
    <p class="mb-0">© 2025 Al Falah Educational Centre</p>
</footer>

<!-- Bootstrap JS -->
<script src="bootstrap/js/bootstrap.bundle.min.js"></script>
</body>
</html>
