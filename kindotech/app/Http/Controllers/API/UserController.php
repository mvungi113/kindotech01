<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

/**
 * User management controller for admins
 * Handles user listing, role management, and profile updates
 */
class UserController extends Controller
{
    /**
     * Get all users with pagination and filtering
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = User::query();

            // Filter by role if specified
            if ($request->filled('role')) {
                $query->where('role', $request->role);
            }

            // Filter by status if specified
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            // Search by name or email
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Get users with post counts
            $users = $query->withCount('posts')
                          ->orderBy('created_at', 'desc')
                          ->paginate($request->get('per_page', 15));

            // Get statistics for all users (regardless of pagination/filtering)
            $totalStats = [
                'total_users' => User::count(),
                'total_admins' => User::where('role', 'admin')->count(),
                'total_authors' => User::where('role', 'author')->count(),
                'total_verified' => User::whereNotNull('email_verified_at')->count(),
                'active_users' => User::where('status', 'active')->count(),
                'inactive_users' => User::where('status', 'inactive')->count(),
                'suspended_users' => User::where('status', 'suspended')->count(),
                'pending_activation' => User::where('status', 'inactive')->where('role', 'author')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $users,
                'stats' => $totalStats,
                'message' => 'Users retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error retrieving users: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve users.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get a specific user
     */
    public function show(User $user): JsonResponse
    {
        try {
            // Load user with posts count and recent posts
            $user->loadCount('posts');
            $user->load(['posts' => function($query) {
                $query->latest()->take(5);
            }]);

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'User retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error retrieving user: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update user information (Admin only)
     */
    public function update(Request $request, User $user): JsonResponse
    {
        try {
            // Validate request
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $user->id,
                'role' => 'sometimes|in:admin,author',
                'bio' => 'sometimes|nullable|string|max:500',
                'avatar' => 'sometimes|nullable|string|max:255',
                'social_facebook' => 'sometimes|nullable|url',
                'social_twitter' => 'sometimes|nullable|url',
                'social_instagram' => 'sometimes|nullable|url',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update user
            $user->update($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $user->fresh(),
                'message' => 'User updated successfully.'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error updating user: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Delete a user (Admin only)
     */
    public function destroy(User $user): JsonResponse
    {
        try {
            // Don't allow deletion of the last admin
            if ($user->role === 'admin') {
                $adminCount = User::where('role', 'admin')->count();
                if ($adminCount <= 1) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cannot delete the last administrator.'
                    ], 403);
                }
            }

            // Don't allow users to delete themselves
            if ($user->id === auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot delete your own account.'
                ], 403);
            }

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully.'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error deleting user: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get user statistics
     */
    public function stats(): JsonResponse
    {
        try {
            $stats = [
                'total_users' => User::count(),
                'admin_users' => User::where('role', 'admin')->count(),
                'author_users' => User::where('role', 'author')->count(),
                'verified_users' => User::whereNotNull('email_verified_at')->count(),
                'recent_users' => User::where('created_at', '>=', now()->subWeek())->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'User statistics retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error retrieving user stats: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user statistics.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Activate a user account (Admin only)
     */
    public function activateUser(Request $request, $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            
            $user->update(['status' => 'active']);
            
            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'User account activated successfully.'
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error activating user: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to activate user account.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Deactivate a user account (Admin only)
     */
    public function deactivateUser(Request $request, $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            
            // Prevent deactivating the last admin
            if ($user->role === 'admin' && User::where('role', 'admin')->where('status', 'active')->count() <= 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot deactivate the last active admin account.'
                ], 400);
            }
            
            $user->update(['status' => 'inactive']);
            
            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'User account deactivated successfully.'
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error deactivating user: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to deactivate user account.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Change user status (Admin only)
     */
    public function changeStatus(Request $request, $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => 'required|in:active,inactive,suspended'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::findOrFail($id);
            
            // Prevent deactivating the last admin
            if ($user->role === 'admin' && $request->status !== 'active' && User::where('role', 'admin')->where('status', 'active')->count() <= 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot change status of the last active admin account.'
                ], 400);
            }
            
            $user->update(['status' => $request->status]);
            
            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'User status updated successfully.'
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error changing user status: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user status.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}