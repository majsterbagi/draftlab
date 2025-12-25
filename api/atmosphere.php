<?php
/**
 * Atmosphere API
 * Handles temperature/humidity data from iOS Shortcuts (HomePod mini)
 * 
 * GET: Returns all stored data
 * POST: Adds new temperature/humidity reading
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataFile = __DIR__ . '/atmosphere_data.json';

// Initialize data file if doesn't exist
if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode([]));
}

// GET - Return all data
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $data = json_decode(file_get_contents($dataFile), true) ?: [];
    echo json_encode($data);
    exit;
}

// POST - Add new reading
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (!isset($input['temp']) || !isset($input['humidity'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing temp or humidity']);
        exit;
    }
    
    $temp = floatval($input['temp']);
    $humidity = floatval($input['humidity']);
    $timestamp = isset($input['timestamp']) ? intval($input['timestamp']) : time();
    
    // Load existing data
    $data = json_decode(file_get_contents($dataFile), true) ?: [];
    
    // Add new entry
    $data[] = [
        'temp' => $temp,
        'humidity' => $humidity,
        'timestamp' => $timestamp
    ];
    
    // Save data
    file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
    
    echo json_encode(['success' => true, 'count' => count($data)]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
