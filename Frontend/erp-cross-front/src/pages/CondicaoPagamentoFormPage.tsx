import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';
import { CondicaoPagamentoService } from '../services/condicaoPagamentoService';
import type { CondicaoPagamentoCreate } from '../types/entities';
import type { AxiosError } from 'axios';
import './PaisesPage.css';

const EMPTY: CondicaoPagamentoCreate = {
  nomeCondicao: '', taxaJuros: 0, multa: 0, desconto: 0, ativo: true,
};

export default function CondicaoPagamentoFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<CondicaoPagamentoCreate>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      CondicaoPagamentoService.getById(Number(id))
        .then(res => {
          const c = res.data;
          setForm({ nomeCondicao: c.nomeCondicao, taxaJuros: c.taxaJuros, multa: c.multa, desconto: c.desconto, ativo: c.ativo });
        })
        .catch(() => navigate('/condicoes-pagamento'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, isEdit, navigate]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nomeCondicao.trim()) { setError('Nome é obrigatório.'); return; }

    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await CondicaoPagamentoService.update(Number(id), form);
      } else {
        await CondicaoPagamentoService.create(form);
      }
      navigate('/condicoes-pagamento');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      if (axiosErr.response?.status === 409) {
        setError(axiosErr.response.data?.message ?? 'Conflito nos dados informados.');
      } else {
        setError('Erro ao salvar. Verifique os dados e tente novamente.');
      }
      setSaving(false);
    }
  }

  if (loading) return <div className="page-container"><div className="table-loading">Carregando...</div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-area">
          <CalendarClock size={24} className="page-title-icon" />
          <h1 className="page-title">{isEdit ? 'Editar Condição de Pagamento' : 'Nova Condição de Pagamento'}</h1>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSave} className="form-page">
          <div className="form-section">
            <h2 className="form-section-title">Dados da Condição</h2>

            <div className="form-group">
              <label htmlFor="nomeCondicao">Nome *</label>
              <input
                id="nomeCondicao"
                type="text"
                placeholder="Ex: 30/60/90 DIAS"
                value={form.nomeCondicao}
                onChange={e => setForm({ ...form, nomeCondicao: e.target.value.toUpperCase() })}
                autoFocus
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="taxaJuros">Taxa de Juros (%)</label>
                <input
                  id="taxaJuros"
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0,00"
                  value={form.taxaJuros}
                  onChange={e => setForm({ ...form, taxaJuros: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="multa">Multa (%)</label>
                <input
                  id="multa"
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0,00"
                  value={form.multa}
                  onChange={e => setForm({ ...form, multa: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="desconto">Desconto (%)</label>
                <input
                  id="desconto"
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0,00"
                  value={form.desconto}
                  onChange={e => setForm({ ...form, desconto: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group form-check">
              <label>
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={e => setForm({ ...form, ativo: e.target.checked })}
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
            <button type="button" className="btn-secondary" onClick={() => navigate('/condicoes-pagamento')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
