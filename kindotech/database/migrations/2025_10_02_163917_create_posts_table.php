<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('title'); 
            $table->string('title_sw')->nullable(); 
            $table->string('slug')->unique(); 
            $table->text('content');
            $table->text('content_sw')->nullable(); 
            $table->text('excerpt')->nullable(); 
            $table->string('featured_image')->nullable();
            $table->string('image_caption')->nullable(); 
            $table->boolean('is_published')->default(false);
            $table->boolean('is_featured')->default(false); 
            $table->timestamp('published_at')->nullable();
            $table->integer('views')->default(0); 
            $table->integer('reading_time')->default(5); 
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); 
            $table->foreignId('category_id')->constrained()->onDelete('cascade'); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
