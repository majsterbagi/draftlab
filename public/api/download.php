<?php
/**
 * DraftCargo - File Download API
 * Serves uploaded files for download
 */

header('Access-Control-Allow-Origin: *');

if (!isset($_GET['id']) || !isset($_GET['name'])) {
    http_response_code(400);
    echo 'Missing file ID or name';
    exit;
}

$fileId = preg_replace('/[^a-zA-Z0-9._-]/', '', $_GET['id']);
$filename = preg_replace('/[^a-zA-Z0-9._-]/', '', $_GET['name']);
$uploadDir = __DIR__ . '/../uploads/';
$filePath = $uploadDir . $fileId . '_' . $filename;

if (!file_exists($filePath)) {
    http_response_code(404);
    echo 'File not found or expired';
    exit;
}

// Set headers for download
header('Content-Description: File Transfer');
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Content-Length: ' . filesize($filePath));
header('Cache-Control: must-revalidate');
header('Pragma: public');

readfile($filePath);
exit;
