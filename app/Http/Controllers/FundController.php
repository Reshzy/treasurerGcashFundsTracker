<?php

namespace App\Http\Controllers;

use App\Models\Fund;
use App\Models\Sender;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FundController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $name = $request->input('name');
        $description = $request->input('description');
        $totalMin = $request->input('total_min');
        $totalMax = $request->input('total_max');
        $transactionsMin = $request->input('transactions_min');
        $transactionsMax = $request->input('transactions_max');
        $createdFrom = $request->input('created_from');
        $createdTo = $request->input('created_to');

        $funds = $user->funds()
            ->with(['creator', 'transactions'])
            ->withCount('transactions')
            ->when($name, fn ($q) => $q->where('funds.name', 'like', '%'.trim($name).'%'))
            ->when($description, fn ($q) => $q->where('funds.description', 'like', '%'.trim($description).'%'))
            ->when($totalMin !== null && $totalMin !== '', fn ($q) => $q->whereRaw('(SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE transactions.fund_id = funds.id) >= ?', [(float) $totalMin]))
            ->when($totalMax !== null && $totalMax !== '', fn ($q) => $q->whereRaw('(SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE transactions.fund_id = funds.id) <= ?', [(float) $totalMax]))
            ->when($transactionsMin !== null && $transactionsMin !== '', fn ($q) => $q->having('transactions_count', '>=', (int) $transactionsMin))
            ->when($transactionsMax !== null && $transactionsMax !== '', fn ($q) => $q->having('transactions_count', '<=', (int) $transactionsMax))
            ->when($createdFrom, fn ($q) => $q->whereDate('funds.created_at', '>=', $createdFrom))
            ->when($createdTo, fn ($q) => $q->whereDate('funds.created_at', '<=', $createdTo))
            ->orderBy('funds.name')
            ->paginate(15)
            ->withQueryString()
            ->through(function ($fund) {
                return [
                    'id' => $fund->id,
                    'name' => $fund->name,
                    'description' => $fund->description,
                    'total' => $fund->transactions->sum('amount'),
                    'transaction_count' => $fund->transactions_count,
                    'creator' => $fund->creator->name,
                    'role' => $fund->pivot->role ?? 'owner',
                    'created_at' => $fund->created_at->format('Y-m-d'),
                    'created_at_formatted' => $fund->created_at->format('M j, Y g:i A'),
                ];
            });

        return Inertia::render('Funds/Index', [
            'funds' => $funds,
            'filters' => $request->only(['name', 'description', 'total_min', 'total_max', 'transactions_min', 'transactions_max', 'created_from', 'created_to']),
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
    public function show(Request $request, string $fund)
    {
        $fund = Fund::with(['creator', 'members'])
            ->findOrFail($fund);

        // Check if user has access
        $user = Auth::user();
        $hasAccess = $fund->members()->where('user_id', $user->id)->exists()
            || $fund->created_by === $user->id;

        if (! $hasAccess) {
            abort(403, 'You do not have access to this fund.');
        }

        $senderSearch = $request->input('sender_search');
        $notes = $request->input('notes');
        $category = $request->input('category');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $createdFrom = $request->input('created_from');
        $createdTo = $request->input('created_to');
        $amountMin = $request->input('amount_min');
        $amountMax = $request->input('amount_max');

        $searchTerm = $senderSearch ? '%'.trim($senderSearch).'%' : null;

        $transactions = $fund->transactions()
            ->with(['sender.members', 'creator'])
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->when($searchTerm, fn ($q) => $q->whereHas('sender', function ($s) use ($searchTerm) {
                $s->where('name', 'like', $searchTerm)
                    ->orWhereHas('members', fn ($m) => $m->where('name', 'like', $searchTerm));
            }))
            ->when($notes, fn ($q) => $q->where('notes', 'like', '%'.trim($notes).'%'))
            ->when($category, fn ($q) => $q->where('category', 'like', '%'.trim($category).'%'))
            ->when($dateFrom, fn ($q) => $q->whereDate('date', '>=', $dateFrom))
            ->when($dateTo, fn ($q) => $q->whereDate('date', '<=', $dateTo))
            ->when($createdFrom, fn ($q) => $q->whereDate('created_at', '>=', $createdFrom))
            ->when($createdTo, fn ($q) => $q->whereDate('created_at', '<=', $createdTo))
            ->when($amountMin !== null && $amountMin !== '', fn ($q) => $q->where('amount', '>=', (float) $amountMin))
            ->when($amountMax !== null && $amountMax !== '', fn ($q) => $q->where('amount', '<=', (float) $amountMax))
            ->paginate(15)
            ->withQueryString()
            ->through(function ($transaction) use ($user) {
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
                        'can_edit' => $transaction->sender->created_by === $user->id,
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
            ->map(fn ($sender) => [
                'id' => $sender->id,
                'name' => $sender->name,
                'type' => $sender->type,
                'members' => $sender->type === 'group'
                    ? $sender->members->pluck('name')->values()->all()
                    : [],
            ]);

        $savedMemberNames = $user->savedMemberNames()->pluck('name')->values()->all();

        $canManageMembers = $fund->isOwner($user);
        $memberIds = $fund->members->pluck('id');
        $users = $canManageMembers
            ? User::where('is_admin', true)
                ->whereNotIn('id', $memberIds)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn ($u) => ['id' => $u->id, 'name' => $u->name])
            : [];

        return Inertia::render('Funds/Show', [
            'fund' => [
                'id' => $fund->id,
                'name' => $fund->name,
                'description' => $fund->description,
                'total' => $fund->total,
                'creator' => $fund->creator->name,
                'members' => $fund->members->map(fn ($member) => [
                    'id' => $member->id,
                    'name' => $member->name,
                    'role' => $member->pivot->role,
                ]),
                'user_role' => $fund->members()->where('user_id', $user->id)->first()?->pivot->role
                    ?? ($fund->created_by === $user->id ? 'owner' : null),
                'can_manage_members' => $canManageMembers,
            ],
            'users' => $users,
            'transactions' => $transactions,
            'senders' => $senders,
            'savedMemberNames' => $savedMemberNames,
            'filters' => $request->only([
                'sender_search', 'notes', 'category',
                'date_from', 'date_to', 'created_from', 'created_to',
                'amount_min', 'amount_max',
            ]),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $fund = Fund::with('members')->findOrFail($id);
        $user = Auth::user();

        if (! $fund->canEdit($user)) {
            abort(403, 'You do not have permission to edit this fund.');
        }

        $memberIds = $fund->members->pluck('id');
        $users = User::where('is_admin', true)
            ->whereNotIn('id', $memberIds)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn ($u) => ['id' => $u->id, 'name' => $u->name]);

        return Inertia::render('Funds/Edit', [
            'fund' => [
                'id' => $fund->id,
                'name' => $fund->name,
                'description' => $fund->description,
                'members' => $fund->members->map(fn ($member) => [
                    'id' => $member->id,
                    'name' => $member->name,
                    'role' => $member->pivot->role,
                ]),
            ],
            'users' => $users,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $fund = Fund::findOrFail($id);
        $user = Auth::user();

        if (! $fund->canEdit($user)) {
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

        if (! $fund->isOwner($user)) {
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

        if (! $fund->isOwner($user)) {
            abort(403, 'You do not have permission to add members to this fund.');
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:viewer,member',
        ]);

        $fund->members()->syncWithoutDetaching([
            $validated['user_id'] => ['role' => $validated['role']],
        ]);

        return redirect()->back()->with('success', 'Member added successfully.');
    }

    /**
     * Remove a member from the fund.
     */
    public function removeMember(Request $request, string $id, string $userId)
    {
        $fund = Fund::findOrFail($id);
        $user = Auth::user();

        if (! $fund->isOwner($user)) {
            abort(403, 'You do not have permission to remove members from this fund.');
        }

        $memberToRemove = $fund->members()->where('user_id', $userId)->first();

        if (! $memberToRemove) {
            return redirect()->back()->with('error', 'Member not found in this fund.');
        }

        if ($memberToRemove->pivot->role === 'owner') {
            return redirect()->back()->with('error', 'You cannot remove an owner from the fund.');
        }

        $fund->members()->detach($userId);

        return redirect()->back()->with('success', 'Member removed successfully.');
    }
}
