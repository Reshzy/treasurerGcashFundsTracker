<?php

namespace App\Http\Controllers;

use App\Models\Fund;
use App\Models\SavedMemberName;
use App\Models\Sender;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class TransactionController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate either sender_id OR new_sender, but not both
        $request->validate([
            'fund_id' => 'required|exists:funds,id',
            'sender_id' => 'required_without:new_sender|nullable|exists:senders,id',
            'new_sender' => 'required_without:sender_id|nullable|array',
            'new_sender.name' => 'required_with:new_sender|string|max:255',
            'new_sender.type' => 'required_with:new_sender|in:individual,group',
            'new_sender.member_names' => 'required_if:new_sender.type,group|array|min:1',
            'new_sender.member_names.*' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01|max:999999.99',
            'date' => 'required|date|before_or_equal:today',
            'notes' => 'nullable|string',
            'category' => 'nullable|string|max:255',
        ]);

        // Check if user can manage transactions (owner or member; viewer cannot)
        $fund = Fund::findOrFail($request->fund_id);
        $user = Auth::user();

        if (! $fund->canManageTransactions($user)) {
            abort(403, 'You do not have permission to add transactions to this fund.');
        }

        // Trap: same sender name already in this fund (case-insensitive)
        if ($request->has('new_sender')) {
            $existingNames = $fund->transactions()
                ->with('sender')
                ->get()
                ->pluck('sender.name')
                ->filter()
                ->map(fn ($n) => strtolower(trim($n)))
                ->values()
                ->all();
            $newName = strtolower(trim($request->input('new_sender.name', '')));
            if ($newName !== '' && in_array($newName, $existingNames)) {
                throw ValidationException::withMessages([
                    'new_sender.name' => 'A sender with this name already exists in this fund. Please select it from the list.',
                ]);
            }
        }

        // Handle sender creation if new_sender is provided
        $senderId = $request->sender_id;
        if ($request->has('new_sender')) {
            $newSender = $request->new_sender;

            if ($newSender['type'] === 'individual') {
                // Create or get placeholder user for individual sender
                $placeholderUser = User::firstOrCreate(
                    ['name' => $newSender['name'], 'email' => null],
                    ['password' => null]
                );

                // Create sender linked to the user
                $sender = Sender::create([
                    'name' => $newSender['name'],
                    'type' => 'individual',
                    'created_by' => $user->id,
                ]);

                // Link user to sender (for individual, the user is the sender)
                $sender->members()->attach($placeholderUser->id);
                $senderId = $sender->id;
            } else {
                // Group sender
                $memberUserIds = [];

                // Create placeholder users for each member
                foreach ($newSender['member_names'] as $memberName) {
                    $memberUser = User::firstOrCreate(
                        ['name' => $memberName, 'email' => null],
                        ['password' => null]
                    );
                    $memberUserIds[] = $memberUser->id;
                }

                // Create sender
                $sender = Sender::create([
                    'name' => $newSender['name'],
                    'type' => 'group',
                    'created_by' => $user->id,
                ]);

                // Link all member users to sender
                $sender->members()->sync($memberUserIds);

                // Save member names for reuse in later funds
                foreach ($newSender['member_names'] as $memberName) {
                    SavedMemberName::firstOrCreate(
                        ['user_id' => $user->id, 'name' => trim($memberName)],
                        ['user_id' => $user->id, 'name' => trim($memberName)]
                    );
                }

                $senderId = $sender->id;
            }
        }

        // Trap: duplicate transaction (same fund, sender, date, amount)
        if (Transaction::where('fund_id', $fund->id)
            ->where('sender_id', $senderId)
            ->whereDate('date', $request->date)
            ->where('amount', $request->amount)
            ->exists()) {
            throw ValidationException::withMessages([
                'amount' => 'A transaction with this sender, date, and amount already exists in this fund.',
            ]);
        }

        $transaction = Transaction::create([
            'fund_id' => $request->fund_id,
            'sender_id' => $senderId,
            'amount' => $request->amount,
            'date' => $request->date,
            'notes' => $request->notes,
            'category' => $request->category,
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

        // Check if user can manage transactions (owner or member; viewer cannot)
        $fund = $transaction->fund;

        if (! $fund->canManageTransactions($user)) {
            abort(403, 'You do not have permission to edit this transaction.');
        }

        $rules = [
            'sender_id' => 'required|exists:senders,id',
            'amount' => 'required|numeric|min:0.01|max:999999.99',
            'date' => 'required|date|before_or_equal:today',
            'notes' => 'nullable|string',
            'category' => 'nullable|string|max:255',
        ];

        if ($request->has('edit_sender') && $request->edit_sender !== null) {
            $rules['edit_sender'] = 'nullable|array';
            $rules['edit_sender.name'] = 'required_with:edit_sender|string|max:255';
            $rules['edit_sender.type'] = 'required_with:edit_sender|in:individual,group';
            $rules['edit_sender.member_names'] = 'required_if:edit_sender.type,group|array|min:1';
            $rules['edit_sender.member_names.*'] = 'required|string|max:255';
        }

        $validated = $request->validate($rules);

        // Only accept edit_sender when editing the same sender in place and user created the sender
        $sender = Sender::findOrFail($validated['sender_id']);
        if (isset($validated['edit_sender']) && $validated['edit_sender'] !== null) {
            if ((int) $validated['sender_id'] !== (int) $transaction->sender_id) {
                throw ValidationException::withMessages([
                    'edit_sender' => ['You can only edit the sender when keeping the same sender.'],
                ]);
            }
            if ($sender->created_by !== $user->id) {
                abort(403, 'You do not have permission to edit this sender.');
            }

            $editSender = $validated['edit_sender'];
            $sender->update([
                'name' => $editSender['name'],
                'type' => $editSender['type'],
            ]);

            if ($editSender['type'] === 'individual') {
                $placeholderUser = User::firstOrCreate(
                    ['name' => $editSender['name'], 'email' => null],
                    ['password' => null]
                );
                $sender->members()->sync([$placeholderUser->id]);
            } else {
                $memberUserIds = [];
                foreach ($editSender['member_names'] as $memberName) {
                    $memberUser = User::firstOrCreate(
                        ['name' => $memberName, 'email' => null],
                        ['password' => null]
                    );
                    $memberUserIds[] = $memberUser->id;
                }
                $sender->members()->sync($memberUserIds);
                foreach ($editSender['member_names'] as $memberName) {
                    SavedMemberName::firstOrCreate(
                        ['user_id' => $user->id, 'name' => trim($memberName)],
                        ['user_id' => $user->id, 'name' => trim($memberName)]
                    );
                }
            }
        }

        // Trap: duplicate transaction (same fund, sender, date, amount, excluding current)
        if (Transaction::where('fund_id', $fund->id)
            ->where('sender_id', $validated['sender_id'])
            ->whereDate('date', $validated['date'])
            ->where('amount', $validated['amount'])
            ->where('id', '!=', $transaction->id)
            ->exists()) {
            throw ValidationException::withMessages([
                'amount' => 'A transaction with this sender, date, and amount already exists in this fund.',
            ]);
        }

        $transaction->update([
            'sender_id' => $validated['sender_id'],
            'amount' => $validated['amount'],
            'date' => $validated['date'],
            'notes' => $validated['notes'] ?? null,
            'category' => $validated['category'] ?? null,
        ]);

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

        // Check if user can manage transactions (owner or member; viewer cannot)
        $fund = $transaction->fund;

        if (! $fund->canManageTransactions($user)) {
            abort(403, 'You do not have permission to delete this transaction.');
        }

        $fundId = $fund->id;
        $transaction->delete();

        return redirect()->route('funds.show', $fundId)
            ->with('success', 'Transaction deleted successfully.');
    }
}
