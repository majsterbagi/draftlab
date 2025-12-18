<?php
/**
 * DraftCargo - Hourly Cleanup Script
 * To be named: cron-hourly.php on home.pl
 */

$uploadDir = __DIR__ . '/uploads/';

if (!file_exists($uploadDir)) {
    exit("Upload directory does not exist.\n");
}

$files = glob($uploadDir . '*.json');
$now = time();
$deletedCount = 0;

foreach ($files as $metaFile) {
    $data = json_decode(file_get_contents($metaFile), true);

    if ($data && isset($data['expiresAt'])) {
        if ($now > $data['expiresAt']) {
            // Delete actual file
            $actualFile = str_replace('.json', '', $metaFile);
            if (file_exists($actualFile)) {
                unlink($actualFile);
            }
            // Delete meta file
            unlink($metaFile);
            $deletedCount++;
        }
    }
}

echo "Cleanup finished. Deleted $deletedCount expired files.\n";
