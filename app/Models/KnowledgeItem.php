<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KnowledgeItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'author_id',
        'title',
        'description',
        'status',
    ];

    // --- RELATIONSHIPS ---

    // 1. The Author
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    // 2. History
    public function versions()
    {
        return $this->hasMany(Version::class);
    }

    // 3. Metadata
    public function tags()
    {
        return $this->hasMany(MetadataTag::class);
    }

    // 4. MISSING RELATIONSHIPS ADDED HERE:

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function suggestions()
    {
        return $this->hasMany(Suggestion::class);
    }
}
