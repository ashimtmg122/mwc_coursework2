<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Role;

class RoleController extends Controller
{
    // List all roles with the count of users 
    public function index()
    {
        return response()->json(Role::withCount('users')->get());
    }

    public function show($id)
    {
        return response()->json(Role::findOrFail($id));
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|unique:roles,name']);

        $role = Role::create(['name' => $request->name]);

        return response()->json(['message' => 'Role created', 'role' => $role], 201);
    }

    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $request->validate(['name' => 'required|string|unique:roles,name,' . $id]);

        $role->update(['name' => $request->name]);

        return response()->json(['message' => 'Role updated', 'role' => $role]);
    }

    public function destroy($id)
    {
        $role = Role::withCount('users')->findOrFail($id);

        
        if ($role->users_count > 0) {
            return response()->json([
                'message' => 'Cannot delete role because ' . $role->users_count . ' users are assigned to it.'
            ], 422);
        }

        $role->delete();
        return response()->json(['message' => 'Role deleted successfully.']);
    }
}
