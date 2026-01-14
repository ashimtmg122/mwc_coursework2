<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $userRole = $request->user()->role->name ?? null;

   
        if (!in_array($userRole, $roles)) {
            return response()->json(['message' => 'Unauthorized. Access denied.'], 403);
        }

        return $next($request);
    }
}
