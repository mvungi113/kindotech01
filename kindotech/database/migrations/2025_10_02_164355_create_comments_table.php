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
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
             $table->text('content'); 
            $table->string('author_name'); 
            $table->string('author_email'); 
            $table->string('author_website')->nullable(); 
            $table->boolean('is_approved')->default(false); 
            $table->integer('likes')->default(0); 
            $table->foreignId('post_id')->constrained()->onDelete('cascade'); 
            $table->foreignId('parent_id')->nullable()->constrained('comments')->onDelete('cascade'); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
