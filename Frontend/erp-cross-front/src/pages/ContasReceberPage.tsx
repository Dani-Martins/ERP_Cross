import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Eye, Pencil, Trash2, Plus, Search, X, CheckSquare } from 'lucide-react';
import { ContaReceberService } from '../services/contasService';
import type { ContaReceberView } from '../types/entities';
import './PaisesPage.css';

const STATUS_LABEL: Record<string, string> = {
  ABERTO: 'Aberto',
  PAGO: 'Pago',
  RECEBIDO: 'Recebido',
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
  if (s === 'PAGO' || s === 'RECEBIDO') return 'status-badge status-active';
  if (s === 'CANCELADO') return 'status-badge status-inactive';
  if (s === 'VENCIDO') return 'status-badge status-inactive';
  return 'status-badge';
}

export default function ContasReceberPage() {
  const navigate = useNavigate();
  const [contas, setContas] = useState<ContaReceberView[]>([]);
  const [busca, setBusca] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'abertos' | 'pagos'>('todos');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());
  const [showBaixaModal, setShowBaixaModal] = useState(false);
  const [dataBaixa, setDataBaixa] = useState(new Date().toISOString().substring(0, 10));
  const [baixando, setBaixando] = useState(false);

  useEffect(() => {
    ContaReceberService.getAll()
      .then(res => setContas(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtradas = contas.filter(c => {
    const matchStatus =
      filterStatus === 'todos' ? true :
      filterStatus === 'pagos' ? (c.status === 'PAGO' || c.status === 'RECEBIDO') :
      c.status !== 'PAGO' && c.status !== 'RECEBIDO' && c.status !== 'CANCELADO';
    const matchBusca = !busca ||
      (c.nomeCliente ?? '').toLowerCase().includes(busca.toLowerCase()) ||
      c.numeroNota.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const selecionaveis = filtradas.filter(c => c.status !== 'PAGO' && c.status !== 'RECEBIDO' && c.status !== 'CANCELADO');
  const todosSelecionados = selecionaveis.length > 0 && selecionaveis.every(c => selecionados.has(c.id));

  function toggleSelecionado(id: number) {
    setSelecionados(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleTodos() {
    if (todosSelecionados) {
      setSelecionados(prev => {
        const next = new Set(prev);
        selecionaveis.forEach(c => next.delete(c.id));
        return next;
      });
    } else {
      setSelecionados(prev => {
        const next = new Set(prev);
        selecionaveis.forEach(c => next.add(c.id));
        return next;
      });
    }
  }

  async function handleBaixaLote() {
    setBaixando(true);
    await ContaReceberService.baixaLote({ ids: Array.from(selecionados), dataRecebimento: dataBaixa });
    const res = await ContaReceberService.getAll();
    setContas(res.data);
    setSelecionados(new Set());
    setShowBaixaModal(false);
    setBaixando(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await ContaReceberService.remove(deleteId);
    setContas(prev => prev.filter(c => c.id !== deleteId));
    setDeleteId(null);
    setDeleting(false);
  }

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <div className="page-title-area">
            <TrendingUp size={24} className="page-title-icon" />
            <h1 className="page-title">Contas a Receber</h1>
            <span className="page-badge">{filtradas.length}</span>
          </div>
          <div className="page-actions">
            <div className="filter-select-group">
              <label>Status:</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}>
                <option value="todos">Todos</option>
                <option value="abertos">Em Aberto</option>
                <option value="pagos">Pagos</option>
              </select>
            </div>
            <div className="search-box">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por cliente ou nº nota..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
              />
              {busca && (
                <button className="search-clear" onClick={() => setBusca('')}><X size={14} /></button>
              )}
            </div>
            <button className="btn-primary" onClick={() => navigate('/contas-receber/nova')}>
              <Plus size={16} /> Nova Conta
            </button>
            {selecionados.size > 0 && (
              <button className="btn-primary" style={{ background: 'var(--success, #16a34a)' }}
                onClick={() => { setDataBaixa(new Date().toISOString().substring(0, 10)); setShowBaixaModal(true); }}>
                <CheckSquare size={16} /> Dar Baixa ({selecionados.size})
              </button>
            )}
          </div>
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
                  <th style={{ width: 40 }}>
                    <input type="checkbox" checked={todosSelecionados}
                      onChange={toggleTodos}
                      title="Selecionar todos em aberto" />
                  </th>
                  <th style={{ width: 60 }}>#</th>
                  <th>Cliente</th>
                  <th style={{ width: 100 }}>Nº Nota</th>
                  <th style={{ width: 50 }}>Parc.</th>
                  <th style={{ width: 120 }}>Valor</th>
                  <th style={{ width: 110 }}>Vencimento</th>
                  <th style={{ width: 110 }}>Recebimento</th>
                  <th style={{ width: 100 }}>Status</th>
                  <th className="col-actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map(c => {
                  const selecionavel = c.status !== 'PAGO' && c.status !== 'RECEBIDO' && c.status !== 'CANCELADO';
                  return (
                  <tr key={c.id} style={selecionados.has(c.id) ? { background: 'var(--row-selected, #fef9ec)' } : {}}>
                    <td style={{ textAlign: 'center' }}>
                      {selecionavel && (
                        <input type="checkbox" checked={selecionados.has(c.id)}
                          onChange={() => toggleSelecionado(c.id)} />
                      )}
                    </td>
                    <td className="col-id">{c.id}</td>
                    <td>{c.nomeCliente ?? '—'}</td>
                    <td>{c.numeroNota}</td>
                    <td style={{ textAlign: 'center' }}>{c.numParcela}</td>
                    <td><strong>{fmtMoeda(c.valorParcela)}</strong></td>
                    <td>{fmtData(c.dataVencimento)}</td>
                    <td>{c.dataRecebimento ? fmtData(c.dataRecebimento) : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td>
                      <span className={statusClass(c.status)}>
                        {STATUS_LABEL[c.status] ?? c.status}
                      </span>
                    </td>
                    <td className="col-actions" style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn-icon btn-view" title="Visualizar" onClick={() => navigate(`/contas-receber/visualizar/${c.id}`)}>
                        <Eye size={16} />
                      </button>
                      <button className="btn-icon btn-edit" title="Editar" onClick={() => navigate(`/contas-receber/editar/${c.id}`)}>
                        <Pencil size={16} />
                      </button>
                      <button className="btn-icon btn-delete" title="Excluir" onClick={() => setDeleteId(c.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                  );
                })}
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
              <p>Tem certeza que deseja excluir esta conta a receber? Esta ação só pode ser desfeita por um Administrador.</p>
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

      {showBaixaModal && (
        <div className="modal-overlay" onClick={() => setShowBaixaModal(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Dar Baixa em Lote</h2>
              <button className="modal-close" onClick={() => setShowBaixaModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>{selecionados.size} parcela(s) serão marcadas como <strong>PAGO</strong> com o valor da parcela como valor recebido.</p>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label htmlFor="dataBaixa">Data de Recebimento</label>
                <input id="dataBaixa" type="date" value={dataBaixa}
                  onChange={e => setDataBaixa(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={handleBaixaLote} disabled={baixando}>
                {baixando ? 'Processando...' : 'Confirmar Baixa'}
              </button>
              <button className="btn-secondary" onClick={() => setShowBaixaModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
