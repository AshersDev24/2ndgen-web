<?php

namespace App\Http\Controllers;

use App\Models\Product;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::query()
            ->with('variants')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'data' => $products,
        ]);
    }

    public function show(string $slug)
    {
        $product = Product::query()
            ->with('variants')
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json([
            'data' => $product,
        ]);
    }
}
