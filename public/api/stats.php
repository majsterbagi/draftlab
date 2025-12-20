<?php
/**
 * DraftCargo Stats API
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$statsFile = __DIR__ . '/stats.json';

if (file_exists($statsFile)) {
    if (!is_readable($statsFile)) {
        echo json_encode(['error' => 'FILE_NOT_READABLE', 'count' => 0, 'size' => 0]);
        exit;
    }
    $content = file_get_contents($statsFile);
    $data = json_decode($content, true);
    if ($data) {
        echo $content;
        exit;
    } else {
        echo json_encode(['error' => 'INVALID_JSON', 'count' => 0, 'size' => 0]);
        exit;
    }
}
echo json_encode(['error' => 'FILE_NOT_FOUND', 'count' => 0, 'size' => 0]);
