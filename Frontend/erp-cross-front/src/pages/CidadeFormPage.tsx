import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Search } from 'lucide-react';
import type { AxiosError } from 'axios';
import { CidadeService } from '../services/cidadeService';
import type { CidadeCreate } from '../types/entities';
import EstadoLookupModal from '../components/EstadoLookupModal';
import './PaisesPage.css';

const EMPTY_FORM: CidadeCreate = { nomeCidade: '', ddd: '', idEstado: 0, ativo: true };

export default function CidadeFormPage({ cidadeId, onClose }: { cidadeId?: number; onClose?: () => void } = {}) {
  const routeParams = useParams<{ id: string }>();
  const id = cidadeId?.toString() ?? routeParams.id;
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<CidadeCreate>(EMPTY_FORM);
  const [nomeEstado, setNomeEstado] = useState('');
  const [nextId, setNextId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showEstadoModal, setShowEstadoModal] = useState(false);

  useEffect(() => {
    if (isEdit) {
      CidadeService.getById(Number(id))
        .then(res => {
          const c = res.data;
          setForm({ nomeCidade: c.nomeCidade, ddd: c.ddd, idEstado: c.idEstado, ativo: c.ativo });
          setNomeEstado(c.nomeEstado ?? '');
          setNextId(String(c.id));
        })
        .catch(() => onClose ? onClose() : navigate('/cidades'))
        .finally(() => setLoading(false));
    } else {
      CidadeService.getAll()
        .then(res => {
          const maxId = res.data.length > 0 ? Math.max(...res.data.map(c => c.id)) : 0;
          setNextId(String(maxId + 1));
        })
        .catch(() => setNextId(''))
        .finally(() => setLoading(false));
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
      if (onClose) onClose();
      else navigate('/cidades');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      if (axiosErr.response?.status === 409) {
        setError(axiosErr.response.data?.message ?? 'Já existe uma cidade com este nome para o estado.');
      } else {
        setError('Erro ao salvar. Verifique os dados e tente novamente.');
      }
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
    <>
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

            <div className="form-group id-field">
              <label htmlFor="id">Código</label>
              <input id="id" type="text" readOnly value={nextId} />
            </div>

            <div className="form-group city-field">
              <label htmlFor="nomeCidade">Cidade *</label>
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
              <div className="form-group cidade-ddd-field">
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
              <div className="form-group lookup-code-group">
                <label>Cód.</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input
                    type="text"
                    value={form.idEstado > 0 ? form.idEstado : ''}
                    placeholder="ID"
                    readOnly
                    className="lookup-input"
                    style={{ width: '100%', textAlign: 'center' }}
                  />
                  <button
                    type="button"
                    className="btn-lookup"
                    onClick={() => setShowEstadoModal(true)}
                    title="Pesquisar estado"
                    style={{ padding: '4px 8px' }}
                  >
                    <Search size={16} />
                  </button>
                </div>
              </div>
              <div className="form-group cidade-estado-field" style={{ flex: 1 }}>
                <label htmlFor="idEstado">Estado *</label>
                <input
                  id="idEstado"
                  type="text"
                  readOnly
                  placeholder="Selecione um estado..."
                  value={nomeEstado}
                  className="lookup-input"
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
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-page-footer">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => onClose ? onClose() : navigate('/cidades')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
    {showEstadoModal && (
      <EstadoLookupModal
        zBase={1001}
        onSelect={(estadoId, estadoNome) => {
          setForm(prev => ({ ...prev, idEstado: estadoId }));
          setNomeEstado(estadoNome);
          setShowEstadoModal(false);
        }}
        onClose={() => setShowEstadoModal(false)}
      />
    )}
    </>
  );
}
