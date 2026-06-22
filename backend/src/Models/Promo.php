<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Model;

class Promo extends Model
{
    protected string $table = 'promo';
    protected string $primaryKey = 'id_promo';

    /**
     * Récupère toutes les promos avec le nombre de stagiaires associés.
     * LEFT JOIN pour conserver les promos sans aucun stagiaire (count = 0).
     */
    public function allWithStagiaireCount(): array
    {
        $sql = "
            SELECT
                p.*,
                COALESCE(stats.nb_stagiaires, 0) AS nb_stagiaires
            FROM promo p
            LEFT JOIN (
                SELECT id_promo, COUNT(*) AS nb_stagiaires
                FROM stagiaire
                GROUP BY id_promo
            ) stats ON stats.id_promo = p.id_promo
            ORDER BY p.id_promo
        ";

        return $this->db->query($sql)->fetchAll();
    }
}
