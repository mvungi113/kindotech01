<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

use App\Models\Post;

$post = Post::latest()->first();
$response = [
    'success' => true, 
    'data' => $post->load(['category', 'user', 'tags']), 
    'message' => 'Post created successfully.'
];

echo "=== API Response Format ===\n";
echo json_encode($response, JSON_PRETTY_PRINT);
echo "\n\n=== Success Flag ===\n";
echo "response.success = " . ($response['success'] ? 'true' : 'false') . "\n";