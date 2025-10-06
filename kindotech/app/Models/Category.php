<?php
/**
 * Category model for organizing posts by Tanzania-specific topics
 * Includes bilingual support and active status management
 */
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'name_sw', 'slug', 'description', 
        'color', 'icon', 'is_active', 'order'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Boot function for automatic slug generation
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    /**
     * Get all posts in this category
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    /**
     * Get only published posts in this category
     */
    public function publishedPosts(): HasMany
    {
        return $this->posts()->published();
    }

    /**
     * Scope a query to only include active categories
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to order categories by display order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('name');
    }

    /**
     * Get the category URL for frontend
     */
    public function getUrlAttribute(): string
    {
        return url("/categories/{$this->slug}");
    }

    /**
     * Get display name (Swahili if available, otherwise English)
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->name_sw ?: $this->name;
    }
}