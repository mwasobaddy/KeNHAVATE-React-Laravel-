<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TeamMember;
use App\Models\Idea;

class TeamMemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
    $names = ['Alice', 'Bob', 'Charlie', 'Dana', 'Eli', 'Fiona', 'George'];
    $roles = ['Author', 'Member', 'Pioneer', 'Researcher', 'Contributor'];

        $ideas = Idea::all();

        foreach ($ideas as $idea) {
            // pick 0-3 random names
            $count = rand(0, 3);
            if ($count === 0) {
                continue;
            }
            $picked = (array) array_rand(array_flip($names), $count);
            foreach ($picked as $name) {
                $email = strtolower(preg_replace('/[^a-z]/', '', $name)) . rand(1, 999) . '@example.test';
                $role = $roles[array_rand($roles)];
                TeamMember::create([
                    'idea_id' => $idea->id,
                    'name' => $name,
                    'email' => $email,
                    'role' => $role,
                ]);
            }
        }
    }
}
