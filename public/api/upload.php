<?php
/**
 * DraftCargo - Chunked Upload Handler
 * Optimized for home.pl (Apache/PHP)
 */

// Enable error logging for debugging (will save to api/error.log)
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_error.log');

$uploadDir = __DIR__ . '/../uploads/';
if (!file_exists($uploadDir)) {
    if (!@mkdir($uploadDir, 0777, true)) {
        die(json_encode(['error' => 'Cannot create uploads directory. Check permissions.']));
    }
}

// Basic security: only Allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die(json_encode(['error' => 'Method not allowed']));
}

$fileId = $_POST['fileId'] ?? null;
$chunkIndex = isset($_POST['chunkIndex']) ? (int) $_POST['chunkIndex'] : null;
$totalChunks = isset($_POST['totalChunks']) ? (int) $_POST['totalChunks'] : null;
$fileName = $_POST['fileName'] ?? 'unknown';

if (!$fileId || $chunkIndex === null || !$totalChunks) {
    die(json_encode(['error' => 'Missing parameters']));
}

// Clean filename for safety (fixed regex 0-9)
$safeFileName = preg_replace('/[^A-Za-z0-9._-]/', '_', $fileName);
$tempFile = $uploadDir . $fileId . '.part';

// Handle upload
if (!isset($_FILES['chunk'])) {
    die(json_encode(['error' => 'No chunk uploaded']));
}

$chunk = $_FILES['chunk']['tmp_name'];

// Append chunk to the main file
$out = fopen($tempFile, $chunkIndex === 0 ? "wb" : "ab");
if ($out) {
    $in = fopen($chunk, "rb");
    if ($in) {
        while ($buff = fread($in, 4096)) {
            fwrite($out, $buff);
        }
    }
    fclose($in);
    fclose($out);
}

// If last chunk, finalize
if ($chunkIndex === $totalChunks - 1) {
    $finalPath = $uploadDir . $fileId . '-' . $safeFileName;
    rename($tempFile, $finalPath);

    // Save metadata for the downloader and cron
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
