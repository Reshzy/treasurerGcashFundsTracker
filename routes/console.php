<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('user:make-admin {email?}', function (?string $email = null) {
    if ($email) {
        $user = User::where('email', $email)->first();
        if (! $user) {
            $this->error("No user found with email: {$email}");
            return 1;
        }
    } else {
        $user = User::orderBy('id')->first();
        if (! $user) {
            $this->error('No users in the database.');
            return 1;
        }
    }
    $user->update(['is_admin' => true]);
    $this->info("User \"{$user->name}\" ({$user->email}) is now an admin.");
    return 0;
})->purpose('Make a user an admin (by email, or first user if no email given)');
