<?php
session_start();
header('Content-Type: application/json');
require_once 'db_connect.php';

// Security check: Make sure user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$action = $_GET['action'] ?? '';

if ($action === 'dashboard_stats') {
    $agent_id = $_SESSION['user_id'];
    $stats = [];

    // 1. Today's Appointments
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM appointments WHERE agent_id = ? AND DATE(appointment_date) = CURDATE() AND status != 'cancelled'");
    $stmt->execute([$agent_id]);
    $stats['todayAppointments'] = $stmt->fetchColumn();

    // 2. Total Clients
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM clients WHERE status = 'active'");
    $stmt->execute();
    $stats['totalClients'] = $stmt->fetchColumn();

    // 3. Ongoing Insurance Plans
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM insurance_plans WHERE agent_id = ? AND status = 'ongoing'");
    $stmt->execute([$agent_id]);
    $stats['ongoingPlans'] = $stmt->fetchColumn();

    // 4. Total Recruitment (Placeholder logic - you can adjust based on what this means in your DB)
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE role = 'agent'");
    $stmt->execute();
    $stats['totalRecruitment'] = $stmt->fetchColumn();

    echo json_encode(['success' => true, 'stats' => $stats]);
    exit;
}

// NEW: Appointments List Endpoint
if ($action === 'appointments_list') {
    // Fetch all appointments and join with the clients table to get names/numbers
    $stmt = $pdo->prepare("
        SELECT a.id, a.appointment_date, a.appointment_time, a.reason as treatment, a.status,
               c.name as client_name, c.mobile as client_mobile
        FROM appointments a
        LEFT JOIN clients c ON a.client_id = c.id
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
    ");
    $stmt->execute();
    $appointments = $stmt->fetchAll();

    // Calculate the top statistics
    $total = count($appointments);
    $confirmed = 0;
    $pending = 0;
    
    foreach($appointments as $app) {
        if (strtolower($app['status']) === 'confirmed') $confirmed++;
        if (strtolower($app['status']) === 'pending') $pending++;
    }

    echo json_encode([
        'success' => true,
        'stats' => [
            'total' => $total, 
            'confirmed' => $confirmed, 
            'pending' => $pending
        ],
        'appointments' => $appointments
    ]);
    exit;
}

// NEW: Recruitment List Endpoint
if ($action === 'recruits_list') {
    $agent_id = $_SESSION['user_id'];
    
    // Fetch recruits associated with this agent
    $stmt = $pdo->prepare("
        SELECT id, first_name, last_name, email, phone, status, created_at 
        FROM recruits 
        WHERE agent_id = ? 
        ORDER BY created_at DESC
    ");
    $stmt->execute([$agent_id]);
    $recruits = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'recruits' => $recruits
    ]);
    exit;
}
?>