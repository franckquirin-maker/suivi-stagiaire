<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Models\User;

class UserController extends Controller
{
    public function index(): void
    {
        $this->requireAuth();

        $user = new User();
        $users = $user->all();

        // On ne renvoie jamais le hash du mot de passe au front
        $users = array_map(function (array $u) {
            unset($u['hashpassword']);
            return $u;
        }, $users);

        $this->json($users);
    }

    public function show(string $id): void
    {
        $this->requireAuth();

        $user = new User();
        $result = $user->find((int) $id);

        if (!$result) {
            $this->json(['error' => 'Utilisateur introuvable'], 404);
            return;
        }

        unset($result['hashpassword']);
        $this->json($result);
    }

    public function store(): void
    {
        $this->requireAuth();

        $data = $this->input();

        if (!empty($data['password'])) {
            $data['hashpassword'] = password_hash($data['password'], PASSWORD_DEFAULT);
            unset($data['password']);
        }

        $user = new User();
        $id = $user->create($data);
        $this->json(['id_users' => $id], 201);
    }

    public function update(string $id): void
    {
        $this->requireAuth();

        $data = $this->input();

        if (!empty($data['password'])) {
            $data['hashpassword'] = password_hash($data['password'], PASSWORD_DEFAULT);
            unset($data['password']);
        }

        $user = new User();
        $user->update((int) $id, $data);
        $this->json(['message' => 'Utilisateur mis à jour']);
    }

    public function destroy(string $id): void
    {
        $this->requireAuth();

        $user = new User();
        $user->delete((int) $id);
        $this->json(['message' => 'Utilisateur supprimé']);
    }
}
