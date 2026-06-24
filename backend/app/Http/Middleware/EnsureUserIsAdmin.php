<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Пропускает дальше только администраторов. Предполагается, что выше
     * по цепочке уже отработал auth:sanctum (пользователь аутентифицирован).
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isAdmin()) {
            abort(403, 'Доступ только для администратора.');
        }

        return $next($request);
    }
}
