<?php
/**
 * DraftCargo Upload API v5.1 - Base64 Chunked Upload
 * Obsługuje przesyłanie plików w kawałkach zakodowanych Base64
 */

error_reporting(0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Konfiguracja
$uploadDir = __DIR__ . '/uploads/';
$tempDir = __DIR__ . '/temp/';
$statsFile = __DIR__ . '/stats.json';

// Sprawdź/utwórz foldery
if (!is_dir($uploadDir))
    mkdir($uploadDir, 0755, true);
if (!is_dir($tempDir))
    mkdir($tempDir, 0755, true);

// Pobierz dane z FormData
$chunkData = $_POST['chunkData'] ?? null;
$chunkIndex = intval($_POST['chunkIndex'] ?? 0);
$totalChunks = intval($_POST['totalChunks'] ?? 1);
$fileId = $_POST['fileId'] ?? null;
$fileName = $_POST['fileName'] ?? 'unnamed_file';

if (!$chunkData || !$fileId) {
    echo json_encode(['success' => false, 'error' => 'Brak danych']);
    exit;
}

$binaryData = base64_decode($chunkData);
if ($binaryData === false) {
    echo json_encode(['success' => false, 'error' => 'Base64 error']);
    exit;
}

$tempFile = $tempDir . $fileId . '.part';
$mode = ($chunkIndex === 0) ? 'wb' : 'ab';
$handle = fopen($tempFile, $mode);

if (!$handle) {
    echo json_encode(['success' => false, 'error' => 'File write error']);
    exit;
}

fwrite($handle, $binaryData);
fclose($handle);

if ($chunkIndex + 1 >= $totalChunks) {
    $safeFileName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $fileName);
    $finalPath = $uploadDir . $fileId . '_' . $safeFileName;

    if (rename($tempFile, $finalPath)) {
        // --- STATS COUNTING ---
        clearstatcache();
        $fileSize = filesize($finalPath);

        $stats = ['count' => 0, 'size' => 0];
        if (file_exists($statsFile)) {
            $currentData = json_decode(file_get_contents($statsFile), true);
            if ($currentData)
                $stats = $currentData;
        }

        $stats['count']++;
        $stats['size'] += $fileSize;
        file_put_contents($statsFile, json_encode($stats, JSON_PRETTY_PRINT), LOCK_EX);
        // ----------------------

        $downloadUrl = 'api/download.php?id=' . $fileId . '_' . $safeFileName;

        echo json_encode([
            'success' => true,
            'fileUrl' => $downloadUrl,
            'size' => $fileSize
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Rename error']);
    }
} else {
    echo json_encode(['success' => true, 'chunk' => $chunkIndex, 'total' => $totalChunks]);
}
