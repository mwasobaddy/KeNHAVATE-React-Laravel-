<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class IdeaLike extends Model
{
    use HasFactory;

    protected $fillable = ['idea_id', 'user_id'];

    public function idea()
    {
        return $this->belongsTo(Idea::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
