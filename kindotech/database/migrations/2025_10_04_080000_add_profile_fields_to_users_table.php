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
        Schema::table('users', function (Blueprint $table) {
            // Role for RBAC (admin, author)
            $table->string('role')->default('author')->after('password');
            // Profile fields
            $table->text('bio')->nullable()->after('role');
            $table->string('avatar')->nullable()->after('bio');
            $table->string('social_facebook')->nullable()->after('avatar');
            $table->string('social_twitter')->nullable()->after('social_facebook');
            $table->string('social_instagram')->nullable()->after('social_twitter');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role',
                'bio',
                'avatar',
                'social_facebook',
                'social_twitter',
                'social_instagram',
            ]);
        });
    }
};
