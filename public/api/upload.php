<?php
/**
 * DraftCargo - Base64 Upload Handler v4.0
 * BYPASS: Sends file as Base64 text, not as file upload
 * This completely bypasses the tmp folder requirement
 */

header('Content-Type: application/json');

// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_error.log');

// Increase memory limit for base64 decoding
ini_set('memory_limit', '256M');

$uploadDir = __DIR__ . '/../uploads/';
if (!file_exists($uploadDir)) {
    if (!@mkdir($uploadDir, 0777, true)) {
        die(json_encode(['error' => 'Cannot create uploads directory']));
    }
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die(json_encode(['error' => 'Method not allowed']));
}

// Get parameters from POST (not from $_FILES!)
$fileId = $_POST['fileId'] ?? null;
$chunkIndex = isset($_POST['chunkIndex']) ? (int) $_POST['chunkIndex'] : null;
$totalChunks = isset($_POST['totalChunks']) ? (int) $_POST['totalChunks'] : null;
$fileName = $_POST['fileName'] ?? 'unknown';
$chunkData = $_POST['chunkData'] ?? null; // Base64 encoded chunk

if (!$fileId || $chunkIndex === null || !$totalChunks || !$chunkData) {
    error_log("Cargo Error: Missing parameters. fileId=$fileId, chunkIndex=$chunkIndex, totalChunks=$totalChunks, chunkData=" . (empty($chunkData) ? 'empty' : 'present'));
    die(json_encode(['error' => 'Missing parameters']));
}

// Decode base64 data
$binaryData = base64_decode($chunkData);
if ($binaryData === false) {
    error_log("Cargo Error: Base64 decode failed");
    die(json_encode(['error' => 'Invalid base64 data']));
}

$dataSize = strlen($binaryData);
error_log("Cargo Debug: Chunk $chunkIndex received, $dataSize bytes after base64 decode");

// Clean filename
$safeFileName = preg_replace('/[^A-Za-z0-9._-]/', '_', $fileName);
$tempFile = $uploadDir . $fileId . '.part';

// Write data to file
$mode = $chunkIndex === 0 ? 'wb' : 'ab';
$out = @fopen($tempFile, $mode);
if (!$out) {
    error_log("Cargo Error: Cannot open $tempFile for writing (mode: $mode)");
    die(json_encode(['error' => 'Cannot write to file']));
}

$written = fwrite($out, $binaryData);
fclose($out);

if ($written === false) {
    error_log("Cargo Error: Write failed for chunk $chunkIndex");
    die(json_encode(['error' => 'Write error']));
}

error_log("Cargo Success: Chunk $chunkIndex written, $written bytes");

// If last chunk, finalize
if ($chunkIndex === $totalChunks - 1) {
    $finalPath = $uploadDir . $fileId . '-' . $safeFileName;

    if (!@rename($tempFile, $finalPath)) {
        error_log("Cargo Error: Cannot rename to $finalPath");
        die(json_encode(['error' => 'Cannot finalize file']));
    }

    // Save metadata
    $metaData = [
        'originalName' => $fileName,
        'uploadDate' => time(),
        'expiresAt' => time() + (72 * 3600),
        'fileId' => $fileId,
        'size' => filesize($finalPath)
    ];
    file_put_contents($finalPath . '.json', json_encode($metaData));

    error_log("Cargo Success: Upload complete. File: $finalPath, Size: " . filesize($finalPath));

    echo json_encode([
        'success' => true,
        'message' => 'Upload complete',
        'fileUrl' => 'api/download.php?id=' . $fileId . '-' . $safeFileName
    ]);
} else {
    echo json_encode([
        'success' => true,
        'message' => 'Chunk ' . ($chunkIndex + 1) . '/' . $totalChunks . ' received'
    ]);
}
