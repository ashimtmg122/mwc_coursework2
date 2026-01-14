<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoginLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\SystemHealthLog;

class HealthController extends Controller
{
    
    public function check(Request $request)
    {
        $status = 1; 
        $message = "System Operational";

        try {
            // Test Database Connection
            DB::connection()->getPdo();
        } catch (\Exception $e) {
            $status = 0; 
            $message = "Database Error: " . $e->getMessage();
        }

        //Log the result to your existing table
        SystemHealthLog::create([
            'monitored_by_id' => $request->user() ? $request->user()->id : null,
            'status' => $status
        ]);

       
        return response()->json([
            'status_label' => $status === 1 ? 'Healthy' : 'Issues Detected',
            'status_code' => $status,
            'message' => $message,
            'checked_at' => now()
        ], $status === 1 ? 200 : 503);
    }

    
    public function index()
    {
        return response()->json(
            SystemHealthLog::with('monitor:id,name') 
                ->latest()
                ->limit(20)
                ->get()
        );
    }
    public function loginLogs()
    {
       
        $logs = LoginLog::with('user:id,name,email') 
            ->latest('login_time')
            ->limit(50)
            ->get();

        
        return response()->json($logs);
    }
}
