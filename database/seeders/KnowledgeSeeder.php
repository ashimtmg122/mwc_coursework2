<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\KnowledgeItem;
use App\Models\Version;
use App\Models\MetadataTag;
use App\Models\Workspace;
use App\Models\Comment;
use App\Models\Suggestion;
use App\Models\ValidationRequest;
use App\Models\SystemHealthLog;
use App\Models\Notification;
use App\Notifications\NewKnowledgeAdded;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Pest\Support\Str;

class KnowledgeSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Fetch our Actors (created in the previous User seeder)
        $admin = User::where('email', 'admin@admin.com')->first();
        $manager = User::where('email', 'manager@admin.com')->first();
        $champion = User::where('email', 'champion@admin.com')->first();
        $employee = User::where('email', 'employee@admin.com')->first();

        // Safety check
        if (!$employee) {
            $this->command->info("Please run the UserSeeder first!");
            return;
        }

        // ==========================================
        // 2. CREATE WORKSPACES (Collaboration)
        // ==========================================
        $workspace = Workspace::create([
            'owner_id' => $manager->id,
            'name' => 'Q1 Digital Transformation',
        ]);
        $this->command->info('Workspace created.');

        // ==========================================
        // 3. CREATE KNOWLEDGE ITEMS & ASSOCIATIONS
        // ==========================================

        // Item 1: A Draft by Employee
        $draft = KnowledgeItem::create([
            'author_id' => $employee->id,
            'title' => 'React Component Standards 2025',
            'description' => 'Guidelines for using Hooks and Context API.',
            'status' => 0, // Draft
        ]);

        // Add Version
        Version::create([
            'knowledge_item_id' => $draft->id,
            'version_number' => '0.1',
        ]);

        // Add Tag
        MetadataTag::create([
            'knowledge_item_id' => $draft->id,
            'label' => 'Frontend',
            'category' => 'Engineering',
        ]);

        // Item 2: Pending Review (Submitted by Employee)
        $pending = KnowledgeItem::create([
            'author_id' => $employee->id,
            'title' => 'Laravel API Security Best Practices',
            'description' => 'How to use Sanctum and Policies correctly.',
            'status' => 1, // Pending
        ]);

        Version::create([
            'knowledge_item_id' => $pending->id,
            'version_number' => '1.0',
        ]);

        MetadataTag::create([
            'knowledge_item_id' => $pending->id,
            'label' => 'Security',
            'category' => 'Backend',
        ]);

        // Item 3: Published & Approved (By Champion)
        $published = KnowledgeItem::create([
            'author_id' => $champion->id,
            'title' => 'Onboarding Documentation v2',
            'description' => 'The official guide for new hires.',
            'status' => 2, // Published
        ]);

        // ==========================================
        // 4. CREATE WORKFLOWS (Validation & Feedback)
        // ==========================================

        // Validation Request for the Pending Item
        ValidationRequest::create([
            'requester_id' => $employee->id,
            'knowledge_item_id' => $pending->id,
            'status' => 0, // Pending
            'request_on' => Carbon::now(),
        ]);

        // Suggestion on the Draft
        Suggestion::create([
            'knowledge_item_id' => $draft->id,
            'message' => 'Please add a section on Custom Hooks.',
        ]);

        // Comment on the Published Item
        Comment::create([
            'knowledge_item_id' => $published->id,
            'user_id' => $manager->id,
            'text' => 'Great work, this is much clearer than the old wiki.',
        ]);

        $this->command->info('Knowledge Items & Workflow seeded.');

        // ==========================================
        // 5. SYSTEM ADMIN LOGS
        // ==========================================

        // System Health Log
        SystemHealthLog::create([
            'monitored_by_id' => $admin->id,
            'status' => 1, // Healthy
        ]);

        DB::table('notifications')->insert([
            [
                'type' => 'SystemAlert',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => 1, // User ID
                'data' => json_encode([
                    'message' => 'Welcome to the new Knowledge System!',
                    'link' => '/dashboard',
                    'document_id' => null
                ]),
                'read_at' => null, // Unread
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'DocumentUpdate',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => 1,
                'data' => json_encode([
                    'message' => 'Admin published: "Q1 Financial Report"',
                    'link' => '/dashboard/knowledge/1',
                    'document_id' => 1
                ]),
                'read_at' => null,
                'created_at' => now()->subMinutes(5),
                'updated_at' => now(),
            ]
        ]);

        // Login Log
        \App\Models\LoginLog::create([
            'user_id' => $employee->id,
            'login_time' => Carbon::now()->subMinutes(15),
        ]);

        $this->command->info('System Logs & Notifications seeded.');
    }
}
