<?php

use App\Http\Controllers\FundController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SenderController;
use App\Http\Controllers\TransactionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    $user = Auth::user();
    $funds = $user->funds()
        ->with(['creator', 'transactions'])
        ->withCount('transactions')
        ->get()
        ->map(function ($fund) {
            return [
                'id' => $fund->id,
                'name' => $fund->name,
                'description' => $fund->description,
                'total' => $fund->total,
                'transaction_count' => $fund->transactions_count,
                'role' => $fund->pivot->role ?? 'owner',
            ];
        })
        ->take(5); // Show only top 5 funds

    $totalFunds = $user->funds()->count();
    $totalAmount = $user->funds()->get()->sum('total');

    return Inertia::render('Dashboard', [
        'funds' => $funds,
        'totalFunds' => $totalFunds,
        'totalAmount' => $totalAmount,
    ]);
})->middleware(['auth', 'verified', 'admin'])->name('dashboard');

Route::get('/unauthorized', function () {
    return Inertia::render('Unauthorized');
})->middleware('auth')->name('unauthorized');

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Funds routes
    Route::resource('funds', FundController::class);
    Route::post('/funds/{fund}/members', [FundController::class, 'addMember'])->name('funds.members.add');

    // Senders routes
    Route::resource('senders', SenderController::class);

    // Transactions routes
    Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
    Route::put('/transactions/{transaction}', [TransactionController::class, 'update'])->name('transactions.update');
    Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy'])->name('transactions.destroy');
});

require __DIR__.'/auth.php';
