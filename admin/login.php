<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Login – Al Falah</title>

        <link href="../bootstrap/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="css/admin.css">
    </head>

    <body class="login-body">
        <div class="login-wrapper">
            <div class="login-glass-card text-center w-100" style="max-width: 450px;">
                <img src="../img/logo.png" class="login-logo mb-2" alt="Al Falah Logo">
                <h3 class="login-title mb-4">Admin Login</h3>

                <!-- Alert area -->
                <div id="alertBox"></div>

                <!-- Updated form action -->
                <form action="php/admin_login.php" method="POST" id="loginForm">
                    <div class="mb-3">
                        <input type="email" class="form-control" name="email" placeholder="Email" required>
                    </div>
                    <div class="mb-3">
                        <input type="password" class="form-control" name="password" placeholder="Password" required>
                    </div>
                    <button type="submit" class="btn btn-login w-100">Login</button>
                </form>
            </div>
        </div>

        <script src="../bootstrap/js/bootstrap.bundle.min.js"></script>
        <script src="js/login.js"></script>
    </body>
</html>