<?php
/**
 * DraftCargo Download API
 */

$uploadDir = __DIR__ . '/uploads/';
$id = $_GET['id'] ?? '';

if (empty($id))
    die("Error: No file ID specified.");

$safeId = preg_replace('/[^a-zA-Z0-9._-]/', '', $id);
$filePath = $uploadDir . $safeId;

if (file_exists($filePath)) {
    $parts = explode('_', $safeId, 3);
    $displayName = (count($parts) >= 3) ? $parts[2] : $safeId;

    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . $displayName . '"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($filePath));

    readfile($filePath);
    exit;
} else {
    http_response_code(404);
    die("Error: File not found.");
}
