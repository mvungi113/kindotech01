<?php

/**
 * Dashboard controller for admin statistics and overview
 * Provides analytics and recent activity data for Tanzania blog
 */
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\User;
use App\Models\Comment;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics for admin panel
     * Returns counts and metrics for Tanzania blog
     */
    public function stats(): JsonResponse
    {
        try {
            // Basic counts
            $totalPosts = Post::count();
            $publishedPosts = Post::published()->count();
            $draftPosts = Post::draft()->count();
            $totalUsers = User::count();
            $totalComments = Comment::count();
            $totalCategories = Category::count();
            
            // Recent activity (last 30 days)
            $recentDate = Carbon::now()->subDays(30);
            $recentPosts = Post::where('created_at', '>=', $recentDate)->count();
            $recentUsers = User::where('created_at', '>=', $recentDate)->count();
            $recentComments = Comment::where('created_at', '>=', $recentDate)->count();
            
            // Popular posts (by views)
            $popularPosts = Post::published()
                ->orderBy('views', 'desc')
                ->limit(5)
                ->get(['id', 'title', 'views', 'published_at']);
                
            // Total views
            $totalViews = Post::sum('views');
            
            return response()->json([
                'success' => true,
                'data' => [
                    'totals' => [
                        'posts' => $totalPosts,
                        'published_posts' => $publishedPosts,
                        'draft_posts' => $draftPosts,
                        'users' => $totalUsers,
                        'comments' => $totalComments,
                        'categories' => $totalCategories,
                        'views' => $totalViews,
                    ],
                    'recent' => [
                        'posts' => $recentPosts,
                        'users' => $recentUsers,
                        'comments' => $recentComments,
                    ],
                    'popular_posts' => $popularPosts,
                ],
                'message' => 'Dashboard statistics retrieved successfully.'
            ]);
        } catch (\Exception $e) {
            \Log::error('Dashboard stats error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load dashboard statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get recent activity for dashboard
     * Returns latest posts, comments, and user registrations
     */
    public function recentActivity(): JsonResponse
    {
        try {
            // Recent posts (last 10)
            $recentPosts = Post::with('user', 'category')
                ->latest()
                ->limit(10)
                ->get(['id', 'title', 'user_id', 'category_id', 'is_published', 'created_at']);

            // Recent comments (last 10) - using correct column names
            $recentComments = Comment::with('post')
                ->latest()
                ->limit(10)
                ->get(['id', 'content', 'author_name', 'post_id', 'is_approved', 'created_at']);

            // Recent users (last 10)
            $recentUsers = User::latest()
                ->limit(10)
                ->get(['id', 'name', 'email', 'role', 'created_at']);

            return response()->json([
                'success' => true,
                'data' => [
                    'recent_posts' => $recentPosts,
                    'recent_comments' => $recentComments,
                    'recent_users' => $recentUsers,
                ],
                'message' => 'Recent activity retrieved successfully.'
            ]);
        } catch (\Exception $e) {
            \Log::error('Dashboard recent activity error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load recent activity',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get monthly statistics for charts
     * Returns data for the last 12 months
     */
    public function monthlyStats(): JsonResponse
    {
        $months = [];
        $postsData = [];
        $usersData = [];
        $commentsData = [];

        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthStart = $date->copy()->startOfMonth();
            $monthEnd = $date->copy()->endOfMonth();
            
            $months[] = $date->format('M Y');
            
            $postsData[] = Post::whereBetween('created_at', [$monthStart, $monthEnd])->count();
            $usersData[] = User::whereBetween('created_at', [$monthStart, $monthEnd])->count();
            $commentsData[] = Comment::whereBetween('created_at', [$monthStart, $monthEnd])->count();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'months' => $months,
                'posts' => $postsData,
                'users' => $usersData,
                'comments' => $commentsData,
            ],
            'message' => 'Monthly statistics retrieved successfully.'
        ]);
    }
}