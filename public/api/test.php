<?php
// Ultra simple test - always returns success if server is working
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Log the request for debugging
$logFile = __DIR__ . '/debug.log';
$logData = [
    'time' => date('Y-m-d H:i:s'),
    'method' => $_SERVER['REQUEST_METHOD'],
    'input' => file_get_contents('php://input'),
    'headers' => getallheaders()
];
file_put_contents($logFile, json_encode($logData, JSON_PRETTY_PRINT) . "\n---\n", FILE_APPEND);

// Always return success
echo json_encode([
    'status' => 'ok',
    'message' => 'Test endpoint works!',
    'method' => $_SERVER['REQUEST_METHOD'],
    'time' => date('Y-m-d H:i:s')
]);
?>