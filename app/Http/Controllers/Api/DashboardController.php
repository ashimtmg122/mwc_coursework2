<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\KnowledgeItem;
use App\Models\MetadataTag;
use App\Models\User;
use App\Models\Tag;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();

        
        $stats = [
            'total_docs' => KnowledgeItem::count(),
            'my_drafts' => KnowledgeItem::where('author_id', $user->id)->where('status', 0)->count(),
            'pending_reviews' => KnowledgeItem::where('status', 1)->count(),
            'total_users' => User::count(),
        ];

    
        $lineData = KnowledgeItem::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $pieData = KnowledgeItem::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        // BAR CHART DATA (Documents per Category/Tag)
        
        $barData = MetadataTag::select('category as label', DB::raw('count(*) as knowledge_items_count'))
            ->whereNotNull('category') // Filter out empty categories
            ->groupBy('category')
            ->orderByDesc('knowledge_items_count')
            ->limit(5)
            ->get();

        return response()->json([
            'stats' => $stats,
            'charts' => [
                'line' => $lineData,
                'bar' => $barData,
                'pie' => $pieData
            ]
        ]);
    }
}
