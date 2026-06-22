<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/autoload.php';
require_once __DIR__ . '/../config/config.php';

use App\Core\Response;
use App\Core\Router;

// --- CORS : nécessaire car React (port 5173) et l'API (port 8080)
//     sont sur des origines différentes, avec des sessions PHP ---
$allowedOrigin = getenv('FRONTEND_URL') ?: 'http://localhost:5173';
header("Access-Control-Allow-Origin: {$allowedOrigin}");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Réponse immédiate aux requêtes "preflight" envoyées par le navigateur
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Cookie de session : SameSite=Lax fonctionne ici car front et back
// partagent le même "site" (localhost), même si le port diffère.
// ⚠️ En production sur des domaines réellement différents, prévoir
// SameSite=None + Secure (donc HTTPS obligatoire).
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'samesite' => 'Lax',
    'secure' => false,
    'httponly' => true,
]);
session_start();

$router = new Router();
require __DIR__ . '/../src/Routes/api.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';

try {
    $router->dispatch($method, $uri);
} catch (\Throwable $e) {
    Response::json(['error' => $e->getMessage()], 500);
}
