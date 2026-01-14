<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   
    public function up(): void
    {
        
        Schema::create('notifications', function (Blueprint $table) {
            $table->id(); 
            $table->string('type');
            $table->morphs('notifiable'); 
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

    
        Schema::create('login_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('login_time')->useCurrent();
        });

       
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('generated_by_id')->constrained('users');
            $table->timestamps(); 
        });

      
        Schema::create('system_health_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monitored_by_id')->nullable()->constrained('users');
            $table->integer('status');
            $table->timestamps();
        });
    }

   
    public function down(): void
    {
        Schema::dropIfExists('system_tables');
    }
};
