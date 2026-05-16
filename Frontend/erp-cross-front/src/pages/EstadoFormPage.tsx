import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Map } from 'lucide-react';
import { EstadoService } from '../services/estadoService';
import { PaisService } from '../services/paisService';
import type { EstadoCreate, PaisView } from '../types/entities';
import './PaisesPage.css';

const EMPTY_FORM: EstadoCreate = { nomeEstado: '', uf: '', idPais: 0, ativo: true };

export default function EstadoFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<EstadoCreate>(EMPTY_FORM);
  const [paises, setPaises] = useState<PaisView[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPaises = PaisService.getAll().then((res) =>
      setPaises(res.data.filter((p) => p.ativo))
    );
    if (isEdit) {
      Promise.all([
        loadPaises,
        EstadoService.getById(Number(id)).then((res) => {
          const e = res.data;
          setForm({ nomeEstado: e.nomeEstado, uf: e.uf, idPais: e.idPais, ativo: e.ativo });
        }).catch(() => navigate('/estados')),
      ]).finally(() => setLoading(false));
    } else {
      loadPaises.finally(() => setLoading(false));
    }
  }, [id, isEdit, navigate]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nomeEstado.trim()) { setError('Nome do estado é obrigatório.'); return; }
    if (!form.uf.trim()) { setError('UF é obrigatória.'); return; }
    if (!form.idPais) { setError('País é obrigatório.'); return; }

    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await EstadoService.update(Number(id), form);
      } else {
        await EstadoService.create(form);
      }
      navigate('/estados');
    } catch {
      setError('Erro ao salvar. Verifique os dados e tente novamente.');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="table-loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-area">
          <Map size={24} className="page-title-icon" />
          <h1 className="page-title">{isEdit ? 'Editar Estado' : 'Novo Estado'}</h1>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSave} className="form-page">
          <div className="form-section">
            <h2 className="form-section-title">Dados do Estado</h2>

            <div className="form-group">
              <label htmlFor="nomeEstado">Nome do Estado *</label>
              <input
                id="nomeEstado"
                type="text"
                placeholder="Ex: SÃO PAULO"
                value={form.nomeEstado}
                onChange={(e) => setForm({ ...form, nomeEstado: e.target.value.toUpperCase() })}
                autoFocus
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="uf">UF *</label>
                <input
                  id="uf"
                  type="text"
                  placeholder="Ex: SP"
                  maxLength={2}
                  value={form.uf}
                  onChange={(e) => setForm({ ...form, uf: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="idPais">País *</label>
                <select
                  id="idPais"
                  value={form.idPais}
                  onChange={(e) => setForm({ ...form, idPais: Number(e.target.value) })}
                >
                  <option value={0}>Selecione um país...</option>
                  {paises.map((p) => (
                    <option key={p.id} value={p.id}>{p.nomePais}</option>
                  ))}
                </select>
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
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-page-footer">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/estados')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
