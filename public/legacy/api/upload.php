<?php
/**
 * DraftCargo - Chunked File Upload API
 * Handles large file uploads via Base64 chunks
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$uploadDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Support both FormData (from CargoController) and JSON body
$input = [];
if (!empty($_POST)) {
    // FormData from CargoController.js
    $input = [
        'filename' => $_POST['fileName'] ?? '',
        'chunk' => $_POST['chunkData'] ?? '',
        'chunkIndex' => $_POST['chunkIndex'] ?? '',
        'totalChunks' => $_POST['totalChunks'] ?? '',
        'fileId' => $_POST['fileId'] ?? ''
    ];
} else {
    // JSON body (legacy support)
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
}

if (empty($input['filename']) || empty($input['chunk']) || !isset($input['chunkIndex']) || !isset($input['totalChunks'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$filename = preg_replace('/[^a-zA-Z0-9._-]/', '', $input['filename']);
$chunkIndex = intval($input['chunkIndex']);
$totalChunks = intval($input['totalChunks']);
$chunk = $input['chunk'];

// Validate Base64
if (!preg_match('/^[A-Za-z0-9+\/=]+$/', $chunk)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid Base64 data']);
    exit;
}

// Generate unique file ID for this upload session
$fileId = isset($input['fileId']) ? $input['fileId'] : uniqid('cargo_', true);
$tempDir = $uploadDir . $fileId . '/';

if (!is_dir($tempDir)) {
    mkdir($tempDir, 0755, true);
}

// Save chunk
$chunkFile = $tempDir . 'chunk_' . str_pad($chunkIndex, 5, '0', STR_PAD_LEFT);
file_put_contents($chunkFile, base64_decode($chunk));

// Check if all chunks received
$receivedChunks = count(glob($tempDir . 'chunk_*'));

if ($receivedChunks === $totalChunks) {
    // Combine chunks
    $finalFile = $uploadDir . $fileId . '_' . $filename;
    $fp = fopen($finalFile, 'wb');

    for ($i = 0; $i < $totalChunks; $i++) {
        $chunkPath = $tempDir . 'chunk_' . str_pad($i, 5, '0', STR_PAD_LEFT);
        if (file_exists($chunkPath)) {
            fwrite($fp, file_get_contents($chunkPath));
            unlink($chunkPath);
        }
    }
    fclose($fp);
    rmdir($tempDir);

    // Update stats
    $statsFile = __DIR__ . '/stats.json';
    $stats = file_exists($statsFile) ? json_decode(file_get_contents($statsFile), true) : ['count' => 0, 'totalSize' => 0];
    $stats['count']++;
    $stats['totalSize'] += filesize($finalFile);
    file_put_contents($statsFile, json_encode($stats));

    $downloadUrl = 'https://draftlab.pl/api/download.php?id=' . $fileId . '&name=' . urlencode($filename);

    echo json_encode([
        'success' => true,
        'complete' => true,
        'fileUrl' => $downloadUrl,
        'fileId' => $fileId
    ]);
} else {
    echo json_encode([
        'success' => true,
        'complete' => false,
        'received' => $receivedChunks,
        'total' => $totalChunks,
        'fileId' => $fileId
    ]);
}
