import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingDown, Eye, Pencil, Trash2, Plus } from 'lucide-react';
import { ContaPagarService } from '../services/contasService';
import type { ContaPagarView } from '../types/entities';
import './PaisesPage.css';

const STATUS_LABEL: Record<string, string> = {
  ABERTO: 'Aberto',
  PAGO: 'Pago',
  CANCELADO: 'Cancelado',
  VENCIDO: 'Vencido',
};

function fmtMoeda(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtData(s: string) {
  if (!s) return '—';
  const parts = s.split('/');
  if (parts.length === 3) return `${parts[0]}/${parts[1]}/${parts[2]}`;
  return s.substring(0, 10).split('-').reverse().join('/');
}

function statusClass(s: string) {
  if (s === 'PAGO') return 'status-badge status-active';
  if (s === 'CANCELADO') return 'status-badge status-inactive';
  if (s === 'VENCIDO') return 'status-badge status-inactive';
  return 'status-badge';
}

export default function ContasPagarPage() {
  const navigate = useNavigate();
  const [contas, setContas] = useState<ContaPagarView[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    ContaPagarService.getAll()
      .then(res => setContas(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtradas = contas.filter(c =>
    c.nomeFornecedor?.toLowerCase().includes(busca.toLowerCase()) ||
    c.numeroNota.toLowerCase().includes(busca.toLowerCase()) ||
    c.status.toLowerCase().includes(busca.toLowerCase())
  );

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await ContaPagarService.remove(deleteId);
    setContas(prev => prev.filter(c => c.id !== deleteId));
    setDeleteId(null);
    setDeleting(false);
  }

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <div className="page-title-area">
            <TrendingDown size={24} className="page-title-icon" />
            <h1 className="page-title">Contas a Pagar</h1>
          </div>
          <button className="btn-primary" onClick={() => navigate('/contas-pagar/nova')}>
            <Plus size={16} /> Nova Conta
          </button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por fornecedor, nº nota ou status..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>

        <div className="table-card">
          {loading ? (
            <div className="table-loading">Carregando...</div>
          ) : filtradas.length === 0 ? (
            <div className="table-empty">Nenhuma conta encontrada.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>#</th>
                  <th>Fornecedor</th>
                  <th style={{ width: 100 }}>Nº Nota</th>
                  <th style={{ width: 50 }}>Parc.</th>
                  <th style={{ width: 120 }}>Valor</th>
                  <th style={{ width: 110 }}>Vencimento</th>
                  <th style={{ width: 110 }}>Pagamento</th>
                  <th style={{ width: 100 }}>Status</th>
                  <th className="col-actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map(c => (
                  <tr key={c.id}>
                    <td className="col-id">{c.id}</td>
                    <td>{c.nomeFornecedor ?? '—'}</td>
                    <td>{c.numeroNota}</td>
                    <td style={{ textAlign: 'center' }}>{c.numParcela}</td>
                    <td><strong>{fmtMoeda(c.valorParcela)}</strong></td>
                    <td>{fmtData(c.dataVencimento)}</td>
                    <td>{c.dataPagamento ? fmtData(c.dataPagamento) : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td>
                      <span className={statusClass(c.status)}>
                        {STATUS_LABEL[c.status] ?? c.status}
                      </span>
                    </td>
                    <td className="col-actions" style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn-icon btn-view" title="Visualizar" onClick={() => navigate(`/contas-pagar/visualizar/${c.id}`)}>
                        <Eye size={16} />
                      </button>
                      <button className="btn-icon btn-edit" title="Editar" onClick={() => navigate(`/contas-pagar/editar/${c.id}`)}>
                        <Pencil size={16} />
                      </button>
                      <button className="btn-icon btn-delete" title="Excluir" onClick={() => setDeleteId(c.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Confirmar Exclusão</h2>
              <button className="modal-close" onClick={() => setDeleteId(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Tem certeza que deseja excluir esta conta a pagar? Esta ação só pode ser desfeita por um Administrador.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
              <button className="btn-secondary" onClick={() => setDeleteId(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
