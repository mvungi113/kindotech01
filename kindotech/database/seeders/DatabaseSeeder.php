<?php
/**
 * Main database seeder for Tanzania Blog
 * Calls all individual seeders in proper order
 */
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database for Tanzania Blog
     */
    public function run(): void
    {
        $this->call([
            CategoriesTableSeeder::class,
            UsersTableSeeder::class,
            PostsTableSeeder::class,
            // CommentsTableSeeder::class, // Disabled for now - requires Faker
        ]);
    }
}