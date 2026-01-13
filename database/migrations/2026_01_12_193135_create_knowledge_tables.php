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
        // 1. Knowledge Items (The Parent Table)
        Schema::create('knowledge_items', function (Blueprint $table) {
            $table->id(); // Standard Laravel PK

            // Link to the 'users' table we created earlier
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade');

            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('status')->default(0); // 0: Draft, 1: Published, 2: Archived
            $table->timestamps(); // Creates created_at & updated_at
        });

        // 2. Versions (Child of Knowledge Item)
        Schema::create('versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('knowledge_item_id')->constrained('knowledge_items')->onDelete('cascade');
            $table->string('version_number'); // e.g., "1.0", "1.1"
            $table->timestamps();
        });

        // 3. Metadata Tags (Child of Knowledge Item)
        Schema::create('metadata_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('knowledge_item_id')->constrained('knowledge_items')->onDelete('cascade');
            $table->string('label');
            $table->string('category')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('knowledge_tables');
    }
};
