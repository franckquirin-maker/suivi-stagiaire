<?php

declare(strict_types=1);

namespace App\Core;

abstract class Controller
{
    protected function json(mixed $data, int $statusCode = 200): void
    {
        Response::json($data, $statusCode);
    }

    protected function input(): array
    {
        return Request::body();
    }

    /**
     * Vérifie que l'utilisateur est connecté (session active).
     * Coupe la requête avec un 401 sinon. À appeler en première ligne
     * des actions qui doivent être protégées.
     */
    protected function requireAuth(): int
    {
        if (!isset($_SESSION['user_id'])) {
            $this->json(['error' => 'Non authentifié'], 401);
        }

        return (int) $_SESSION['user_id'];
    }
}
