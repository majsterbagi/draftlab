<?php
/**
 * DraftCargo - Stats API
 * Returns file transfer statistics
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$statsFile = __DIR__ . '/stats.json';

if (!file_exists($statsFile)) {
    echo json_encode(['count' => 0, 'totalSize' => 0]);
    exit;
}

$stats = json_decode(file_get_contents($statsFile), true);
echo json_encode($stats ?: ['count' => 0, 'totalSize' => 0]);
