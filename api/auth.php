<?php
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Database Connection Variables
$host = '172.17.14.97';
$dbname = 'blue_fox_agency'; // Your new insurance database
$username = 'root';          // Default XAMPP username
$password = '';              // Default XAMPP password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die(json_encode(['success' => false, 'error' => 'Database connection failed. Please make sure XAMPP MySQL is running.']));
}

$action = $_POST['action'] ?? '';

// ==========================================
// 1. LOGIN PROCESSING
// ==========================================
if ($action === 'login') {
    $user_input = trim($_POST['username'] ?? '');
    $pwd = $_POST['password'] ?? '';
    
    if (empty($user_input) || empty($pwd)) {
        echo json_encode(['success' => false, 'error' => 'Username and password are required']);
        exit;
    }
    
    // Fetch user from the new users table
    $stmt = $pdo->prepare("SELECT id, username, password, full_name, role FROM users WHERE username = ?");
    $stmt->execute([$user_input]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Verify password using PHP's built-in secure hash checker
    if (!$user || !password_verify($pwd, $user['password'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid username or password']);
        exit;
    }
    
    // Set secure session variables
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['full_name'] = $user['full_name'];
    $_SESSION['role'] = $user['role'];
    
    echo json_encode([
        'success' => true, 
        'role' => $user['role'],
        'username' => $user['username'],
        'name' => $user['full_name']
    ]);
    exit;
}

// ==========================================
// 2. CHECK SESSION (Protects the Dashboard)
// ==========================================
if ($action === 'check_session') {
    if (isset($_SESSION['user_id'])) {
        echo json_encode([
            'loggedIn' => true, 
            'name' => $_SESSION['full_name'],
            'role' => $_SESSION['role']
        ]);
    } else {
        echo json_encode(['loggedIn' => false]);
    }
    exit;
}

// ==========================================
// 3. LOGOUT
// ==========================================
if ($action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true]);
    exit;
}

// ==========================================
// 4. SIGN UP (Optional: for later implementation)
// ==========================================
if ($action === 'signup') {
    $newUser = trim($_POST['username'] ?? '');
    $pwd1 = $_POST['password'] ?? '';
    $newFullName = trim($_POST['full_name'] ?? 'New Agent');
    
    if (empty($newUser) || empty($pwd1)) {
        echo json_encode(['success' => false, 'error' => 'All fields are required']);
        exit;
    }
    
    // Check if username already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$newUser]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'error' => 'Username already exists']);
        exit;
    }
    
    // Hash password and insert into database
    $hashedPassword = password_hash($pwd1, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, 'agent')");
    $stmt->execute([$newUser, $hashedPassword, $newFullName]);
    
    echo json_encode(['success' => true, 'message' => 'Account created successfully!']);
    exit;
}

// If no action matches
echo json_encode(['success' => false, 'error' => 'Invalid action specified']);
?>