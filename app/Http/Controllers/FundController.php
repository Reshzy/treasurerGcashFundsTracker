<?php

namespace App\Http\Controllers;

use App\Models\Fund;
use App\Models\Sender;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FundController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
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
                    'creator' => $fund->creator->name,
                    'role' => $fund->pivot->role ?? 'owner',
                    'created_at' => $fund->created_at->format('Y-m-d'),
                    'created_at_formatted' => $fund->created_at->format('M j, Y g:i A'),
                ];
            });

        return Inertia::render('Funds/Index', [
            'funds' => $funds,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Funds/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) {
                    if (Fund::where('created_by', Auth::id())
                        ->whereRaw('LOWER(name) = ?', [strtolower(trim($value))])
                        ->exists()) {
                        $fail('You already have a fund with this name.');
                    }
                },
            ],
            'description' => 'nullable|string',
        ]);

        $fund = Fund::create([
            ...$validated,
            'created_by' => Auth::id(),
        ]);

        // Add creator as owner
        $fund->members()->attach(Auth::id(), ['role' => 'owner']);

        return redirect()->route('funds.show', $fund->id)
            ->with('success', 'Fund created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $fund = Fund::with(['creator', 'members', 'transactions.sender.members', 'transactions.creator'])
            ->findOrFail($id);

        // Check if user has access
        $user = Auth::user();
        $hasAccess = $fund->members()->where('user_id', $user->id)->exists() 
            || $fund->created_by === $user->id;

        if (!$hasAccess) {
            abort(403, 'You do not have access to this fund.');
        }

        $transactions = $fund->transactions()
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'amount' => $transaction->amount,
                    'date' => $transaction->date->format('Y-m-d'),
                    'notes' => $transaction->notes,
                    'category' => $transaction->category,
                    'sender' => [
                        'id' => $transaction->sender->id,
                        'name' => $transaction->sender->name,
                        'type' => $transaction->sender->type,
                        'members' => $transaction->sender->type === 'group'
                            ? $transaction->sender->members->pluck('name')->values()->all()
                            : [],
                    ],
                    'created_by' => $transaction->creator->name,
                    'created_at' => $transaction->created_at->format('Y-m-d H:i'),
                    'created_at_formatted' => $transaction->created_at->format('M j, Y g:i A'),
                ];
            });

        // Get senders for the transaction form (with members for group display)
        $senders = Sender::where('created_by', $user->id)
            ->orWhereHas('members', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with('members')
            ->get()
            ->map(fn($sender) => [
                'id' => $sender->id,
                'name' => $sender->name,
                'type' => $sender->type,
                'members' => $sender->type === 'group'
                    ? $sender->members->pluck('name')->values()->all()
                    : [],
            ]);

        $savedMemberNames = $user->savedMemberNames()->pluck('name')->values()->all();

        return Inertia::render('Funds/Show', [
            'fund' => [
                'id' => $fund->id,
                'name' => $fund->name,
                'description' => $fund->description,
                'total' => $fund->total,
                'creator' => $fund->creator->name,
                'members' => $fund->members->map(fn($member) => [
                    'id' => $member->id,
                    'name' => $member->name,
                    'role' => $member->pivot->role,
                ]),
                'user_role' => $fund->members()->where('user_id', $user->id)->first()?->pivot->role 
                    ?? ($fund->created_by === $user->id ? 'owner' : null),
            ],
            'transactions' => $transactions,
            'senders' => $senders,
            'savedMemberNames' => $savedMemberNames,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $fund = Fund::with('members')->findOrFail($id);
        $user = Auth::user();
        
        $hasAccess = $fund->members()->where('user_id', $user->id)->where('role', 'owner')->exists()
            || $fund->created_by === $user->id;

        if (!$hasAccess) {
            abort(403, 'You do not have permission to edit this fund.');
        }

        return Inertia::render('Funds/Edit', [
            'fund' => [
                'id' => $fund->id,
                'name' => $fund->name,
                'description' => $fund->description,
                'members' => $fund->members->map(fn($member) => [
                    'id' => $member->id,
                    'name' => $member->name,
                    'role' => $member->pivot->role,
                ]),
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $fund = Fund::findOrFail($id);
        $user = Auth::user();
        
        $hasAccess = $fund->members()->where('user_id', $user->id)->where('role', 'owner')->exists()
            || $fund->created_by === $user->id;

        if (!$hasAccess) {
            abort(403, 'You do not have permission to update this fund.');
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($fund) {
                    if (Fund::where('created_by', Auth::id())
                        ->where('id', '!=', $fund->id)
                        ->whereRaw('LOWER(name) = ?', [strtolower(trim($value))])
                        ->exists()) {
                        $fail('You already have a fund with this name.');
                    }
                },
            ],
            'description' => 'nullable|string',
        ]);

        $fund->update($validated);

        return redirect()->route('funds.show', $fund->id)
            ->with('success', 'Fund updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $fund = Fund::findOrFail($id);
        $user = Auth::user();
        
        $hasAccess = $fund->members()->where('user_id', $user->id)->where('role', 'owner')->exists()
            || $fund->created_by === $user->id;

        if (!$hasAccess) {
            abort(403, 'You do not have permission to delete this fund.');
        }

        $fund->delete();

        return redirect()->route('funds.index')
            ->with('success', 'Fund deleted successfully.');
    }

    /**
     * Add a member to the fund.
     */
    public function addMember(Request $request, string $id)
    {
        $fund = Fund::findOrFail($id);
        $user = Auth::user();
        
        $hasAccess = $fund->members()->where('user_id', $user->id)->where('role', 'owner')->exists()
            || $fund->created_by === $user->id;

        if (!$hasAccess) {
            abort(403, 'You do not have permission to add members to this fund.');
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:owner,member',
        ]);

        $fund->members()->syncWithoutDetaching([
            $validated['user_id'] => ['role' => $validated['role']],
        ]);

        return redirect()->back()->with('success', 'Member added successfully.');
    }
}
