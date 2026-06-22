<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Promo;

class PromoController extends Controller
{
    public function index(): void
    {
        $this->requireAuth();

        $promo = new Promo();
        $this->json($promo->allWithStagiaireCount());
    }

    public function show(string $id): void
    {
        $this->requireAuth();

        $promo = new Promo();
        $result = $promo->find((int) $id);

        if (!$result) {
            $this->json(['error' => 'Promo introuvable'], 404);
            return;
        }

        $this->json($result);
    }

    public function store(): void
    {
        $this->requireAuth();

        $promo = new Promo();
        $id = $promo->create($this->input());
        $this->json(['id_promo' => $id], 201);
    }

    public function update(string $id): void
    {
        $this->requireAuth();

        $promo = new Promo();
        $promo->update((int) $id, $this->input());
        $this->json(['message' => 'Promo mise à jour']);
    }

    public function destroy(string $id): void
    {
        $this->requireAuth();

        $promo = new Promo();
        $promo->delete((int) $id);
        $this->json(['message' => 'Promo supprimée']);
    }
}
