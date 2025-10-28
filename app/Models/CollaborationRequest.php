<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CollaborationRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'idea_id',
        'requester_id',
        'owner_id',
        'status',
        'message',
        'responded_at',
    ];

    protected $casts = [
        'responded_at' => 'datetime',
    ];

    /**
     * The idea that this collaboration request is for.
     */
    public function idea()
    {
        return $this->belongsTo(Idea::class);
    }

    /**
     * The user who sent the collaboration request.
     */
    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    /**
     * The owner of the idea who will respond to the request.
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Scope for pending requests.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for approved requests.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for rejected requests.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Check if the request can be cancelled by the requester.
     */
    public function canBeCancelledBy($userId)
    {
        return $this->requester_id === $userId && $this->status === 'pending';
    }

    /**
     * Check if the request can be responded to by the owner.
     */
    public function canBeRespondedBy($userId)
    {
        return $this->owner_id === $userId && $this->status === 'pending';
    }
}
