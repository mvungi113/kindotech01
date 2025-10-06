<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Database\Seeder;

class CommentsTableSeeder extends Seeder
{
    /**
     * Run the database seeds to create sample comments (including replies).
     */
    public function run(): void
    {
        $posts = Post::all();

        foreach ($posts as $post) {
            // each post gets between 0 and 8 comments
            $count = rand(0, 8);
            if ($count === 0) {
                continue;
            }

            $comments = Comment::factory()->count($count)->make()->toArray();
            foreach ($comments as $cdata) {
                $cdata['post_id'] = $post->id;
                $comment = Comment::create($cdata);

                // create a reply occasionally
                if (rand(1, 5) === 1) {
                    Comment::create([
                        'content' => 'Reply: ' . $cdata['content'],
                        'author_name' => 'Reply User',
                        'author_email' => 'reply+' . rand(1, 9999) . '@example.com',
                        'author_website' => null,
                        'is_approved' => true,
                        'likes' => 0,
                        'post_id' => $post->id,
                        'parent_id' => $comment->id,
                    ]);
                }
            }
        }

        $this->command->info('Comments seeded for posts');
    }
}
