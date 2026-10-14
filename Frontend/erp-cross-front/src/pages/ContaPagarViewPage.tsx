import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TrendingDown, Pencil } from 'lucide-react';
import { ContaPagarService } from '../services/contasService';
import type { ContaPagarView, ContaPagarParcela } from '../types/entities';
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
  ABERTO: 'Aberto', PAGO: 'Pago', FINALIZADO: 'Finalizado', CANCELADO: 'Cancelado', VENCIDO: 'Vencido',
};

function statusClass(s: string) {
  if (s === 'PAGO' || s === 'FINALIZADO') return 'status-badge status-active';
  if (s === 'CANCELADO' || s === 'VENCIDO') return 'status-badge status-inactive';
  return 'status-badge';
}

export default function ContaPagarViewPage({ contaId, onClose, onEdit }: { contaId?: number; onClose?: () => void; onEdit?: (id: number) => void } = {}) {
  const routeParams = useParams<{ id: string }>();
  const id = contaId?.toString() ?? routeParams.id;
  const navigate = useNavigate();
  const [conta, setConta] = useState<ContaPagarView | null>(null);
  const [parcelas, setParcelas] = useState<ContaPagarParcela[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    const [c, p] = await Promise.all([
      ContaPagarService.getById(Number(id)),
      ContaPagarService.getParcelas(Number(id)),
    ]);
    setConta(c.data);
    setParcelas(p.data);
  }

  useEffect(() => {
    carregar()
      .catch(() => onClose ? onClose() : navigate('/contas-pagar'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  if (loading) return <div className="page-container"><div className="table-loading">Carregando...</div></div>;
  if (!conta) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-area">
          <TrendingDown size={24} className="page-title-icon" />
          <h1 className="page-title">Visualizar Conta a Pagar</h1>
        </div>
        {(!onClose || (conta.status === 'ABERTO' && parcelas.every(parcela => !parcela.pago && !parcela.cancelada))) && (
          <button className="btn-secondary" onClick={() => onEdit ? onEdit(conta.id) : navigate(`/contas-pagar/editar/${conta.id}`)}>
            <Pencil size={16} /> Editar
          </button>
        )}
      </div>

      <div className="form-card">
        <div className="form-page">

          {/* Dados do Documento */}
          <div className="form-section">
            <h2 className="form-section-title">Dados do Documento</h2>
            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Código</span>
                <span className="view-value">{conta.id}</span>
              </div>
              <div className="view-group" style={{ gridColumn: 'span 2' }}>
                <span className="view-label">Fornecedor</span>
                <span className="view-value">{conta.nomeFornecedor ?? '—'}</span>
              </div>
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
                <span className="view-label">Parcelas Pagas</span>
                <span className="view-value">{conta.parcelasPagas} de {conta.numParcela}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Data de Emissão</span>
                <span className="view-value">{fmtData(conta.dataEmissao)}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Valor Total</span>
                <span className="view-value"><strong>{fmtMoeda(conta.valorTotal)}</strong></span>
              </div>
            </div>
            <div className="form-row">
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

          {/* Parcelas */}
          <div className="form-section">
            <h2 className="form-section-title">Parcelas</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Parcela</th><th>Vencimento</th><th>Valor</th><th>Situação</th><th>Pago em</th><th>Cancelado em</th>
                </tr>
              </thead>
              <tbody>
                {parcelas.map(p => (
                  <tr key={p.id}>
                    <td>{p.numParcela}/{conta.numParcela}</td>
                    <td>{fmtData(p.dataVencimento)}</td>
                    <td>{fmtMoeda(p.valorParcela)}</td>
                    <td>{p.pago ? 'Paga' : p.cancelada ? 'Cancelada' : 'Em aberto'}</td>
                    <td>{fmtData(p.dataPagamento)}</td>
                    <td>{fmtData(p.dataCancelamento)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Encargos */}
          <div className="form-section">
            <h2 className="form-section-title">Taxas</h2>
            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Juros por parcela (%)</span>
                <span className="view-value">{conta.juros}%</span>
              </div>
              <div className="view-group">
                <span className="view-label">Multa (%)</span>
                <span className="view-value">{conta.multa}%</span>
              </div>
              <div className="view-group">
                <span className="view-label">Desconto (%)</span>
                <span className="view-value">{conta.desconto}%</span>
              </div>
            </div>
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
            {onClose && conta.status === 'ABERTO' && parcelas.every(parcela => !parcela.pago && !parcela.cancelada) && (
              <button className="btn-primary" onClick={() => onEdit ? onEdit(conta.id) : navigate(`/contas-pagar/editar/${conta.id}`)}>
                Editar
              </button>
            )}
            <button className="btn-secondary" onClick={() => onClose ? onClose() : navigate('/contas-pagar')}>
              {onClose ? 'Fechar' : 'Voltar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
