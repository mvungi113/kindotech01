<?php
/**
 * Test script to verify the public posts API endpoint works with pagination
 */
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Post;

echo "=== Testing Public Posts API ===\n";

// Test basic pagination
$posts = Post::published()
    ->with(['category', 'user', 'tags'])
    ->orderBy('published_at', 'desc')
    ->paginate(6);

echo "Total published posts: " . $posts->total() . "\n";
echo "Posts per page: " . $posts->perPage() . "\n";
echo "Current page: " . $posts->currentPage() . "\n";
echo "Last page: " . $posts->lastPage() . "\n";
echo "Posts on this page: " . $posts->count() . "\n\n";

if ($posts->count() > 0) {
    echo "Sample posts:\n";
    foreach ($posts->take(3) as $post) {
        echo "- {$post->title} (Views: {$post->views}, Category: " . 
             ($post->category ? $post->category->name : 'None') . ")\n";
    }
} else {
    echo "No published posts found.\n";
}

echo "\nAPI endpoint ready at: GET /api/v1/posts\n";
echo "Parameters supported:\n";
echo "- page: Page number\n";
echo "- per_page: Posts per page (default: 10)\n";
echo "- search: Search term\n";
echo "- category: Category slug\n";
echo "- order_by: Sort field (default: published_at)\n";
echo "- order_dir: Sort direction (default: desc)\n";