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
        Schema::create('idea_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('idea_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reviewer_id')->constrained('users')->cascadeOnDelete();
            
            // Review stage: stage1 (SME) or stage2 (Board)
            $table->enum('review_stage', ['stage1', 'stage2']);
            
            // Individual reviewer's recommendation
            $table->enum('recommendation', ['approve', 'revise', 'reject']);
            
            // Individual reviewer's comments
            $table->text('comments');
            
            // Review submission timestamp
            $table->timestamp('reviewed_at')->useCurrent();
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['idea_id', 'review_stage']);
            $table->index(['reviewer_id', 'review_stage']);
            $table->index('reviewed_at');
            
            // Ensure one review per reviewer per stage per idea
            $table->unique(['idea_id', 'reviewer_id', 'review_stage']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('idea_reviews');
    }
};
