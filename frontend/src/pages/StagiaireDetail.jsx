import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import DataTable from '../components/DataTable';

function StagiaireDetail() {
  const { id } = useParams();

  const [stagiaire, setStagiaire] = useState(null);
  const [promo, setPromo] = useState(null);
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const stagiaireData = await apiClient.get(`/stagiaires/${id}`);
        setStagiaire(stagiaireData);

        const [promosData, evenementsData] = await Promise.all([
          apiClient.get('/promos'),
          apiClient.get(`/evenements?id_stagiaire=${id}`),
        ]);

        setPromo(promosData.find((p) => p.id_promo === stagiaireData.id_promo) || null);
        setEvenements(evenementsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return <p className="form-error">{error}</p>;
  }

  if (!stagiaire) {
    return <p>Stagiaire introuvable.</p>;
  }

  return (
    <section>
      <Link to="/stagiaires" className="back-link">
        ← Retour aux stagiaires
      </Link>

      <div className="page-header">
        <div>
          <p className="eyebrow">Stagiaire</p>
          <h1>{stagiaire.prenom} {stagiaire.nom}</h1>
        </div>
      </div>

      <div className="detail-card">
        <div>
          <span className="detail-label">Email</span>
          <span>{stagiaire.email}</span>
        </div>
        <div>
          <span className="detail-label">Promo</span>
          <span>{promo ? promo.lib_promo : '—'}</span>
        </div>
      </div>

      <h2 className="section-title">Historique des retards et absences</h2>

      <DataTable
        columns={[
          {
            key: 'nature',
            label: 'Type',
            render: (e) => (
              <span className={`badge badge-${e.nature}`}>
                {e.nature === 'retard' ? 'Retard' : 'Absence'}
              </span>
            ),
          },
          { key: 'lib_type', label: 'Sous-type' },
          { key: 'date_evenement', label: 'Date début' },
          {
            key: 'date_fin',
            label: 'Date fin',
            accessor: (e) => e.absence_date_fin || '',
            render: (e) => (e.nature === 'absence' ? e.absence_date_fin : '—'),
          },
        ]}
        data={evenements}
        rowKey={(e) => e.id_evenement}
        searchPlaceholder="Rechercher dans l'historique..."
        emptyMessage="Aucun retard ou absence enregistré pour ce stagiaire."
      />
    </section>
  );
}

export default StagiaireDetail;
