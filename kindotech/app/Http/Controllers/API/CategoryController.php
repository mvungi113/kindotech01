<?php

/**
 * Handles CRUD operations for post categories in Tanzania blog
 * Manages Tanzania-specific categories with bilingual support
 */
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Display a listing of active categories for public access
     * Returns categories with post counts for Tanzania blog navigation
     */
    public function index(): JsonResponse
    {
        $categories = Category::active()
                            ->ordered()
                            ->withCount(['publishedPosts as posts_count'])
                            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
            'message' => 'Categories retrieved successfully.'
        ]);
    }

    /**
     * Display posts for a specific category
     * Supports pagination for category archive pages
     */
    public function posts($slug, Request $request): JsonResponse
    {
        // Find category by slug
        $category = Category::where('slug', $slug)->first();

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found.'
            ], 404);
        }

        // Get published posts in this category with pagination
        $posts = $category->publishedPosts()
                         ->with(['user', 'tags'])
                         ->orderBy('published_at', 'desc')
                         ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => [
                'category' => $category,
                'posts' => $posts
            ],
            'message' => 'Category posts retrieved successfully.'
        ]);
    }

    /**
     * Store a newly created category (Admin only)
     * Handles category creation with bilingual support
     */
    public function store(Request $request): JsonResponse
    {
        // Validate category data
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories',
            'name_sw' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:50',
            'is_active' => 'boolean',
            'order' => 'integer',
        ]);

        // Generate slug from name
        $validated['slug'] = Str::slug($validated['name']);

        // Create category
        $category = Category::create($validated);

        return response()->json([
            'success' => true,
            'data' => $category,
            'message' => 'Category created successfully.'
        ], 201);
    }

    /**
     * Update the specified category (Admin only)
     */
    public function update(Request $request, Category $category): JsonResponse
    {
        // Validate update data
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:categories,name,' . $category->id,
            'name_sw' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:50',
            'is_active' => 'boolean',
            'order' => 'integer',
        ]);

        // Update slug if name changed
        if ($request->has('name') && $request->name !== $category->name) {
            $validated['slug'] = Str::slug($request->name);
        }

        // Update category
        $category->update($validated);

        return response()->json([
            'success' => true,
            'data' => $category,
            'message' => 'Category updated successfully.'
        ]);
    }

    /**
     * Remove the specified category (Admin only)
     * Prevents deletion if category has posts
     */
    public function destroy(Category $category): JsonResponse
    {
        // Check if category has posts
        if ($category->posts()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category that has posts. Please reassign posts first.'
            ], 422);
        }

        // Delete category
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully.'
        ]);
    }
}