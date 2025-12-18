<?php
/**
 * DraftCargo - File Download Handler
 */

$id = $_GET['id'] ?? null;
if (!$id)
    die("Missing file ID");

$uploadDir = __DIR__ . '/../uploads/';
$filePath = $uploadDir . preg_replace('/[^A-Za-z0-0._-]/', '_', $id);
$metaPath = $filePath . '.json';

if (!file_exists($filePath) || !file_exists($metaPath)) {
    header("HTTP/1.0 404 Not Found");
    die("File not found or expired.");
}

$meta = json_decode(file_get_contents($metaPath), true);
$originalName = $meta['originalName'] ?? 'file';

header('Content-Description: File Transfer');
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $originalName . '"');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');
header('Content-Length: ' . filesize($filePath));

readfile($filePath);
exit;
