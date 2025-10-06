<?php
/**
 * Handles CRUD operations for blog posts in Tanzania blog
 * Manages post creation, editing, publishing, and deletion
 * Supports bilingual content and featured posts
 */
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PostController extends Controller
{
    /**
     * Display a listing of published posts for public access
     * Supports pagination, filtering, and search for Tanzania blog
     * Also supports author-specific queries for dashboard
     */
    public function index(Request $request): JsonResponse
    {
        // Check for optional authentication
        $user = null;
        if ($request->bearerToken()) {
            $user = \Laravel\Sanctum\PersonalAccessToken::findToken($request->bearerToken())?->tokenable;
        }
        
        // Debug logging
        \Log::info('PostController index called with params:', [
            'all_params' => $request->all(),
            'has_admin' => $request->has('admin'),
            'has_status' => $request->has('status'),
            'status_value' => $request->get('status'),
            'has_bearer_token' => $request->bearerToken() ? true : false,
            'user_id' => $user?->id,
            'user_role' => $user?->role,
            'user_is_admin' => $user?->isAdmin() ?? false
        ]);
        
        // Check if this is an authenticated user requesting their own posts
        if ($request->has('user_id') && $user) {
            return $this->getUserPosts($request);
        }
        
        // Start with base query - for admins, include all posts; for public, only published
        if ($user && $user->isAdmin() && $request->has('admin')) {
            \Log::info('Using admin query path');
            $query = Post::with(['category', 'user', 'tags']);
            
            // Admin can filter by status
            if ($request->has('status')) {
                \Log::info('Filtering by status: ' . $request->status);
                if ($request->status === 'published') {
                    $query->where('is_published', true);
                } elseif ($request->status === 'draft') {
                    $query->where('is_published', false);
                }
                // If status is 'all' or not specified, show all posts
            }
        } else {
            \Log::info('Using public query path (published only)');
            // Public access - only published posts
            $query = Post::published()->with(['category', 'user', 'tags']);
        }
        
        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }
        
        // Filter by category
        if ($request->has('category') && $request->category) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }
        
        // Filter by tag
        if ($request->has('tag') && $request->tag) {
            $query->whereHas('tags', function($q) use ($request) {
                $q->where('slug', $request->tag);
            });
        }
        
        // Filter by featured posts
        if ($request->has('featured') && $request->featured) {
            $query->where('is_featured', true);
        }
        
        // Ordering - different logic for admin vs public
        if ($user && $user->isAdmin() && $request->has('admin')) {
            // For admin, sort by created_at to show most recent posts first (including drafts)
            $orderBy = $request->get('order_by', 'created_at');
            $orderDir = $request->get('order_dir', 'desc');
        } else {
            // For public, sort by published_at 
            $orderBy = $request->get('order_by', 'published_at');
            $orderDir = $request->get('order_dir', 'desc');
        }
        $query->orderBy($orderBy, $orderDir);
        
        // Pagination
        $perPage = $request->get('per_page', 10);
        $posts = $query->paginate($perPage);

        // Get statistics for admin users
        $stats = null;
        if ($user && $user->isAdmin() && $request->has('admin')) {
            $stats = [
                'total_posts' => Post::count(),
                'published_posts' => Post::where('is_published', true)->count(),
                'draft_posts' => Post::where('is_published', false)->count(),
                'total_comments' => \DB::table('comments')->count(),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $posts,
            'stats' => $stats,
            'message' => 'Posts retrieved successfully.'
        ]);
    }

    /**
     * Display a single post with related data
     * Handles both slug-based (public) and ID-based (authenticated) access
     * Increments view count for public access only
     */
    public function show(Request $request, $identifier): JsonResponse
    {
        $user = $request->user();
        
        // Determine if identifier is ID or slug
        $isNumeric = is_numeric($identifier);
        
        // Build query with relationships
        $query = Post::with(['category', 'user', 'tags']);
        
        if ($isNumeric) {
            // ID-based lookup (for authenticated users editing)
            $post = $query->where('id', $identifier)->first();
            
            // For ID-based access, check authentication and permissions
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required for ID-based access.'
                ], 401);
            }
            
            // Check if user can access this post
            if (!$user->isAdmin() && $post && $post->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to access this post.'
                ], 403);
            }
        } else {
            // Slug-based lookup (for public access)
            $query->with('topLevelComments.replies'); // Include comments for public view
            $post = $query->where('slug', $identifier)->first();
            
            // For public access, only show published posts unless user is admin/owner
            if ($post && !$post->is_published) {
                if (!$user || (!$user->isAdmin() && $post->user_id !== $user->id)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Post not found.'
                    ], 404);
                }
            }
        }

        // Check if post exists
        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found.'
            ], 404);
        }

        // Increment views only for published posts accessed by slug (public view)
        if (!$isNumeric && $post->is_published) {
            $post->incrementViews();
        }

        return response()->json([
            'success' => true,
            'data' => $post,
            'message' => 'Post retrieved successfully.'
        ]);
    }

    /**
     * Get a post for editing (authenticated users only)
     * Used by admin/author interfaces for post editing
     */
    public function edit(Request $request, Post $post): JsonResponse
    {
        $user = $request->user();
        
        // Check if user can access this post
        if (!$user->isAdmin() && $post->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to access this post.'
            ], 403);
        }

        // Load relationships needed for editing (without comments to keep response lean)
        $post->load(['category', 'user', 'tags']);

        return response()->json([
            'success' => true,
            'data' => $post,
            'message' => 'Post retrieved for editing.'
        ]);
    }

    /**
     * Store a newly created post in storage (Admin/Author only)
     * Handles post creation with validation and tag association
     */
    public function store(Request $request): JsonResponse
    {
        // Log incoming request data for debugging
        \Log::info('=== POST CREATION REQUEST START ===');
        \Log::info('Request method: ' . $request->method());
        \Log::info('Request URL: ' . $request->fullUrl());
        \Log::info('Request headers: ', $request->headers->all());
        \Log::info('Post creation request data:', $request->all());
        \Log::info('User ID: ' . ($request->user() ? $request->user()->id : 'No user'));
        
        // Validate post data
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'title_sw' => 'nullable|string|max:255',
            'content' => 'required|string',
            'content_sw' => 'nullable|string',
            'excerpt' => 'nullable|string|max:500',
            'category_id' => 'nullable|exists:categories,id',
            'featured_image' => 'nullable|string|max:500', // Accept file path, not just URL
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'published_at' => 'nullable|date',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            // Allow these fields but ignore them - we'll set them ourselves
            'slug' => 'nullable|string',
            'author_id' => 'nullable|integer',
        ]);

        // Remove fields we don't want to mass assign
        unset($validated['slug'], $validated['author_id']);

        // Generate unique slug from title with length limits
        $baseSlug = \Str::slug($validated['title']);
        
        // Limit base slug to 200 characters to leave room for counter
        $maxLength = 200;
        if (strlen($baseSlug) > $maxLength) {
            $baseSlug = substr($baseSlug, 0, $maxLength);
            // Remove any incomplete word at the end
            $baseSlug = preg_replace('/-[^-]*$/', '', $baseSlug);
        }
        
        $slug = $baseSlug;
        $counter = 1;
        
        // Ensure slug is unique
        while (Post::where('slug', $slug)->exists()) {
            $counterSuffix = '-' . $counter;
            $availableLength = 250 - strlen($counterSuffix); // Leave margin for MySQL
            
            if (strlen($baseSlug) > $availableLength) {
                $truncatedBase = substr($baseSlug, 0, $availableLength);
                $truncatedBase = preg_replace('/-[^-]*$/', '', $truncatedBase);
                $slug = $truncatedBase . $counterSuffix;
            } else {
                $slug = $baseSlug . $counterSuffix;
            }
            $counter++;
        }
        
        $validated['slug'] = $slug;
        $validated['user_id'] = $request->user()->id;

        // Handle featured image - accept URL or file upload
        if ($request->hasFile('featured_image_file')) {
            $validated['featured_image'] = $request->file('featured_image_file')->store('posts', 'public');
        } elseif ($request->has('featured_image') && $request->featured_image) {
            $validated['featured_image'] = $request->featured_image;
        }

        // Set published_at if publishing
        if ($validated['is_published'] ?? false) {
            $validated['published_at'] = $validated['published_at'] ?? now();
        }

        // Log what we're about to create
        \Log::info('Creating post with data:', $validated);

        try {
            // Create post
            $post = Post::create($validated);
            \Log::info('Post created successfully with ID: ' . $post->id);

            // Sync tags if provided
            if ($request->has('tags')) {
                $post->tags()->sync($request->tags);
                \Log::info('Tags synced for post ID: ' . $post->id);
            }

            // Load relationships for response
            $post->load(['category', 'user', 'tags']);
            \Log::info('Post relationships loaded for response');

            return response()->json([
                'success' => true,
                'data' => $post,
                'message' => 'Post created successfully.'
            ], 201);
            
        } catch (\Exception $e) {
            \Log::error('Failed to create post: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create post: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified post (Admin/Author only)
     * Handles post updates with validation and tag management
     */
    public function update(Request $request, Post $post): JsonResponse
    {
        // Check authorization - users can only update their own posts unless admin
        if (!$request->user()->isAdmin() && $post->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to update this post.'
            ], 403);
        }

        // Validate update data
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'title_sw' => 'nullable|string|max:255',
            'content' => 'sometimes|string',
            'content_sw' => 'nullable|string',
            'excerpt' => 'nullable|string|max:500',
            'category_id' => 'nullable|exists:categories,id',
            'featured_image' => 'nullable|string|max:500', // Accept file path, not just URL
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'published_at' => 'nullable|date',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        // Update slug if title changed
        if ($request->has('title') && $request->title !== $post->title) {
            $baseSlug = \Str::slug($request->title);
            $slug = $baseSlug;
            $counter = 1;
            
            // Ensure slug is unique (exclude current post)
            while (Post::where('slug', $slug)->where('id', '!=', $post->id)->exists()) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }
            
            $validated['slug'] = $slug;
        }

        // Handle featured image - accept URL or file upload
        if ($request->hasFile('featured_image_file')) {
            // Delete old image if exists and it's a stored file
            if ($post->featured_image && !filter_var($post->featured_image, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($post->featured_image);
            }
            $validated['featured_image'] = $request->file('featured_image_file')->store('posts', 'public');
        } elseif ($request->has('featured_image')) {
            $validated['featured_image'] = $request->featured_image;
        }

        // Set published_at if publishing for the first time
        if (($validated['is_published'] ?? false) && !$post->published_at) {
            $validated['published_at'] = $validated['published_at'] ?? now();
        }

        // Update post
        $post->update($validated);

        // Sync tags if provided
        if ($request->has('tags')) {
            $post->tags()->sync($request->tags);
        }

        // Load relationships for response
        $post->load(['category', 'user', 'tags']);

        return response()->json([
            'success' => true,
            'data' => $post,
            'message' => 'Post updated successfully.'
        ]);
    }

    /**
     * Remove the specified post (Admin/Author only)
     * Handles post deletion with image cleanup
     */
    public function destroy(Request $request, Post $post): JsonResponse
    {
        // Check authorization - users can only delete their own posts unless admin
        if (!$request->user()->isAdmin() && $post->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete this post.'
            ], 403);
        }

        // Delete featured image if exists
        if ($post->featured_image) {
            Storage::disk('public')->delete($post->featured_image);
        }

        // Delete post
        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Post deleted successfully.'
        ]);
    }

    /**
     * Get featured posts for homepage
     * Returns posts marked as featured for prominent display
     */
    public function featured(): JsonResponse
    {
        $featuredPosts = Post::published()
                            ->featured()
                            ->with(['category', 'user'])
                            ->orderBy('published_at', 'desc')
                            ->take(5)
                            ->get();

        return response()->json([
            'success' => true,
            'data' => $featuredPosts,
            'message' => 'Featured posts retrieved successfully.'
        ]);
    }

    /**
     * Get recent posts for sidebar or recent articles section
     */
    public function recent(): JsonResponse
    {
        $recentPosts = Post::published()
                          ->with(['category', 'user'])
                          ->orderBy('published_at', 'desc')
                          ->take(10)
                          ->get();

        return response()->json([
            'success' => true,
            'data' => $recentPosts,
            'message' => 'Recent posts retrieved successfully.'
        ]);
    }

    /**
     * Search posts by title, content, or excerpt
     * Returns paginated search results
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->get('q');
        
        if (!$query || strlen($query) < 2) {
            return response()->json([
                'success' => false,
                'message' => 'Search query must be at least 2 characters long.'
            ], 422);
        }

        $posts = Post::published()
            ->with(['category', 'user', 'tags'])
            ->where(function($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('content', 'like', "%{$query}%")
                  ->orWhere('excerpt', 'like', "%{$query}%")
                  ->orWhere('title_sw', 'like', "%{$query}%")
                  ->orWhere('content_sw', 'like', "%{$query}%");
            })
            ->orWhereHas('category', function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('name_sw', 'like', "%{$query}%");
            })
            ->orWhereHas('tags', function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('name_sw', 'like', "%{$query}%");
            })
            ->latest()
            ->paginate(12);

        return response()->json([
            'success' => true,
            'data' => $posts,
            'message' => "Search results for: {$query}"
        ]);
    }

    /**
     * Upload and handle post images
     * Returns image URL for use in post content
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048'
        ]);

        $imagePath = $request->file('image')->store('posts/images', 'public');
        $imageUrl = Storage::disk('public')->url($imagePath);

        return response()->json([
            'success' => true,
            'data' => [
                'url' => $imageUrl,
                'path' => $imagePath
            ],
            'message' => 'Image uploaded successfully.'
        ]);
    }

    /**
     * Get posts for a specific user (author dashboard)
     */
    private function getUserPosts(Request $request): JsonResponse
    {
        try {
            $userId = $request->user_id;
            
            // Get authenticated user
            $user = null;
            if ($request->bearerToken()) {
                $user = \Laravel\Sanctum\PersonalAccessToken::findToken($request->bearerToken())?->tokenable;
            }
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required.'
                ], 401);
            }
            
            // Ensure user can only access their own posts (unless admin)
            if (!$user->isAdmin() && $user->id != $userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to user posts.'
                ], 403);
            }
            
            $query = Post::where('user_id', $userId)
                        ->with(['category', 'user', 'tags'])
                        ->withCount(['comments' => function($q) {
                            $q->where('is_approved', true);
                        }]);
            
            // Filter by status if specified
            if ($request->has('status')) {
                if ($request->status === 'published') {
                    $query->where('is_published', true);
                } elseif ($request->status === 'draft') {
                    $query->where('is_published', false);
                }
            }
            
            // Order by creation date (newest first)
            $query->orderBy('created_at', 'desc');
            
            // For dashboard stats, return all posts (no pagination)
            if ($request->has('all') || $request->has('dashboard')) {
                $posts = $query->get();
                
                return response()->json([
                    'success' => true,
                    'data' => [
                        'data' => $posts,
                        'total' => $posts->count()
                    ],
                    'message' => 'User posts retrieved successfully.'
                ]);
            }

            // Otherwise use pagination
            $posts = $query->paginate($request->get('per_page', 15));
            
            return response()->json([
                'success' => true,
                'data' => $posts,
                'message' => 'User posts retrieved successfully.'
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error retrieving user posts: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user posts.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}