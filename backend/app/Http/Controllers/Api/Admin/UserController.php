<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends Controller
{
    /**
     * Список пользователей с поиском и количеством заказов.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $users = User::query()
            ->withCount('orders')
            ->when($request->string('q')->trim()->value(), function (Builder $query, string $search) {
                $escaped = addcslashes($search, '%_\\');
                $query->where(function (Builder $q) use ($escaped) {
                    $q->where('name', 'ilike', "%{$escaped}%")
                        ->orWhere('email', 'ilike', "%{$escaped}%");
                });
            })
            ->latest()
            ->paginate((int) ($request->integer('per_page') ?: 20));

        return UserResource::collection($users);
    }

    /**
     * Обновление данных пользователя (в т.ч. роли).
     */
    public function update(UpdateUserRequest $request, User $user): UserResource
    {
        $user->update($request->validated());

        return new UserResource($user);
    }

    /**
     * Удаление пользователя. Себя удалить нельзя.
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        abort_if($user->id === $request->user()->id, 422, 'Нельзя удалить собственную учётную запись.');

        $user->delete();

        return response()->json(['message' => 'Пользователь удалён.']);
    }
}
