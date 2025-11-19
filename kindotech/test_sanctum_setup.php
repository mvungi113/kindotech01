<?php
/**
 * Quick diagnostic script to check database and Sanctum setup
 * Run this with: php artisan tinker
 * Or create as a route for testing
 */

// Check if personal_access_tokens table exists
try {
    $tableExists = \Schema::hasTable('personal_access_tokens');
    echo "personal_access_tokens table exists: " . ($tableExists ? 'YES' : 'NO') . "\n";
} catch (\Exception $e) {
    echo "Error checking table: " . $e->getMessage() . "\n";
}

// Check if users table exists and has data
try {
    $usersCount = \App\Models\User::count();
    echo "Total users in database: " . $usersCount . "\n";
    
    if ($usersCount > 0) {
        $activeUsers = \App\Models\User::where('status', 'active')->get();
        echo "Active users: " . $activeUsers->count() . "\n";
        
        foreach ($activeUsers as $user) {
            echo "  - {$user->name} ({$user->email}) - Role: {$user->role}\n";
        }
    }
} catch (\Exception $e) {
    echo "Error checking users: " . $e->getMessage() . "\n";
}

// Test token creation
try {
    $testUser = \App\Models\User::where('status', 'active')->first();
    if ($testUser) {
        $token = $testUser->createToken('test_token');
        echo "\nToken creation test: SUCCESS\n";
        echo "Token ID: " . $token->accessToken->id . "\n";
        
        // Clean up test token
        $token->accessToken->delete();
    } else {
        echo "\nNo active users found for token test\n";
    }
} catch (\Exception $e) {
    echo "\nToken creation test: FAILED\n";
    echo "Error: " . $e->getMessage() . "\n";
}
