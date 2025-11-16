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

    <div class="login-glass-card shadow-lg">

        <div class="text-center mb-4">
            <img src="../img/logo.png" class="login-logo" alt="Al Falah Logo">
            <h2 class="login-title">Parent Login</h2>
        </div>

        <form action="#" method="POST">
            
            <div class="mb-3">
                <label class="form-label fw-semibold">Email</label>
                <input type="email" class="form-control" name="parent_email" required>
            </div>

            <div class="mb-4">
                <label class="form-label fw-semibold">Password</label>
                <input type="password" class="form-control" name="parent_password" required>
            </div>

            <button type="submit" class="btn btn-login w-100">Login</button>
        </form>

    </div>

</div>

<script src="../bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="js/parent.js"></script>

</body>
</html>
