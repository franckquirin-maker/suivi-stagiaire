<?php

declare(strict_types=1);

namespace App\Core;

class Request
{
    /**
     * Lit le corps JSON de la requête et le retourne sous forme de tableau.
     */
    public static function body(): array
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw ?: '', true);

        return is_array($data) ? $data : [];
    }

    public static function query(string $key, mixed $default = null): mixed
    {
        return $_GET[$key] ?? $default;
    }
}
