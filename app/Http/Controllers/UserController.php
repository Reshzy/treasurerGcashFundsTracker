<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $name = $request->input('name');
        $email = $request->input('email');
        $role = $request->input('role');
        $createdFrom = $request->input('created_from');
        $createdTo = $request->input('created_to');
        $sort = $request->input('sort', 'name');
        $dir = $request->input('dir', 'asc');

        $sortColumn = in_array($sort, ['name', 'email', 'created_at']) ? $sort : 'name';
        $sortDir = $dir === 'desc' ? 'desc' : 'asc';
        if ($sort === 'role') {
            $sortColumn = 'is_admin';
            $sortDir = $dir === 'desc' ? 'desc' : 'asc';
        }

        $users = User::query()
            ->when($name, fn ($q) => $q->where('name', 'like', '%'.trim($name).'%'))
            ->when($email, fn ($q) => $q->where('email', 'like', '%'.trim($email).'%'))
            ->when($role === 'admin', fn ($q) => $q->where('is_admin', true))
            ->when($role === 'user', fn ($q) => $q->where('is_admin', false))
            ->when($createdFrom, fn ($q) => $q->whereDate('created_at', '>=', $createdFrom))
            ->when($createdTo, fn ($q) => $q->whereDate('created_at', '<=', $createdTo))
            ->orderBy($sortColumn, $sortDir)
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => $user->is_admin,
                'created_at' => $user->created_at->format('Y-m-d'),
                'created_at_formatted' => $user->created_at->format('M j, Y g:i A'),
            ]);

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['name', 'email', 'role', 'created_from', 'created_to', 'sort', 'dir']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Users/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('users', 'email')->whereNotNull('email')],
            'password' => 'nullable|string|min:8|confirmed',
            'is_admin' => 'boolean',
        ]);

        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'is_admin' => $validated['is_admin'] ?? false,
        ];

        if (! empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        User::create($data);

        return redirect()->route('users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $user = User::findOrFail($id);

        return Inertia::render('Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => $user->is_admin,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'nullable',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id)->whereNotNull('email'),
            ],
            'password' => 'nullable|string|min:8|confirmed',
            'is_admin' => 'boolean',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'] ?? null;
        $user->is_admin = $validated['is_admin'] ?? false;

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);

        if ((int) $id === Auth::id()) {
            return redirect()->route('users.index')
                ->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully.');
    }
}
