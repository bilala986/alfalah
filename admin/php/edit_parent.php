<?php
// admin/php/edit_parent.php
require_once 'admin_protect.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['parent_id'])) {
    $parent_id = intval($_POST['parent_id']);
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $is_approved = isset($_POST['is_approved']) ? 1 : 0;
    
    // Basic validation
    if (empty($name) || empty($email)) {
        echo json_encode([
            'success' => false,
            'message' => 'Name and email are required'
        ]);
        exit;
    }
    
    try {
        // First get the old email to know what to update in initial_admission
        $oldDataStmt = $pdo->prepare("SELECT email FROM parent_users WHERE id = ?");
        $oldDataStmt->execute([$parent_id]);
        $oldData = $oldDataStmt->fetch();
        $old_email = $oldData['email'];
        
        // Update parent_users table
        $stmt = $pdo->prepare("UPDATE parent_users SET name = ?, email = ?, is_approved = ? WHERE id = ?");
        $stmt->execute([$name, $email, $is_approved, $parent_id]);
        
        // Update initial_admission table - update both parent1 and parent2 emails if they match
        $updateAdmissionStmt = $pdo->prepare("
            UPDATE initial_admission 
            SET 
                parent1_first_name = CASE 
                    WHEN parent1_email = ? THEN SUBSTRING_INDEX(?, ' ', 1) 
                    ELSE parent1_first_name 
                END,
                parent1_last_name = CASE 
                    WHEN parent1_email = ? THEN SUBSTRING_INDEX(?, ' ', -1) 
                    ELSE parent1_last_name 
                END,
                parent1_email = CASE 
                    WHEN parent1_email = ? THEN ? 
                    ELSE parent1_email 
                END,
                parent2_first_name = CASE 
                    WHEN parent2_email = ? THEN SUBSTRING_INDEX(?, ' ', 1) 
                    ELSE parent2_first_name 
                END,
                parent2_last_name = CASE 
                    WHEN parent2_email = ? THEN SUBSTRING_INDEX(?, ' ', -1) 
                    ELSE parent2_last_name 
                END,
                parent2_email = CASE 
                    WHEN parent2_email = ? THEN ? 
                    ELSE parent2_email 
                END
            WHERE parent1_email = ? OR parent2_email = ?
        ");
        
        // Split name into first and last name
        $name_parts = explode(' ', $name, 2);
        $first_name = $name_parts[0];
        $last_name = isset($name_parts[1]) ? $name_parts[1] : '';
        
        $updateAdmissionStmt->execute([
            $old_email, $name,           // parent1 first name
            $old_email, $name,           // parent1 last name  
            $old_email, $email,          // parent1 email
            $old_email, $name,           // parent2 first name
            $old_email, $name,           // parent2 last name
            $old_email, $email,          // parent2 email
            $old_email, $old_email       // WHERE clause
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Parent updated successfully across all systems'
        ]);
        
    } catch (PDOException $e) {
        error_log("Database error in edit_parent.php: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Database error occurred'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request'
    ]);
}
?>