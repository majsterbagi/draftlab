<?php
/**
 * DraftCargo - Chunked Upload Handler v3.0
 * Uses move_uploaded_file for immediate processing
 */

header('Content-Type: application/json');

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

$fileId = $_POST['fileId'] ?? null;
$chunkIndex = isset($_POST['chunkIndex']) ? (int) $_POST['chunkIndex'] : null;
$totalChunks = isset($_POST['totalChunks']) ? (int) $_POST['totalChunks'] : null;
$fileName = $_POST['fileName'] ?? 'unknown';

if (!$fileId || $chunkIndex === null || !$totalChunks) {
    error_log("Cargo Error: Missing parameters");
    die(json_encode(['error' => 'Missing parameters']));
}

// Clean filename
$safeFileName = preg_replace('/[^A-Za-z0-9._-]/', '_', $fileName);
$tempFile = $uploadDir . $fileId . '.part';

// Check if chunk was uploaded
if (!isset($_FILES['chunk']) || $_FILES['chunk']['error'] !== UPLOAD_ERR_OK) {
    $errorCode = $_FILES['chunk']['error'] ?? 'no_file';
    error_log("Cargo Error: Upload failed. Error code: $errorCode");
    die(json_encode(['error' => "Upload failed (code: $errorCode)"]));
}

$chunkTmpPath = $_FILES['chunk']['tmp_name'];
$chunkSize = $_FILES['chunk']['size'];

error_log("Cargo Debug: Chunk $chunkIndex, tmp_name: $chunkTmpPath, size: $chunkSize");

// For first chunk, create new file. For others, append.
if ($chunkIndex === 0) {
    // First chunk - move directly
    if (!@move_uploaded_file($chunkTmpPath, $tempFile)) {
        error_log("Cargo Error: Cannot move first chunk to $tempFile");
        die(json_encode(['error' => 'Cannot write first chunk']));
    }
    error_log("Cargo Success: First chunk moved to $tempFile");
} else {
    // Subsequent chunks - append to existing file
    $out = @fopen($tempFile, 'ab');
    if (!$out) {
        error_log("Cargo Error: Cannot open $tempFile for appending");
        die(json_encode(['error' => 'Cannot open file for appending']));
    }

    $in = @fopen($chunkTmpPath, 'rb');
    if (!$in) {
        fclose($out);
        error_log("Cargo Error: Cannot read chunk from $chunkTmpPath");
        die(json_encode(['error' => 'Cannot read uploaded chunk']));
    }

    while ($buffer = fread($in, 8192)) {
        fwrite($out, $buffer);
    }

    fclose($in);
    fclose($out);
    error_log("Cargo Success: Chunk $chunkIndex appended to $tempFile");
}

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
        'expiresAt' => time() + (72 * 3600),
        'fileId' => $fileId,
        'size' => filesize($finalPath)
    ];
    file_put_contents($finalPath . '.json', json_encode($metaData));

    error_log("Cargo Success: Upload complete. Final file: $finalPath");

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
