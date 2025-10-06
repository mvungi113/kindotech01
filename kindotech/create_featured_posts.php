<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Post;

echo "=== Featured Posts Analysis ===" . PHP_EOL;
$totalPosts = Post::count();
$publishedPosts = Post::where('is_published', true)->count();
$featuredPosts = Post::where('is_featured', true)->count();

echo "Total posts: " . $totalPosts . PHP_EOL;
echo "Published posts: " . $publishedPosts . PHP_EOL;
echo "Featured posts: " . $featuredPosts . PHP_EOL . PHP_EOL;

if ($featuredPosts === 0) {
    echo "No featured posts found! Let me mark some posts as featured..." . PHP_EOL;
    
    // Get the top 3 posts with most views to make them featured
    $topPosts = Post::where('is_published', true)
        ->orderBy('views', 'desc')
        ->take(3)
        ->get();
    
    if ($topPosts->count() > 0) {
        echo "Making these posts featured:" . PHP_EOL;
        foreach ($topPosts as $post) {
            $post->is_featured = true;
            $post->save();
            echo "✓ ID: {$post->id} | Title: " . substr($post->title, 0, 50) . "... | Views: {$post->views}" . PHP_EOL;
        }
        echo PHP_EOL . "Featured posts created successfully!" . PHP_EOL;
    } else {
        echo "No published posts found to mark as featured." . PHP_EOL;
    }
} else {
    echo "Existing featured posts:" . PHP_EOL;
    $posts = Post::where('is_featured', true)->get(['id', 'title', 'views']);
    foreach ($posts as $post) {
        echo "✓ ID: {$post->id} | Title: " . substr($post->title, 0, 50) . "... | Views: {$post->views}" . PHP_EOL;
    }
}

echo PHP_EOL . "You can now test http://localhost:3000/posts?featured=true" . PHP_EOL;