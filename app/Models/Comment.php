<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'idea_id',
        'user_id',
        'content',
    ];

    /**
     * The idea that this comment belongs to.
     */
    public function idea()
    {
        return $this->belongsTo(Idea::class);
    }

    /**
     * The user who wrote this comment.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the formatted created date.
     */
    public function getCreatedAtFormattedAttribute()
    {
        return $this->created_at->format('M d, Y \a\t g:i A');
    }
}
