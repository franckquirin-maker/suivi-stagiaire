<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Absence;
use App\Models\Evenement;
use App\Models\Retard;

class EvenementController extends Controller
{
    public function index(): void
    {
        $this->requireAuth();

        $evenement = new Evenement();
        $idStagiaire = $_GET['id_stagiaire'] ?? null;
        $this->json($evenement->allWithDetails($idStagiaire !== null ? (int) $idStagiaire : null));
    }

    public function show(string $id): void
    {
        $this->requireAuth();

        $evenement = new Evenement();
        $result = $evenement->findWithDetails((int) $id);

        if (!$result) {
            $this->json(['error' => 'Événement introuvable'], 404);
            return;
        }

        $this->json($result);
    }

    /**
     * Crée un événement (table mère) puis sa spécialisation (retard ou absence)
     * dans une transaction, pour garantir la cohérence des deux écritures.
     *
     * Corps attendu :
     * {
     *   "date_evenement": "2026-06-20",
     *   "id_stagiaire": 3,
     *   "id_type": 2,
     *   "nature": "retard" | "absence",
     *   "duree": 15           // si nature = retard (en minutes)
     *   "date_fin": "2026-06-21"  // si nature = absence
     * }
     */
    public function store(): void
    {
        $userId = $this->requireAuth();
        $data = $this->input();

        $nature = $data['nature'] ?? null;

        if (!in_array($nature, ['retard', 'absence'], true)) {
            $this->json(['error' => "Le champ 'nature' doit être 'retard' ou 'absence'"], 422);
            return;
        }

        $evenement = new Evenement();
        $db = $evenement->getPdo();

        $db->beginTransaction();

        try {
            $idEvenement = $evenement->create([
                'date_evenement' => $data['date_evenement'],
                'id_users' => $userId,
                'id_stagiaire' => $data['id_stagiaire'],
                'id_type' => $data['id_type'],
            ]);

            if ($nature === 'retard') {
                (new Retard())->create([
                    'id_evenement' => $idEvenement,
                    'duree' => $data['duree'],
                ]);
            } else {
                (new Absence())->create([
                    'id_evenement' => $idEvenement,
                    'date_fin' => $data['date_fin'],
                ]);
            }

            $db->commit();
        } catch (\Throwable $e) {
            $db->rollBack();
            $this->json(['error' => 'Échec de la création de l\'événement : ' . $e->getMessage()], 500);
            return;
        }

        $this->json(['id_evenement' => $idEvenement], 201);
    }

    public function update(string $id): void
    {
        $this->requireAuth();

        $data = $this->input();
        $idEvenement = (int) $id;

        $evenement = new Evenement();
        $evenement->update($idEvenement, array_filter([
            'date_evenement' => $data['date_evenement'] ?? null,
            'id_type' => $data['id_type'] ?? null,
        ], fn($value) => $value !== null));

        if (isset($data['duree'])) {
            (new Retard())->update($idEvenement, ['duree' => $data['duree']]);
        }

        if (isset($data['date_fin'])) {
            (new Absence())->update($idEvenement, ['date_fin' => $data['date_fin']]);
        }

        $this->json(['message' => 'Événement mis à jour']);
    }

    public function destroy(string $id): void
    {
        $this->requireAuth();

        // La suppression de l'événement entraîne celle de sa spécialisation
        // (retard/absence) grâce au ON DELETE CASCADE défini en base.
        $evenement = new Evenement();
        $evenement->delete((int) $id);

        $this->json(['message' => 'Événement supprimé']);
    }
}
