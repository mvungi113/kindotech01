<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';

use App\Models\Category;

$categories = Category::all();

echo "=== CATEGORIES IN DATABASE ===\n";
echo "Total categories: " . $categories->count() . "\n\n";

foreach($categories as $category) {
    echo "ID: " . $category->id . "\n";
    echo "Name: " . $category->name . "\n";
    echo "Slug: " . $category->slug . "\n";
    echo "Description: " . ($category->description ?: 'No description') . "\n";
    echo "---\n";
}