<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\KnowledgeItem;
use App\Models\Version;
use App\Models\MetadataTag;
use App\Models\Notification;
use App\Models\User;
use App\Notifications\NewKnowledgeAdded;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class KnowledgeController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validate Input
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'tags' => 'array', // Expecting ["Frontend", "React"] or objects
            'tags.*.label' => 'required_with:tags|string', // If sending objects
            'tags.*.category' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 2. Start Transaction (Rollback if anything fails)
        try {
            DB::beginTransaction();

            // A. Create the Main Knowledge Item
            $knowledgeItem = KnowledgeItem::create([
                'author_id' => $request->user()->id, // Automatically link to logged-in user
                'title' => $request->title,
                'description' => $request->description,
                'status' => 0, // Default to 0 (Draft)
            ]);

            // B. Create the Initial Version (v0.1)
            Version::create([
                'knowledge_item_id' => $knowledgeItem->id,
                'version_number' => '0.1', // Start as Draft version
            ]);

            // C. Create Tags (if any provided)
            if ($request->has('tags')) {
                foreach ($request->tags as $tagData) {
                    // Handle if simple string or object was sent
                    $label = is_array($tagData) ? $tagData['label'] : $tagData;
                    $category = is_array($tagData) ? ($tagData['category'] ?? 'General') : 'General';

                    MetadataTag::create([
                        'knowledge_item_id' => $knowledgeItem->id,
                        'label' => $label,
                        'category' => $category,
                    ]);
                }
            }

            DB::commit(); // Save everything

            // 3. Return Response with Relationships loaded
            return response()->json([
                'message' => 'Knowledge Item created successfully.',
                'data' => $knowledgeItem->load(['versions', 'tags', 'author'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack(); // Undo everything if error occurs
            return response()->json([
                'message' => 'Failed to create knowledge item.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function changeStatus(Request $request, $id)
    {
        // Validate Input
        $request->validate([
            'status' => 'required|integer|in:0,1,2' // 0: Draft, 1: Pending, 2: Published
        ]);

        $item = KnowledgeItem::findOrFail($id);
        $user = $request->user();

        // helper to check if user is admin or manager
        $isAdminOrManager = $user->role && in_array($user->role->name, ['Administrator', 'Manager']);

        // --- AUTHORIZATION GATES ---

        if ($isAdminOrManager) {
            // ✅ ADMIN/MANAGER: Allowed to do everything. 
            // They can submit for review (1), publish (2), or draft (0) on ANY item.
        } else {
            // ❌ NORMAL USER (AUTHOR): specific restrictions apply.

            // 1. Ownership Check: You can't touch it if you didn't write it.
            if ($item->author_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized: You do not own this item.'], 403);
            }

            // 2. Publish Restriction: You cannot set status to 2 (Published).
            if ($request->status == 2) {
                return response()->json(['message' => 'Unauthorized: Only Admins can publish.'], 403);
            }

            // ✅ RESULT: If they passed the two checks above, they are the Author 
            // and they are trying to set Status 0 (Draft) or 1 (Review). ALLOWED.
        }

        // --- UPDATE STATUS ---
        $item->update(['status' => $request->status]);

        // --- NOTIFICATION LOGIC ---
        $recipients = [];
        $message = "";

        // 1. Notify Admins if Submitted for Review (Status 1)
        if ($request->status == 1) {
            $recipients = User::where('id', '!=', $user->id) // Don't notify self
                ->whereHas('role', function ($q) {
                    $q->whereIn('name', ['Administrator', 'Manager']);
                })->pluck('id');

            $message = "Review Required: " . $user->name . " submitted \"" . $item->title . "\"";
        }

        // 2. Notify Everyone if Published (Status 2)
        elseif ($request->status == 2) {
            $recipients = User::where('id', '!=', $user->id)->pluck('id');
            $message = "New Article Published: " . $item->title;
        }

        // 3. Notify Author if Rejected/Drafted (Status 0)
        elseif ($request->status == 0) {
            // Only notify if someone ELSE (like an Admin) moved it to draft
            if ($item->author_id != $user->id) {
                $recipients = [$item->author_id];
                $message = "Your submission \"" . $item->title . "\" was returned to draft.";
            }
        }

        // --- BULK INSERT NOTIFICATIONS ---
        if (!empty($recipients)) {
            $now = now();
            $inserts = [];

            foreach ($recipients as $userId) {
                $inserts[] = [
                    // 'id' => (string) \Illuminate\Support\Str::uuid(), // Uncomment if using UUID
                    'type' => 'ManualNotification',
                    'notifiable_type' => 'App\Models\User',
                    'notifiable_id' => $userId,
                    'data' => json_encode([
                        'message' => $message,
                        'link' => '/dashboard/knowledge/' . $item->id,
                        'document_id' => $item->id
                    ]),
                    'read_at' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            if (count($inserts) > 0) {
                DB::table('notifications')->insert($inserts);
            }
        }

        return response()->json([
            'message' => 'Status updated successfully.',
            'new_status' => $item->status
        ]);
    }

    /**
     * View All Items (With Search & Pagination)
     * effectively replaces the 'SearchEngine' class logic
     */
    public function index(Request $request)
    {
        $query = KnowledgeItem::with(['author', 'tags'])
            ->latest();

        // Add this block:
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('title', 'LIKE', "%{$search}%")
                ->orWhere('description', 'LIKE', "%{$search}%");
        }

        return response()->json($query->paginate(5));
    }

    /**
     * View Single Item (Detailed)
     */
    public function show($id)
    {
        // 1. Find item or fail
        // Load deep relationships: Comments include the User who wrote them
        $knowledgeItem = KnowledgeItem::with([
            'author',
            'versions',     // View history
            'tags',
            'comments.user', // See who commented
            'suggestions'
        ])->find($id);

        // 2. Handle 404 Not Found
        if (!$knowledgeItem) {
            return response()->json(['message' => 'Knowledge Item not found'], 404);
        }

        // 3. Return Data
        return response()->json($knowledgeItem);
    }

    /**
     * Update Knowledge Item (Creates a new Version automatically)
     */
    public function update(Request $request, $id)
    {
        // 1. Find the Item
        $knowledgeItem = KnowledgeItem::find($id);

        if (!$knowledgeItem) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        // 2. Authorization Check (Optional: Only Author or Admin can edit)
        if ($request->user()->id !== $knowledgeItem->author_id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // 3. Validate Input
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'tags' => 'array',
            'tags.*.label' => 'required|string',
            'tags.*.category' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            // A. Update Main Content
            $knowledgeItem->update([
                'title' => $request->title,
                'description' => $request->description,
                // Note: We do NOT update status here. Status changes require the "Validation Workflow".
            ]);

            // B. Generate New Version Number
            // Get the latest version number (e.g., "0.1")
            $latestVersion = $knowledgeItem->versions()->latest()->first();
            $currentVer = $latestVersion ? (float)$latestVersion->version_number : 0.0;
            $newVer = number_format($currentVer + 0.1, 1); // Increment by 0.1 (e.g., 0.1 -> 0.2)

            // C. Create the New Version Record
            Version::create([
                'knowledge_item_id' => $knowledgeItem->id,
                'version_number' => (string)$newVer,
            ]);

            // D. Sync Tags (Delete old, Insert new)
            // This is safer than trying to diff them manually
            if ($request->has('tags')) {
                $knowledgeItem->tags()->delete(); // Remove existing

                foreach ($request->tags as $tagData) {
                    MetadataTag::create([
                        'knowledge_item_id' => $knowledgeItem->id,
                        'label' => $tagData['label'],
                        'category' => $tagData['category'] ?? 'General',
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Knowledge updated successfully.',
                'new_version' => $newVer,
                'data' => $knowledgeItem->load('tags')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Update failed.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Add this method for Deleting
    public function destroy($id)
    {
        $item = KnowledgeItem::findOrFail($id);
        // Optional: Check if user is author
        $item->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    // Add this method for Comments
    public function storeComment(Request $request, $id)
    {
        $request->validate(['text' => 'required|string']);

        $comment = \App\Models\Comment::create([
            'knowledge_item_id' => $id,
            'user_id' => $request->user()->id,
            'text' => $request->text
        ]);

        // Return with user loaded for the UI
        return response()->json($comment->load('user'), 201);
    }
}
