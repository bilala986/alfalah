<?php
// admin/php/approve_admin.php - FOR SUPER ADMIN USE
session_start();
require_once '../../php/db_connect.php';

// Check if current user is super admin (you can set this manually in database)
// For now, this is a basic version - you'll want to add proper authentication

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['admin_id'])) {
    $admin_id = $_POST['admin_id'];
    
    try {
        $stmt = $pdo->prepare("UPDATE admin_users SET is_approved = 1 WHERE id = ?");
        $stmt->execute([$admin_id]);
        
        echo json_encode(["success" => true, "message" => "Admin approved successfully"]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
    exit;
}

// Get pending admins
try {
    $stmt = $pdo->prepare("SELECT id, name, email, created_at FROM admin_users WHERE is_approved = 0 ORDER BY created_at DESC");
    $stmt->execute();
    $pending_admins = $stmt->fetchAll();
} catch (PDOException $e) {
    $pending_admins = [];
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Approve Admins</title>
    <link href="../bootstrap/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-4">
        <h2>Pending Admin Approvals</h2>
        <?php if (empty($pending_admins)): ?>
            <div class="alert alert-info">No pending admin approvals.</div>
        <?php else: ?>
            <div class="list-group">
                <?php foreach ($pending_admins as $admin): ?>
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <h6><?= htmlspecialchars($admin['name']) ?></h6>
                            <small class="text-muted"><?= htmlspecialchars($admin['email']) ?></small><br>
                            <small class="text-muted">Registered: <?= $admin['created_at'] ?></small>
                        </div>
                        <button class="btn btn-success btn-sm approve-btn" data-admin-id="<?= $admin['id'] ?>">Approve</button>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>

    <script>
        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const adminId = this.dataset.adminId;
                
                fetch('approve_admin.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    body: 'admin_id=' + adminId
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.closest('.list-group-item').remove();
                        alert('Admin approved successfully!');
                    } else {
                        alert('Error: ' + data.message);
                    }
                });
            });
        });
    </script>
</body>
</html>