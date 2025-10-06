<?php
/**
 * Test script to check if posts have required data for the new UI
 */
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Post;
use App\Models\Category;

echo "=== Testing Post Data for New UI ===\n";

// Get some recent posts with relationships
$posts = Post::with(['category', 'user'])
    ->where('is_published', true)
    ->orderBy('created_at', 'desc')
    ->take(5)
    ->get();

if ($posts->count() > 0) {
    echo "Found {$posts->count()} published posts:\n\n";
    
    foreach ($posts as $post) {
        echo "Post ID: {$post->id}\n";
        echo "Title: {$post->title}\n";
        echo "Slug: {$post->slug}\n";
        echo "Category: " . ($post->category ? $post->category->display_name ?? $post->category->name : 'None') . "\n";
        echo "Author: " . ($post->user ? $post->user->name : 'Unknown') . "\n";
        echo "Featured Image: " . ($post->featured_image ? $post->featured_image : 'None') . "\n";
        echo "Views: {$post->views}\n";
        echo "Reading Time: " . ($post->reading_time ?? '5') . " min\n";
        echo "Excerpt: " . ($post->excerpt ? substr($post->excerpt, 0, 50) . '...' : 'None') . "\n";
        echo "Published: " . ($post->is_published ? 'Yes' : 'No') . "\n";
        echo "Featured: " . ($post->is_featured ? 'Yes' : 'No') . "\n";
        echo "---\n";
    }
} else {
    echo "No published posts found.\n";
}

// Check categories
$categories = Category::take(6)->get();
echo "\nFound {$categories->count()} categories:\n";
foreach ($categories as $category) {
    echo "- {$category->name} (slug: {$category->slug})\n";
}

echo "\nUI test data check complete!\n";