<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parent Login – Al Falah</title>

    <link href="../bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/parent.css">
</head>

<body class="login-body">

<div class="login-wrapper">

    <div class="login-glass-card text-center w-100" style="max-width: 450px;">

        <div class="text-center mb-4">
            <img src="../img/logo.png" class="login-logo" alt="Al Falah Logo">
            <h2 class="login-title">Parent Login</h2>
        </div>

        <!-- Alert area -->
        <div id="alertBox"></div>

        <form action="php/parent_login.php" method="POST" id="loginForm">
            <!-- CSRF Token -->
            <input type="hidden" name="csrf_token" id="csrf_token">
            
            <div class="mb-3">
                <input type="email" class="form-control" name="parent_email" placeholder="Email Address" required 
                       maxlength="150" autocomplete="email">
            </div>

            <div class="mb-4">
                <input type="password" class="form-control" name="parent_password" placeholder="Password" required 
                       maxlength="255" autocomplete="current-password">
            </div>

            <button type="submit" class="btn btn-login w-100">Login</button>
        </form>

    </div>

</div>

<script src="../bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="js/login.js"></script>

</body>
</html>