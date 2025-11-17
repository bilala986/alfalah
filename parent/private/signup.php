<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Parent Account – Hidden</title>

    <link href="../../bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../css/parent.css">
</head>

<body class="login-body">

<div class="login-wrapper">

    <div class="login-glass-card text-center w-100" style="max-width: 450px;">
        
        <div class="text-center mb-4">
            <img src="../../img/logo.png" class="login-logo" alt="Al Falah Logo">
            <h2 class="login-title">Create Account</h2>
            <p class="mb-4" style="font-size: 0.95rem;">
                Please ensure you use the <strong>same parent email address</strong> that was
                provided on the admissions form. Your portal account will link directly to 
                your child's application.
            </p>
        </div>

        <form action="#" method="POST">

            <div class="mb-3">
                <input type="text" class="form-control" name="parent_name" placeholder="Full Name" required>
            </div>

            <div class="mb-3">
                <input type="email" class="form-control" name="parent_email" placeholder="Email Address" required>
            </div>

            <div class="mb-3">
                <input type="password" class="form-control" name="parent_password" placeholder="Password" required>
            </div>

            <div class="mb-4">
                <input type="password" class="form-control" name="parent_password_confirm" placeholder="Confirm Password" required>
            </div>

            <button type="submit" class="btn btn-login w-100">Create Account</button>

        </form>


    </div>

</div>

</body>
</html>
