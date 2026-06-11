import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TrendingDown, Pencil } from 'lucide-react';
import { ContaPagarService } from '../services/contasService';
import type { ContaPagarView } from '../types/entities';
import './PaisesPage.css';

function fmtData(s?: string | null) {
  if (!s) return '—';
  const parts = s.split('/');
  if (parts.length === 3) return `${parts[0]}/${parts[1]}/${parts[2]}`;
  return s.substring(0, 10).split('-').reverse().join('/');
}

function fmtMoeda(v?: number | null) {
  if (v == null) return '—';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const STATUS_LABEL: Record<string, string> = {
  ABERTO: 'Aberto', PAGO: 'Pago', CANCELADO: 'Cancelado', VENCIDO: 'Vencido',
};

function statusClass(s: string) {
  if (s === 'PAGO') return 'status-badge status-active';
  if (s === 'CANCELADO' || s === 'VENCIDO') return 'status-badge status-inactive';
  return 'status-badge';
}

export default function ContaPagarViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [conta, setConta] = useState<ContaPagarView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ContaPagarService.getById(Number(id))
      .then(r => setConta(r.data))
      .catch(() => navigate('/contas-pagar'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="page-container"><div className="table-loading">Carregando...</div></div>;
  if (!conta) return null;

  const totalComEncargos = (conta.valorParcela ?? 0) + (conta.juros ?? 0) + (conta.multa ?? 0) - (conta.desconto ?? 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-area">
          <TrendingDown size={24} className="page-title-icon" />
          <h1 className="page-title">Visualizar Conta a Pagar</h1>
        </div>
        <button className="btn-secondary" onClick={() => navigate(`/contas-pagar/editar/${conta.id}`)}>
          <Pencil size={16} /> Editar
        </button>
      </div>

      <div className="form-card">
        <div className="form-page">

          {/* Dados do Documento */}
          <div className="form-section">
            <h2 className="form-section-title">Dados do Documento</h2>
            <div className="view-group">
              <span className="view-label">Fornecedor</span>
              <span className="view-value">{conta.nomeFornecedor ?? '—'}</span>
            </div>
            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Número da Nota</span>
                <span className="view-value">{conta.numeroNota}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Modelo</span>
                <span className="view-value">{conta.modelo || '—'}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Série</span>
                <span className="view-value">{conta.serie || '—'}</span>
              </div>
            </div>
            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Nº Parcela</span>
                <span className="view-value">{conta.numParcela}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Data de Emissão</span>
                <span className="view-value">{fmtData(conta.dataEmissao)}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Data de Vencimento</span>
                <span className="view-value">{fmtData(conta.dataVencimento)}</span>
              </div>
            </div>
            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Valor da Parcela</span>
                <span className="view-value"><strong>{fmtMoeda(conta.valorParcela)}</strong></span>
              </div>
              <div className="view-group">
                <span className="view-label">Forma de Pagamento</span>
                <span className="view-value">{conta.nomeFormaPagamento ?? '—'}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Status</span>
                <span className={statusClass(conta.status)}>{STATUS_LABEL[conta.status] ?? conta.status}</span>
              </div>
            </div>
          </div>

          {/* Pagamento */}
          <div className="form-section">
            <h2 className="form-section-title">Pagamento</h2>
            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Data de Pagamento</span>
                <span className="view-value">{fmtData(conta.dataPagamento)}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Valor Pago</span>
                <span className="view-value">{fmtMoeda(conta.valorPago)}</span>
              </div>
            </div>
            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Juros</span>
                <span className="view-value" style={{ color: conta.juros > 0 ? '#dc2626' : undefined }}>
                  {fmtMoeda(conta.juros)}
                </span>
              </div>
              <div className="view-group">
                <span className="view-label">Multa</span>
                <span className="view-value" style={{ color: conta.multa > 0 ? '#dc2626' : undefined }}>
                  {fmtMoeda(conta.multa)}
                </span>
              </div>
              <div className="view-group">
                <span className="view-label">Desconto</span>
                <span className="view-value" style={{ color: conta.desconto > 0 ? '#16a34a' : undefined }}>
                  {fmtMoeda(conta.desconto)}
                </span>
              </div>
            </div>
            {(conta.juros > 0 || conta.multa > 0 || conta.desconto > 0) && (
              <div className="view-group">
                <span className="view-label">Total com Encargos</span>
                <span className="view-value"><strong>{fmtMoeda(totalComEncargos)}</strong></span>
              </div>
            )}
          </div>

          {conta.observacao && (
            <div className="form-section">
              <h2 className="form-section-title">Observações</h2>
              <div className="view-group">
                <span className="view-value">{conta.observacao}</span>
              </div>
            </div>
          )}

          <div className="form-section view-dates">
            <h2 className="form-section-title">Informações do Sistema</h2>
            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Criado em</span>
                <span className="view-value view-muted">{fmtData(conta.criadoEm)}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Atualizado em</span>
                <span className="view-value view-muted">{fmtData(conta.atualizadoEm)}</span>
              </div>
            </div>
          </div>

          <div className="form-page-footer">
            <button className="btn-secondary" onClick={() => navigate('/contas-pagar')}>
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
