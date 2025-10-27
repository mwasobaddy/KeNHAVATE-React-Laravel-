<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Idea;
use App\Models\IdeaLike;
use App\Models\User;

class IdeaLikeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $ideas = Idea::all();

        if ($users->isEmpty() || $ideas->isEmpty()) {
            return;
        }

        foreach ($ideas as $idea) {
            // each idea gets 0..users_count random likes
            $count = rand(0, min(5, $users->count()));
            $sample = $users->random($count);
            foreach ($sample as $user) {
                IdeaLike::firstOrCreate([
                    'idea_id' => $idea->id,
                    'user_id' => $user->id,
                ]);
            }
        }
    }
}
