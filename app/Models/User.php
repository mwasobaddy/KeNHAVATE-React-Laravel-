<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'username',
        'email',
        'password',
        'department_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * The ideas created by this user.
     */
    public function ideas()
    {
        return $this->hasMany(Idea::class);
    }

    /**
     * The comments written by this user.
     */
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Collaboration requests sent by this user.
     */
    public function sentCollaborationRequests()
    {
        return $this->hasMany(CollaborationRequest::class, 'requester_id');
    }

    /**
     * Collaboration requests received by this user (as idea owner).
     */
    public function receivedCollaborationRequests()
    {
        return $this->hasMany(CollaborationRequest::class, 'owner_id');
    }

    /**
     * Get the department that this user belongs to.
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the directorate through the department.
     */
    public function directorate()
    {
        return $this->department?->directorate();
    }

    /**
     * Get the region through the department.
     */
    public function region()
    {
        return $this->department?->region();
    }

    /**
     * Scope to order users by name.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('name');
    }
}
