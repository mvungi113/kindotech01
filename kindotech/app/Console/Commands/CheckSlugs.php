<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Post;

class CheckSlugs extends Command
{
    protected $signature = 'check:slugs';
    protected $description = 'Check existing post slugs';

    public function handle()
    {
        $this->info('Recent post slugs:');
        
        $posts = Post::latest()->take(10)->get(['id', 'title', 'slug']);
        
        foreach ($posts as $post) {
            $this->info("ID {$post->id}: {$post->slug}");
        }
        
        // Count duplicates
        $duplicates = Post::select('slug')
            ->groupBy('slug')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('slug');
            
        if ($duplicates->count() > 0) {
            $this->error('Duplicate slugs found:');
            foreach ($duplicates as $slug) {
                $count = Post::where('slug', $slug)->count();
                $this->error("- {$slug} ({$count} times)");
            }
        } else {
            $this->info('No duplicate slugs found.');
        }
    }
}
