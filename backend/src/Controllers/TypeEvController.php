<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Models\TypeEv;

class TypeEvController extends Controller
{
    public function index(): void
    {
        $this->requireAuth();

        $typeEv = new TypeEv();
        $this->json($typeEv->all());
    }

    public function store(): void
    {
        $this->requireAuth();

        $typeEv = new TypeEv();
        $id = $typeEv->create($this->input());
        $this->json(['id_type' => $id], 201);
    }

    public function update(string $id): void
    {
        $this->requireAuth();

        $typeEv = new TypeEv();
        $typeEv->update((int) $id, $this->input());
        $this->json(['message' => 'Type mis à jour']);
    }

    public function destroy(string $id): void
    {
        $this->requireAuth();

        $typeEv = new TypeEv();
        $typeEv->delete((int) $id);
        $this->json(['message' => 'Type supprimé']);
    }
}
