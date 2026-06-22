import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';

const emptyForm = {
  lib_promo: '',
  annee: new Date().getFullYear(),
  duree_formation_heure: '',
  pourcentage_max_absence: '',
  id_users: '',
};

function Promos() {
  const [promos, setPromos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [promosData, usersData] = await Promise.all([
        apiClient.get('/promos'),
        apiClient.get('/users'),
      ]);
      setPromos(promosData);
      setUsers(usersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(promo) {
    setEditingId(promo.id_promo);
    setForm({
      lib_promo: promo.lib_promo,
      annee: promo.annee,
      duree_formation_heure: promo.duree_formation_heure,
      pourcentage_max_absence: promo.pourcentage_max_absence,
      id_users: promo.id_users,
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

    const payload = {
      ...form,
      annee: Number(form.annee),
      duree_formation_heure: Number(form.duree_formation_heure),
      pourcentage_max_absence: Number(form.pourcentage_max_absence),
      id_users: Number(form.id_users),
    };

    try {
      if (editingId) {
        await apiClient.put(`/promos/${editingId}`, payload);
      } else {
        await apiClient.post('/promos', payload);
      }
      closeModal();
      await loadData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer cette promo ? Cette action est irréversible.')) {
      return;
    }
    try {
      await apiClient.delete(`/promos/${id}`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  function responsableName(idUsers) {
    const user = users.find((u) => u.id_users === idUsers);
    return user ? `${user.prenom} ${user.nom}` : '—';
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Formation</p>
          <h1>Promotions</h1>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Nouvelle promo
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p>Chargement...</p>
      ) : promos.length === 0 ? (
        <div className="empty-state">
          <p>Aucune promo enregistrée pour l'instant.</p>
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            Créer la première promo
          </button>
        </div>
      ) : (
        <DataTable
          columns={[
            { key: 'lib_promo', label: 'Libellé' },
            { key: 'annee', label: 'Année' },
            {
              key: 'duree_formation_heure',
              label: 'Durée',
              render: (p) => `${p.duree_formation_heure} h`,
            },
            {
              key: 'pourcentage_max_absence',
              label: "Seuil d'absence max.",
              render: (p) => `${p.pourcentage_max_absence} %`,
            },
            {
              key: 'nb_stagiaires',
              label: 'Stagiaires',
              accessor: (p) => Number(p.nb_stagiaires),
              render: (p) => p.nb_stagiaires,
            },
            {
              key: 'responsable',
              label: 'Responsable',
              accessor: (p) => responsableName(p.id_users),
              render: (p) => responsableName(p.id_users),
            },
            {
              key: 'actions',
              label: '',
              sortable: false,
              searchable: false,
              render: (p) => (
                <div className="row-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => openEdit(p)}>
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-danger"
                    onClick={() => handleDelete(p.id_promo)}
                  >
                    Supprimer
                  </button>
                </div>
              ),
            },
          ]}
          data={promos}
          rowKey={(p) => p.id_promo}
          searchPlaceholder="Rechercher une promo..."
          emptyMessage="Aucune promo ne correspond à ta recherche."
        />
      )}

      {modalOpen && (
        <Modal title={editingId ? 'Modifier la promo' : 'Nouvelle promo'} onClose={closeModal}>
          <form onSubmit={handleSubmit}>
            {formError && <p className="form-error">{formError}</p>}

            <label className="field">
              <span>Libellé</span>
              <input
                type="text"
                value={form.lib_promo}
                onChange={(e) => setForm({ ...form, lib_promo: e.target.value })}
                required
              />
            </label>

            <div className="field-row">
              <label className="field">
                <span>Année</span>
                <input
                  type="number"
                  value={form.annee}
                  onChange={(e) => setForm({ ...form, annee: e.target.value })}
                  required
                />
              </label>

              <label className="field">
                <span>Durée formation (heures)</span>
                <input
                  type="number"
                  value={form.duree_formation_heure}
                  onChange={(e) => setForm({ ...form, duree_formation_heure: e.target.value })}
                  required
                />
              </label>
            </div>

            <div className="field-row">
              <label className="field">
                <span>Seuil d'absence max. (%)</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.pourcentage_max_absence}
                  onChange={(e) => setForm({ ...form, pourcentage_max_absence: e.target.value })}
                  required
                />
              </label>

              <label className="field">
                <span>Responsable</span>
                <select
                  value={form.id_users}
                  onChange={(e) => setForm({ ...form, id_users: e.target.value })}
                  required
                >
                  <option value="" disabled>
                    Choisir...
                  </option>
                  {users.map((u) => (
                    <option key={u.id_users} value={u.id_users}>
                      {u.prenom} {u.nom}
                    </option>
                  ))}
                </select>
              </label>
            </div>

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

export default Promos;
