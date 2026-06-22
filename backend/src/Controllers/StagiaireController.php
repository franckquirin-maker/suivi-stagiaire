<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Stagiaire;

class StagiaireController extends Controller
{
    public function index(): void
    {
        $this->requireAuth();

        $stagiaire = new Stagiaire();

        $idPromo = $_GET['id_promo'] ?? null;
        $this->json($stagiaire->allWithAbsenceDays($idPromo !== null ? (int) $idPromo : null));
    }

    public function show(string $id): void
    {
        $this->requireAuth();

        $stagiaire = new Stagiaire();
        $result = $stagiaire->find((int) $id);

        if (!$result) {
            $this->json(['error' => 'Stagiaire introuvable'], 404);
            return;
        }

        $this->json($result);
    }

    public function store(): void
    {
        $this->requireAuth();

        $stagiaire = new Stagiaire();
        $id = $stagiaire->create($this->input());
        $this->json(['id_stagiaire' => $id], 201);
    }

    public function update(string $id): void
    {
        $this->requireAuth();

        $stagiaire = new Stagiaire();
        $stagiaire->update((int) $id, $this->input());
        $this->json(['message' => 'Stagiaire mis à jour']);
    }

    public function destroy(string $id): void
    {
        $this->requireAuth();

        $stagiaire = new Stagiaire();
        $stagiaire->delete((int) $id);
        $this->json(['message' => 'Stagiaire supprimé']);
    }
}
