<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // System Management
            'manage.users',
            'manage.admin-users',
            'manage.regions',
            'manage.directorates', 
            'manage.departments',
            'manage.system-settings',
            'soft-delete.any',
            'permanent-delete.any',

            // Ideas Management
            'create.ideas',
            'edit.own-ideas',
            'edit.any-ideas',
            'delete.own-ideas',
            'delete.any-ideas',
            'view.all-ideas',
            'view.own-ideas',
            
            // Review Process - Ideas
            'review.ideas-stage1',
            'review.ideas-stage2',
            'manage.idea-workflow',
            'comment.on-ideas',
            'trigger.stage1-revise',
            'trigger.stage2-review',
            'trigger.stage2-revise',
            'approve.ideas',
            'reject.ideas',
            'compile.sme-comments',
            'oversee.review-process',

            // Challenge Management
            'create.challenges',
            'edit.challenges',
            'delete.challenges',
            'participate.challenges',
            'review.challenge-submissions',
            'comment.on-challenges',
            'manage.challenge-workflow',
            'award.challenges',

            // Collaboration
            'request.collaboration',
            'manage.collaboration-proposals',
            'submit.collaboration-proposals',
            'approve.collaboration-proposals',
            'reject.collaboration-proposals',

            // Content Access
            'access.dashboard',
            'access.review-queue',
            'access.reports',
            'access.analytics',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        
        // 1. Admin Role - Full system access
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        // 2. Deputy Director Role - Management and workflow oversight
        $ddRole = Role::create(['name' => 'deputy-director']);
        $ddRole->givePermissionTo([
            // User management (except admins)
            'manage.users',
            'manage.regions',
            'manage.directorates',
            'manage.departments',
            'soft-delete.any',
            
            // Ideas workflow management
            'view.all-ideas',
            'manage.idea-workflow',
            'comment.on-ideas',
            'trigger.stage1-revise',
            'trigger.stage2-review',
            'trigger.stage2-revise',
            'approve.ideas',
            'reject.ideas',
            'compile.sme-comments',
            'oversee.review-process',
            
            // Challenge management
            'create.challenges',
            'edit.challenges',
            'delete.challenges',
            'manage.challenge-workflow',
            'award.challenges',
            
            // Dashboard and reporting
            'access.dashboard',
            'access.review-queue',
            'access.reports',
            'access.analytics',
        ]);

        // 3. Board Role - Stage 2 review
        $boardRole = Role::create(['name' => 'board']);
        $boardRole->givePermissionTo([
            'review.ideas-stage2',
            'comment.on-ideas',
            'review.challenge-submissions',
            'comment.on-challenges',
            'access.dashboard',
            'access.review-queue',
            'view.own-ideas',
            'create.ideas',
            'edit.own-ideas',
            'delete.own-ideas',
            'participate.challenges',
        ]);

        // 4. Subject Matter Expert Role - Stage 1 review
        $smeRole = Role::create(['name' => 'subject-matter-expert']);
        $smeRole->givePermissionTo([
            'review.ideas-stage1',
            'comment.on-ideas',
            'access.dashboard',
            'access.review-queue',
            'view.own-ideas',
            'create.ideas',
            'edit.own-ideas',
            'delete.own-ideas',
            'participate.challenges',
            'request.collaboration',
            'submit.collaboration-proposals',
        ]);

        // 5. Challenge Reviewer Expert Role - Challenge reviews only
        $challengeReviewerRole = Role::create(['name' => 'challenge-reviewer-expert']);
        $challengeReviewerRole->givePermissionTo([
            'review.challenge-submissions',
            'comment.on-challenges',
            'access.dashboard',
            'access.review-queue',
            'view.own-ideas',
            'create.ideas',
            'edit.own-ideas',
            'delete.own-ideas',
            'participate.challenges',
            'request.collaboration',
            'submit.collaboration-proposals',
        ]);

        // 6. Author Role - Default user role
        $authorRole = Role::create(['name' => 'author']);
        $authorRole->givePermissionTo([
            'create.ideas',
            'edit.own-ideas',
            'delete.own-ideas',
            'view.own-ideas',
            'participate.challenges',
            'request.collaboration',
            'submit.collaboration-proposals',
            'manage.collaboration-proposals',
            'access.dashboard',
        ]);

        // Create some test users with roles
        $this->createTestUsers($adminRole, $ddRole, $boardRole, $smeRole, $challengeReviewerRole, $authorRole);
    }

    private function createTestUsers($adminRole, $ddRole, $boardRole, $smeRole, $challengeReviewerRole, $authorRole)
    {
        // Create Admin user
        $admin = User::create([
            'name' => 'Kelvin Mwangi',
            'slug' => 'kelvin-mwangi',
            'username' => 'system_admin',
            'email' => 'kelvinramsiel@gmail.com',
            'password' => bcrypt('kelvin1234'),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole($adminRole);

        // Create Deputy Director
        $dd = User::create([
            'name' => 'Kelvin Mwangi 2',
            'slug' => 'kelvin-mwangi-2',
            'username' => 'deputy_director',
            'email' => 'kelvinramsiel01@gmail.com',
            'password' => bcrypt('kelvin1234'),
            'email_verified_at' => now(),
        ]);
        $dd->assignRole($ddRole);

        // Create Board Members
        for ($i = 1; $i <= 3; $i++) {
            $board = User::create([
                'name' => "Board Member $i",
                'slug' => "board-member-$i",
                'username' => "board_member_$i",
                'email' => "board$i@kenhavate.com",
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]);
            $board->assignRole($boardRole);
        }

        // Create SME users
        for ($i = 1; $i <= 5; $i++) {
            $sme = User::create([
                'name' => "Subject Matter Expert $i",
                'slug' => "subject-matter-expert-$i",
                'username' => "sme_$i", 
                'email' => "sme$i@kenhavate.com",
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]);
            $sme->assignRole($smeRole);
        }

        // Create Challenge Reviewers
        for ($i = 1; $i <= 3; $i++) {
            $reviewer = User::create([
                'name' => "Challenge Reviewer $i",
                'slug' => "challenge-reviewer-$i",
                'username' => "challenge_reviewer_$i",
                'email' => "reviewer$i@kenhavate.com", 
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]);
            $reviewer->assignRole($challengeReviewerRole);
        }

        // Create regular Authors
        for ($i = 1; $i <= 10; $i++) {
            $author = User::create([
                'name' => "Author $i",
                'slug' => "author-$i",
                'username' => "author_$i",
                'email' => "author$i@kenhavate.com",
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]);
            $author->assignRole($authorRole);
        }

        $this->command->info('Created test users with roles:');
        $this->command->info('- 1 Admin (admin@kenhavate.com)');
        $this->command->info('- 1 Deputy Director (dd@kenhavate.com)');
        $this->command->info('- 3 Board Members (board1-3@kenhavate.com)');
        $this->command->info('- 5 SME Users (sme1-5@kenhavate.com)');
        $this->command->info('- 3 Challenge Reviewers (reviewer1-3@kenhavate.com)');
        $this->command->info('- 10 Authors (author1-10@kenhavate.com)');
        $this->command->info('Default password for all: password');
    }
}
