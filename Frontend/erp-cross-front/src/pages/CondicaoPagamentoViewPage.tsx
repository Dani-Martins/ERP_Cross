import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarClock, Pencil } from 'lucide-react';
import { CondicaoPagamentoService } from '../services/condicaoPagamentoService';
import type { CondicaoPagamentoView } from '../types/entities';
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

function fmtPercent(n: number) {
  return n > 0 ? `${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%` : '—';
}

export default function CondicaoPagamentoViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [condicao, setCondicao] = useState<CondicaoPagamentoView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CondicaoPagamentoService.getById(Number(id))
      .then(res => setCondicao(res.data))
      .catch(() => navigate('/condicoes-pagamento'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="page-container"><div className="table-loading">Carregando...</div></div>;
  if (!condicao) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-area">
          <CalendarClock size={24} className="page-title-icon" />
          <h1 className="page-title">Visualizar Condição de Pagamento</h1>
        </div>
      </div>

      <div className="form-card">
        <div className="form-page">
          <div className="form-section">
            <h2 className="form-section-title">Dados da Condição</h2>

            <div className="view-group">
              <span className="view-label">Nome</span>
              <span className="view-value">{condicao.nomeCondicao}</span>
            </div>

            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Taxa de Juros</span>
                <span className="view-value">{fmtPercent(condicao.taxaJuros)}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Multa</span>
                <span className="view-value">{fmtPercent(condicao.multa)}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Desconto</span>
                <span className="view-value">{fmtPercent(condicao.desconto)}</span>
              </div>
            </div>

            <div className="view-group">
              <span className="view-label">Status</span>
              <span className={`status-badge ${condicao.ativo ? 'status-active' : 'status-inactive'}`}>
                {condicao.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>

          <div className="form-section view-dates">
            <h2 className="form-section-title">Informações do Sistema</h2>
            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Criado em</span>
                <span className="view-value view-muted">{formatDate(condicao.dataCriacao)}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Atualizado em</span>
                <span className="view-value view-muted">{formatDate(condicao.dataAtualizacao)}</span>
              </div>
            </div>
          </div>

          <div className="form-page-footer">
            <button className="btn-primary" onClick={() => navigate(`/condicoes-pagamento/editar/${condicao.id}`)}>
              <Pencil size={15} /> Editar
            </button>
            <button className="btn-secondary" onClick={() => navigate('/condicoes-pagamento')}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
