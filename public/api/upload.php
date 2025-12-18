<?php
/**
 * DraftCargo - RAW Upload Handler (v2.0)
 * Optimized for home.pl - bypasses $_FILES and tmp directory
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-File-Id, X-Chunk-Index, X-Total-Chunks, X-File-Name');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_error.log');

$uploadDir = __DIR__ . '/../uploads/';
if (!file_exists($uploadDir)) {
    if (!@mkdir($uploadDir, 0777, true)) {
        die(json_encode(['error' => 'Cannot create uploads directory. Check permissions.']));
    }
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die(json_encode(['error' => 'Method not allowed']));
}

// Read metadata from headers (sent by frontend)
$fileId = $_SERVER['HTTP_X_FILE_ID'] ?? null;
$chunkIndex = isset($_SERVER['HTTP_X_CHUNK_INDEX']) ? (int) $_SERVER['HTTP_X_CHUNK_INDEX'] : null;
$totalChunks = isset($_SERVER['HTTP_X_TOTAL_CHUNKS']) ? (int) $_SERVER['HTTP_X_TOTAL_CHUNKS'] : null;
$fileName = $_SERVER['HTTP_X_FILE_NAME'] ?? 'unknown';

if (!$fileId || $chunkIndex === null || !$totalChunks) {
    error_log("Cargo Error: Missing headers. FileId: $fileId, ChunkIndex: $chunkIndex, TotalChunks: $totalChunks");
    die(json_encode(['error' => 'Missing required headers']));
}

// Clean filename
$safeFileName = preg_replace('/[^A-Za-z0-9._-]/', '_', $fileName);
$tempFile = $uploadDir . $fileId . '.part';

// Read RAW POST data directly (bypasses $_FILES and tmp folder)
$input = fopen('php://input', 'rb');
if (!$input) {
    error_log("Cargo Error: Cannot open php://input");
    die(json_encode(['error' => 'Cannot read upload stream']));
}

// Open target file for writing
$mode = $chunkIndex === 0 ? 'wb' : 'ab';
$out = @fopen($tempFile, $mode);
if (!$out) {
    fclose($input);
    error_log("Cargo Error: Cannot open $tempFile for writing (mode: $mode)");
    die(json_encode(['error' => 'Cannot write to uploads directory. Check permissions.']));
}

// Stream data directly from input to file
$bytesWritten = 0;
while (!feof($input)) {
    $buffer = fread($input, 8192);
    if ($buffer === false)
        break;
    $written = fwrite($out, $buffer);
    if ($written === false) {
        fclose($input);
        fclose($out);
        error_log("Cargo Error: Write failed for chunk $chunkIndex");
        die(json_encode(['error' => 'Write error during chunk transfer']));
    }
    $bytesWritten += $written;
}

fclose($input);
fclose($out);

error_log("Cargo Success: Chunk $chunkIndex received, $bytesWritten bytes written");

// If last chunk, finalize
if ($chunkIndex === $totalChunks - 1) {
    $finalPath = $uploadDir . $fileId . '-' . $safeFileName;

    if (!@rename($tempFile, $finalPath)) {
        error_log("Cargo Error: Cannot rename $tempFile to $finalPath");
        die(json_encode(['error' => 'Cannot finalize file']));
    }

    // Save metadata
    $metaData = [
        'originalName' => $fileName,
        'uploadDate' => time(),
        'expiresAt' => time() + (72 * 3600), // 72 hours
        'fileId' => $fileId,
        'size' => filesize($finalPath)
    ];
    file_put_contents($finalPath . '.json', json_encode($metaData));

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
