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
        Schema::create('idea_review_decisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('idea_id')->constrained()->cascadeOnDelete();
            $table->foreignId('deputy_director_id')->constrained('users')->cascadeOnDelete();
            
            // Decision stage: stage1 or stage2
            $table->enum('review_stage', ['stage1', 'stage2']);
            
            // DD's final decision for this stage
            $table->enum('decision', ['approve', 'revise', 'reject']);
            
            // DD's compiled comments from all reviewers
            $table->text('compiled_comments');
            
            // Additional DD comments/instructions
            $table->text('dd_comments')->nullable();
            
            // Previous status before this decision
            $table->string('previous_status');
            
            // New status after this decision
            $table->string('new_status');
            
            // Decision timestamp
            $table->timestamp('decided_at')->useCurrent();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['idea_id', 'review_stage']);
            $table->index(['deputy_director_id']);
            $table->index('decided_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('idea_review_decisions');
    }
};
