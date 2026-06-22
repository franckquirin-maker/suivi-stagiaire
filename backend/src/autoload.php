<?php

declare(strict_types=1);

/**
 * Autoload manuel très simple, sans dépendance externe.
 * Convention : App\Sous\Namespace\Classe  =>  src/Sous/Namespace/Classe.php
 */
spl_autoload_register(function (string $class): void {
    $prefix = 'App\\';
    $baseDir = __DIR__ . '/';

    if (strncmp($prefix, $class, strlen($prefix)) !== 0) {
        return;
    }

    $relativeClass = substr($class, strlen($prefix));
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});
