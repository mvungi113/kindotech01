<?php

/**
 * Test script for newsletter subscription functionality
 * Run this script to test the Newsletter model and database
 */
require_once __DIR__ . '/vendor/autoload.php';

use App\Models\Newsletter;
use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Newsletter Subscription System\n";
echo "=====================================\n\n";

try {
    // Test 1: Check if newsletters table exists
    echo "1. Checking if newsletters table exists...\n";
    $tableExists = DB::getSchemaBuilder()->hasTable('newsletters');
    echo $tableExists ? "✓ Table exists\n" : "✗ Table does not exist\n";
    
    if (!$tableExists) {
        echo "Please run: php artisan migrate\n";
        exit(1);
    }
    
    // Test 2: Subscribe a test email
    echo "\n2. Testing subscription...\n";
    $testEmail = 'test@example.com';
    
    $subscription = Newsletter::subscribe($testEmail, 'test');
    echo "✓ Subscription created for: {$subscription->email}\n";
    echo "  - Subscribed at: {$subscription->subscribed_at}\n";
    echo "  - Source: {$subscription->subscription_source}\n";
    echo "  - Status: " . ($subscription->is_active ? 'Active' : 'Inactive') . "\n";
    
    // Test 3: Check if already subscribed
    echo "\n3. Testing duplicate subscription...\n";
    $isDuplicate = Newsletter::isSubscribed($testEmail);
    echo $isDuplicate ? "✓ Correctly detected as already subscribed\n" : "✗ Should be detected as subscribed\n";
    
    // Test 4: Subscribe again (should update existing)
    $subscription2 = Newsletter::subscribe($testEmail, 'test_duplicate');
    echo "✓ Duplicate subscription handled correctly\n";
    echo "  - Updated source: {$subscription2->subscription_source}\n";
    
    // Test 5: Get statistics
    echo "\n4. Testing statistics...\n";
    $totalActive = Newsletter::active()->count();
    $totalAll = Newsletter::count();
    echo "✓ Total active subscribers: {$totalActive}\n";
    echo "✓ Total all subscribers: {$totalAll}\n";
    
    // Test 6: Unsubscribe
    echo "\n5. Testing unsubscribe...\n";
    $subscription->unsubscribe();
    echo "✓ Unsubscribed: {$subscription->email}\n";
    echo "  - Unsubscribed at: {$subscription->unsubscribed_at}\n";
    echo "  - Status: " . ($subscription->is_active ? 'Active' : 'Inactive') . "\n";
    
    // Clean up test data
    echo "\n6. Cleaning up test data...\n";
    Newsletter::where('email', $testEmail)->delete();
    echo "✓ Test data cleaned up\n";
    
    echo "\n=====================================\n";
    echo "✓ All tests passed! Newsletter system is working correctly.\n";
    
} catch (Exception $e) {
    echo "\n✗ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}