<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$file = 'counter.txt';
$cookie_name = 'draftlab_visit';
$cookie_time = 86400; // 24 hours

// Init counter if not exists
if (!file_exists($file)) {
    file_put_contents($file, '100'); // Start from 100 to look nice
}

// Read current count
$count = (int) file_get_contents($file);

// Check if visited
if (!isset($_COOKIE[$cookie_name])) {
    $count++;
    file_put_contents($file, $count);
    setcookie($cookie_name, 'true', time() + $cookie_time, "/");
}

echo json_encode(['count' => $count]);
?>