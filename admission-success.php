<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Submitted – Al Falah</title>

        <link href="bootstrap/css/bootstrap.min.css" rel="stylesheet">

        <style>
            /* Fullscreen green gradient background */
            body {
                margin: 0;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                background: linear-gradient(135deg, #0eb26d, #064d2a);
                font-family: 'Poppins', sans-serif;
            }

            /* Card container */
            .success-container {
                background: white;
                border-radius: 25px;
                padding: 50px 40px;
                max-width: 600px;
                width: 90%;
                box-shadow: 0 20px 50px rgba(0,0,0,0.25);
                text-align: center;
                position: relative;
                overflow: hidden;
            }

            /* Decorative circles */
            .success-container::before,
            .success-container::after {
                content: '';
                position: absolute;
                border-radius: 50%;
                background: rgba(14,178,109,0.3);
                width: 200px;
                height: 200px;
                z-index: 0;
            }
            .success-container::before {
                top: -80px;
                left: -80px;
            }
            .success-container::after {
                bottom: -80px;
                right: -80px;
            }

            /* Content inside card */
            .success-container img {
                height: 80px;
                margin-bottom: 20px;
                z-index: 1;
                position: relative;
            }

            .success-container h1 {
                font-size: 2.5rem;
                font-weight: 700;
                color: #0eb26d; /* Green accent */
                margin-bottom: 20px;
                z-index: 1;
                position: relative;
            }

            .success-container p {
                font-size: 1.1rem;
                line-height: 1.6;
                color: #555;
                z-index: 1;
                position: relative;
                margin-bottom: 30px;
            }

            .success-container a.btn-return {
                padding: 12px 35px;
                background: #0eb26d;
                color: white;
                border-radius: 50px;
                font-weight: 600;
                text-decoration: none;
                transition: 0.3s;
                z-index: 1;
                position: relative;
                display: inline-block;
            }

            .success-container a.btn-return:hover {
                background: #064d2a;
                transform: scale(1.05);
            }

            /* Confetti effect */
            @keyframes floatConfetti {
                0% { transform: translateY(0) rotate(0deg); }
                100% { transform: translateY(500px) rotate(360deg); }
            }

            .confetti {
                position: absolute;
                width: 10px;
                height: 10px;
                background: #0eb26d;
                top: -10px;
                left: 50%;
                animation: floatConfetti 2s linear infinite;
                opacity: 0.7;
                z-index: 0;
                border-radius: 50%;
            }
        </style>
    </head>
    <body>

        <div class="success-container">
            <img src="img/logo.png" alt="Al Falah Logo">
            <h1>Application Submitted!</h1>
            <p>
                Thank you for submitting your child’s admission form.<br><br>
                Our team will review your application and contact you shortly.<br><br>
                If your child is accepted, you will be invited to create a parent account. 
                If not, you will be informed about the decision via email.
            </p>
            <a href="index.html" class="btn-return">Return to Homepage</a>
        </div>

        <!-- Confetti -->
        <div class="confetti" style="left:10%; animation-delay: 0s;"></div>
        <div class="confetti" style="left:30%; animation-delay: 0.5s;"></div>
        <div class="confetti" style="left:60%; animation-delay: 1s;"></div>
        <div class="confetti" style="left:80%; animation-delay: 1.5s;"></div>

    </body>
</html>
