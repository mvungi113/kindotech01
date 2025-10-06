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
        // Create a few specific posts
        Post::factory()->count(20)->create();

        $this->command->info('Sample posts created (20)');
    }
}
