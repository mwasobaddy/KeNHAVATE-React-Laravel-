<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CollaborationMember extends Model
{
    use HasFactory;

    protected $fillable = ['idea_id', 'name', 'email', 'role'];

    public function idea()
    {
        return $this->belongsTo(Idea::class);
    }
}
