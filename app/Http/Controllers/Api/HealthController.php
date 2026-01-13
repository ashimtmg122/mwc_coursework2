<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoginLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\SystemHealthLog;

class HealthController extends Controller
{
    /**
     * Check system status and log it to the DB.
     */
    public function check(Request $request)
    {
        $status = 1; // Default to 1 (Healthy)
        $message = "System Operational";

        try {
            // 1. Test Database Connection
            DB::connection()->getPdo();
        } catch (\Exception $e) {
            $status = 0; // Set to 0 (Issues)
            $message = "Database Error: " . $e->getMessage();
        }

        // 2. Log the result to your existing table
        SystemHealthLog::create([
            'monitored_by_id' => $request->user() ? $request->user()->id : null, // Records who ran the check (if logged in)
            'status' => $status
        ]);

        // 3. Return JSON response
        return response()->json([
            'status_label' => $status === 1 ? 'Healthy' : 'Issues Detected',
            'status_code' => $status,
            'message' => $message,
            'checked_at' => now()
        ], $status === 1 ? 200 : 503);
    }

    /**
     * Get recent logs for the Admin Dashboard
     */
    public function index()
    {
        return response()->json(
            SystemHealthLog::with('monitor:id,name') // Get the name of the person who checked
                ->latest()
                ->limit(20)
                ->get()
        );
    }
    public function loginLogs()
    {
        // Fetch last 50 logins with user details
        $logs = LoginLog::with('user:id,name,email') // Eager load user data
            ->latest('login_time')
            ->limit(50)
            ->get();

        // RETURN DIRECT ARRAY
        return response()->json($logs);
    }
}
