<?php

/**
 * Post model representing blog articles in Tanzania blog
 * Handles relationships with categories, tags, comments, and authors
 * Includes bilingual content support and publishing workflow
 */
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'title_sw', 'slug', 'content', 'content_sw', 'excerpt',
        'featured_image', 'image_caption', 'is_published', 'is_featured',
        'published_at', 'views', 'reading_time', 'meta_title', 
        'meta_description', 'user_id', 'category_id'
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'is_published' => 'boolean',
        'is_featured' => 'boolean',
    ];

    /**
     * Boot function for automatic slug generation
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($post) {
            if (empty($post->slug)) {
                $post->slug = Str::slug($post->title);
            }
        });

        static::updating(function ($post) {
            if ($post->isDirty('title') && empty($post->getOriginal('slug'))) {
                $post->slug = Str::slug($post->title);
            }
        });
    }

    /**
     * Get the author/user who created the post
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category this post belongs to
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get all tags associated with this post
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    /**
     * Get all comments for this post
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Get only approved comments for this post
     */
    public function approvedComments(): HasMany
    {
        return $this->comments()->where('is_approved', true);
    }

    /**
     * Get top-level comments (not replies)
     */
    public function topLevelComments(): HasMany
    {
        return $this->approvedComments()->whereNull('parent_id');
    }

    /**
     * Scope a query to only include published posts
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true)
                    ->where('published_at', '<=', now());
    }

    /**
     * Scope a query to only include featured posts
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope a query to only include draft posts
     */
    public function scopeDraft($query)
    {
        return $query->where('is_published', false);
    }

    /**
     * Scope a query to only include posts from specific category
     */
    public function scopeInCategory($query, $categorySlug)
    {
        return $query->whereHas('category', function ($q) use ($categorySlug) {
            $q->where('slug', $categorySlug);
        });
    }

    /**
     * Increment post views counter
     */
    public function incrementViews()
    {
        $this->views++;
        $this->save();
    }

    /**
     * Get the estimated reading time in minutes
     */
    public function getReadingTimeAttribute(): int
    {
        $wordCount = str_word_count(strip_tags($this->content));
        return max(1, ceil($wordCount / 200)); // 200 words per minute
    }

    /**
     * Get the post URL for frontend
     */
    public function getUrlAttribute(): string
    {
        return url("/posts/{$this->slug}");
    }
}