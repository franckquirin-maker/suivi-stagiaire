<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Models\User;

class AuthController extends Controller
{
    public function login(): void
    {
        $data = $this->input();
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        $userModel = new User();
        $user = $userModel->findByEmail($email);

        if (!$user || !password_verify($password, $user['hashpassword'])) {
            $this->json(['error' => 'Identifiants invalides'], 401);
            return;
        }

        // Régénère l'identifiant de session pour éviter la fixation de session
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id_users'];

        unset($user['hashpassword']);
        $this->json(['user' => $user]);
    }

    public function logout(): void
    {
        $_SESSION = [];
        session_destroy();
        $this->json(['message' => 'Déconnecté']);
    }

    public function me(): void
    {
        if (!isset($_SESSION['user_id'])) {
            $this->json(['error' => 'Non authentifié'], 401);
            return;
        }

        $userModel = new User();
        $user = $userModel->find((int) $_SESSION['user_id']);

        if ($user) {
            unset($user['hashpassword']);
        }

        $this->json(['user' => $user]);
    }
}
