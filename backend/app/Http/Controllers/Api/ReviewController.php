<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Review\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReviewController extends Controller
{
    /**
     * Отзывы на товар (публично).
     */
    public function index(Product $product): AnonymousResourceCollection
    {
        $reviews = $product->reviews()
            ->with('user')
            ->latest()
            ->paginate(15);

        return ReviewResource::collection($reviews);
    }

    /**
     * Оставить или обновить отзыв на товар (один отзыв на пользователя).
     */
    public function store(StoreReviewRequest $request, Product $product): JsonResponse
    {
        $review = $product->reviews()->updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'rating' => $request->integer('rating'),
                'comment' => $request->input('comment'),
            ],
        );

        $product->recalculateRating();
        $review->load('user');

        return (new ReviewResource($review))
            ->response()
            ->setStatusCode($review->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Удалить отзыв. Доступно автору отзыва или администратору.
     */
    public function destroy(Request $request, Product $product, Review $review): JsonResponse
    {
        abort_unless($review->product_id === $product->id, 404);

        $user = $request->user();
        abort_unless($review->user_id === $user->id || $user->isAdmin(), 403);

        $review->delete();
        $product->recalculateRating();

        return response()->json(['message' => 'Отзыв удалён.']);
    }
}
