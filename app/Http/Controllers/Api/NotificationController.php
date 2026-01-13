<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get the list of notifications for the logged-in user.
     */
    public function index(Request $request)
    {
        // We fetch the latest 10 notifications (both read and unread)
        // so the user can see their history.
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->limit(10)
            ->get();

        return response()->json($notifications);
    }

    /**
     * Mark all unread notifications as read.
     * This turns off the red badge.
     */
    public function markRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'Notifications marked as read']);
    }

    /**
     * Delete all notifications for the user (Clear History).
     */
    public function destroy(Request $request)
    {
        $request->user()->notifications()->delete();

        return response()->json(['message' => 'Notifications cleared']);
    }
}
