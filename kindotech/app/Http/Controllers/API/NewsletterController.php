<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Newsletter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class NewsletterController extends Controller
{
    /**
     * Subscribe user to newsletter
     */
    public function subscribe(Request $request)
    {
        try {
            // Validate the email
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|max:255',
                'source' => 'nullable|string|max:50'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid email address',
                    'errors' => $validator->errors()
                ], 422);
            }

            $email = $request->email;
            $source = $request->source ?? 'website';

            // Check if already subscribed
            if (Newsletter::isSubscribed($email)) {
                return response()->json([
                    'success' => true,
                    'message' => 'You are already subscribed to our newsletter!'
                ]);
            }

            // Subscribe the user
            $subscription = Newsletter::subscribe($email, $source);

            Log::info('Newsletter subscription', [
                'email' => $email,
                'source' => $source,
                'ip' => $request->ip()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Thank you for subscribing! You will receive updates from Kindo Tech.',
                'data' => [
                    'email' => $subscription->email,
                    'subscribed_at' => $subscription->subscribed_at->format('Y-m-d H:i:s')
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Newsletter subscription error', [
                'email' => $request->email ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Sorry, there was an error subscribing. Please try again.'
            ], 500);
        }
    }

    /**
     * Unsubscribe user from newsletter
     */
    public function unsubscribe(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid email address',
                    'errors' => $validator->errors()
                ], 422);
            }

            $subscription = Newsletter::where('email', $request->email)->first();

            if (!$subscription) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email not found in our newsletter list.'
                ], 404);
            }

            if (!$subscription->is_active) {
                return response()->json([
                    'success' => true,
                    'message' => 'You are already unsubscribed from our newsletter.'
                ]);
            }

            $subscription->unsubscribe();

            Log::info('Newsletter unsubscription', [
                'email' => $request->email,
                'ip' => $request->ip()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'You have been successfully unsubscribed from our newsletter.'
            ]);

        } catch (\Exception $e) {
            Log::error('Newsletter unsubscription error', [
                'email' => $request->email ?? 'unknown',
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Sorry, there was an error unsubscribing. Please try again.'
            ], 500);
        }
    }

    /**
     * Get newsletter statistics (Admin only)
     */
    public function stats()
    {
        try {
            $totalSubscribers = Newsletter::active()->count();
            $totalUnsubscribed = Newsletter::where('is_active', false)->count();
            $recentSubscribers = Newsletter::active()
                ->where('subscribed_at', '>=', now()->subDays(30))
                ->count();

            $sourceStats = Newsletter::active()
                ->selectRaw('subscription_source, count(*) as count')
                ->groupBy('subscription_source')
                ->get()
                ->keyBy('subscription_source');

            return response()->json([
                'success' => true,
                'data' => [
                    'total_subscribers' => $totalSubscribers,
                    'total_unsubscribed' => $totalUnsubscribed,
                    'recent_subscribers' => $recentSubscribers,
                    'sources' => $sourceStats
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Newsletter stats error', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Error retrieving newsletter statistics'
            ], 500);
        }
    }

    /**
     * Get subscribers list (Admin only)
     */
    public function index(Request $request)
    {
        try {
            $query = Newsletter::query();

            // Filter by status
            if ($request->has('status')) {
                if ($request->status === 'active') {
                    $query->active();
                } elseif ($request->status === 'inactive') {
                    $query->where('is_active', false);
                }
            }

            // Filter by source
            if ($request->has('source')) {
                $query->fromSource($request->source);
            }

            // Search by email
            if ($request->has('search')) {
                $query->where('email', 'like', '%' . $request->search . '%');
            }

            $subscribers = $query->orderBy('subscribed_at', 'desc')
                ->paginate($request->per_page ?? 50);

            return response()->json([
                'success' => true,
                'data' => $subscribers
            ]);

        } catch (\Exception $e) {
            Log::error('Newsletter list error', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Error retrieving subscribers list'
            ], 500);
        }
    }
}
