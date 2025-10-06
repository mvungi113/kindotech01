<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Post;
use App\Models\Category;

class TestPostCreation extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:post-creation';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test post creation to debug API issues';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing post creation...');
        
        // Get a test user
        $user = User::where('email', 'jane.author@example.com')->first();
        if (!$user) {
            $this->error('Test user not found');
            return;
        }
        
        // Get a category
        $category = Category::first();
        
        $this->info("User: {$user->email} (ID: {$user->id})");
        $this->info("Category: " . ($category ? $category->name . " (ID: {$category->id})" : 'None found'));
        
        // Test data
        $postData = [
            'title' => 'Test Post ' . now()->format('Y-m-d H:i:s'),
            'content' => 'This is test content for debugging post creation issues.',
            'excerpt' => 'Test excerpt',
            'user_id' => $user->id,
            'category_id' => $category ? $category->id : null,
            'is_published' => false,
            'slug' => 'test-post-' . time()
        ];
        
        try {
            $post = Post::create($postData);
            $this->info('Post created successfully: ' . $post->title);
            $this->info('Post ID: ' . $post->id);
        } catch (\Exception $e) {
            $this->error('Post creation failed: ' . $e->getMessage());
        }
    }
}
