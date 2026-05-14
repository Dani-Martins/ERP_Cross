import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, X, Globe } from 'lucide-react';
import { PaisService } from '../services/paisService';
import type { PaisView, PaisCreate } from '../types/entities';
import './PaisesPage.css';

const EMPTY_FORM: PaisCreate = { nomePais: '', sigla: '', ddi: '', ativo: true };

export default function PaisesPage() {
  const [paises, setPaises] = useState<PaisView[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ativos' | 'inativos' | 'todos'>('ativos');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<PaisCreate>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Confirmação de exclusão
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await PaisService.getAll();
      setPaises(res.data);
    } catch {
      setPaises([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = paises.filter((p) => {
    const matchSearch =
      p.nomePais.toLowerCase().includes(search.toLowerCase()) ||
      p.sigla.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'ativos' ? p.ativo : !p.ativo);
    return matchSearch && matchStatus;
  });

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(p: PaisView) {
    setEditId(p.id);
    setForm({ nomePais: p.nomePais, sigla: p.sigla, ddi: p.ddi, ativo: p.ativo });
    setFormError('');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError('');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nomePais.trim()) { setFormError('Nome do país é obrigatório.'); return; }
    if (!form.sigla.trim()) { setFormError('Sigla é obrigatória.'); return; }
    if (!form.ddi.trim()) { setFormError('DDI é obrigatório.'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (editId !== null) {
        await PaisService.update(editId, form);
      } else {
        await PaisService.create(form);
      }
      closeModal();
      load();
    } catch {
      setFormError('Erro ao salvar. Verifique os dados e tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await PaisService.remove(deleteId);
      setDeleteId(null);
      load();
    } catch {
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="page-container">
      {/* Cabeçalho da página */}
      <div className="page-header">
        <div className="page-title-area">
          <Globe size={24} className="page-title-icon" />
          <h1 className="page-title">Países</h1>
          <span className="page-badge">{filtered.length}</span>
        </div>
        <div className="page-actions">
          <div className="filter-select-group">
            <label htmlFor="statusFilter">Status</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ativos' | 'inativos' | 'todos')}
            >
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
              <option value="todos">Todos</option>
            </select>
          </div>
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nome ou sigla..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Novo País
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="table-card">
        {loading ? (
          <div className="table-loading">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="table-empty">
            {search ? 'Nenhum país encontrado para a busca.' : 'Nenhum país cadastrado.'}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>Sigla</th>
                <th>DDI</th>
                <th>Status</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="col-id">{p.id}</td>
                  <td className="col-name">{p.nomePais}</td>
                  <td><span className="tag">{p.sigla}</span></td>
                  <td>+{p.ddi}</td>
                  <td>
                    <span className={`status-badge ${p.ativo ? 'status-active' : 'status-inactive'}`}>
                      {p.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="col-actions">
                    <button className="btn-icon btn-edit" title="Editar" onClick={() => openEdit(p)}>
                      <Pencil size={15} />
                    </button>
                    <button className="btn-icon btn-delete" title="Excluir" onClick={() => setDeleteId(p.id)}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Criar / Editar */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId !== null ? 'Editar País' : 'Novo País'}</h2>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
                <label htmlFor="nomePais">Nome do País *</label>
                <input
                  id="nomePais"
                  type="text"
                  placeholder="Ex: Brasil"
                  value={form.nomePais}
                  onChange={(e) => setForm({ ...form, nomePais: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sigla">Sigla *</label>
                  <input
                    id="sigla"
                    type="text"
                    placeholder="Ex: BR"
                    maxLength={5}
                    value={form.sigla}
                    onChange={(e) => setForm({ ...form, sigla: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="ddi">DDI *</label>
                  <input
                    id="ddi"
                    type="text"
                    placeholder="Ex: 55"
                    maxLength={5}
                    value={form.ddi}
                    onChange={(e) => setForm({ ...form, ddi: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
              </div>
              <div className="form-group form-check">
                <label>
                  <input
                    type="checkbox"
                    checked={form.ativo}
                    onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                  />
                  Ativo
                </label>
              </div>

              {formError && <p className="form-error">{formError}</p>}

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {deleteId !== null && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar Exclusão</h2>
              <button className="modal-close" onClick={() => setDeleteId(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p>Tem certeza que deseja excluir este país? Esta ação não pode ser desfeita.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setDeleteId(null)}>Cancelar</button>
              <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
