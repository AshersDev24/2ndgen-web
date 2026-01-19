<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('status')->default('draft');
            $table->boolean('is_limited')->default(false);
            $table->unsignedBigInteger('drop_id')->nullable();
            $table->timestamps();

            $table->index(['status']);
            $table->index(['is_limited']);
            $table->index(['drop_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
