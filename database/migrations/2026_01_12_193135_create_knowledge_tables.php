<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   
    public function up(): void
    {
        
        Schema::create('knowledge_items', function (Blueprint $table) {
            $table->id(); 

           
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade');

            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('status')->default(0); 
            $table->timestamps();
        });

        
        Schema::create('versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('knowledge_item_id')->constrained('knowledge_items')->onDelete('cascade');
            $table->string('version_number'); 
            $table->timestamps();
        });

       
        Schema::create('metadata_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('knowledge_item_id')->constrained('knowledge_items')->onDelete('cascade');
            $table->string('label');
            $table->string('category')->nullable();
            $table->timestamps();
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('knowledge_tables');
    }
};
