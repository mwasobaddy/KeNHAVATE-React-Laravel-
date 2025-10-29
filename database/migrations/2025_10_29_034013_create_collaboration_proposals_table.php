<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('collaboration_proposals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('idea_id')->constrained()->cascadeOnDelete();
            $table->foreignId('collaborator_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('original_author_id')->constrained('users')->cascadeOnDelete();
            
            // Proposed changes (same structure as ideas table)
            $table->string('proposed_idea_title', 255)->nullable();
            $table->foreignId('proposed_thematic_area_id')->nullable()->constrained('thematic_areas')->nullOnDelete();
            $table->text('proposed_abstract')->nullable();
            $table->text('proposed_problem_statement')->nullable();
            $table->text('proposed_solution')->nullable();
            $table->text('proposed_cost_benefit_analysis')->nullable();
            $table->text('proposed_declaration_of_interests')->nullable();
            $table->boolean('proposed_original_idea_disclaimer')->default(false);
            $table->boolean('proposed_collaboration_enabled')->default(false);
            $table->boolean('proposed_team_effort')->default(false);
            $table->boolean('proposed_comments_enabled')->default(true);
            $table->date('proposed_collaboration_deadline')->nullable();
            
            // Collaboration notes and metadata
            $table->text('collaboration_notes')->nullable();
            $table->text('change_summary')->nullable(); // Brief summary of what was changed
            $table->json('changed_fields')->nullable(); // Array of field names that were modified
            
            // Status tracking
            $table->enum('status', ['pending', 'accepted', 'rejected', 'revision_requested'])->default('pending');
            $table->text('review_notes')->nullable(); // Notes from the original author
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            
            // Version tracking
            $table->unsignedInteger('version_number')->default(1);
            $table->foreignId('parent_proposal_id')->nullable()->constrained('collaboration_proposals')->cascadeOnDelete();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['idea_id', 'status']);
            $table->index(['collaborator_id']);
            $table->index(['original_author_id']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('collaboration_proposals');
    }
};
