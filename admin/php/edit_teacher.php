<?php
// admin/php/edit_teacher.php - UPDATED FOR MULTIPLE YEAR GROUPS AND PROGRAMS
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if teacher_id is set
    if (!isset($_POST['teacher_id'])) {
        echo json_encode(["success" => false, "message" => "Teacher ID is required"]);
        exit;
    }
    
    // Update teacher details
    $teacher_id = intval($_POST['teacher_id']);
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    
    // Handle multiple year groups
    $year_groups = '';
    if (isset($_POST['year_group']) && is_array($_POST['year_group'])) {
        $year_groups = implode(',', array_map('intval', $_POST['year_group']));
    }
    
    // Handle multiple programs
    $programs = '';
    if (isset($_POST['program']) && is_array($_POST['program'])) {
        $valid_programs = [
            'weekday_morning_hifdh',
            'weekday_evening_hifdh', 
            'weekend_evening_islamic_studies',
            'weekend_hifdh',
            'weekend_islamic_studies'
        ];
        
        $filtered_programs = array_filter($_POST['program'], function($program) use ($valid_programs) {
            return in_array($program, $valid_programs);
        });
        
        $programs = implode(',', $filtered_programs);
    }
    
    // FIXED: Properly check checkbox value
    $is_approved = (!empty($_POST['is_approved']) && $_POST['is_approved'] == '1') ? 1 : 0;
    
    // Validate inputs
    if (empty($name) || empty($email)) {
        echo json_encode(["success" => false, "message" => "Name and email are required"]);
        exit;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["success" => false, "message" => "Invalid email format"]);
        exit;
    }
    
    try {
        // Check if email already exists for another teacher
        $stmt = $pdo->prepare("SELECT id FROM teacher_users WHERE email = ? AND id != ?");
        $stmt->execute([$email, $teacher_id]);
        
        if ($stmt->fetch()) {
            echo json_encode(["success" => false, "message" => "Email already exists"]);
            exit;
        }
        
        // Update teacher with year_groups and programs
        $stmt = $pdo->prepare("UPDATE teacher_users SET name = ?, email = ?, year_group = ?, program = ?, is_approved = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$name, $email, $year_groups, $programs, $is_approved, $teacher_id]);
        
        echo json_encode([
            "success" => true, 
            "message" => "Teacher updated successfully",
            "data" => [
                "is_approved" => $is_approved,
                "year_group" => $year_groups,
                "program" => $programs
            ]
        ]);
        
    } catch (PDOException $e) {
        error_log("Edit teacher error: " . $e->getMessage());
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
    
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
}
?>