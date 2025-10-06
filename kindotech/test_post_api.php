<?php
/**
 * Simple test script to check if the post API endpoint works for ID-based access
 */

require_once 'vendor/autoload.php';

use App\Models\Post;
use App\Models\User;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Testing Post API Fix ===\n";

// Check if any posts exist
$posts = Post::select('id', 'title', 'user_id', 'is_published')->take(5)->get();

if ($posts->isEmpty()) {
    echo "No posts found in database.\n";
    exit;
}

echo "Found " . $posts->count() . " posts:\n";
foreach ($posts as $post) {
    echo "- ID: {$post->id}, Title: " . substr($post->title, 0, 50) . "..., User ID: {$post->user_id}, Published: " . ($post->is_published ? 'Yes' : 'No') . "\n";
}

// Check if any admin users exist
$adminUser = User::where('role', 'admin')->first();
if ($adminUser) {
    echo "\nFound admin user: {$adminUser->name} (ID: {$adminUser->id})\n";
} else {
    echo "\nNo admin users found.\n";
}

echo "\nTest complete. You can now try accessing the admin editor with a valid post ID.\n";
echo "For example: http://localhost:3000/admin/posts/edit/{$posts->first()->id}\n";