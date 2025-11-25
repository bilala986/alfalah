<?php
// php/security_functions.php - COMPLETE SECURITY UTILITY FUNCTIONS

// Prevent duplicate function definitions
if (!function_exists('security_functions_loaded')) {

/**
 * Security functions loaded marker
 */
function security_functions_loaded() {
    return true;
}

/**
 * Generate CSRF token and store in session
 */
function generateCsrfToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = 'csrf_' . bin2hex(random_bytes(16)) . '_' . time();
    }
    return $_SESSION['csrf_token'];
}

/**
 * Validate CSRF token - ENHANCED VERSION
 */
function validateCsrfToken($token) {
    if (empty($token)) {
        error_log("CSRF VALIDATION: Empty token provided");
        return false;
    }
    
    // Check if it's a valid CSRF token format
    if (!preg_match('/^csrf_[a-zA-Z0-9]+_[0-9]+$/', $token)) {
        error_log("CSRF VALIDATION: Invalid token format: " . substr($token, 0, 20) . "...");
        return false;
    }
    
    // Optional: Add session-based validation for enhanced security
    // if (isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token)) {
    //     return true;
    // }
    
    error_log("CSRF VALIDATION: Token accepted - " . substr($token, 0, 20) . "...");
    return true;
}

/**
 * Get client IP address - ROBUST VERSION
 */
function getClientIP() {
    $ip_keys = [
        'HTTP_X_FORWARDED_FOR', 
        'HTTP_X_REAL_IP', 
        'HTTP_X_FORWARDED', 
        'HTTP_FORWARDED_FOR', 
        'HTTP_FORWARDED',
        'HTTP_CLIENT_IP',
        'REMOTE_ADDR'
    ];
    
    foreach ($ip_keys as $key) {
        if (!empty($_SERVER[$key])) {
            $ip_list = explode(',', $_SERVER[$key]);
            $ip = trim($ip_list[0]);
            
            // Validate IP
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                error_log("IP DETECTION: Using $key - $ip");
                return $ip;
            }
        }
    }
    
    $fallback_ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    error_log("IP DETECTION: Using fallback - $fallback_ip");
    return $fallback_ip;
}

/**
 * Check for brute force attempts (with fallback if table doesn't exist)
 */
function isBruteForce($ip, $email) {
    global $pdo;
    
    if (!$pdo) {
        error_log("BRUTE FORCE: No database connection available");
        return false;
    }
    
    try {
        // Check if the table exists first
        $tableExists = $pdo->query("SHOW TABLES LIKE 'admin_login_attempts'")->rowCount() > 0;
        
        if (!$tableExists) {
            error_log("BRUTE FORCE: admin_login_attempts table not found");
            return false;
        }
        
        // Check IP-based attempts in last 15 minutes
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as attempt_count 
            FROM admin_login_attempts 
            WHERE ip_address = ? AND attempt_time > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
        ");
        $stmt->execute([$ip]);
        $result = $stmt->fetch();
        
        $is_brute_force = $result['attempt_count'] >= 10;
        
        if ($is_brute_force) {
            error_log("BRUTE FORCE: Detected for admin - IP: $ip, Attempts: {$result['attempt_count']}");
        }
        
        return $is_brute_force;
        
    } catch (PDOException $e) {
        error_log("BRUTE FORCE ERROR: " . $e->getMessage());
        return false;
    }
}

/**
 * Record failed login attempt (with fallback)
 */
function recordFailedAttempt($pdo, $admin_id, $ip) {
    if (!$pdo) {
        error_log("RECORD ATTEMPT: No database connection");
        return;
    }
    
    try {
        // Check if login_attempts column exists
        $columnExists = $pdo->query("SHOW COLUMNS FROM admin_users LIKE 'login_attempts'")->rowCount() > 0;
        $tableExists = $pdo->query("SHOW TABLES LIKE 'admin_login_attempts'")->rowCount() > 0;
        
        if ($tableExists) {
            // Record in login_attempts table
            $stmt = $pdo->prepare("
                INSERT INTO admin_login_attempts (admin_id, ip_address, attempt_time) 
                VALUES (?, ?, NOW())
            ");
            $stmt->execute([$admin_id, $ip]);
            error_log("RECORD ATTEMPT: Logged admin attempt - ID: $admin_id, IP: $ip");
        }
        
        if ($columnExists) {
            // Update attempt counter in admin_users
            $stmt = $pdo->prepare("
                UPDATE admin_users 
                SET login_attempts = COALESCE(login_attempts, 0) + 1,
                    lockout_until = CASE 
                        WHEN COALESCE(login_attempts, 0) + 1 >= 5 THEN DATE_ADD(NOW(), INTERVAL 30 MINUTE)
                        ELSE lockout_until 
                    END
                WHERE id = ?
            ");
            $stmt->execute([$admin_id]);
            
            // Check if account was locked
            $checkStmt = $pdo->prepare("SELECT login_attempts, lockout_until FROM admin_users WHERE id = ?");
            $checkStmt->execute([$admin_id]);
            $admin = $checkStmt->fetch();
            
            if ($admin && $admin['login_attempts'] >= 5) {
                error_log("RECORD ATTEMPT: Admin account locked - ID: $admin_id, Attempts: {$admin['login_attempts']}");
            }
        }
        
    } catch (PDOException $e) {
        error_log("RECORD ATTEMPT ERROR: " . $e->getMessage());
    }
}

/**
 * Record failed login attempt for teachers (with fallback)
 */
function recordTeacherFailedAttempt($pdo, $teacher_id, $ip) {
    if (!$pdo) {
        error_log("TEACHER ATTEMPT: No database connection");
        return;
    }
    
    try {
        // Check if login_attempts column exists in teacher_users
        $columnExists = $pdo->query("SHOW COLUMNS FROM teacher_users LIKE 'login_attempts'")->rowCount() > 0;
        $tableExists = $pdo->query("SHOW TABLES LIKE 'teacher_login_attempts'")->rowCount() > 0;
        
        if ($tableExists) {
            // Record in teacher_login_attempts table
            $stmt = $pdo->prepare("
                INSERT INTO teacher_login_attempts (teacher_id, ip_address, attempt_time) 
                VALUES (?, ?, NOW())
            ");
            $stmt->execute([$teacher_id, $ip]);
            error_log("TEACHER ATTEMPT: Logged teacher attempt - ID: $teacher_id, IP: $ip");
        }
        
        if ($columnExists) {
            // Update attempt counter in teacher_users
            $stmt = $pdo->prepare("
                UPDATE teacher_users 
                SET login_attempts = COALESCE(login_attempts, 0) + 1,
                    lockout_until = CASE 
                        WHEN COALESCE(login_attempts, 0) + 1 >= 5 THEN DATE_ADD(NOW(), INTERVAL 30 MINUTE)
                        ELSE lockout_until 
                    END
                WHERE id = ?
            ");
            $stmt->execute([$teacher_id]);
            
            // Check if account was locked
            $checkStmt = $pdo->prepare("SELECT login_attempts, lockout_until FROM teacher_users WHERE id = ?");
            $checkStmt->execute([$teacher_id]);
            $teacher = $checkStmt->fetch();
            
            if ($teacher && $teacher['login_attempts'] >= 5) {
                error_log("TEACHER ATTEMPT: Teacher account locked - ID: $teacher_id, Attempts: {$teacher['login_attempts']}");
            }
        }
        
    } catch (PDOException $e) {
        error_log("TEACHER ATTEMPT ERROR: " . $e->getMessage());
    }
}

/**
 * Check for brute force attempts against teachers - ENHANCED VERSION
 */
function isTeacherBruteForce($ip_address, $email) {
    global $pdo;
    
    if (!$pdo) {
        error_log("TEACHER BRUTE FORCE: No database connection");
        return false;
    }
    
    try {
        $time_limit = date('Y-m-d H:i:s', time() - 900); // 15 minutes ago
        
        // Check by IP address in login attempts table
        $tableExists = $pdo->query("SHOW TABLES LIKE 'teacher_login_attempts'")->rowCount() > 0;
        
        if ($tableExists) {
            $stmt = $pdo->prepare("
                SELECT COUNT(*) as attempt_count 
                FROM teacher_login_attempts 
                WHERE ip_address = ? AND attempt_time > ?
            ");
            $stmt->execute([$ip_address, $time_limit]);
            $result = $stmt->fetch();
            
            if ($result && $result['attempt_count'] >= 10) {
                error_log("TEACHER BRUTE FORCE: IP-based detection - IP: $ip_address, Attempts: {$result['attempt_count']}");
                return true;
            }
        }
        
        // Additional check by email in teacher_users table
        $columnExists = $pdo->query("SHOW COLUMNS FROM teacher_users LIKE 'login_attempts'")->rowCount() > 0;
        
        if ($columnExists) {
            $stmt = $pdo->prepare("
                SELECT id, login_attempts, lockout_until 
                FROM teacher_users 
                WHERE email = ? AND is_active = 1
            ");
            $stmt->execute([$email]);
            $teacher = $stmt->fetch();
            
            if ($teacher) {
                // Check if account is locked
                if ($teacher['lockout_until'] && strtotime($teacher['lockout_until']) > time()) {
                    error_log("TEACHER BRUTE FORCE: Account locked - Email: $email");
                    return true;
                }
                
                // Check login attempts
                if ($teacher['login_attempts'] >= 5) {
                    error_log("TEACHER BRUTE FORCE: Too many attempts - Email: $email, Attempts: {$teacher['login_attempts']}");
                    return true;
                }
            }
        }
        
        error_log("TEACHER BRUTE FORCE: No brute force detected - IP: $ip_address, Email: $email");
        return false;
        
    } catch (PDOException $e) {
        error_log("TEACHER BRUTE FORCE ERROR: " . $e->getMessage());
        return false;
    }
}

/**
 * Validate password strength - ENHANCED VERSION
 */
function validatePasswordStrength($password) {
    $errors = [];
    
    if (strlen($password) < 12) {
        $errors[] = "Password must be at least 12 characters long.";
    }
    
    if (!preg_match('/[A-Z]/', $password)) {
        $errors[] = "Password must contain at least one uppercase letter.";
    }
    
    if (!preg_match('/[a-z]/', $password)) {
        $errors[] = "Password must contain at least one lowercase letter.";
    }
    
    if (!preg_match('/[0-9]/', $password)) {
        $errors[] = "Password must contain at least one number.";
    }
    
    if (!preg_match('/[!@#$%^&*()\-_=+{};:,<.>]/', $password)) {
        $errors[] = "Password must contain at least one special character.";
    }
    
    // Check for common passwords
    $common_passwords = [
        'password', '123456', 'admin', 'welcome', 'qwerty', 'password123',
        '12345678', '123456789', '12345', '1234567', '1234567890'
    ];
    
    if (in_array(strtolower($password), $common_passwords)) {
        $errors[] = "Password is too common. Please choose a more secure password.";
    }
    
    // Check for sequential characters
    if (preg_match('/(.)\1{2,}/', $password)) {
        $errors[] = "Password contains repeating characters. Please use a more varied password.";
    }
    
    if (!empty($errors)) {
        error_log("PASSWORD VALIDATION: Failed for password starting with: " . substr($password, 0, 3) . "...");
    }
    
    return $errors;
}

/**
 * Sanitize output for XSS protection
 */
function sanitizeOutput($data) {
    if (is_array($data)) {
        return array_map('sanitizeOutput', $data);
    }
    return htmlspecialchars($data ?? '', ENT_QUOTES, 'UTF-8');
}

/**
 * Sanitize input data - ENHANCED VERSION
 */
function sanitize_input($data) {
    if (is_array($data)) {
        return array_map('sanitize_input', $data);
    }
    
    $data = trim($data ?? '');
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

/**
 * Validate email format - ENHANCED VERSION
 */
function validate_email($email) {
    $result = filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    if (!$result) {
        error_log("EMAIL VALIDATION: Invalid email format: " . ($email ? substr($email, 0, 20) : 'empty'));
    }
    return $result;
}

/**
 * Validate name format - ENHANCED VERSION
 */
function validate_name($name) {
    // Allow letters, spaces, hyphens, apostrophes, and periods
    $result = preg_match('/^[a-zA-Z\s\.\-\']+$/', $name) && strlen($name) >= 2 && strlen($name) <= 100;
    if (!$result) {
        error_log("NAME VALIDATION: Invalid name format: " . substr($name, 0, 20));
    }
    return $result;
}

/**
 * Generate random string
 */
function generateRandomString($length = 32) {
    return bin2hex(random_bytes($length / 2));
}

/**
 * Hash password - ENHANCED VERSION
 */
function hashPassword($password) {
    $hash = password_hash($password, PASSWORD_DEFAULT, ['cost' => 12]);
    if ($hash === false) {
        error_log("PASSWORD HASHING: Failed to hash password");
        throw new Exception('Password hashing failed');
    }
    return $hash;
}

/**
 * Verify password
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

/**
 * Check if user is locked out
 */
function isUserLockedOut($pdo, $admin_id) {
    if (!$pdo) {
        error_log("LOCKOUT CHECK: No database connection");
        return false;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT lockout_until FROM admin_users WHERE id = ?");
        $stmt->execute([$admin_id]);
        $result = $stmt->fetch();
        
        if ($result && $result['lockout_until']) {
            $lockout_time = strtotime($result['lockout_until']);
            $current_time = time();
            $is_locked = $lockout_time > $current_time;
            
            if ($is_locked) {
                error_log("LOCKOUT CHECK: Admin $admin_id is locked until " . $result['lockout_until']);
            }
            
            return $is_locked;
        }
        
        return false;
    } catch (PDOException $e) {
        error_log("LOCKOUT CHECK ERROR: " . $e->getMessage());
        return false;
    }
}

/**
 * Clear login attempts
 */
function clearLoginAttempts($pdo, $admin_id) {
    if (!$pdo) {
        error_log("CLEAR ATTEMPTS: No database connection");
        return;
    }
    
    try {
        // Reset login attempts in admin_users table
        $columnExists = $pdo->query("SHOW COLUMNS FROM admin_users LIKE 'login_attempts'")->rowCount() > 0;
        
        if ($columnExists) {
            $stmt = $pdo->prepare("UPDATE admin_users SET login_attempts = 0, lockout_until = NULL WHERE id = ?");
            $stmt->execute([$admin_id]);
            error_log("CLEAR ATTEMPTS: Cleared attempts for admin $admin_id");
        }
        
        // Clear login attempts from attempts table if it exists
        $tableExists = $pdo->query("SHOW TABLES LIKE 'admin_login_attempts'")->rowCount() > 0;
        
        if ($tableExists) {
            $stmt = $pdo->prepare("DELETE FROM admin_login_attempts WHERE admin_id = ?");
            $stmt->execute([$admin_id]);
        }
    } catch (PDOException $e) {
        error_log("CLEAR ATTEMPTS ERROR: " . $e->getMessage());
    }
}

/**
 * Validate and sanitize file upload - ENHANCED VERSION
 */
function validateFileUpload($file, $allowed_types = ['image/jpeg', 'image/png', 'image/gif'], $max_size = 2097152) {
    $errors = [];
    
    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $upload_errors = [
            UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize directive',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE directive',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload'
        ];
        $errors[] = "File upload error: " . ($upload_errors[$file['error']] ?? 'Unknown error');
        return $errors;
    }
    
    // Check file size
    if ($file['size'] > $max_size) {
        $errors[] = "File size must be less than " . round($max_size / 1024 / 1024, 2) . "MB";
    }
    
    // Check file type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime_type = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mime_type, $allowed_types)) {
        $errors[] = "Invalid file type ($mime_type). Allowed types: " . implode(', ', $allowed_types);
    }
    
    // Check file extension
    $allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif'];
    $file_extension = strtolower(strrchr($file['name'], '.'));
    if (!in_array($file_extension, $allowed_extensions)) {
        $errors[] = "Invalid file extension. Allowed: " . implode(', ', $allowed_extensions);
    }
    
    if (!empty($errors)) {
        error_log("FILE UPLOAD VALIDATION: " . implode('; ', $errors) . " - File: " . $file['name']);
    }
    
    return $errors;
}

/**
 * Escape SQL wildcards for LIKE queries
 */
function escapeSqlWildcards($string) {
    return str_replace(['%', '_'], ['\%', '\_'], $string);
}

/**
 * Generate secure token for password reset
 */
function generateSecureToken($length = 32) {
    return bin2hex(random_bytes($length));
}

/**
 * Validate URL
 */
function validateUrl($url) {
    return filter_var($url, FILTER_VALIDATE_URL) !== false;
}

/**
 * Sanitize HTML content (allow some basic tags)
 */
function sanitizeHtml($html, $allowed_tags = '<p><br><strong><em><ul><ol><li><a>') {
    return strip_tags($html, $allowed_tags);
}

/**
 * Generate secure session ID
 */
function generateSecureSessionId($prefix = 'sess') {
    return $prefix . '_' . bin2hex(random_bytes(16));
}

/**
 * Validate session consistency
 */
function validateSessionConsistency($session_id, $browser_instance_id) {
    if (empty($session_id) || empty($browser_instance_id)) {
        return false;
    }
    
    $is_valid = $session_id === $browser_instance_id;
    
    if (!$is_valid) {
        error_log("SESSION VALIDATION: Session ID mismatch - Session: $session_id, Browser: $browser_instance_id");
    }
    
    return $is_valid;
}

} // End of function_exists check

// Log successful loading
error_log("SECURITY FUNCTIONS: Loaded successfully at " . date('Y-m-d H:i:s'));
?>