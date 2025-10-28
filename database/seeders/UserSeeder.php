<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate(
            [
                'email' => 'kelvinramsiel@gmail.com',
            ],
            [
                'name' => 'Kelvin Mwangi',
                'slug' => 'kelvin-mwangi',
                'username' => 'kelvinmwangi',
                'password' => Hash::make('kelvin1234'),
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            [
                'email' => 'kelvinramsiel01@gmail.com',
            ],
            [
                'name' => 'Kelvin Mwangi2',
                'slug' => 'kelvin-mwangi-2',
                'username' => 'kelvinmwangi2',
                'password' => Hash::make('kelvin1234'),
                'email_verified_at' => now(),
            ]
        );
    }
}