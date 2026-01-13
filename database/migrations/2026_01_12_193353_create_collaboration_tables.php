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
        // 1. Suggestions (Feedback on content)
        Schema::create('suggestions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('knowledge_item_id')->constrained('knowledge_items')->onDelete('cascade');
            $table->text('message');
            $table->timestamps();
        });

        // 2. Comments (User discussions)
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('knowledge_item_id')->constrained('knowledge_items')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Who commented?
            $table->text('text');
            $table->timestamps();
        });

        // 3. Workspaces (Project groups)
        Schema::create('workspaces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->timestamps();
        });

        // 4. Validation Requests (The Approval Workflow)
        Schema::create('validation_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requester_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('knowledge_item_id')->constrained('knowledge_items')->onDelete('cascade');
            $table->integer('status')->default(0); // 0: Pending, 1: Approved, 2: Rejected
            $table->timestamp('request_on')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('collaboration_tables');
    }
};
