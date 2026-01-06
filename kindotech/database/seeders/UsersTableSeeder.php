<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds to create sample users.
     * 
     * User Types:
     * 1. Admin Users - Login required, full system access
     * 2. Author Users - Login required, can create/manage posts
     * 3. Regular Users/Commenters - No login needed, comment anonymously
     */
    public function run(): void
    {

        // Create or update an admin user with known credentials
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Site Admin',
                'password' => bcrypt('admin123'), // Changed to more secure password
                'role' => 'admin',
                'status' => 'active', // Ensure account is active
                'bio' => 'Administrator account for full system management',
                'email_verified_at' => now(),
            ]
        );

        // Create or update author users with known credentials
        User::updateOrCreate(
            ['email' => 'jane.author@example.com'],
            [
                'name' => 'Jane Author',
                'password' => bcrypt('author123'), // Consistent password for testing
                'role' => 'author',
                'status' => 'active', // Ensure account is active
                'bio' => 'Technology writer and contributor',
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'john.writer@example.com'],
            [
                'name' => 'John Writer',
                'password' => bcrypt('author123'), // Consistent password for testing
                'role' => 'author',
                'status' => 'active', // Ensure account is active
                'bio' => 'Business and economy reporter',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Sample users seeded:');
        $this->command->info('- Admin user: admin@example.com (password: admin123)');
        $this->command->info('- Author users: jane.author@example.com, john.writer@example.com (password: author123)');
    }
}
