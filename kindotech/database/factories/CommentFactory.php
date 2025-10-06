<?php

namespace Database\Factories;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Comment>
 */
class CommentFactory extends Factory
{
    protected $model = Comment::class;

    public function definition(): array
    {
        $post = Post::inRandomOrder()->first();

        return [
            'content' => fake()->sentences(3, true),
            'author_name' => fake()->name(),
            'author_email' => fake()->unique()->safeEmail(),
            'author_website' => fake()->boolean(20) ? fake()->url() : null,
            'is_approved' => true,
            'likes' => fake()->numberBetween(0, 50),
            'post_id' => $post ? $post->id : Post::factory()->create()->id,
            'parent_id' => null,
        ];
    }
}
