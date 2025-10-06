<?php

/**
 * Handles comment operations for Tanzania blog posts
 * Manages comment creation, approval, and moderation
 * Supports nested replies for engaging discussions
 */
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Get comments for a specific post
     * Returns approved comments with replies for public display
     */
    public function getPostComments($postId): JsonResponse
    {
        // Find post
        $post = Post::find($postId);
        
        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found.'
            ], 404);
        }

        // Get approved top-level comments with their replies
        $comments = $post->topLevelComments()
                        ->with('replies')
                        ->orderBy('created_at', 'desc')
                        ->get();

        return response()->json([
            'success' => true,
            'data' => $comments,
            'message' => 'Post comments retrieved successfully.'
        ]);
    }

    /**
     * Store a newly created comment
     * Handles guest comment submission with approval system
     */
    public function store(Request $request, $postId): JsonResponse
    {
        // Find post
        $post = Post::published()->find($postId);
        
        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found or not published.'
            ], 404);
        }

        // Validate comment data
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
            'author_name' => 'required|string|max:255',
            'author_email' => 'required|email|max:255',
            'author_website' => 'nullable|url|max:255',
            'parent_id' => 'nullable|exists:comments,id', // For replies
        ]);

        // Add post ID to validated data
        $validated['post_id'] = $post->id;

        // Auto-approve comments if needed (can be modified based on settings)
        $validated['is_approved'] = true; // Set to false for moderation

        // Create comment
        $comment = Comment::create($validated);

        return response()->json([
            'success' => true,
            'data' => $comment,
            'message' => 'Comment submitted successfully. It will appear after approval.'
        ], 201);
    }

    /**
     * Approve a comment (Admin only)
     * Moderation endpoint for comment approval
     */
    public function approve(Comment $comment): JsonResponse
    {
        $comment->update(['is_approved' => true]);

        return response()->json([
            'success' => true,
            'data' => $comment,
            'message' => 'Comment approved successfully.'
        ]);
    }

    /**
     * Like a comment
     * Increments like counter for comment engagement
     */
    public function like(Comment $comment): JsonResponse
    {
        $comment->incrementLikes();

        return response()->json([
            'success' => true,
            'data' => [
                'likes' => $comment->likes
            ],
            'message' => 'Comment liked successfully.'
        ]);
    }

    /**
     * Get comments for moderation (Admin only)
     * Returns unapproved comments for admin review
     */
    public function moderationQueue(): JsonResponse
    {
        $comments = Comment::with(['post', 'parent'])
                          ->where('is_approved', false)
                          ->orderBy('created_at', 'desc')
                          ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $comments,
            'message' => 'Moderation queue retrieved successfully.'
        ]);
    }

    /**
     * Remove the specified comment (Admin/Moderator only)
     */
    public function destroy(Comment $comment): JsonResponse
    {
        $comment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Comment deleted successfully.'
        ]);
    }
}