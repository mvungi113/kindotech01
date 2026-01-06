<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Faker\Factory as FakerFactory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Post>
 */
class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition(): array
    {
        $faker = FakerFactory::create();
        $title = $faker->sentence(6);
        $category = Category::inRandomOrder()->first() ?? Category::factory()->create();
        $user = User::inRandomOrder()->first() ?? User::factory()->create();

        return [
            'title' => $title,
            'title_sw' => null,
            'slug' => Str::slug($title) . '-' . Str::random(5),
            'content' => $faker->paragraphs(5, true),
            'excerpt' => $faker->sentence(12),
            'featured_image' => null,
            'image_caption' => null,
            'is_published' => true,
            'is_featured' => $faker->boolean(15),
            'published_at' => now()->subDays($faker->numberBetween(0, 30)),
            'views' => $faker->numberBetween(0, 5000),
            'reading_time' => $faker->numberBetween(3, 10),
            'meta_title' => null,
            'meta_description' => null,
            'user_id' => $user->id,
            'category_id' => $category->id,
        ];
    }
}
