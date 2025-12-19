<?php
// Suppress errors to prevent corrupted JSON
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Configuration
$DATA_DIR = __DIR__ . '/data';
$DATA_FILE = $DATA_DIR . '/atmosphere_data.json';
$API_SECRET = 'draftlab_secure_key_2024';

// Handle OPTIONS (Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Ensure data directory exists
if (!is_dir($DATA_DIR)) {
    @mkdir($DATA_DIR, 0755, true);
}

// Handle POST (Save Data)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');

    if (empty($input)) {
        http_response_code(400);
        echo json_encode(['error' => 'Empty request body']);
        exit;
    }

    $data = json_decode($input, true);

    if ($data === null) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }

    // Auth Check
    if (!isset($data['passkey']) || $data['passkey'] !== $API_SECRET) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    // Validate payloads
    if (!isset($data['temp']) || !isset($data['humidity'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing temp or humidity']);
        exit;
    }

    $entry = [
        'timestamp' => time(),
        'date' => date('Y-m-d H:i:s'),
        'temp' => floatval($data['temp']),
        'humidity' => floatval($data['humidity']),
        'device' => isset($data['device']) ? strip_tags($data['device']) : 'HomePod'
    ];

    // Load existing data
    $currentData = [];
    if (file_exists($DATA_FILE)) {
        $content = @file_get_contents($DATA_FILE);
        if ($content) {
            $decoded = json_decode($content, true);
            if (is_array($decoded)) {
                $currentData = $decoded;
            }
        }
    }

    // Append new entry
    $currentData[] = $entry;

    // Limit size (keep last 5000)
    if (count($currentData) > 5000) {
        $currentData = array_slice($currentData, -5000);
    }

    // Save
    $result = @file_put_contents($DATA_FILE, json_encode($currentData, JSON_PRETTY_PRINT));

    if ($result !== false) {
        echo json_encode(['status' => 'success', 'logged' => $entry]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Write failed - check folder permissions']);
    }
    exit;
}

// Handle GET (Retrieve Data)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($DATA_FILE)) {
        $content = @file_get_contents($DATA_FILE);
        echo $content ? $content : '[]';
    } else {
        echo '[]';
    }
    exit;
}
?>