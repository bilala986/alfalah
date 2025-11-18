<?php
// =============================
//   SECURE PROCESS ADMISSIONS FORM
// =============================

// Start session for CSRF protection
session_start();

// For development only - REMOVE IN PRODUCTION
error_reporting(E_ALL);
ini_set('display_errors', 0);

// For production - UNCOMMENT THESE:
// error_reporting(0);
// ini_set('display_errors', 0);

// Security headers
header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");
header("X-XSS-Protection: 1; mode=block");
header("Referrer-Policy: strict-origin-when-cross-origin");

// -----------------------------
//  DATABASE CONNECTION
// -----------------------------
require_once __DIR__ . '/db_connect.php';

// -----------------------------
//  SECURITY CHECKS
// -----------------------------

// Check if it's a POST request
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    die("Method not allowed.");
}

// Check content type
if (isset($_SERVER['CONTENT_TYPE']) && stripos($_SERVER['CONTENT_TYPE'], 'application/x-www-form-urlencoded') === false) {
    http_response_code(415);
    die("Unsupported media type.");
}

// Rate limiting - simple implementation
$rateLimitKey = 'form_submission_' . md5($_SERVER['REMOTE_ADDR']);
$submissionCount = $_SESSION[$rateLimitKey] ?? 0;
$lastSubmissionTime = $_SESSION[$rateLimitKey . '_time'] ?? 0;
$currentTime = time();

// Reset counter if more than 1 hour has passed
if ($currentTime - $lastSubmissionTime > 3600) {
    $submissionCount = 0;
}

// Allow maximum 5 submissions per hour
if ($submissionCount >= 5) {
    http_response_code(429);
    die("Too many submissions. Please try again later.");
}

// -----------------------------
//  INPUT VALIDATION & SANITIZATION
// -----------------------------

function sanitizeInput($data, $type = 'string') {
    if ($data === null) return null;
    
    $data = trim($data);
    $data = stripslashes($data);
    
    switch ($type) {
        case 'email':
            $data = filter_var($data, FILTER_SANITIZE_EMAIL);
            if (!filter_var($data, FILTER_VALIDATE_EMAIL)) {
                return null;
            }
            break;
            
        case 'phone':
            $data = preg_replace('/[^\d+]/', '', $data);
            if (strlen($data) < 10) {
                return null;
            }
            break;
            
        case 'name':
            $data = preg_replace('/[^a-zA-Z\s\-\']/', '', $data);
            if (strlen($data) > 100) {
                $data = substr($data, 0, 100);
            }
            break;
            
        case 'text':
            $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
            break;
            
        case 'date':
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data)) {
                return null;
            }
            $date = DateTime::createFromFormat('Y-m-d', $data);
            if (!$date || $date->format('Y-m-d') !== $data) {
                return null;
            }
            // Check if date is not in future and reasonable (born after 1900)
            $minDate = new DateTime('1900-01-01');
            $maxDate = new DateTime();
            if ($date < $minDate || $date > $maxDate) {
                return null;
            }
            break;
            
        default:
            $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    }
    
    return $data;
}

// Define validation rules for each field
$validationRules = [
    'student_first_name' => 'name',
    'student_last_name' => 'name',
    'student_gender' => 'string',
    'student_dob' => 'date',
    'student_age' => 'int',
    'year_group' => 'string',
    'year_group_other' => 'text',
    'student_school' => 'text',
    'interested_program' => 'string',
    
    'parent1_first_name' => 'name',
    'parent1_last_name' => 'name',
    'parent1_relationship' => 'string',
    'parent1_relationship_other' => 'text',
    'parent1_sibling_age' => 'int',
    'parent1_mobile' => 'phone',
    'parent1_email' => 'email',
    'emergency_contact' => 'phone',
    
    'parent2_first_name' => 'name',
    'parent2_last_name' => 'name',
    'parent2_relationship' => 'string',
    'parent2_relationship_other' => 'text',
    'parent2_sibling_age' => 'int',
    'parent2_mobile' => 'phone',
    'parent2_email' => 'email',
    
    'address' => 'text',
    'city' => 'name',
    'county' => 'name',
    'postal_code' => 'string',
    
    'illness' => 'string',
    'illness_details' => 'text',
    'special_needs' => 'string',
    'special_needs_details' => 'text',
    'allergies' => 'string',
    'allergies_details' => 'text',
    
    'knows_swimming' => 'string',
    'travel_sickness' => 'string',
    'travel_permission' => 'string',
    'photo_permission' => 'string',
    'transport_mode' => 'text',
    'go_home_alone' => 'string',
    
    'attended_islamic_education' => 'string',
    'islamic_years' => 'text',
    'islamic_education_details' => 'text'
];

// Sanitize all inputs
$data = [];
foreach ($validationRules as $field => $type) {
    $input = $_POST[$field] ?? null;
    
    // Required fields validation
    $requiredFields = [
        'student_first_name', 'student_last_name', 'student_gender', 'student_dob',
        'year_group', 'student_school', 'interested_program', 'parent1_first_name',
        'parent1_last_name', 'parent1_relationship', 'parent1_mobile', 'parent1_email',
        'emergency_contact', 'address', 'city', 'postal_code', 'knows_swimming',
        'travel_sickness', 'travel_permission', 'photo_permission', 'transport_mode',
        'go_home_alone', 'attended_islamic_education'
    ];
    
    if (in_array($field, $requiredFields) && empty($input)) {
        http_response_code(400);
        die("Required field missing: $field");
    }
    
    $data[$field] = sanitizeInput($input, $type);
    
    // Additional validation for specific fields
    if (in_array($field, $requiredFields) && $data[$field] === null) {
        http_response_code(400);
        die("Invalid data in field: $field");
    }
}

// Validate age calculation
if (!empty($data['student_dob']) && !empty($data['student_age'])) {
    $dob = new DateTime($data['student_dob']);
    $today = new DateTime();
    $calculatedAge = $today->diff($dob)->y;
    
    if ($calculatedAge != $data['student_age']) {
        http_response_code(400);
        die("Age calculation mismatch.");
    }
}

// -----------------------------
//  DATABASE OPERATION
// -----------------------------

try {
    $pdo->beginTransaction();
    
    $sql = "INSERT INTO initial_admission (
                student_first_name, student_last_name, student_gender, student_dob, student_age,
                year_group, year_group_other, student_school, interested_program,
                parent1_first_name, parent1_last_name, parent1_relationship, parent1_relationship_other,
                parent1_sibling_age, parent1_mobile, parent1_email, emergency_contact,
                parent2_first_name, parent2_last_name, parent2_relationship, parent2_relationship_other,
                parent2_sibling_age, parent2_mobile, parent2_email,
                address, city, county, postal_code,
                illness, illness_details, special_needs, special_needs_details,
                allergies, allergies_details,
                knows_swimming, travel_sickness, travel_permission, photo_permission,
                transport_mode, go_home_alone,
                attended_islamic_education, islamic_years, islamic_education_details
            ) VALUES (
                :student_first_name, :student_last_name, :student_gender, :student_dob, :student_age,
                :year_group, :year_group_other, :student_school, :interested_program,
                :parent1_first_name, :parent1_last_name, :parent1_relationship, :parent1_relationship_other,
                :parent1_sibling_age, :parent1_mobile, :parent1_email, :emergency_contact,
                :parent2_first_name, :parent2_last_name, :parent2_relationship, :parent2_relationship_other,
                :parent2_sibling_age, :parent2_mobile, :parent2_email,
                :address, :city, :county, :postal_code,
                :illness, :illness_details, :special_needs, :special_needs_details,
                :allergies, :allergies_details,
                :knows_swimming, :travel_sickness, :travel_permission, :photo_permission,
                :transport_mode, :go_home_alone,
                :attended_islamic_education, :islamic_years, :islamic_education_details
            )";

    $stmt = $pdo->prepare($sql);
    
    // Bind parameters with explicit types
    foreach ($data as $key => $value) {
        if (strpos($key, 'age') !== false || $key === 'parent1_sibling_age' || $key === 'parent2_sibling_age') {
            $paramType = PDO::PARAM_INT;
            $value = $value !== null ? (int)$value : null;
        } else {
            $paramType = PDO::PARAM_STR;
        }
        $stmt->bindValue(':' . $key, $value, $paramType);
    }
    
    if ($stmt->execute()) {
        $pdo->commit();
        
        // Update rate limiting
        $_SESSION[$rateLimitKey] = $submissionCount + 1;
        $_SESSION[$rateLimitKey . '_time'] = $currentTime;
        
        // Clear sensitive data from memory
        unset($data, $_POST);
        
        // Redirect
        header("Location: ../admission-success.php");
        exit;
    } else {
        $pdo->rollBack();
        throw new Exception("Failed to execute database query.");
    }
    
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    error_log("Admission form error: " . $e->getMessage());
    http_response_code(500);
    die("An error occurred while processing your application. Please try again.");
}

// Clear sensitive data
unset($pdo, $stmt, $data);
?>