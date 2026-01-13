<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        // 1. Get the user's role name (assuming relationship is set up)
        // We access the 'role' relationship defined in User model
        $userRole = $request->user()->role->name ?? null;

        // 2. Check if the user's role is in the allowed list passed to the middleware
        if (!in_array($userRole, $roles)) {
            return response()->json(['message' => 'Unauthorized. Access denied.'], 403);
        }

        return $next($request);
    }
}
