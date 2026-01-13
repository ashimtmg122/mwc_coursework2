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
        // 1. Notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->id(); // <--- You requested Auto-Increment Integer
            $table->string('type');
            $table->morphs('notifiable'); // Creates notifiable_id (int) & notifiable_type (string)
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        // 2. Login Logs (Audit Trail)
        Schema::create('login_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('login_time')->useCurrent();
        });

        // 3. Reports
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('generated_by_id')->constrained('users');
            $table->timestamps(); // Created_at serves as 'generated_on'
        });

        // 4. System Health
        Schema::create('system_health_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monitored_by_id')->nullable()->constrained('users');
            $table->integer('status'); // 1: Healthy, 0: Issues
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_tables');
    }
};
