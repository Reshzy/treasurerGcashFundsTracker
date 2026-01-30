<?php

namespace App\Http\Controllers;

use App\Models\Fund;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'fund_id' => 'required|exists:funds,id',
            'sender_id' => 'required|exists:senders,id',
            'amount' => 'required|numeric|min:0.01',
            'date' => 'required|date',
            'notes' => 'nullable|string',
            'category' => 'nullable|string|max:255',
        ]);

        // Check if user has access to the fund
        $fund = Fund::findOrFail($validated['fund_id']);
        $user = Auth::user();
        $hasAccess = $fund->members()->where('user_id', $user->id)->exists()
            || $fund->created_by === $user->id;

        if (!$hasAccess) {
            abort(403, 'You do not have access to this fund.');
        }

        $transaction = Transaction::create([
            ...$validated,
            'created_by' => $user->id,
        ]);

        return redirect()->route('funds.show', $fund->id)
            ->with('success', 'Transaction added successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $transaction = Transaction::findOrFail($id);
        $user = Auth::user();

        // Check if user has access to the fund
        $fund = $transaction->fund;
        $hasAccess = $fund->members()->where('user_id', $user->id)->exists()
            || $fund->created_by === $user->id;

        if (!$hasAccess) {
            abort(403, 'You do not have access to this transaction.');
        }

        $validated = $request->validate([
            'sender_id' => 'required|exists:senders,id',
            'amount' => 'required|numeric|min:0.01',
            'date' => 'required|date',
            'notes' => 'nullable|string',
            'category' => 'nullable|string|max:255',
        ]);

        $transaction->update($validated);

        return redirect()->route('funds.show', $fund->id)
            ->with('success', 'Transaction updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $transaction = Transaction::findOrFail($id);
        $user = Auth::user();

        // Check if user has access to the fund
        $fund = $transaction->fund;
        $hasAccess = $fund->members()->where('user_id', $user->id)->exists()
            || $fund->created_by === $user->id;

        if (!$hasAccess) {
            abort(403, 'You do not have access to this transaction.');
        }

        $fundId = $fund->id;
        $transaction->delete();

        return redirect()->route('funds.show', $fundId)
            ->with('success', 'Transaction deleted successfully.');
    }
}
