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
        Schema::create('challenge_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_id')->constrained('challenges')->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->text('motivation');
            $table->decimal('cost_of_implementation', 15, 2)->nullable();
            $table->text('original_disclaimer');
            $table->string('attachment_path')->nullable(); // For any file format
            $table->string('attachment_name')->nullable(); // Original filename
            $table->string('attachment_mime_type')->nullable(); // MIME type
            $table->enum('status', ['draft', 'stage 1 review', 'stage 2 review', 'stage 1 revise', 'stage 2 revise', 'approved', 'rejected'])->default('draft');
            $table->foreignId('submitted_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
            
            $table->index(['challenge_id', 'status']);
            $table->index('submitted_by');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('challenge_submissions');
    }
};
