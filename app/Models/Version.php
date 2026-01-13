<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Version extends Model
{
    use HasFactory;

    protected $fillable = ['knowledge_item_id', 'version_number'];

    public function knowledgeItem()
    {
        return $this->belongsTo(KnowledgeItem::class);
    }
}
