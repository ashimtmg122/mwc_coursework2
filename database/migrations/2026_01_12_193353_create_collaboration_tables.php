<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   
    public function up(): void
    {
       
        Schema::create('suggestions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('knowledge_item_id')->constrained('knowledge_items')->onDelete('cascade');
            $table->text('message');
            $table->timestamps();
        });

       
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('knowledge_item_id')->constrained('knowledge_items')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); 
            $table->text('text');
            $table->timestamps();
        });

        Schema::create('workspaces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->timestamps();
        });

        
        Schema::create('validation_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requester_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('knowledge_item_id')->constrained('knowledge_items')->onDelete('cascade');
            $table->integer('status')->default(0); 
            $table->timestamp('request_on')->useCurrent();
            $table->timestamps();
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('collaboration_tables');
    }
};
