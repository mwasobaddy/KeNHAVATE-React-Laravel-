<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'kelvinramsiel@gmail.com'],
            [
                'name' => 'Kelvin Mwangi',
                'slug' => 'wcuilck',
                'username' => 'kelvinmwangi',
                'password' => 'kelvin1234',
                'email_verified_at' => now(),
            ]
        );

        $this->call([
            ThematicAreaSeeder::class,
            IdeaSeeder::class,
            TeamMemberSeeder::class,
            CollaborationMemberSeeder::class,
            IdeaLikeSeeder::class,
        ]);
    }
}
