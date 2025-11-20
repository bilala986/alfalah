<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Signup – Al Falah</title>

        <link href="../../bootstrap/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="../css/admin.css">
    </head>

    <body class="login-body">
        <div class="login-wrapper">
            <div class="login-glass-card text-center w-100" style="max-width: 450px;">
                <img src="../../img/logo.png" class="login-logo mb-2" alt="Al Falah Logo">
                <h3 class="login-title mb-3">Create Admin Account</h3>

                <!-- Alert area -->
                <div id="alertBox"></div>

                <!-- Updated form with CSRF protection -->
                <form action="../php/admin_signup.php" method="POST" id="signupForm">
                    <!-- CSRF Token -->
                    <input type="hidden" name="csrf_token" id="csrf_token">
                    
                    <div class="mb-3">
                        <input type="text" class="form-control" name="admin_name" placeholder="Full Name" required 
                               maxlength="100" pattern="[a-zA-Z\s\.\-\']{2,100}" 
                               title="Name can only contain letters, spaces, hyphens, apostrophes, and periods">
                    </div>
                    <div class="mb-3">
                        <input type="email" class="form-control" name="admin_email" placeholder="Email Address" required 
                               maxlength="150" autocomplete="email">
                    </div>
                    <div class="mb-3">
                        <input type="password" class="form-control" name="admin_password" placeholder="Password" required 
                               maxlength="255" autocomplete="new-password" 
                               pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{12,}$"
                               title="Password must be at least 12 characters with uppercase, lowercase, number, and special character">
                        
                        <!-- Password Strength Meter -->
                        <div id="passwordStrength" class="mt-2" style="display: none;">
                            <div class="progress" style="height: 6px;">
                                <div id="passwordProgress" class="progress-bar" role="progressbar" style="width: 0%"></div>
                            </div>
                            <div id="passwordRequirements" class="mt-2 small">
                                <div class="requirement" data-requirement="length">
                                    <span class="requirement-icon">❌</span>
                                    At least 12 characters
                                </div>
                                <div class="requirement" data-requirement="uppercase">
                                    <span class="requirement-icon">❌</span>
                                    One uppercase letter (A-Z)
                                </div>
                                <div class="requirement" data-requirement="number">
                                    <span class="requirement-icon">❌</span>
                                    One number (0-9)
                                </div>
                                <div class="requirement" data-requirement="special">
                                    <span class="requirement-icon">❌</span>
                                    One special character (!@#$% etc.)
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="mb-4">
                        <input type="password" class="form-control" name="admin_confirm_password" placeholder="Confirm Password" required 
                               maxlength="255" autocomplete="new-password">
                    </div>
                    <button type="submit" class="btn btn-login w-100">Create Account</button>
                </form>
            </div>
        </div>

        <script src="../../bootstrap/js/bootstrap.bundle.min.js"></script>
        <script src="../js/signup.js"></script>
    </body>
</html>