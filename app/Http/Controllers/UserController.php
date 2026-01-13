<?php

namespace App\Http\Controllers;

use App\Models\LoginLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{


    public function login(Request $request)
    {
        // 1️⃣ Validate
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        // 2️⃣ Attempt login
        if (! Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid email or password'
            ], 401);
        }

        // 3️⃣ Get authenticated user
        $user = Auth::user();

        // 4️⃣ Generate token
        $token = $user->createToken('auth_token')->plainTextToken;

        // 5️⃣ Log the login (directly in controller)
        LoginLog::create([
            'user_id' => $user->id,
            'login_time' => now(), // Captures exact time
        ]);

        // 6️⃣ Return response
        return response()->json([
            'token' => $token,
            'user'  => $user,
        ]);
    }


    public function getUser(Request $request)
    {
        // We MUST use load('role') to attach the role data to the JSON response
        return response()->json($request->user()->load('role'));
    }

    public function logout(Request $request)
    {
        // Revoke the current token
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    // app/Http/Controllers/Api/UserController.php

    public function index(Request $request)
    {
        $query = \App\Models\User::with('role'); // Load Role relationship

        // Search Logic
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'LIKE', "%{$search}%")
                ->orWhere('email', 'LIKE', "%{$search}%");
        }

        // Return paginated 10 users per page
        return response()->json($query->paginate(10));
    }

    // Add Delete method (optional but useful)
    public function destroy($id)
    {
        $user = \App\Models\User::find($id);
        if ($user) {
            $user->delete();
            return response()->json(['message' => 'User deleted']);
        }
        return response()->json(['message' => 'User not found'], 404);
    }

    // Get Single User (for editing)
    public function show($id)
    {
        return response()->json(\App\Models\User::findOrFail($id));
    }

    // Update User
    public function update(Request $request, $id)
    {
        $user = \App\Models\User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id, // Ignore current user's email
            'role_id' => 'required|exists:roles,id',
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'role_id' => $request->role_id,
        ]);

        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }

    // Get All Roles (for the dropdown)
    public function roles()
    {
        return response()->json(\App\Models\Role::all());
    }
    // Create New User
    public function store(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8', // Password is required for creation
            'role_id' => 'required|exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = \App\Models\User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => \Illuminate\Support\Facades\Hash::make($request->password),
            'role_id' => $request->role_id,
        ]);

        return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
    }
}
