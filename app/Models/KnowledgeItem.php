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

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function versions()
    {
        return $this->hasMany(Version::class);
    }

    public function tags()
    {
        return $this->hasMany(MetadataTag::class);
    }


    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function suggestions()
    {
        return $this->hasMany(Suggestion::class);
    }
}
