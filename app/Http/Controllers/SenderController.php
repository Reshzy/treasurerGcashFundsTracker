<?php

namespace App\Http\Controllers;

use App\Models\SavedMemberName;
use App\Models\Sender;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SenderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $senders = Sender::where('created_by', Auth::id())
            ->orWhereHas('members', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->with(['creator', 'members'])
            ->get()
            ->map(function ($sender) {
                return [
                    'id' => $sender->id,
                    'name' => $sender->name,
                    'type' => $sender->type,
                    'creator' => $sender->creator->name,
                    'members' => $sender->members->map(fn($member) => $member->name),
                    'created_at' => $sender->created_at->format('Y-m-d'),
                    'created_at_formatted' => $sender->created_at->format('M j, Y g:i A'),
                ];
            });

        return Inertia::render('Senders/Index', [
            'senders' => $senders,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $users = \App\Models\User::select('id', 'name')->get();
        return Inertia::render('Senders/Create', [
            'users' => $users,
        ]);
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
                    if (Sender::where('created_by', Auth::id())
                        ->whereRaw('LOWER(name) = ?', [strtolower(trim($value))])
                        ->exists()) {
                        $fail('You already have a sender with this name.');
                    }
                },
            ],
            'type' => 'required|in:individual,group',
            'member_ids' => 'required_if:type,group|array',
            'member_ids.*' => 'exists:users,id',
        ]);

        $sender = Sender::create([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'created_by' => Auth::id(),
        ]);

        // If it's a group, attach members and save member names for reuse
        if ($validated['type'] === 'group' && isset($validated['member_ids'])) {
            $sender->members()->attach($validated['member_ids']);
            $memberNames = User::whereIn('id', $validated['member_ids'])->pluck('name');
            foreach ($memberNames as $name) {
                SavedMemberName::firstOrCreate(
                    ['user_id' => Auth::id(), 'name' => $name],
                    ['user_id' => Auth::id(), 'name' => $name]
                );
            }
        }

        return redirect()->route('senders.index')
            ->with('success', 'Sender created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $sender = Sender::with(['creator', 'members', 'transactions.fund'])
            ->findOrFail($id);

        return Inertia::render('Senders/Show', [
            'sender' => $sender,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $sender = Sender::with('members')->findOrFail($id);
        
        if ($sender->created_by !== Auth::id()) {
            abort(403, 'You do not have permission to edit this sender.');
        }

        return Inertia::render('Senders/Edit', [
            'sender' => $sender,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $sender = Sender::findOrFail($id);
        
        if ($sender->created_by !== Auth::id()) {
            abort(403, 'You do not have permission to update this sender.');
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($sender) {
                    if (Sender::where('created_by', Auth::id())
                        ->where('id', '!=', $sender->id)
                        ->whereRaw('LOWER(name) = ?', [strtolower(trim($value))])
                        ->exists()) {
                        $fail('You already have a sender with this name.');
                    }
                },
            ],
            'type' => 'required|in:individual,group',
            'member_ids' => 'required_if:type,group|array',
            'member_ids.*' => 'exists:users,id',
        ]);

        $sender->update([
            'name' => $validated['name'],
            'type' => $validated['type'],
        ]);

        // Update members if it's a group and save member names for reuse
        if ($validated['type'] === 'group' && isset($validated['member_ids'])) {
            $sender->members()->sync($validated['member_ids']);
            $memberNames = User::whereIn('id', $validated['member_ids'])->pluck('name');
            foreach ($memberNames as $name) {
                SavedMemberName::firstOrCreate(
                    ['user_id' => Auth::id(), 'name' => $name],
                    ['user_id' => Auth::id(), 'name' => $name]
                );
            }
        } else {
            $sender->members()->detach();
        }

        return redirect()->route('senders.index')
            ->with('success', 'Sender updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $sender = Sender::findOrFail($id);
        
        if ($sender->created_by !== Auth::id()) {
            abort(403, 'You do not have permission to delete this sender.');
        }

        $sender->delete();

        return redirect()->route('senders.index')
            ->with('success', 'Sender deleted successfully.');
    }
}
