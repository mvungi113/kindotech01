<?php

/**
 * API routes for Kindo Tech backend
 * Defines all endpoints for frontend communication
 * Organized by public and protected routes with Sanctum authentication
 */
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\PostController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\CommentController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\NewsletterController;
use Illuminate\Support\Facades\Route;

// Public routes - accessible without authentication
Route::prefix('v1')->group(function () {
    
    // Authentication routes
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    
    // Public post routes
    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/featured', [PostController::class, 'featured']);
    Route::get('/posts/recent', [PostController::class, 'recent']);
    Route::get('/posts/search', [PostController::class, 'search']);
    Route::get('/posts/{slug}', [PostController::class, 'show'])->where('slug', '[a-zA-Z0-9\-_]+');
    
    // Public category routes
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}/posts', [CategoryController::class, 'posts']);
    
    // Public comment routes
    Route::get('/posts/{postId}/comments', [CommentController::class, 'getPostComments']);
    Route::post('/posts/{postId}/comments', [CommentController::class, 'store']);
    Route::post('/comments/{comment}/like', [CommentController::class, 'like']);
    
    // Newsletter routes (public)
    Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe']);
    Route::post('/newsletter/unsubscribe', [NewsletterController::class, 'unsubscribe']);
    
    // Health check endpoint
    Route::get('/health', function () {
        try {
            // Check database connection
            \DB::connection()->getPdo();
            $dbStatus = 'connected';
            
            // Check if personal_access_tokens table exists
            $sanctumTable = \Schema::hasTable('personal_access_tokens') ? 'exists' : 'missing';
            
            // Check users count
            $usersCount = \App\Models\User::count();
            
            return response()->json([
                'success' => true,
                'status' => 'healthy',
                'database' => $dbStatus,
                'sanctum_table' => $sanctumTable,
                'users_count' => $usersCount,
                'app_debug' => config('app.debug'),
                'app_env' => config('app.env')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    });
    // Debug Sanctum endpoint
    Route::get('/debug-sanctum', function () {
        try {
            $report = [];
            
            // 1. Check Table
            $report['table_exists'] = \Schema::hasTable('personal_access_tokens');
            
            // 2. Check User
            $user = \App\Models\User::first();
            $report['user_found'] = $user ? true : false;
            
            if ($user) {
                $report['user_id'] = $user->id;
                $report['user_class'] = get_class($user);
                $report['traits'] = class_uses_recursive($user);
                
                // 3. Try Create Token
                try {
                    $token = $user->createToken('debug_token');
                    $report['token_created'] = true;
                    $report['token_id'] = $token->accessToken->id;
                    // Cleanup
                    $token->accessToken->delete();
                } catch (\Exception $e) {
                    $report['token_created'] = false;
                    $report['token_error'] = $e->getMessage();
                    $report['token_trace'] = $e->getTraceAsString();
                }
            }
            
            return response()->json($report);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    });

    // Temporary route to fix user password
    Route::get('/fix-password', function (\Illuminate\Http\Request $request) {
        $secret = $request->query('secret');
        if ($secret !== 'kindotech_debug_fix') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $email = $request->query('email');
        $password = $request->query('password');
        
        if (!$email || !$password) {
            return response()->json(['error' => 'Email and password required'], 400);
        }
        
        $user = \App\Models\User::where('email', $email)->first();
        
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }
        
        $user->password = \Illuminate\Support\Facades\Hash::make($password);
        $user->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully',
            'user' => $user->email
        ]);
    });
});

// Protected routes - require Sanctum authentication
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    
    // Authentication management
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::post('/user/change-password', [AuthController::class, 'changePassword']);
    
    // Debug route to test authentication
    Route::get('/auth-test', function () {
        return response()->json([
            'success' => true,
            'user' => auth()->user(),
            'message' => 'Authentication working'
        ]);
    });
    
    // Post management (Admin/Author)
    Route::apiResource('/posts', PostController::class)->except(['index', 'show']);
    Route::get('/posts/{post}/edit', [PostController::class, 'edit']); // For editing access by ID
    Route::post('/posts/{post}/publish', [PostController::class, 'publish']);
    Route::post('/posts/{post}/unpublish', [PostController::class, 'unpublish']);
    Route::post('/posts/upload-image', [PostController::class, 'uploadImage']);
    
    // Category management (Admin only)
    Route::middleware('admin')->group(function () {
        Route::apiResource('/categories', CategoryController::class)->except(['index']);
        
        // Comment moderation (Admin only)
        Route::get('/comments/moderation', [CommentController::class, 'moderationQueue']);
        Route::post('/comments/{comment}/approve', [CommentController::class, 'approve']);
        Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
        
        // User management (Admin only)
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::get('/users/stats', [UserController::class, 'stats']);
        
        // User activation management (Admin only)
        Route::post('/users/{user}/activate', [UserController::class, 'activateUser']);
        Route::post('/users/{user}/deactivate', [UserController::class, 'deactivateUser']);
        Route::put('/users/{user}/status', [UserController::class, 'changeStatus']);
        
        // Newsletter management (Admin only)
        Route::get('/newsletter/subscribers', [NewsletterController::class, 'index']);
        Route::get('/newsletter/stats', [NewsletterController::class, 'stats']);
    });
    
    // Dashboard routes (temporarily without admin middleware for testing)
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/recent-activity', [DashboardController::class, 'recentActivity']);
    Route::get('/dashboard/monthly-stats', [DashboardController::class, 'monthlyStats']);
});

// Fallback route for undefined API endpoints
Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'API endpoint not found.'
    ], 404);
});