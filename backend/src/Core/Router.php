<?php

declare(strict_types=1);

namespace App\Core;

class Router
{
    /** @var array<string, array<string, array{0: class-string, 1: string}>> */
    private array $routes = [];

    public function get(string $path, array $action): void
    {
        $this->addRoute('GET', $path, $action);
    }

    public function post(string $path, array $action): void
    {
        $this->addRoute('POST', $path, $action);
    }

    public function put(string $path, array $action): void
    {
        $this->addRoute('PUT', $path, $action);
    }

    public function delete(string $path, array $action): void
    {
        $this->addRoute('DELETE', $path, $action);
    }

    private function addRoute(string $method, string $path, array $action): void
    {
        $this->routes[$method][$path] = $action;
    }

    public function dispatch(string $method, string $uri): void
    {
        $routes = $this->routes[$method] ?? [];

        foreach ($routes as $path => $action) {
            // Transforme /api/promos/{id} en regex avec groupe nommé "id"
            $pattern = preg_replace('#\{(\w+)\}#', '(?P<$1>[^/]+)', $path);
            $pattern = '#^' . $pattern . '$#';

            if (preg_match($pattern, $uri, $matches)) {
                $params = array_filter(
                    $matches,
                    fn($key) => !is_int($key),
                    ARRAY_FILTER_USE_KEY
                );

                [$controllerClass, $methodName] = $action;
                $controller = new $controllerClass();

                $controller->$methodName(...array_values($params));
                return;
            }
        }

        Response::json(['error' => 'Route non trouvée'], 404);
    }
}
