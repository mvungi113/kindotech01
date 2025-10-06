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
            CommentsTableSeeder::class,
            // Add other seeders here as we create them
            // UsersTableSeeder::class,
            // PostsTableSeeder::class,
            // TagsTableSeeder::class,
        ]);
    }
}