<?php
/**
 * Tag model for post keywords and topics in Tanzania blog
 * Enables content discovery and organization through tagging system
 */
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug'];

    /**
     * Boot function for automatic slug generation
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($tag) {
            if (empty($tag->slug)) {
                $tag->slug = Str::slug($tag->name);
            }
        });
    }

    /**
     * Get all posts with this tag
     */
    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class);
    }

    /**
     * Get only published posts with this tag
     */
    public function publishedPosts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class)->published();
    }

    /**
     * Get the tag URL for frontend
     */
    public function getUrlAttribute(): string
    {
        return url("/tags/{$this->slug}");
    }
}