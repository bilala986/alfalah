<?php
// admin/php/add_class.php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $class_name = trim($_POST['class_name'] ?? '');
    $year_group = trim($_POST['year_group'] ?? '');
    $program = trim($_POST['program'] ?? '');
    $gender = trim($_POST['gender'] ?? 'Mixed');
    $teacher_id = !empty($_POST['teacher_id']) ? intval($_POST['teacher_id']) : null;
    
    // Validate required fields
    if (empty($class_name) || empty($year_group) || empty($program)) {
        echo json_encode(["success" => false, "message" => "All required fields must be filled"]);
        exit;
    }
    
    try {
        // Check if class with same name already exists
        $stmt = $pdo->prepare("SELECT id FROM classes WHERE class_name = ? AND status = 'active'");
        $stmt->execute([$class_name]);
        
        if ($stmt->fetch()) {
            echo json_encode(["success" => false, "message" => "A class with this name already exists"]);
            exit;
        }
        
        // Insert new class
        $stmt = $pdo->prepare("INSERT INTO classes (class_name, year_group, program, gender, teacher_id) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$class_name, $year_group, $program, $gender, $teacher_id]);
        
        echo json_encode([
            "success" => true, 
            "message" => "Class created successfully"
        ]);
        
    } catch (PDOException $e) {
        error_log("Add class error: " . $e->getMessage());
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
}
?>