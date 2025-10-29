<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\User;

class Idea extends Model
{
    use HasFactory, SoftDeletes;

    protected $hidden = ['attachment'];

    protected $fillable = [
        'idea_title',
        'slug',
        'thematic_area_id',
        'abstract',
        'problem_statement',
        'proposed_solution',
        'cost_benefit_analysis',
        'declaration_of_interests',
        'original_idea_disclaimer',
        'collaboration_enabled',
        'team_effort',
        'comments_enabled',
        'attachment',
        'attachment_filename',
        'attachment_mime',
        'attachment_size',
        'status',
        'user_id',
        'current_revision_number',
        'collaboration_deadline',
    ];

    protected $casts = [
        'original_idea_disclaimer' => 'boolean',
        'collaboration_enabled' => 'boolean',
        'team_effort' => 'boolean',
        'comments_enabled' => 'boolean',
        'current_revision_number' => 'integer',
        'collaboration_deadline' => 'date',
    ];

    protected static function booted()
    {
        static::creating(function (Idea $idea) {
            if (empty($idea->slug)) {
            $generate = function () {
                $letters = '';
                for ($i = 0; $i < 4; $i++) {
                $letters .= chr(random_int(97, 122)); // a-z
                }
                $digits = '';
                for ($i = 0; $i < 4; $i++) {
                $digits .= (string) random_int(0, 9);
                }
                $chars = str_split($letters . $digits);
                shuffle($chars);
                $s = implode('', $chars);
                return substr($s, 0, 4) . '-' . substr($s, 4, 4);
            };

            $slug = $generate();
            while (self::where('slug', $slug)->exists()) {
                $slug = $generate();
            }
            $idea->slug = $slug;
            }
        });
    }

    /**
     * The user who created the idea.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function teamMembers()
    {
        return $this->hasMany(TeamMember::class);
    }

    public function collaborationMembers()
    {
        return $this->hasMany(CollaborationMember::class);
    }

    public function likes()
    {
        return $this->hasMany(IdeaLike::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function collaborationRequests()
    {
        return $this->hasMany(CollaborationRequest::class);
    }

    public function collaborationProposals()
    {
        return $this->hasMany(CollaborationProposal::class);
    }

    public function versions()
    {
        return $this->hasMany(IdeaVersion::class);
    }

    /**
     * Scope to eager load team members and include the count.
     */
    public function scopeWithTeam($query)
    {
        return $query->with(['teamMembers', 'collaborationMembers', 'likes'])->withCount(['teamMembers', 'collaborationMembers', 'likes']);
    }

    /**
     * Get attachment info without binary data.
     */
    public function getAttachmentInfoAttribute()
    {
        return $this->attachment ? [
            'filename' => $this->attachment_filename,
            'mime' => $this->attachment_mime,
            'size' => $this->attachment_size,
        ] : null;
    }

    // Relationship to ThematicArea
    public function thematicArea()
    {
        return $this->belongsTo(ThematicArea::class);
    }
}
