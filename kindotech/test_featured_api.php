<?php
/**
 * Test the featured posts API endpoint with detailed response analysis
 */
$url = 'http://localhost:8000/api/v1/posts?featured=true&per_page=5';

echo "=== FEATURED POSTS API TEST ===" . PHP_EOL;
echo "Testing API endpoint: $url" . PHP_EOL;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: $httpCode" . PHP_EOL;

if ($response) {
    $data = json_decode($response, true);
    
    echo "=== RESPONSE STRUCTURE ===" . PHP_EOL;
    echo "Response keys: " . implode(', ', array_keys($data)) . PHP_EOL;
    echo "Success: " . ($data['success'] ? 'true' : 'false') . PHP_EOL;
    
    if ($data && isset($data['success']) && $data['success']) {
        $dataSection = $data['data'];
        echo "Data type: " . gettype($dataSection) . PHP_EOL;
        
        if (is_array($dataSection) && isset($dataSection['data'])) {
            // Paginated response
            $posts = $dataSection['data'];
            echo "Paginated response - Posts found: " . count($posts) . PHP_EOL;
            echo "Current page: " . ($dataSection['current_page'] ?? 'N/A') . PHP_EOL;
            echo "Total posts: " . ($dataSection['total'] ?? 'N/A') . PHP_EOL;
            echo "Last page: " . ($dataSection['last_page'] ?? 'N/A') . PHP_EOL;
        } else if (is_array($dataSection)) {
            // Direct array
            $posts = $dataSection;
            echo "Direct array response - Posts found: " . count($posts) . PHP_EOL;
        } else {
            $posts = [];
            echo "Unexpected data structure!" . PHP_EOL;
        }
        
        echo PHP_EOL . "=== FEATURED POSTS ===" . PHP_EOL;
        foreach ($posts as $index => $post) {
            echo ($index + 1) . ". ID: {$post['id']} | Title: " . substr($post['title'], 0, 40) . "..." . PHP_EOL;
            echo "   Featured: " . ($post['is_featured'] ? 'YES' : 'NO') . " | Views: {$post['views']}" . PHP_EOL;
        }
        
        if (empty($posts)) {
            echo "WARNING: No posts returned despite success=true!" . PHP_EOL;
        }
    } else {
        echo "API Error: " . ($data['message'] ?? 'Unknown error') . PHP_EOL;
        echo "Full response: " . substr($response, 0, 500) . PHP_EOL;
    }
} else {
    echo "No response from API" . PHP_EOL;
}

echo PHP_EOL . "Now test in browser: http://localhost:3000/posts?featured=true" . PHP_EOL;