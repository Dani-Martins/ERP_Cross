import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreditCard, Pencil } from 'lucide-react';
import { FormaPagamentoService } from '../services/formaPagamentoService';
import type { FormaPagamentoView } from '../types/entities';
import './PaisesPage.css';

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const parts = value.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
  }
  const d = new Date(value.replace(' ', 'T'));
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('pt-BR');
}

export default function FormaPagamentoViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [forma, setForma] = useState<FormaPagamentoView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    FormaPagamentoService.getById(Number(id))
      .then(res => setForma(res.data))
      .catch(() => navigate('/formas-pagamento'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="page-container"><div className="table-loading">Carregando...</div></div>;
  if (!forma) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-area">
          <CreditCard size={24} className="page-title-icon" />
          <h1 className="page-title">Visualizar Forma de Pagamento</h1>
        </div>
      </div>

      <div className="form-card">
        <div className="form-page">
          <div className="form-section">
            <h2 className="form-section-title">Dados da Forma de Pagamento</h2>

            <div className="view-group">
              <span className="view-label">Nome</span>
              <span className="view-value">{forma.nomeFormaPagamento}</span>
            </div>

            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Aceita Parcelamento</span>
                <span className={`status-badge ${forma.aceitaParcela ? 'status-active' : 'status-inactive'}`}>
                  {forma.aceitaParcela ? 'Sim' : 'Não'}
                </span>
              </div>
              <div className="view-group">
                <span className="view-label">Status</span>
                <span className={`status-badge ${forma.ativo ? 'status-active' : 'status-inactive'}`}>
                  {forma.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>

          <div className="form-section view-dates">
            <h2 className="form-section-title">Informações do Sistema</h2>
            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Criado em</span>
                <span className="view-value view-muted">{formatDate(forma.dataCriacao)}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Atualizado em</span>
                <span className="view-value view-muted">{formatDate(forma.dataAtualizacao)}</span>
              </div>
            </div>
          </div>

          <div className="form-page-footer">
            <button className="btn-primary" onClick={() => navigate(`/formas-pagamento/editar/${forma.id}`)}>
              <Pencil size={15} /> Editar
            </button>
            <button className="btn-secondary" onClick={() => navigate('/formas-pagamento')}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
