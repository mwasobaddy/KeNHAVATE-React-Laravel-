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
        Schema::create('idea_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('idea_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('version_number');
            
            // Snapshot of the idea at this version
            $table->string('idea_title', 255);
            $table->foreignId('thematic_area_id')->nullable()->constrained()->nullOnDelete();
            $table->text('abstract')->nullable();
            $table->text('problem_statement')->nullable();
            $table->text('proposed_solution')->nullable();
            $table->text('cost_benefit_analysis')->nullable();
            $table->text('declaration_of_interests')->nullable();
            $table->boolean('original_idea_disclaimer')->default(false);
            $table->boolean('collaboration_enabled')->default(false);
            $table->boolean('team_effort')->default(false);
            $table->boolean('comments_enabled')->default(true);
            $table->unsignedInteger('current_revision_number')->default(1);
            $table->date('collaboration_deadline')->nullable();
            $table->enum('status', ['draft', 'stage 1 review', 'stage 2 review', 'stage 1 revise', 'stage 2 revise', 'approved', 'rejected']);
            
            // Version metadata
            $table->text('change_description')->nullable();
            $table->json('changed_fields')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('collaboration_proposal_id')->nullable()->constrained()->nullOnDelete();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['idea_id', 'version_number']);
            $table->unique(['idea_id', 'version_number']);
            $table->index(['changed_by']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('idea_versions');
    }
};
