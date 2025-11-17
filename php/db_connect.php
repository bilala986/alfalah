<?php
// =============================================
// DATABASE CONNECTION (db_connect.php)
// =============================================

$host = "localhost";
$dbname = "bilazqnw_alfalah";
$username = "bilazqnw_alfalah-admin";
$password = "Smash3cv4tc!"; // ← Add your hosting password here

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
?>
