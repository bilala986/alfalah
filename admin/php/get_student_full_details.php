<?php
require_once 'admin_protect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/alfalah/php/db_connect.php';

header('Content-Type: application/json');

if (isset($_GET['id'])) {
    $student_id = intval($_GET['id']);
    
    try {
        $stmt = $pdo->prepare("SELECT 
            s.*,
            ia.student_gender,
            ia.student_dob,
            ia.student_school,
            ia.parent1_first_name,
            ia.parent1_last_name,
            ia.parent1_relationship,
            ia.parent1_relationship_other,
            ia.parent1_mobile,
            ia.parent1_email,
            ia.parent2_first_name,
            ia.parent2_last_name,
            ia.parent2_relationship,
            ia.parent2_relationship_other,
            ia.parent2_mobile,
            ia.parent2_email,
            ia.emergency_contact,
            ia.address,
            ia.city,
            ia.county,
            ia.postal_code,
            ia.illness,
            ia.illness_details,
            ia.special_needs,
            ia.special_needs_details,
            ia.allergies,
            ia.allergies_details,
            ia.knows_swimming,
            ia.travel_sickness,
            ia.travel_permission,
            ia.photo_permission,
            ia.transport_mode,
            ia.go_home_alone,
            ia.attended_islamic_education,
            ia.islamic_years,
            ia.islamic_education_details,
            ia.submitted_at,
            tu.name as teacher_name,
            tu.id as teacher_id
        FROM students s
        LEFT JOIN initial_admission ia ON s.admission_id = ia.id
        LEFT JOIN teacher_users tu ON s.teacher_id = tu.id
        WHERE s.id = ?");
        $stmt->execute([$student_id]);
        $student = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($student) {
            echo json_encode([
                'success' => true,
                'student' => $student
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Student not found'
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No student ID provided'
    ]);
}
?>