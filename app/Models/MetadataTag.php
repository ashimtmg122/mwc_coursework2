<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MetadataTag extends Model
{
    use HasFactory;

    protected $fillable = ['knowledge_item_id', 'label', 'category'];

    public function knowledgeItem()
    {
        return $this->belongsTo(KnowledgeItem::class);
    }
}
