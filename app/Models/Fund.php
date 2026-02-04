<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Fund extends Model
{
    protected $fillable = [
        'name',
        'description',
        'created_by',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'fund_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function getTotalAttribute(): float
    {
        return $this->transactions()->sum('amount');
    }

    /**
     * Check if the user can manage transactions (add/edit/delete).
     */
    public function canManageTransactions(User $user): bool
    {
        $membership = $this->members()->where('user_id', $user->id)->first();

        if ($membership) {
            return in_array($membership->pivot->role, ['owner', 'member'], true);
        }

        return $this->created_by === $user->id;
    }

    /**
     * Check if the user can edit the fund (name, description, members).
     */
    public function canEdit(User $user): bool
    {
        $membership = $this->members()->where('user_id', $user->id)->first();

        if ($membership) {
            return in_array($membership->pivot->role, ['owner', 'member'], true);
        }

        return $this->created_by === $user->id;
    }

    /**
     * Check if the user is an owner (can add/remove members, delete fund).
     */
    public function isOwner(User $user): bool
    {
        $membership = $this->members()->where('user_id', $user->id)->first();

        if ($membership) {
            return $membership->pivot->role === 'owner';
        }

        return $this->created_by === $user->id;
    }
}
