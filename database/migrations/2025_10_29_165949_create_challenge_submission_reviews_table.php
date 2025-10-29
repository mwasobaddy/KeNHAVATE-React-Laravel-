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
        Schema::create('challenge_submission_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_submission_id')->constrained('challenge_submissions')->onDelete('cascade');
            $table->foreignId('reviewer_id')->constrained('users')->onDelete('cascade');
            $table->enum('review_stage', ['stage 1', 'stage 2']);
            $table->enum('recommendation', ['approve', 'revise', 'reject']);
            $table->text('comments');
            $table->timestamp('reviewed_at')->useCurrent();
            $table->timestamps();
            
            $table->unique(['challenge_submission_id', 'reviewer_id', 'review_stage'], 'unique_challenge_review');
            $table->index(['challenge_submission_id', 'review_stage']);
            $table->index('reviewer_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('challenge_submission_reviews');
    }
};
