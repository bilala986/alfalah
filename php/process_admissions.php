<?php
// =============================
//   PROCESS ADMISSIONS FORM
// =============================

// Enable error reporting during development (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// -----------------------------
//  DATABASE CONNECTION
// -----------------------------
require_once __DIR__ . '/db_connect.php';



// -----------------------------
//  CHECK FORM SUBMISSION
// -----------------------------

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // Collect all fields safely
    $data = [
        "student_first_name" => $_POST["student_first_name"] ?? null,
        "student_last_name" => $_POST["student_last_name"] ?? null,
        "student_gender" => $_POST["student_gender"] ?? null,
        "student_dob" => $_POST["student_dob"] ?? null,
        "student_age" => $_POST["student_age"] ?? null,
        "year_group" => $_POST["year_group"] ?? null,
        "year_group_other" => $_POST["year_group_other"] ?? null,
        "student_school" => $_POST["student_school"] ?? null,
        "interested_program" => $_POST["interested_program"] ?? null,

        // Parent 1
        "parent1_first_name" => $_POST["parent1_first_name"] ?? null,
        "parent1_last_name" => $_POST["parent1_last_name"] ?? null,
        "parent1_relationship" => $_POST["parent1_relationship"] ?? null,
        "parent1_relationship_other" => $_POST["parent1_relationship_other"] ?? null,
        "parent1_sibling_age" => $_POST["parent1_sibling_age"] ?? null,
        "parent1_mobile" => $_POST["parent1_mobile"] ?? null,
        "parent1_email" => $_POST["parent1_email"] ?? null,
        "emergency_contact" => $_POST["emergency_contact"] ?? null,

        // Parent 2
        "parent2_first_name" => $_POST["parent2_first_name"] ?? null,
        "parent2_last_name" => $_POST["parent2_last_name"] ?? null,
        "parent2_relationship" => $_POST["parent2_relationship"] ?? null,
        "parent2_relationship_other" => $_POST["parent2_relationship_other"] ?? null,
        "parent2_sibling_age" => $_POST["parent2_sibling_age"] ?? null,
        "parent2_mobile" => $_POST["parent2_mobile"] ?? null,
        "parent2_email" => $_POST["parent2_email"] ?? null,

        // Address
        "address" => $_POST["address"] ?? null,
        "city" => $_POST["city"] ?? null,
        "county" => $_POST["county"] ?? null,
        "postal_code" => $_POST["postal_code"] ?? null,

        // Medical
        "illness" => $_POST["illness"] ?? null,
        "illness_details" => $_POST["illness_details"] ?? null,
        "special_needs" => $_POST["special_needs"] ?? null,
        "special_needs_details" => $_POST["special_needs_details"] ?? null,
        "allergies" => $_POST["allergies"] ?? null,
        "allergies_details" => $_POST["allergies_details"] ?? null,

        // Permissions
        "knows_swimming" => $_POST["knows_swimming"] ?? null,
        "travel_sickness" => $_POST["travel_sickness"] ?? null,
        "travel_permission" => $_POST["travel_permission"] ?? null,
        "photo_permission" => $_POST["photo_permission"] ?? null,
        "transport_mode" => $_POST["transport_mode"] ?? null,
        "go_home_alone" => $_POST["go_home_alone"] ?? null,

        // Islamic Education
        "attended_islamic_education" => $_POST["attended_islamic_education"] ?? null,
        "islamic_years" => $_POST["islamic_years"] ?? null,
        "islamic_education_details" => $_POST["islamic_education_details"] ?? null,
    ];

    // -----------------------------
    //  INSERT INTO DATABASE
    // -----------------------------

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

    if ($stmt->execute($data)) {
        // SUCCESS → Redirect to parent signup portal
        header("Location: ../admission-success.php");
        exit;
    } else {
        echo "Something went wrong while saving the application.";
    }
} else {
    echo "Invalid request.";
}
?>
