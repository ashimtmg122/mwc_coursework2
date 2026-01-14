<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\KnowledgeItem;
use App\Models\Version;
use App\Models\MetadataTag;
use App\Models\Notification;
use App\Models\User;
use App\Notifications\NewKnowledgeAdded;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class KnowledgeController extends Controller
{
    public function store(Request $request)
    {
       
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'tags' => 'array', 
            'tags.*.label' => 'required_with:tags|string', 
            'tags.*.category' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

       
        try {
            DB::beginTransaction();

           
            $knowledgeItem = KnowledgeItem::create([
                'author_id' => $request->user()->id, 
                'title' => $request->title,
                'description' => $request->description,
                'status' => 0, 
            ]);

            
            Version::create([
                'knowledge_item_id' => $knowledgeItem->id,
                'version_number' => '0.1', // Start as Draft version
            ]);

           
            if ($request->has('tags')) {
                foreach ($request->tags as $tagData) {
                   
                    $label = is_array($tagData) ? $tagData['label'] : $tagData;
                    $category = is_array($tagData) ? ($tagData['category'] ?? 'General') : 'General';

                    MetadataTag::create([
                        'knowledge_item_id' => $knowledgeItem->id,
                        'label' => $label,
                        'category' => $category,
                    ]);
                }
            }

            DB::commit(); 

            
            return response()->json([
                'message' => 'Knowledge Item created successfully.',
                'data' => $knowledgeItem->load(['versions', 'tags', 'author'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack(); 
            return response()->json([
                'message' => 'Failed to create knowledge item.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function changeStatus(Request $request, $id)
    {
        
        $request->validate([
            'status' => 'required|integer|in:0,1,2' 
        ]);

        $item = KnowledgeItem::findOrFail($id);
        $user = $request->user();

     
        $isAdminOrManager = $user->role && in_array($user->role->name, ['Administrator', 'Manager']);


        if ($isAdminOrManager) {
        } else {
            if ($item->author_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized: You do not own this item.'], 403);
            }
            if ($request->status == 2) {
                return response()->json(['message' => 'Unauthorized: Only Admins can publish.'], 403);
            }

        }

        $item->update(['status' => $request->status]);

        $recipients = [];
        $message = "";

        if ($request->status == 1) {
            $recipients = User::where('id', '!=', $user->id) // Don't notify self
                ->whereHas('role', function ($q) {
                    $q->whereIn('name', ['Administrator', 'Manager']);
                })->pluck('id');

            $message = "Review Required: " . $user->name . " submitted \"" . $item->title . "\"";
        }

        elseif ($request->status == 2) {
            $recipients = User::where('id', '!=', $user->id)->pluck('id');
            $message = "New Article Published: " . $item->title;
        }

       
        elseif ($request->status == 0) {
           
            if ($item->author_id != $user->id) {
                $recipients = [$item->author_id];
                $message = "Your submission \"" . $item->title . "\" was returned to draft.";
            }
        }

        
        if (!empty($recipients)) {
            $now = now();
            $inserts = [];

            foreach ($recipients as $userId) {
                $inserts[] = [
                  
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

   
    public function index(Request $request)
    {
        $query = KnowledgeItem::with(['author', 'tags'])
            ->latest();

       
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

    
    public function show($id)
    {
        
        $knowledgeItem = KnowledgeItem::with([
            'author',
            'versions',    
            'tags',
            'comments.user', 
            'suggestions'
        ])->find($id);

        if (!$knowledgeItem) {
            return response()->json(['message' => 'Knowledge Item not found'], 404);
        }

        
        return response()->json($knowledgeItem);
    }

    
    public function update(Request $request, $id)
    {
        
        $knowledgeItem = KnowledgeItem::find($id);

        if (!$knowledgeItem) {
            return response()->json(['message' => 'Item not found'], 404);
        }

       
        if ($request->user()->id !== $knowledgeItem->author_id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

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

           
            $knowledgeItem->update([
                'title' => $request->title,
                'description' => $request->description,
               
            ]);

           
            $latestVersion = $knowledgeItem->versions()->latest()->first();
            $currentVer = $latestVersion ? (float)$latestVersion->version_number : 0.0;
            $newVer = number_format($currentVer + 0.1, 1); 

           
            Version::create([
                'knowledge_item_id' => $knowledgeItem->id,
                'version_number' => (string)$newVer,
            ]);

           
            if ($request->has('tags')) {
                $knowledgeItem->tags()->delete(); 

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

    public function exportPdf()
    {
       
        $items = KnowledgeItem::with('author')
            ->where('status', 2) 
            ->get();

        
        $pdf = Pdf::loadView('knowledge', ['items' => $items]);

        
        return $pdf->download('knowledge_report.pdf');
    }

   
    public function destroy($id)
    {
        $item = KnowledgeItem::findOrFail($id);
        $item->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    public function storeComment(Request $request, $id)
    {
        $request->validate(['text' => 'required|string']);

        $comment = \App\Models\Comment::create([
            'knowledge_item_id' => $id,
            'user_id' => $request->user()->id,
            'text' => $request->text
        ]);

        return response()->json($comment->load('user'), 201);
    }
}
