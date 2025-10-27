<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Idea;
use App\Models\CollaborationMember;

class CollaborationMemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $names = ['Hannah', 'Ivan', 'Julia', 'Kevin', 'Liam', 'Mona'];
        $roles = ['Advisor', 'Reviewer', 'Stakeholder', 'Consultant'];

        $ideas = Idea::all();

        foreach ($ideas as $idea) {
            $count = rand(0, 3);
            for ($i = 0; $i < $count; $i++) {
                $name = $names[array_rand($names)];
                CollaborationMember::create([
                    'idea_id' => $idea->id,
                    'name' => $name,
                    'email' => strtolower(preg_replace('/[^a-z]/', '', $name)) . rand(1, 999) . '@example.test',
                    'role' => $roles[array_rand($roles)],
                ]);
            }
        }
    }
}
