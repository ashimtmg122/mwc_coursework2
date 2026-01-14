<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemHealthLog extends Model
{
    use HasFactory;

    protected $table = 'system_health_logs'; 

    protected $fillable = ['monitored_by_id', 'status'];

    public function monitor()
    {
        return $this->belongsTo(User::class, 'monitored_by_id');
    }
}
