<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

   
    public function run(): void
    {
        
        $roles = [
            'Administrator' => 'admin@admin.com',
            'Manager' => 'manager@admin.com',
            'Knowledge Champion' => 'champion@admin.com',
            'Employee' => 'employee@admin.com',
        ];

        foreach ($roles as $roleName => $email) {
           
            $role = \App\Models\Role::firstOrCreate(['name' => $roleName]);

            \App\Models\User::create([
                'role_id' => $role->id,
                'name' => $roleName . ' User',
                'email' => $email,
                'password' => bcrypt('password'), 
            ]);
        }

        $this->call(KnowledgeSeeder::class);
    }
}
