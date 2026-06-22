<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Model;

class Evenement extends Model
{
    protected string $table = 'evenements';
    protected string $primaryKey = 'id_evenement';

    /**
     * Récupère les événements avec le détail de leur spécialisation
     * (retard.duree ou absence.date_fin) et le libellé du stagiaire/type.
     * Filtrable par stagiaire pour la page de détail.
     */
    public function allWithDetails(?int $idStagiaire = null): array
    {
        $sql = "
            SELECT
                e.id_evenement,
                e.date_declaration,
                e.date_evenement,
                e.id_stagiaire,
                s.nom AS stagiaire_nom,
                s.prenom AS stagiaire_prenom,
                e.id_type,
                t.lib_type,
                e.id_users,
                r.duree AS retard_duree,
                a.date_fin AS absence_date_fin,
                CASE WHEN r.id_evenement IS NOT NULL THEN 'retard' ELSE 'absence' END AS nature
            FROM evenements e
            JOIN stagiaire s ON s.id_stagiaire = e.id_stagiaire
            JOIN type_ev t ON t.id_type = e.id_type
            LEFT JOIN retard r ON r.id_evenement = e.id_evenement
            LEFT JOIN absence a ON a.id_evenement = e.id_evenement
        ";

        $params = [];
        if ($idStagiaire !== null) {
            $sql .= ' WHERE e.id_stagiaire = :id_stagiaire';
            $params['id_stagiaire'] = $idStagiaire;
        }

        $sql .= ' ORDER BY e.date_evenement DESC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    public function findWithDetails(int $id): ?array
    {
        $sql = "
            SELECT
                e.id_evenement,
                e.date_declaration,
                e.date_evenement,
                e.id_stagiaire,
                s.nom AS stagiaire_nom,
                s.prenom AS stagiaire_prenom,
                e.id_type,
                t.lib_type,
                e.id_users,
                r.duree AS retard_duree,
                a.date_fin AS absence_date_fin,
                CASE WHEN r.id_evenement IS NOT NULL THEN 'retard' ELSE 'absence' END AS nature
            FROM evenements e
            JOIN stagiaire s ON s.id_stagiaire = e.id_stagiaire
            JOIN type_ev t ON t.id_type = e.id_type
            LEFT JOIN retard r ON r.id_evenement = e.id_evenement
            LEFT JOIN absence a ON a.id_evenement = e.id_evenement
            WHERE e.id_evenement = :id
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();

        return $result ?: null;
    }
}
