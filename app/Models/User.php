<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'role_id',
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // --- RELATIONSHIPS ---

    /**
     * A User belongs to one Role (Employee, Manager, etc.)
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * A User creates many Knowledge Items (The "Author")
     */
    public function knowledgeItems()
    {
        return $this->hasMany(KnowledgeItem::class, 'author_id');
    }

    /**
     * A User owns Workspaces
     */
    public function workspaces()
    {
        return $this->hasMany(Workspace::class, 'owner_id');
    }

    /**
     * A User can make many Validation Requests
     */
    public function validationRequests()
    {
        return $this->hasMany(ValidationRequest::class, 'requester_id');
    }

    // --- HELPER FUNCTIONS ---

    /**
     * Check if user is a Knowledge Champion
     */
    public function isChampion()
    {
        // Assuming you handle roles by name in the relationship
        return $this->role->name === 'Knowledge Champion';
    }

    /**
     * Check if user is Admin
     */
    public function isAdmin()
    {
        return $this->role->name === 'Administrator';
    }
}
