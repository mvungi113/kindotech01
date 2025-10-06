<?php
/**
 * Test script to verify image upload functionality
 */
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Laravel\Sanctum\PersonalAccessToken;

echo "=== Testing Image Upload Functionality ===\n";

// Check if storage directory exists and is writable
$publicStoragePath = storage_path('app/public');
$postsImagePath = storage_path('app/public/posts/images');

echo "Storage paths:\n";
echo "- Public storage: {$publicStoragePath} " . (is_dir($publicStoragePath) ? '[EXISTS]' : '[MISSING]') . "\n";
echo "- Posts images: {$postsImagePath} " . (is_dir($postsImagePath) ? '[EXISTS]' : '[MISSING]') . "\n";

// Create directories if they don't exist
if (!is_dir($publicStoragePath)) {
    mkdir($publicStoragePath, 0755, true);
    echo "Created public storage directory\n";
}

if (!is_dir($postsImagePath)) {
    mkdir($postsImagePath, 0755, true);
    echo "Created posts images directory\n";
}

// Check write permissions
echo "Permissions:\n";
echo "- Public storage writable: " . (is_writable($publicStoragePath) ? 'YES' : 'NO') . "\n";
echo "- Posts images writable: " . (is_writable($postsImagePath) ? 'YES' : 'NO') . "\n";

// Check if symlink exists and works
$publicSymlinkPath = public_path('storage');
echo "Public symlink: {$publicSymlinkPath} " . (is_link($publicSymlinkPath) ? '[SYMLINK]' : (is_dir($publicSymlinkPath) ? '[DIRECTORY]' : '[MISSING]')) . "\n";

if (is_link($publicSymlinkPath)) {
    $target = readlink($publicSymlinkPath);
    echo "- Points to: {$target}\n";
    echo "- Target exists: " . (file_exists($target) ? 'YES' : 'NO') . "\n";
}

// Check if we can get a valid auth token
$adminUser = User::where('role', 'admin')->first();
if ($adminUser) {
    echo "\nAdmin user found: {$adminUser->name} (ID: {$adminUser->id})\n";
    
    // Create a test token
    $token = $adminUser->createToken('test-upload')->plainTextToken;
    echo "Test token created: " . substr($token, 0, 20) . "...\n";
    
    // Clean up the token
    $adminUser->tokens()->delete();
    echo "Test token cleaned up\n";
} else {
    echo "\nNo admin user found for testing\n";
}

echo "\nImage upload setup complete. You can now test uploading images through the frontend.\n";