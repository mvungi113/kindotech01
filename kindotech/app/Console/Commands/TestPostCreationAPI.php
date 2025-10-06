<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Category;
use App\Models\Post;

class TestPostCreationAPI extends Command
{
    protected $signature = 'test:post-api';
    protected $description = 'Test post creation through API validation logic';

    public function handle()
    {
        // Get an author user
        $author = User::where('role', 'author')->first();
        if (!$author) {
            $this->error('No author user found.');
            return;
        }

        // Get a category
        $category = Category::first();

        // Test with a long title like the frontend might send
        $longTitle = "The Rise of AI-Powered Coding: How Developers Are Building Faster Than Ever Before with Advanced Machine Learning Tools and Automated Code Generation Systems";
        
        $postData = [
            'title' => $longTitle,
            'content' => 'This is test content for a post with a very long title to test slug generation.',
            'excerpt' => 'Test excerpt',
            'category_id' => $category?->id,
            'is_published' => true,
            'is_featured' => false,
            'featured_image' => 'https://via.placeholder.com/800x400',
            'user_id' => $author->id,
        ];

        try {
            // Simulate the validation and creation logic from PostController
            $this->info('Testing post creation with data:');
            $this->info("Title: {$postData['title']}");
            $this->info("Length: " . strlen($postData['title']) . " characters");

            // Generate slug using the same logic as PostController
            $baseSlug = \Str::slug($postData['title']);
            $this->info("Base slug: {$baseSlug}");
            $this->info("Base slug length: " . strlen($baseSlug) . " characters");

            // Apply length limit
            $maxLength = 200;
            if (strlen($baseSlug) > $maxLength) {
                $baseSlug = substr($baseSlug, 0, $maxLength);
                $baseSlug = preg_replace('/-[^-]*$/', '', $baseSlug);
                $this->info("Truncated slug: {$baseSlug}");
                $this->info("Truncated length: " . strlen($baseSlug) . " characters");
            }

            $slug = $baseSlug;
            $counter = 1;
            
            // Check for uniqueness
            while (Post::where('slug', $slug)->exists()) {
                $counterSuffix = '-' . $counter;
                $availableLength = 250 - strlen($counterSuffix);
                
                if (strlen($baseSlug) > $availableLength) {
                    $truncatedBase = substr($baseSlug, 0, $availableLength);
                    $truncatedBase = preg_replace('/-[^-]*$/', '', $truncatedBase);
                    $slug = $truncatedBase . $counterSuffix;
                } else {
                    $slug = $baseSlug . $counterSuffix;
                }
                $counter++;
                
                $this->info("Trying slug: {$slug} (length: " . strlen($slug) . ")");
            }

            $postData['slug'] = $slug;
            $this->info("Final slug: {$slug}");
            $this->info("Final slug length: " . strlen($slug) . " characters");

            // Create the post
            $post = Post::create($postData);
            
            $this->info("✅ Post created successfully!");
            $this->info("Post ID: {$post->id}");
            $this->info("Post slug: {$post->slug}");

        } catch (\Exception $e) {
            $this->error("❌ Error creating post: " . $e->getMessage());
            $this->error("Full error: " . $e->getTraceAsString());
        }
    }
}