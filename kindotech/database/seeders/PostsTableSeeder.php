<?php

namespace Database\Seeders;

use App\Models\Post;
use Illuminate\Database\Seeder;

class PostsTableSeeder extends Seeder
{
    /**
     * Run the database seeds to create sample posts.
     */
    public function run(): void
    {
        // Get users for post authorship
        $users = \App\Models\User::where('role', 'author')->get();
        $categories = \App\Models\Category::all();
        
        if ($users->isEmpty() || $categories->isEmpty()) {
            $this->command->warn('No users or categories found. Please run UsersTableSeeder and CategoriesTableSeeder first.');
            return;
        }

        // Create sample posts
        $samplePosts = [
            [
                'title' => 'Getting Started with Laravel Development',
                'content' => 'Laravel is a powerful PHP framework that makes web development enjoyable and creative. In this comprehensive guide, we\'ll explore the fundamentals of Laravel development, from installation to deployment. Laravel\'s elegant syntax and robust features make it the framework of choice for modern web applications.',
                'excerpt' => 'Learn the basics of Laravel framework and start building modern web applications.',
            ],
            [
                'title' => 'Understanding Modern JavaScript Frameworks',
                'content' => 'JavaScript frameworks have revolutionized frontend development. React, Vue, and Angular each offer unique approaches to building interactive user interfaces. This article compares these popular frameworks and helps you choose the right one for your next project. We\'ll dive deep into component architectures, state management, and performance optimization.',
                'excerpt' => 'A comprehensive comparison of React, Vue, and Angular for modern web development.',
            ],
            [
                'title' => 'Database Optimization Techniques for Web Applications',
                'content' => 'Optimizing database queries is crucial for application performance. We\'ll explore indexing strategies, query optimization, and caching mechanisms to speed up your database operations. Learn how to use EXPLAIN queries, implement proper indexes, and leverage database-specific features for maximum efficiency.',
                'excerpt' => 'Master database optimization to improve your application\'s performance.',
            ],
            [
                'title' => 'RESTful API Design Best Practices',
                'content' => 'Designing a good API is an art. This guide covers RESTful principles, versioning strategies, authentication methods, and documentation best practices. We\'ll also discuss common pitfalls and how to avoid them when building APIs that will stand the test of time.',
                'excerpt' => 'Learn how to design robust and scalable RESTful APIs.',
            ],
            [
                'title' => 'Introduction to Docker and Containerization',
                'content' => 'Docker has transformed how we deploy applications. Containers provide consistency across development, testing, and production environments. In this tutorial, we\'ll cover Docker basics, Dockerfile creation, docker-compose, and container orchestration fundamentals.',
                'excerpt' => 'Get started with Docker and learn containerization concepts.',
            ],
        ];

        foreach ($samplePosts as $postData) {
            \App\Models\Post::create([
                'title' => $postData['title'],
                'slug' => \Illuminate\Support\Str::slug($postData['title']) . '-' . \Illuminate\Support\Str::random(5),
                'content' => $postData['content'],
                'excerpt' => $postData['excerpt'],
                'user_id' => $users->random()->id,
                'category_id' => $categories->random()->id,
                'is_published' => true,
                'is_featured' => rand(0, 100) < 20,
                'published_at' => now()->subDays(rand(1, 30)),
                'views' => rand(100, 5000),
                'reading_time' => rand(3, 10),
            ]);
        }

        $this->command->info('Sample posts created (5)');
    }
}
