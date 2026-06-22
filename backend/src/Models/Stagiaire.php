<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Model;

class Stagiaire extends Model
{
    protected string $table = 'stagiaire';
    protected string $primaryKey = 'id_stagiaire';

    /** Forfait fixe utilisé pour convertir des jours d'absence en heures. */
    private const HEURES_PAR_JOUR = 7;

    public function findByPromo(int $idPromo): array
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE id_promo = :id_promo");
        $stmt->execute(['id_promo' => $idPromo]);

        return $stmt->fetchAll();
    }

    /**
     * Liste les stagiaires (filtrés par promo si fourni) avec :
     * - nb_retards / nb_absences : nombre d'événements de chaque nature
     * - nb_jours_absence : somme des jours d'absence (retards exclus, pas de date_fin)
     * - volume_horaire_absence : nb_jours_absence converti en heures (forfait fixe)
     * - pct_absence_formation : volume_horaire_absence rapporté à la durée totale de la promo
     */
    public function allWithAbsenceDays(?int $idPromo = null): array
    {
        $sql = "
            SELECT
                s.*,
                p.duree_formation_heure,
                p.pourcentage_max_absence,
                COALESCE(stats.nb_retards, 0) AS nb_retards,
                COALESCE(stats.nb_absences, 0) AS nb_absences,
                COALESCE(stats.nb_jours_absence, 0) AS nb_jours_absence
            FROM stagiaire s
            JOIN promo p ON p.id_promo = s.id_promo
            LEFT JOIN (
                SELECT
                    e.id_stagiaire,
                    COUNT(DISTINCT r.id_evenement) AS nb_retards,
                    COUNT(DISTINCT a.id_evenement) AS nb_absences,
                    SUM(DATEDIFF(a.date_fin, e.date_evenement) + 1) AS nb_jours_absence
                FROM evenements e
                LEFT JOIN retard r ON r.id_evenement = e.id_evenement
                LEFT JOIN absence a ON a.id_evenement = e.id_evenement
                GROUP BY e.id_stagiaire
            ) stats ON stats.id_stagiaire = s.id_stagiaire
        ";

        $params = [];
        if ($idPromo !== null) {
            $sql .= ' WHERE s.id_promo = :id_promo';
            $params['id_promo'] = $idPromo;
        }

        $sql .= ' ORDER BY s.id_stagiaire';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        foreach ($rows as &$row) {
            $nbJoursAbsence = (int) $row['nb_jours_absence'];
            $dureeFormation = (float) $row['duree_formation_heure'];

            $volumeHoraireAbsence = $nbJoursAbsence * self::HEURES_PAR_JOUR;

            $row['nb_retards'] = (int) $row['nb_retards'];
            $row['nb_absences'] = (int) $row['nb_absences'];
            $row['nb_jours_absence'] = $nbJoursAbsence;
            $row['volume_horaire_absence'] = $volumeHoraireAbsence;
            $row['pct_absence_formation'] = $dureeFormation > 0
                ? round(($volumeHoraireAbsence / $dureeFormation) * 100, 2)
                : 0.0;
        }
        unset($row);

        return $rows;
    }
}
