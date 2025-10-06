<?php
/**
 * Comment model for post discussions and user interactions
 * Supports comment approval system and nested replies for better engagement
 */
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'content', 'author_name', 'author_email', 
        'author_website', 'is_approved', 'likes', 
        'post_id', 'parent_id'
    ];

    protected $casts = [
        'is_approved' => 'boolean',
    ];

    /**
     * Get the post this comment belongs to
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Get the parent comment if this is a reply
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    /**
     * Get all replies to this comment
     */
    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id')->approved();
    }

    /**
     * Scope a query to only include approved comments
     */
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    /**
     * Scope a query to only include top-level comments (not replies)
     */
    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Increment comment likes counter
     */
    public function incrementLikes()
    {
        $this->likes++;
        $this->save();
    }

    /**
     * Check if comment has replies
     */
    public function hasReplies(): bool
    {
        return $this->replies()->count() > 0;
    }

    /**
     * Get gravatar URL for comment author
     */
    public function getGravatarUrlAttribute(): string
    {
        $hash = md5(strtolower(trim($this->author_email)));
        return "https://www.gravatar.com/avatar/{$hash}?s=60&d=mp";
    }
}