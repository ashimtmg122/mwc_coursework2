<?php

use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\RoleController as ApiRoleController;
use App\Http\Controllers\KnowledgeController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [UserController::class, 'login']); // token login

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [UserController::class, 'getUser']); // get current user
    Route::post('/logout', [UserController::class, 'logout']); // logout
});


/*
|--------------------------------------------------------------------------
| Public Routes (No Login Required)
|--------------------------------------------------------------------------
*/
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);

// --- ADMIN ROUTES (Users & Roles) ---
// We add 'role:Administrator' to ensure only Admins can touch these.
Route::middleware(['auth:sanctum', 'role:Administrator'])->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/roles', [UserController::class, 'roles']); // Must be before {id}
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::delete('/knowledge/{id}', [KnowledgeController::class, 'destroy']);
    Route::post('/system/health-check', [\App\Http\Controllers\Api\HealthController::class, 'check']);
    Route::get('/system/login-logs', [\App\Http\Controllers\Api\HealthController::class, 'loginLogs']);
    // View the logs (for Admin Dashboard)
    Route::get('/system/health-logs', [\App\Http\Controllers\Api\HealthController::class, 'index']);
    // If you implemented the Role Controller from the previous step:
    Route::apiResource('/roles', ApiRoleController::class);
});



Route::middleware('auth:sanctum')->get('/dashboard-stats', [\App\Http\Controllers\Api\DashboardController::class, 'stats']);
// --- GENERAL ROUTES (Knowledge Base) ---
// Accessible by any logged-in user (Employees, Managers, Admins)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/knowledge/{id}/status', [KnowledgeController::class, 'changeStatus']);
    Route::get('/knowledge', [KnowledgeController::class, 'index']);
    Route::post('/knowledge', [KnowledgeController::class, 'store']);
    Route::get('/knowledge/{id}', [KnowledgeController::class, 'show']);
    Route::put('/knowledge/{id}', [KnowledgeController::class, 'update']);

    Route::post('/knowledge/{id}/comments', [KnowledgeController::class, 'storeComment']);
    Route::post('/profile/info', [\App\Http\Controllers\Api\ProfileController::class, 'updateInfo']);
    Route::post('/profile/password', [\App\Http\Controllers\Api\ProfileController::class, 'updatePassword']);
});
Route::middleware('auth:sanctum')->group(function () {
    // ... other routes ...
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read', [NotificationController::class, 'markRead']);
    Route::delete('/notifications', [NotificationController::class, 'destroy']);
});
