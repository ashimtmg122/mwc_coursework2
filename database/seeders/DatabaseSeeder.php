<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Define the Roles your system needs
        $roles = [
            'Administrator' => 'admin@admin.com',
            'Manager' => 'manager@admin.com',
            'Knowledge Champion' => 'champion@admin.com',
            'Employee' => 'employee@admin.com',
        ];

        foreach ($roles as $roleName => $email) {
            // Create the Role if it doesn't exist
            $role = \App\Models\Role::firstOrCreate(['name' => $roleName]);

            // Create a User for this Role
            \App\Models\User::create([
                'role_id' => $role->id,
                'name' => $roleName . ' User',
                'email' => $email,
                'password' => bcrypt('password'), // Password is 'password' for everyone
            ]);
        }

        $this->call(KnowledgeSeeder::class);
    }
}
