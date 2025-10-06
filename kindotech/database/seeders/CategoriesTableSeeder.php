<?php

/**
 * Seeds the categories table with Tanzania-specific topics
 * Includes bilingual support for English and Swahili categories
 * Covers news, politics, business, technology, culture, and more
 */
namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategoriesTableSeeder extends Seeder
{
    /**
     * Run the database seeds with Tanzania blog categories
     */
    public function run(): void
    {
        $categories = [
            // News & Politics
            [
                'name' => 'News & Politics',
                'name_sw' => 'Habari na Siasa',
                'description' => 'Latest news and political developments in Tanzania',
                'color' => '#EF4444',
                'icon' => 'fas fa-newspaper',
                'order' => 1,
            ],
            [
                'name' => 'Business & Economy',
                'name_sw' => 'Biashara na Uchumi',
                'description' => 'Business news, investments, and economic updates in Tanzania',
                'color' => '#10B981',
                'icon' => 'fas fa-chart-line',
                'order' => 2,
            ],
            [
                'name' => 'Technology',
                'name_sw' => 'Teknolojia',
                'description' => 'Technology trends, innovations, and digital transformation in Tanzania',
                'color' => '#3B82F6',
                'icon' => 'fas fa-laptop-code',
                'order' => 3,
            ],
            [
                'name' => 'Culture & Heritage',
                'name_sw' => 'Utamaduni na Urithi',
                'description' => 'Tanzanian culture, traditions, music, and heritage preservation',
                'color' => '#8B5CF6',
                'icon' => 'fas fa-music',
                'order' => 4,
            ],
            [
                'name' => 'Travel & Tourism',
                'name_sw' => 'Safari na Utalii',
                'description' => 'Travel guides, tourism news, and beautiful destinations in Tanzania',
                'color' => '#F59E0B',
                'icon' => 'fas fa-plane',
                'order' => 5,
            ],
            [
                'name' => 'Health & Wellness',
                'name_sw' => 'Afya na Ustawi',
                'description' => 'Health tips, medical news, and wellness advice for Tanzanians',
                'color' => '#EC4899',
                'icon' => 'fas fa-heartbeat',
                'order' => 6,
            ],
            [
                'name' => 'Sports',
                'name_sw' => 'Michezo',
                'description' => 'Sports news, matches, and athlete profiles from Tanzania',
                'color' => '#84CC16',
                'icon' => 'fas fa-futbol',
                'order' => 7,
            ],
            [
                'name' => 'Education',
                'name_sw' => 'Elimu',
                'description' => 'Education news, career advice, and learning resources in Tanzania',
                'color' => '#06B6D4',
                'icon' => 'fas fa-graduation-cap',
                'order' => 8,
            ],
            [
                'name' => 'Entertainment',
                'name_sw' => 'Burudani',
                'description' => 'Entertainment news, movies, music, and celebrity updates',
                'color' => '#F97316',
                'icon' => 'fas fa-film',
                'order' => 9,
            ],
            [
                'name' => 'Lifestyle',
                'name_sw' => 'Mtindo wa Maisha',
                'description' => 'Lifestyle tips, fashion, relationships, and daily living in Tanzania',
                'color' => '#8B5CF6',
                'icon' => 'fas fa-utensils',
                'order' => 10,
            ],
        ];

        foreach ($categories as $category) {
            // ensure slug exists (simple slug from name)
            $slug = \Str::slug($category['name']);
            $category['slug'] = $slug;

            // update existing or create new to make seeding idempotent
            Category::updateOrCreate(
                ['slug' => $slug],
                $category
            );
        }

        $this->command->info('Tanzania blog categories seeded successfully (idempotent)');
    }
}