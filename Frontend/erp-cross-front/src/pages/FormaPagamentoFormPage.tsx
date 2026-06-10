import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { FormaPagamentoService } from '../services/formaPagamentoService';
import type { FormaPagamentoCreate } from '../types/entities';
import type { AxiosError } from 'axios';
import './PaisesPage.css';

const EMPTY: FormaPagamentoCreate = { nomeFormaPagamento: '', aceitaParcela: false, ativo: true };

export default function FormaPagamentoFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormaPagamentoCreate>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      FormaPagamentoService.getById(Number(id))
        .then(res => {
          const f = res.data;
          setForm({ nomeFormaPagamento: f.nomeFormaPagamento, aceitaParcela: f.aceitaParcela, ativo: f.ativo });
        })
        .catch(() => navigate('/formas-pagamento'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, isEdit, navigate]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nomeFormaPagamento.trim()) { setError('Nome é obrigatório.'); return; }

    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await FormaPagamentoService.update(Number(id), form);
      } else {
        await FormaPagamentoService.create(form);
      }
      navigate('/formas-pagamento');
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
          <CreditCard size={24} className="page-title-icon" />
          <h1 className="page-title">{isEdit ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}</h1>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSave} className="form-page">
          <div className="form-section">
            <h2 className="form-section-title">Dados da Forma de Pagamento</h2>

            <div className="form-group">
              <label htmlFor="nomeFormaPagamento">Nome *</label>
              <input
                id="nomeFormaPagamento"
                type="text"
                placeholder="Ex: CARTÃO DE CRÉDITO"
                value={form.nomeFormaPagamento}
                onChange={e => setForm({ ...form, nomeFormaPagamento: e.target.value.toUpperCase() })}
                autoFocus
              />
            </div>

            <div className="form-group form-check">
              <label>
                <input
                  type="checkbox"
                  checked={form.aceitaParcela}
                  onChange={e => setForm({ ...form, aceitaParcela: e.target.checked })}
                />
                Aceita Parcelamento
              </label>
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
            <button type="button" className="btn-secondary" onClick={() => navigate('/formas-pagamento')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
