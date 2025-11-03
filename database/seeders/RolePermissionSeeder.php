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
            // Dashboard
            'admin-stats', //for admin users to view comprehensive stats
            'idea-review-stats', //for idea reviewers and board members
            'basic-stats', //for basic users to view general stats
            'dd-stats', //for deputy directors to view comprehensive stats
            'challenge-review-stats', //for challenge reviewers
            
            // User Management
            'manage.users',
            'create.users',
            'edit.users',
            'view.users',
            'soft-delete.users',
            'permanent-delete.users',
            'restore.users',
        
            // User Roles and Permissions
            'manage.user-roles',
            'create.user-roles',
            'edit.user-roles',
            'view.user-roles',
            'soft-delete.user-roles',
            'permanent-delete.user-roles',
            'restore.user-roles',
            'manage.user-permissions',
            'create.user-permissions',
            'edit.user-permissions',
            'view.user-permissions',
            'soft-delete.user-permissions',
            'permanent-delete.user-permissions',
            'restore.user-permissions',

            // Admin Users Management
            'manage.admin-users',
            'create.admin-users',
            'edit.admin-users',
            'view.admin-users',
            'soft-delete.admin-users',
            'permanent-delete.admin-users',
            'restore.admin-users',

            // Regions Management
            'manage.regions',
            'create.regions',
            'edit.regions',
            'view.regions',
            'soft-delete.regions',
            'permanent-delete.regions',
            'restore.regions',

            // Directorates Management
            'manage.directorates',
            'create.directorates',
            'edit.directorates',
            'view.directorates',
            'soft-delete.directorates',
            'permanent-delete.directorates',
            'restore.directorates',

            // Departments Management
            'manage.departments',
            'create.departments',
            'edit.departments',
            'view.departments',
            'soft-delete.departments',
            'permanent-delete.departments',
            'restore.departments',

            // System Settings Management
            'manage.system-settings',
            'create.system-settings',
            'edit.system-settings',
            'view.system-settings',
            'soft-delete.system-settings',
            'permanent-delete.system-settings',
            'restore.system-settings',

            // Audit Logs
            'manage.audit-logs',
            'view.audit-logs',
            'soft-delete.audit-logs',
            'restore.audit-logs',
            'permanent-delete.audit-logs',

            // Soft Delete and Restore Any Resource
            'soft-delete.any',
            'permanent-delete.any',
            'restore.any',

            // Ideas Management
            // Own Ideas
            'manage.own-ideas',
            'create.ideas',
            'edit.own-ideas',
            'view.own-ideas',
            'soft-delete.own-ideas',
            'permanent-delete.own-ideas',
            'restore.own-ideas',

            // Any Ideas
            'edit.any-ideas', //no one should have this permission except admins
            'view.any-ideas', //no one should have this permission except admins
            'view.any-ideasAdmin', //admin level view permission
            'view.any-ideasReviewers', //reviewer level view permission
            'soft-delete.any-ideas', //no one should have this permission except admins
            'permanent-delete.any-ideas', //no one should have this permission except admins
            'restore.any-ideas', //no one should have this permission except admins

            // Review Process - Ideas
            'review.ideas-stage1',
            'review.ideas-stage2',
            'manage.idea-workflow',
            'manage.review-decisions',
            'comment.on-ideas',
            'trigger.stage1-revise',
            'trigger.stage2-review',
            'trigger.stage2-revise',
            'approve.ideas',
            'reject.ideas',
            'compile.sme-comments',
            'oversee.review-process',

            // Challenge Management
            'manage.challenges',
            'create.challenges',
            'edit.challenges',
            'soft-delete.challenges',
            'permanent-delete.challenges',
            'restore.challenges',
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
            // Dashboard Stats
            'dd-stats',

            // User management (except admins)
            'manage.system-settings',
            'manage.users',
            'manage.regions',
            'manage.directorates',
            'manage.departments',
            
            // Ideas workflow management
            'view.any-ideas',
            'manage.idea-workflow',
            'manage.review-decisions',
            'comment.on-ideas',
            'trigger.stage1-revise',
            'trigger.stage2-review',
            'trigger.stage2-revise',
            'approve.ideas',
            'reject.ideas',
            'compile.sme-comments',
            'oversee.review-process',

            // Ideas Management
            // Own Ideas
            'manage.own-ideas',
            'create.ideas',
            'edit.own-ideas',
            'view.own-ideas',
            'soft-delete.own-ideas',
            'permanent-delete.own-ideas',
            'restore.own-ideas',

            // Any Ideas
            'view.any-ideasReviewers',

            // Challenge management
            'manage.challenges',
            'create.challenges',
            'edit.challenges',
            'soft-delete.challenges',
            'permanent-delete.challenges',
            'restore.challenges',
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
            // Review Stats
            'idea-review-stats',

            // Any Ideas
            'view.any-ideasReviewers',

            'review.ideas-stage2',
            'comment.on-ideas',
            'review.challenge-submissions',
            'comment.on-challenges',
            'access.dashboard',
            'access.review-queue',

            // Ideas Management
            // Own Ideas
            'manage.own-ideas',
            'create.ideas',
            'edit.own-ideas',
            'view.own-ideas',
            'soft-delete.own-ideas',
            'permanent-delete.own-ideas',
            'restore.own-ideas',

            'participate.challenges',
        ]);

        // 4. Subject Matter Expert Role - Stage 1 review
        $smeRole = Role::create(['name' => 'subject-matter-expert']);
        $smeRole->givePermissionTo([
            // Review Stats
            'idea-review-stats',

            // Any Ideas
            'view.any-ideasReviewers',

            'review.ideas-stage1',
            'comment.on-ideas',
            'access.dashboard',
            'access.review-queue',

            // Ideas Management
            // Own Ideas
            'manage.own-ideas',
            'create.ideas',
            'edit.own-ideas',
            'view.own-ideas',
            'soft-delete.own-ideas',
            'permanent-delete.own-ideas',
            'restore.own-ideas',


            'participate.challenges',
            'request.collaboration',
            'submit.collaboration-proposals',
        ]);

        // 5. Challenge Reviewer Expert Role - Challenge reviews only
        $challengeReviewerRole = Role::create(['name' => 'challenge-reviewer-expert']);
        $challengeReviewerRole->givePermissionTo([
            // Review Stats
            'challenge-review-stats',

            'review.challenge-submissions',
            'comment.on-challenges',
            'access.dashboard',
            'access.review-queue',

            // Ideas Management
            // Own Ideas
            'manage.own-ideas',
            'create.ideas',
            'edit.own-ideas',
            'view.own-ideas',
            'soft-delete.own-ideas',
            'permanent-delete.own-ideas',
            'restore.own-ideas',

            'participate.challenges',
            'request.collaboration',
            'submit.collaboration-proposals',
        ]);

        // 6. Author Role - Default user role
        $authorRole = Role::create(['name' => 'author']);
        $authorRole->givePermissionTo([
            // Basic Stats
            'basic-stats',
            
            // Ideas Management
            // Own Ideas
            'manage.own-ideas',
            'create.ideas',
            'edit.own-ideas',
            'view.own-ideas',
            'soft-delete.own-ideas',
            'permanent-delete.own-ideas',
            'restore.own-ideas',
            
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
