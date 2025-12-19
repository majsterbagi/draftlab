<?php
// Prevent PHP warnings from corrupting the JSON output
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

// Ensure data directory exists and is writable
if (!file_exists($DATA_DIR)) {
    if (!mkdir($DATA_DIR, 0777, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to monitor filesystem']);
        exit;
    }
}

// Handle POST (Save Data)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');

    // Check if input is empty
    if (empty($input)) {
        http_response_code(400);
        echo json_encode(['error' => 'Empty request body']);
        exit;
    }

    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON: ' . json_last_error_msg()]);
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
        'temp' => (float) $data['temp'],
        'humidity' => (float) $data['humidity'],
        'device' => isset($data['device']) ? htmlspecialchars($data['device']) : 'HomePod'
    ];

    // Load existing data
    $currentData = [];
    if (file_exists($DATA_FILE)) {
        $fileContent = file_get_contents($DATA_FILE);
        if ($fileContent) {
            $decoded = json_decode($fileContent, true);
            if (is_array($decoded)) {
                $currentData = $decoded;
            }
        }
    }

    // Append new entry
    $currentData[] = $entry;

    // Limit size
    if (count($currentData) > 5000) {
        $currentData = array_slice($currentData, -5000);
    }

    // Save
    if (file_put_contents($DATA_FILE, json_encode($currentData, JSON_PRETTY_PRINT))) {
        echo json_encode(['status' => 'success', 'logged' => $entry]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to write data storage']);
    }
    exit;
}

// Handle GET (Retrieve Data)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($DATA_FILE)) {
        echo file_get_contents($DATA_FILE);
    } else {
        echo json_encode([]);
    }
    exit;
}
?>