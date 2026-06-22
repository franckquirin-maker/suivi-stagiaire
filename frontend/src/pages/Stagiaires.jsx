import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';

const emptyForm = { nom: '', prenom: '', email: '', id_promo: '' };

function Stagiaires() {
  const navigate = useNavigate();
  const [stagiaires, setStagiaires] = useState([]);
  const [promos, setPromos] = useState([]);
  const [filterPromo, setFilterPromo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadPromos() {
    try {
      const data = await apiClient.get('/promos');
      setPromos(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadStagiaires(idPromo) {
    setLoading(true);
    setError(null);
    try {
      const path = idPromo ? `/stagiaires?id_promo=${idPromo}` : '/stagiaires';
      const data = await apiClient.get(path);
      setStagiaires(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPromos();
    loadStagiaires('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterChange(value) {
    setFilterPromo(value);
    loadStagiaires(value);
  }

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, id_promo: filterPromo || '' });
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(stagiaire) {
    setEditingId(stagiaire.id_stagiaire);
    setForm({
      nom: stagiaire.nom,
      prenom: stagiaire.prenom,
      email: stagiaire.email,
      id_promo: stagiaire.id_promo,
    });
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    const payload = { ...form, id_promo: Number(form.id_promo) };

    try {
      if (editingId) {
        await apiClient.put(`/stagiaires/${editingId}`, payload);
      } else {
        await apiClient.post('/stagiaires', payload);
      }
      closeModal();
      await loadStagiaires(filterPromo);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer ce stagiaire ? Cette action est irréversible.')) {
      return;
    }
    try {
      await apiClient.delete(`/stagiaires/${id}`);
      await loadStagiaires(filterPromo);
    } catch (err) {
      setError(err.message);
    }
  }

  function promoLabel(idPromo) {
    const promo = promos.find((p) => p.id_promo === idPromo);
    return promo ? promo.lib_promo : '—';
  }

  /**
   * Détermine la couleur d'alerte d'une ligne : on compare le % d'absence
   * du stagiaire au seuil max de sa promo (pourcentage_max_absence), pas à
   * une valeur fixe. Ex : seuil promo = 10%, stagiaire à 6% -> 60% du seuil -> jaune.
   */
  function alertRowClass(s) {
    const pct = Number(s.pct_absence_formation);
    const max = Number(s.pourcentage_max_absence);

    if (!max) return '';

    const ratio = (pct / max) * 100;

    if (ratio > 100) return 'row-alert-red';
    if (ratio >= 75) return 'row-alert-orange';
    if (ratio >= 50) return 'row-alert-yellow';
    return '';
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Formation</p>
          <h1>Stagiaires</h1>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Nouveau stagiaire
        </button>
      </div>

      <div className="toolbar">
        <label className="field field-inline">
          <span>Filtrer par promo</span>
          <select value={filterPromo} onChange={(e) => handleFilterChange(e.target.value)}>
            <option value="">Toutes les promos</option>
            {promos.map((p) => (
              <option key={p.id_promo} value={p.id_promo}>
                {p.lib_promo}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p>Chargement...</p>
      ) : stagiaires.length === 0 ? (
        <div className="empty-state">
          <p>Aucun stagiaire pour cette sélection.</p>
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            Ajouter un stagiaire
          </button>
        </div>
      ) : (
        <DataTable
          columns={[
            { key: 'nom', label: 'Nom' },
            { key: 'prenom', label: 'Prénom' },
            { key: 'email', label: 'Email' },
            {
              key: 'promo',
              label: 'Promo',
              accessor: (s) => promoLabel(s.id_promo),
              render: (s) => promoLabel(s.id_promo),
            },
            {
              key: 'nb_jours_absence',
              label: "Jours d'absence",
              accessor: (s) => Number(s.nb_jours_absence),
              render: (s) => s.nb_jours_absence,
            },
            {
              key: 'nb_retards',
              label: 'Retards',
              accessor: (s) => Number(s.nb_retards),
              render: (s) => s.nb_retards,
            },
            {
              key: 'nb_absences',
              label: 'Absences',
              accessor: (s) => Number(s.nb_absences),
              render: (s) => s.nb_absences,
            },
            {
              key: 'volume_horaire_absence',
              label: "Volume d'absence",
              accessor: (s) => Number(s.volume_horaire_absence),
              render: (s) => `${s.volume_horaire_absence} h`,
            },
            {
              key: 'pct_absence_formation',
              label: '% formation',
              accessor: (s) => Number(s.pct_absence_formation),
              render: (s) => `${s.pct_absence_formation} %`,
            },
            {
              key: 'actions',
              label: '',
              sortable: false,
              searchable: false,
              render: (s) => (
                <div className="row-actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(s);
                    }}
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(s.id_stagiaire);
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              ),
            },
          ]}
          data={stagiaires}
          rowKey={(s) => s.id_stagiaire}
          rowClassName={alertRowClass}
          onRowClick={(s) => navigate(`/stagiaires/${s.id_stagiaire}`)}
          searchPlaceholder="Rechercher un stagiaire..."
          emptyMessage="Aucun stagiaire ne correspond à ta recherche."
        />
      )}

      {modalOpen && (
        <Modal title={editingId ? 'Modifier le stagiaire' : 'Nouveau stagiaire'} onClose={closeModal}>
          <form onSubmit={handleSubmit}>
            {formError && <p className="form-error">{formError}</p>}

            <div className="field-row">
              <label className="field">
                <span>Nom</span>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  required
                />
              </label>

              <label className="field">
                <span>Prénom</span>
                <input
                  type="text"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  required
                />
              </label>
            </div>

            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>

            <label className="field">
              <span>Promo</span>
              <select
                value={form.id_promo}
                onChange={(e) => setForm({ ...form, id_promo: e.target.value })}
                required
              >
                <option value="" disabled>
                  Choisir...
                </option>
                {promos.map((p) => (
                  <option key={p.id_promo} value={p.id_promo}>
                    {p.lib_promo}
                  </option>
                ))}
              </select>
            </label>

            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={closeModal}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

export default Stagiaires;
