import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TrendingUp, Pencil } from 'lucide-react';
import { ContaReceberService } from '../services/contasService';
import type { ContaReceberView } from '../types/entities';
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
  ABERTO: 'Aberto', PARCIAL: 'Parcial', PAGO: 'Finalizado', RECEBIDO: 'Finalizado', CANCELADO: 'Cancelado', VENCIDO: 'Vencido',
};

function statusClass(s: string) {
  if (s === 'PAGO' || s === 'RECEBIDO' || s === 'FINALIZADO') return 'status-badge status-active';
  if (s === 'CANCELADO' || s === 'VENCIDO') return 'status-badge status-inactive';
  return 'status-badge';
}

export default function ContaReceberViewPage({ contaId, onClose, onEdit }: { contaId?: number; onClose?: () => void; onEdit?: (id: number) => void } = {}) {
  const routeParams = useParams<{ id: string }>();
  const id = contaId?.toString() ?? routeParams.id;
  const navigate = useNavigate();
  const [conta, setConta] = useState<ContaReceberView | null>(null);
  const [parcelas, setParcelas] = useState<ContaReceberView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([ContaReceberService.getById(Number(id)), ContaReceberService.getAll()])
      .then(([resConta, resTodas]) => {
        const notaSelecionada = resConta.data;
        setConta(notaSelecionada);
        const parcelasDaNota = resTodas.data
          .filter(parcela => parcela.numeroNota === notaSelecionada.numeroNota
            && parcela.modelo === notaSelecionada.modelo
            && parcela.serie === notaSelecionada.serie
            && parcela.clienteId === notaSelecionada.clienteId)
          .sort((a, b) => a.numParcela - b.numParcela || a.id - b.id);
        setParcelas(parcelasDaNota.length > 0 ? parcelasDaNota : [notaSelecionada]);
      })
      .catch(() => onClose ? onClose() : navigate('/contas-receber'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="page-container"><div className="table-loading">Carregando...</div></div>;
  if (!conta) return null;

  const totalBruto = parcelas.reduce((total, parcela) => total + parcela.valorParcela, 0);
  const totalComEncargos = parcelas.reduce((total, parcela) =>
    total + parcela.valorParcela + parcela.juros + parcela.multa - parcela.desconto, 0);
  const totalJuros = parcelas.reduce((total, parcela) => total + parcela.juros, 0);
  const totalMulta = parcelas.reduce((total, parcela) => total + parcela.multa, 0);
  const totalDesconto = parcelas.reduce((total, parcela) => total + parcela.desconto, 0);
  const parcelasPagas = parcelas.filter(parcela => parcela.status === 'PAGO' || parcela.status === 'RECEBIDO').length;
  const parcelasCanceladas = parcelas.filter(parcela => parcela.status === 'CANCELADO').length;
  const situacaoGeral = parcelasPagas + parcelasCanceladas === parcelas.length
    ? parcelasPagas > 0 ? 'PAGO' : 'CANCELADO'
    : parcelasPagas + parcelasCanceladas > 0 ? 'PARCIAL' : 'ABERTO';
  const contaEditavel = parcelas.length > 0 && parcelas.every(parcela =>
    parcela.status !== 'PAGO' && parcela.status !== 'RECEBIDO' && parcela.status !== 'CANCELADO'
      && !parcela.dataRecebimento && !parcela.dataCancelamento);
  const formasPagamento = [...new Set(parcelas.map(parcela => parcela.nomeFormaPagamento).filter(Boolean))].join(', ') || '—';

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-area">
          <TrendingUp size={24} className="page-title-icon" />
          <h1 className="page-title">Visualizar Conta a Receber</h1>
        </div>
        {(!onClose || contaEditavel) && (
          <button className="btn-secondary" onClick={() => onEdit ? onEdit(conta.id) : navigate(`/contas-receber/editar/${conta.id}`)}>
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
                <span className="view-label">Quantidade de Parcelas</span>
                <span className="view-value">{parcelas.length}</span>
              </div>
              <div className="view-group" style={{ gridColumn: 'span 2' }}>
                <span className="view-label">Cliente</span>
                <span className="view-value">{conta.nomeCliente ?? '—'}</span>
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
                <span className="view-label">Nº Parcela</span>
              </div>
              <div className="view-group">
                <span className="view-label">Data de Emissão</span>
                <span className="view-value">{fmtData(conta.dataEmissao)}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Valor Total</span>
                <span className="view-value"><strong>{fmtMoeda(totalBruto)}</strong></span>
              </div>
            </div>
            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Forma de Pagamento</span>
                <span className="view-value">{formasPagamento}</span>
              </div>
              <div className="view-group">
                <span className="view-label">Status</span>
                <span className={statusClass(situacaoGeral)}>{STATUS_LABEL[situacaoGeral] ?? situacaoGeral}</span>
              </div>
            </div>
          </div>

          {/* Parcelas */}
          <div className="form-section">
            <h2 className="form-section-title">Parcelas</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Parcela</th>
                  <th>Vencimento</th>
                  <th>Valor</th>
                  <th>Situação</th>
                  <th>Recebido em</th>
                  <th>Cancelado em</th>
                </tr>
              </thead>
              <tbody>
                  {parcelas.map(parcela => (
                    <tr key={parcela.id}>
                      <td>{parcela.numParcela}</td>
                      <td>{fmtData(parcela.dataVencimento)}</td>
                      <td>{fmtMoeda(parcela.valorParcela)}</td>
                      <td>{STATUS_LABEL[parcela.status] ?? parcela.status}</td>
                      <td>{fmtData(parcela.dataRecebimento)}</td>
                      <td>{fmtData(parcela.dataCancelamento)}</td>
                      </tr>
                    ))}
                </tbody>
            </table>
          </div>

          {/* Taxas */}
          <div className="form-section">
            <h2 className="form-section-title">Taxas</h2>
            <div className="form-row">
              <div className="view-group">
                <span className="view-label">Juros</span>
                <span className="view-value" style={{ color: totalJuros > 0 ? '#dc2626' : undefined }}>
                  {fmtMoeda(totalJuros)}
                </span>
              </div>
              <div className="view-group">
                <span className="view-label">Multa</span>
                <span className="view-value" style={{ color: totalMulta > 0 ? '#dc2626' : undefined }}>
                  {fmtMoeda(totalMulta)}
                </span>
              </div>
              <div className="view-group">
                <span className="view-label">Desconto</span>
                <span className="view-value" style={{ color: totalDesconto > 0 ? '#16a34a' : undefined }}>{fmtMoeda(totalDesconto)}</span>
              </div>
            </div>
            {(totalJuros > 0 || totalMulta > 0 || totalDesconto > 0) && (
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
            {onClose && contaEditavel && (
              <button className="btn-primary" onClick={() => onEdit ? onEdit(conta.id) : navigate(`/contas-receber/editar/${conta.id}`)}>
                Editar
              </button>
            )}
            <button className="btn-secondary" onClick={() => onClose ? onClose() : navigate('/contas-receber')}>
              {onClose ? 'Fechar' : 'Voltar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
