import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { CidadeService } from '../services/cidadeService';
import { EstadoService } from '../services/estadoService';
import type { CidadeCreate, EstadoView } from '../types/entities';
import './PaisesPage.css';

const EMPTY_FORM: CidadeCreate = { nomeCidade: '', ddd: '', idEstado: 0, ativo: true };

export default function CidadeFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<CidadeCreate>(EMPTY_FORM);
  const [estados, setEstados] = useState<EstadoView[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEstados = EstadoService.getAll().then((res) =>
      setEstados(res.data.filter((e) => e.ativo))
    );
    if (isEdit) {
      Promise.all([
        loadEstados,
        CidadeService.getById(Number(id)).then((res) => {
          const c = res.data;
          setForm({ nomeCidade: c.nomeCidade, ddd: c.ddd, idEstado: c.idEstado, ativo: c.ativo });
        }).catch(() => navigate('/cidades')),
      ]).finally(() => setLoading(false));
    } else {
      loadEstados.finally(() => setLoading(false));
    }
  }, [id, isEdit, navigate]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nomeCidade.trim()) { setError('Nome da cidade é obrigatório.'); return; }
    if (!form.ddd.trim()) { setError('DDD é obrigatório.'); return; }
    if (!form.idEstado) { setError('Estado é obrigatório.'); return; }

    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await CidadeService.update(Number(id), form);
      } else {
        await CidadeService.create(form);
      }
      navigate('/cidades');
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
          <MapPin size={24} className="page-title-icon" />
          <h1 className="page-title">{isEdit ? 'Editar Cidade' : 'Nova Cidade'}</h1>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSave} className="form-page">
          <div className="form-section">
            <h2 className="form-section-title">Dados da Cidade</h2>

            <div className="form-group">
              <label htmlFor="nomeCidade">Nome da Cidade *</label>
              <input
                id="nomeCidade"
                type="text"
                placeholder="Ex: SÃO PAULO"
                value={form.nomeCidade}
                onChange={(e) => setForm({ ...form, nomeCidade: e.target.value.toUpperCase() })}
                autoFocus
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ddd">DDD *</label>
                <input
                  id="ddd"
                  type="text"
                  placeholder="Ex: 11"
                  maxLength={3}
                  value={form.ddd}
                  onChange={(e) => setForm({ ...form, ddd: e.target.value.replace(/\D/g, '') })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="idEstado">Estado *</label>
                <select
                  id="idEstado"
                  value={form.idEstado}
                  onChange={(e) => setForm({ ...form, idEstado: Number(e.target.value) })}
                >
                  <option value={0}>Selecione um estado...</option>
                  {estados.map((e) => (
                    <option key={e.id} value={e.id}>{e.nomeEstado} ({e.uf})</option>
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
            <button type="button" className="btn-secondary" onClick={() => navigate('/cidades')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
