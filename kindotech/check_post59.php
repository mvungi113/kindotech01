<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Post;

$maxId = Post::max('id');
echo 'Maximum post ID: ' . ($maxId ?: 'No posts') . PHP_EOL;

$post59 = Post::find(59);
if ($post59) {
    echo 'Post 59 exists: ' . $post59->title . PHP_EOL;
} else {
    echo 'Post 59 does not exist' . PHP_EOL;
}

$post56 = Post::find(56);
if ($post56) {
    echo 'Post 56 exists: ' . $post56->title . ' (User ID: ' . $post56->user_id . ')' . PHP_EOL;
} else {
    echo 'Post 56 does not exist' . PHP_EOL;
}

$totalPosts = Post::count();
echo 'Total posts in database: ' . $totalPosts . PHP_EOL;