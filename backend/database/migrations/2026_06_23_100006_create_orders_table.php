<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Заказы. Контактные данные сохраняются в самом заказе (снимок на момент
     * оформления), статус отражает жизненный цикл заказа.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('pending'); // pending/processing/shipped/completed/cancelled
            $table->decimal('total', 10, 2);
            $table->string('full_name');
            $table->string('phone');
            $table->text('address');
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
