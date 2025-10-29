<?php

namespace Database\Seeders;

use App\Models\Idea;
use App\Models\IdeaReview;
use App\Models\IdeaReviewDecision;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some ideas and change their status to stage 1 review
        $ideas = Idea::limit(5)->get();
        $smeUsers = User::role('subject-matter-expert')->get();
        $ddUser = User::role('deputy-director')->first();
        $boardUsers = User::role('board')->get();

        foreach ($ideas as $index => $idea) {
            if ($index < 3) {
                // First 3 ideas are in stage 1 review
                $idea->update(['status' => 'stage 1 review']);

                // Assign SME reviews to these ideas
                foreach ($smeUsers->take(3) as $sme) {
                    // Skip if SME is the author of the idea (conflict of interest)
                    if ($sme->id === $idea->author_id) {
                        continue;
                    }

                    // Skip if review already exists
                    if (IdeaReview::where('idea_id', $idea->id)
                                   ->where('reviewer_id', $sme->id)
                                   ->where('review_stage', 'stage1')
                                   ->exists()) {
                        continue;
                    }

                    IdeaReview::create([
                        'idea_id' => $idea->id,
                        'reviewer_id' => $sme->id,
                        'review_stage' => 'stage1',
                        'recommendation' => collect(['approve', 'revise', 'reject'])->random(),
                        'comments' => 'This is a sample review comment for idea: ' . $idea->title,
                        'reviewed_at' => now()->subDays(rand(1, 5)),
                    ]);
                }

                // Create DD decision for first idea
                if ($index === 0) {
                IdeaReviewDecision::create([
                    'idea_id' => $idea->id,
                    'deputy_director_id' => $ddUser->id,
                    'review_stage' => 'stage1',
                    'decision' => 'approve',
                    'compiled_comments' => 'Stage 1 reviews have been compiled. The idea shows promise and should proceed to stage 2.',
                    'previous_status' => 'stage 1 review',
                    'new_status' => 'stage 2 review',
                    'decided_at' => now()->subDays(1),
                ]);                    // Update idea status to stage 2 review
                    $idea->update(['status' => 'stage 2 review']);

                    // Add some board reviews
                    foreach ($boardUsers->take(2) as $board) {
                        // Skip if review already exists
                        if (IdeaReview::where('idea_id', $idea->id)
                                       ->where('reviewer_id', $board->id)
                                       ->where('review_stage', 'stage2')
                                       ->exists()) {
                            continue;
                        }

                        IdeaReview::create([
                            'idea_id' => $idea->id,
                            'reviewer_id' => $board->id,
                            'review_stage' => 'stage2',
                            'recommendation' => collect(['approve', 'revise'])->random(),
                            'comments' => 'Board review comment for: ' . $idea->title,
                            'reviewed_at' => now()->subHours(rand(1, 12)),
                        ]);
                    }
                }
            } elseif ($index === 3) {
                // One idea needs revision from stage 1
                $idea->update(['status' => 'stage 1 revise']);
                
                IdeaReviewDecision::create([
                    'idea_id' => $idea->id,
                    'deputy_director_id' => $ddUser->id,
                    'review_stage' => 'stage1',
                    'decision' => 'revise',
                    'compiled_comments' => 'The reviewers have suggested several improvements. Please address the feedback and resubmit.',
                    'previous_status' => 'stage 1 review',
                    'new_status' => 'stage 1 revise',
                    'decided_at' => now()->subDays(2),
                ]);
            } elseif ($index === 4) {
                // One approved idea
                $idea->update(['status' => 'approved']);
                
                // Stage 1 decision
                IdeaReviewDecision::create([
                    'idea_id' => $idea->id,
                    'deputy_director_id' => $ddUser->id,
                    'review_stage' => 'stage1',
                    'decision' => 'approve',
                    'compiled_comments' => 'Excellent idea with strong potential.',
                    'previous_status' => 'stage 1 review',
                    'new_status' => 'stage 2 review',
                    'decided_at' => now()->subDays(3),
                ]);

                // Stage 2 decision  
                IdeaReviewDecision::create([
                    'idea_id' => $idea->id,
                    'deputy_director_id' => $ddUser->id,
                    'review_stage' => 'stage2',
                    'decision' => 'approve',
                    'compiled_comments' => 'Board has approved this idea for implementation.',
                    'previous_status' => 'stage 2 review',
                    'new_status' => 'approved',
                    'decided_at' => now()->subDays(1),
                ]);
            }
        }

        $this->command->info('Review test data created successfully!');
        $this->command->info('- 3 ideas in stage 1 review with SME comments');
        $this->command->info('- 1 idea in stage 2 review with board comments');
        $this->command->info('- 1 idea requiring stage 1 revision');
        $this->command->info('- 1 idea fully approved');
    }
}