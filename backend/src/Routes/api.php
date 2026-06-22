<?php

declare(strict_types=1);

use App\Controllers\AuthController;
use App\Controllers\EvenementController;
use App\Controllers\PromoController;
use App\Controllers\StagiaireController;
use App\Controllers\TypeEvController;
use App\Controllers\UserController;

/** @var \App\Core\Router $router */

// --- Authentification ---
$router->post('/api/auth/login', [AuthController::class, 'login']);
$router->post('/api/auth/logout', [AuthController::class, 'logout']);
$router->get('/api/auth/me', [AuthController::class, 'me']);

// --- Utilisateurs (personnel) ---
$router->get('/api/users', [UserController::class, 'index']);
$router->get('/api/users/{id}', [UserController::class, 'show']);
$router->post('/api/users', [UserController::class, 'store']);
$router->put('/api/users/{id}', [UserController::class, 'update']);
$router->delete('/api/users/{id}', [UserController::class, 'destroy']);

// --- Promotions ---
$router->get('/api/promos', [PromoController::class, 'index']);
$router->get('/api/promos/{id}', [PromoController::class, 'show']);
$router->post('/api/promos', [PromoController::class, 'store']);
$router->put('/api/promos/{id}', [PromoController::class, 'update']);
$router->delete('/api/promos/{id}', [PromoController::class, 'destroy']);

// --- Stagiaires ---
$router->get('/api/stagiaires', [StagiaireController::class, 'index']);
$router->get('/api/stagiaires/{id}', [StagiaireController::class, 'show']);
$router->post('/api/stagiaires', [StagiaireController::class, 'store']);
$router->put('/api/stagiaires/{id}', [StagiaireController::class, 'update']);
$router->delete('/api/stagiaires/{id}', [StagiaireController::class, 'destroy']);

// --- Types d'événements ---
$router->get('/api/types-ev', [TypeEvController::class, 'index']);
$router->post('/api/types-ev', [TypeEvController::class, 'store']);
$router->put('/api/types-ev/{id}', [TypeEvController::class, 'update']);
$router->delete('/api/types-ev/{id}', [TypeEvController::class, 'destroy']);

// --- Événements (retards / absences) ---
$router->get('/api/evenements', [EvenementController::class, 'index']);
$router->get('/api/evenements/{id}', [EvenementController::class, 'show']);
$router->post('/api/evenements', [EvenementController::class, 'store']);
$router->put('/api/evenements/{id}', [EvenementController::class, 'update']);
$router->delete('/api/evenements/{id}', [EvenementController::class, 'destroy']);
