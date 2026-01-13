<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoginLog extends Model
{
    use HasFactory;

    protected $table = 'login_logs'; // Match your table name
    public $timestamps = false;      // Your schema only has 'login_time', not created_at/updated_at

    protected $fillable = ['user_id', 'login_time'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
