<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Idea;
use App\Models\TeamMember;
use Illuminate\Support\Str;

class IdeaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
    $ideas = [
            [
                'idea_title' => 'Smart Water Meter',
                'slug' => Str::slug('Smart Water Meter-' . Str::random(4)),
                'thematic_area_id' => 1,
                'abstract' => 'A device to monitor water usage in real time.',
                'problem_statement' => 'Water wastage due to lack of monitoring.',
                'proposed_solution' => 'Install smart meters to track usage.',
                'cost_benefit_analysis' => 'Reduces wastage, saves money.',
                'declaration_of_interests' => 'None',
                'original_idea_disclaimer' => true,
                'collaboration_enabled' => true,
                'team_effort' => true,
                'current_revision_number' => 1,
                'collaboration_deadline' => now()->addMonth(),
                'status' => 'draft',
                'attachment' => null,
                'attachment_filename' => null,
                'attachment_mime' => null,
                'attachment_size' => null,
                'user_id' => 1,
            ],
            [
                'idea_title' => 'Solar-Powered Charger',
                'slug' => Str::slug('Solar-Powered Charger-' . Str::random(4)),
                'thematic_area_id' => 2,
                'abstract' => 'Portable charger using solar energy.',
                'problem_statement' => 'Limited access to electricity in rural areas.',
                'proposed_solution' => 'Develop affordable solar chargers.',
                'cost_benefit_analysis' => 'Promotes green energy.',
                'declaration_of_interests' => 'None',
                'original_idea_disclaimer' => false,
                'collaboration_enabled' => false,
                'team_effort' => false,
                'current_revision_number' => 1,
                'collaboration_deadline' => null,
                'status' => 'draft',
                'attachment' => null,
                'attachment_filename' => null,
                'attachment_mime' => null,
                'attachment_size' => null,
                'user_id' => 1,
            ],
            [
                'idea_title' => 'Community Recycling App',
                'slug' => Str::slug('Community Recycling App-' . Str::random(4)),
                'thematic_area_id' => 3,
                'abstract' => 'App to coordinate recycling efforts.',
                'problem_statement' => 'Low recycling rates in urban areas.',
                'proposed_solution' => 'Mobile app for recycling pickup scheduling.',
                'cost_benefit_analysis' => 'Improves recycling rates.',
                'declaration_of_interests' => 'None',
                'original_idea_disclaimer' => true,
                'collaboration_enabled' => true,
                'team_effort' => true,
                'current_revision_number' => 2,
                'collaboration_deadline' => now()->addWeeks(2),
                'status' => 'draft',
                'attachment' => null,
                'attachment_filename' => null,
                'attachment_mime' => null,
                'attachment_size' => null,
                'user_id' => 1,
            ],
        ];

        foreach ($ideas as $idea) {
            Idea::create($idea);
        }
    }
}
