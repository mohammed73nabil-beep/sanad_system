<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isSuperAdmin()) {
            if ($request->expectsJson() || $request->header('X-Inertia')) {
                return response()->json(['message' => 'غير مصرح لك بالوصول.'], 403);
            }

            abort(403, 'غير مصرح لك بالوصول إلى لوحة المشرف.');
        }

        return $next($request);
    }
}
