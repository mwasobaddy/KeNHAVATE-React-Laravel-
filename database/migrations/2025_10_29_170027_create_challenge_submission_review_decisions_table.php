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
        Schema::create('challenge_submission_review_decisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_submission_id')->constrained('challenge_submissions')->onDelete('cascade');
            $table->enum('review_stage', ['stage 1', 'stage 2']);
            $table->enum('decision', ['approve', 'revise', 'reject']);
            $table->text('compiled_comments');
            $table->text('dd_comments')->nullable();
            $table->foreignId('decided_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('decided_at')->useCurrent();
            $table->timestamps();
            
            $table->index(['challenge_submission_id', 'review_stage']);
            $table->index('decided_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('challenge_submission_review_decisions');
    }
};
