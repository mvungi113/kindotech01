<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

use App\Models\Post;

// Get all posts with their IDs
$posts = Post::select('id', 'title', 'slug', 'is_published', 'user_id')->orderBy('id')->get();

echo "=== All Posts in Database ===\n";
foreach ($posts as $post) {
    echo "ID: {$post->id} | Title: {$post->title} | Slug: {$post->slug} | Published: " . ($post->is_published ? 'Yes' : 'No') . " | User: {$post->user_id}\n";
}

echo "\n=== Checking Post 59 ===\n";
$post59 = Post::find(59);
if ($post59) {
    echo "Post 59 exists: {$post59->title}\n";
} else {
    echo "Post 59 does NOT exist\n";
}

echo "\n=== Database Stats ===\n";
echo "Total posts: " . Post::count() . "\n";
echo "Max post ID: " . Post::max('id') . "\n";
echo "Published posts: " . Post::where('is_published', true)->count() . "\n";
echo "Draft posts: " . Post::where('is_published', false)->count() . "\n";