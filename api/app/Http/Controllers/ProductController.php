<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $products = Product::query()
            ->where('status', 'active')
            ->orderByDesc('created_at')
            ->get(['id', 'name', 'slug', 'description', 'is_limited', 'drop_id', 'created_at', 'updated_at']);

        return response()->json([
            'data' => $products,
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::query()
            ->where('slug', $slug)
            ->where('status', 'active')
            ->with(['variants' => function ($query) {
                $query->where('is_active', true)
                    ->orderBy('id');
            }])
            ->firstOrFail();

        return response()->json([
            'data' => $product,
        ]);
    }
}
