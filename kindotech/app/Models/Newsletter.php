<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Newsletter extends Model
{
    protected $fillable = [
        'email',
        'is_active',
        'subscribed_at',
        'unsubscribed_at',
        'subscription_source'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'subscribed_at' => 'datetime',
        'unsubscribed_at' => 'datetime',
    ];

    /**
     * Scope to get only active subscribers
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get subscribers from a specific source
     */
    public function scopeFromSource($query, $source)
    {
        return $query->where('subscription_source', $source);
    }

    /**
     * Check if email is already subscribed
     */
    public static function isSubscribed($email)
    {
        return self::where('email', $email)->where('is_active', true)->exists();
    }

    /**
     * Subscribe an email
     */
    public static function subscribe($email, $source = 'website')
    {
        return self::updateOrCreate(
            ['email' => $email],
            [
                'is_active' => true,
                'subscribed_at' => Carbon::now(),
                'unsubscribed_at' => null,
                'subscription_source' => $source
            ]
        );
    }

    /**
     * Unsubscribe an email
     */
    public function unsubscribe()
    {
        $this->update([
            'is_active' => false,
            'unsubscribed_at' => Carbon::now()
        ]);
        return $this;
    }
}
