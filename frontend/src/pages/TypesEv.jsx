import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';

const emptyForm = { lib_type: '' };

function TypesEv() {
  const [types, setTypes] = useState([]);
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
      const data = await apiClient.get('/types-ev');
      setTypes(data);
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

  function openEdit(type) {
    setEditingId(type.id_type);
    setForm({ lib_type: type.lib_type });
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

    try {
      if (editingId) {
        await apiClient.put(`/types-ev/${editingId}`, form);
      } else {
        await apiClient.post('/types-ev', form);
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
    if (!window.confirm('Supprimer ce type ? Cette action est irréversible.')) {
      return;
    }
    try {
      await apiClient.delete(`/types-ev/${id}`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Référentiel</p>
          <h1>Types d'événements</h1>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Nouveau type
        </button>
      </div>

      <p className="page-intro">
        Sous-catégories utilisées lors de la déclaration d'un retard ou d'une absence
        (ex. « Retard transport », « Absence maladie »...).
      </p>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p>Chargement...</p>
      ) : types.length === 0 ? (
        <div className="empty-state">
          <p>Aucun type d'événement enregistré pour l'instant.</p>
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            Créer le premier type
          </button>
        </div>
      ) : (
        <DataTable
          columns={[
            { key: 'lib_type', label: 'Libellé' },
            {
              key: 'actions',
              label: '',
              sortable: false,
              searchable: false,
              render: (t) => (
                <div className="row-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => openEdit(t)}>
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-danger"
                    onClick={() => handleDelete(t.id_type)}
                  >
                    Supprimer
                  </button>
                </div>
              ),
            },
          ]}
          data={types}
          rowKey={(t) => t.id_type}
          searchPlaceholder="Rechercher un type..."
          emptyMessage="Aucun type ne correspond à ta recherche."
        />
      )}

      {modalOpen && (
        <Modal title={editingId ? 'Modifier le type' : 'Nouveau type'} onClose={closeModal}>
          <form onSubmit={handleSubmit}>
            {formError && <p className="form-error">{formError}</p>}

            <label className="field">
              <span>Libellé</span>
              <input
                type="text"
                value={form.lib_type}
                onChange={(e) => setForm({ ...form, lib_type: e.target.value })}
                placeholder="Ex : Absence maladie"
                required
                autoFocus
              />
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

export default TypesEv;
