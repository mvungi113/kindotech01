<?php
/**
 * Handles user authentication, registration, and profile management
 * Uses Laravel Sanctum for API token-based authentication
 * Supports admin/author roles for Tanzania blog
 */
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user (author/admin) for Tanzania blog
     * Validates input, creates user, and returns API token
     */
    public function register(Request $request): JsonResponse
    {
        // Validate registration data
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8|confirmed',
            'role' => 'sometimes|in:admin,author', // Role assignment
            'bio' => 'sometimes|string|max:500',
        ]);

        // Return validation errors if any
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors occurred',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create new user with hashed password - always inactive by default
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'author', // Only authors can register
            'status' => 'inactive', // Always inactive, requires admin activation
            'bio' => $request->bio,
        ]);

        // Don't generate token - user needs activation first
        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status' => $user->status
                ]
            ],
            'message' => 'Registration successful! Your account is pending admin activation.'
        ], 201);
    }

    /**
     * Login user and return API token for Tanzania blog access
     * Validates credentials and generates Sanctum token
     */
    public function login(Request $request): JsonResponse
    {
        // Validate login credentials
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Find user by email
        $user = User::where('email', $request->email)->first();

        // Check if user exists and password is correct
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if account is active
        if ($user->status !== 'active') {
            $message = match($user->status) {
                'inactive' => 'Your account is pending admin activation. Please contact an administrator.',
                'suspended' => 'Your account has been suspended. Please contact an administrator.',
                default => 'Your account is not available for login.'
            };
            
            return response()->json([
                'success' => false,
                'message' => $message
            ], 403);
        }

        // Generate new API token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'token' => $token
            ],
            'message' => 'User logged in successfully to kindoTech.'
        ]);
    }

    /**
     * Logout user and revoke current token
     * Ensures secure session termination
     */
    public function logout(Request $request): JsonResponse
    {
        // Delete current access token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'User logged out successfully from Tanzania blog.'
        ]);
    }

    /**
     * Get authenticated user profile with role information
     * Returns user data for profile management
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user
            ],
            'message' => 'User profile retrieved successfully.'
        ]);
    }

    /**
     * Update authenticated user profile
     * Allows users to update their name, bio, and social links
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        // Validate update data
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'bio' => 'sometimes|string|max:500',
            'social_facebook' => 'sometimes|url|max:255',
            'social_twitter' => 'sometimes|url|max:255',
            'social_instagram' => 'sometimes|url|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors occurred',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update user profile
        $user->update($validator->validated());

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user
            ],
            'message' => 'Profile updated successfully.'
        ]);
    }

    /**
     * Send password reset link to user's email
     * Generates secure reset token
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $user = User::where('email', $request->email)->first();
        
        // Generate reset token
        $token = Str::random(64);
        
        // Store token in password_reset_tokens table
        \DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => Hash::make($token),
                'created_at' => now()
            ]
        );

        // Send email with reset link (implement email sending)
        // For now, return success response
        return response()->json([
            'success' => true,
            'message' => 'Password reset link sent to your email.',
            'token' => $token // Remove this in production
        ]);
    }

    /**
     * Reset user password using token
     * Validates token and updates password
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|min:8|confirmed'
        ]);

        // Find reset record
        $resetRecord = \DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord || !Hash::check($request->token, $resetRecord->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired reset token.'
            ], 422);
        }

        // Check if token is not expired (24 hours)
        if (now()->diffInHours($resetRecord->created_at) > 24) {
            return response()->json([
                'success' => false,
                'message' => 'Reset token has expired.'
            ], 422);
        }

        // Update user password
        $user = User::where('email', $request->email)->first();
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        // Delete reset token
        \DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully.'
        ]);
    }

    /**
     * Change user password (for authenticated users)
     * Validates current password before changing
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|min:8|confirmed'
        ]);

        $user = $request->user();

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.'
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.'
        ]);
    }
}
