import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TrendingDown, Search } from 'lucide-react';
import { ContaPagarService } from '../services/contasService';
import { FornecedorService } from '../services/fornecedorService';
import { FormaPagamentoService } from '../services/formaPagamentoService';
import type { ContaPagarCreate, FornecedorView, FormaPagamentoView } from '../types/entities';
import type { AxiosError } from 'axios';
import CurrencyInput from '../components/CurrencyInput';
import './PaisesPage.css';

const STATUS_OPTIONS = ['ABERTO', 'PAGO', 'CANCELADO'];

const today = () => new Date().toISOString().substring(0, 10);

const EMPTY: ContaPagarCreate = {
  fornecedorId: 0, modelo: '', serie: '', numeroNota: '',
  numParcela: 1, valorParcela: 0,
  dataEmissao: today(), dataVencimento: today(),
  juros: 0, multa: 0, desconto: 0,
  status: 'ABERTO', ativo: true,
};

export default function ContaPagarFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<ContaPagarCreate>(EMPTY);
  const [selectedFornecedor, setSelectedFornecedor] = useState<FornecedorView | null>(null);
  const [selectedForma, setSelectedForma] = useState<FormaPagamentoView | null>(null);
  const [fornecedores, setFornecedores] = useState<FornecedorView[]>([]);
  const [formas, setFormas] = useState<FormaPagamentoView[]>([]);
  const [showFornecedorLookup, setShowFornecedorLookup] = useState(false);
  const [showFormaLookup, setShowFormaLookup] = useState(false);
  const [fornecedorSearch, setFornecedorSearch] = useState('');
  const [formaSearch, setFormaSearch] = useState('');
  const fornecedorSearchRef = useRef<HTMLInputElement>(null);
  const formaSearchRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      FornecedorService.getAll().then(r => setFornecedores(r.data)),
      FormaPagamentoService.getAll().then(r => setFormas(r.data.filter(f => f.ativo))),
    ]).then(() => {
      if (isEdit) {
        ContaPagarService.getById(Number(id)).then(r => {
          const c = r.data;
          setForm({
            notaCompraId: c.notaCompraId, fornecedorId: c.fornecedorId,
            modelo: c.modelo, serie: c.serie, numeroNota: c.numeroNota,
            numParcela: c.numParcela, valorParcela: c.valorParcela,
            dataEmissao: isoDate(c.dataEmissao), dataVencimento: isoDate(c.dataVencimento),
            dataPagamento: c.dataPagamento ? isoDate(c.dataPagamento) : undefined,
            valorPago: c.valorPago, juros: c.juros, multa: c.multa, desconto: c.desconto,
            status: c.status, ativo: c.ativo, formaPagamentoId: c.formaPagamentoId, observacao: c.observacao,
          });
          setFornecedores(prev => {
            const found = prev.find(x => x.id === c.fornecedorId);
            if (found) setSelectedFornecedor(found);
            return prev;
          });
          setFormas(prev => {
            const found = prev.find(x => x.id === c.formaPagamentoId);
            if (found) setSelectedForma(found);
            return prev;
          });
        }).catch(() => navigate('/contas-pagar'));
      }
    }).finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  function isoDate(s: string) {
    if (!s) return today();
    const parts = s.split('/');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return s.substring(0, 10);
  }

  const fornecedoresFiltrados = fornecedores.filter(f =>
    f.nome.toLowerCase().includes(fornecedorSearch.toLowerCase())
  );
  const formasFiltradas = formas.filter(f =>
    f.nomeFormaPagamento.toLowerCase().includes(formaSearch.toLowerCase())
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fornecedorId) { setError('Selecione o Fornecedor.'); return; }
    if (!form.numeroNota.trim()) { setError('Número da nota é obrigatório.'); return; }
    if (form.valorParcela <= 0) { setError('Valor da parcela deve ser maior que zero.'); return; }

    setSaving(true);
    setError('');
    try {
      const payload = { ...form, formaPagamentoId: selectedForma?.id };
      if (isEdit) {
        await ContaPagarService.update(Number(id), payload);
      } else {
        await ContaPagarService.create(payload);
      }
      navigate('/contas-pagar');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      setError(axiosErr.response?.data?.message ?? 'Erro ao salvar. Verifique os dados e tente novamente.');
      setSaving(false);
    }
  }

  if (loading) return <div className="page-container"><div className="table-loading">Carregando...</div></div>;

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <div className="page-title-area">
            <TrendingDown size={24} className="page-title-icon" />
            <h1 className="page-title">{isEdit ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}</h1>
          </div>
        </div>

        <div className="form-card">
          <form onSubmit={handleSave} className="form-page">

            {/* Dados do Documento */}
            <div className="form-section">
              <h2 className="form-section-title">Dados do Documento</h2>

              <div className="form-group">
                <label>Fornecedor *</label>
                <div className="lookup-field">
                  <input type="text" readOnly className="lookup-input"
                    value={selectedFornecedor?.nome ?? ''}
                    placeholder="Selecione o fornecedor..." />
                  <button type="button" className="btn-lookup"
                    onClick={() => { setShowFornecedorLookup(true); setTimeout(() => fornecedorSearchRef.current?.focus(), 50); }}>
                    <Search size={15} />
                  </button>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="numeroNota">Número da Nota *</label>
                  <input id="numeroNota" type="text" placeholder="Ex: 000001"
                    value={form.numeroNota}
                    onChange={e => setForm({ ...form, numeroNota: e.target.value.toUpperCase() })} />
                </div>
                <div className="form-group">
                  <label htmlFor="modelo">Modelo</label>
                  <input id="modelo" type="text" placeholder="Ex: 55"
                    value={form.modelo}
                    onChange={e => setForm({ ...form, modelo: e.target.value.toUpperCase() })} />
                </div>
                <div className="form-group">
                  <label htmlFor="serie">Série</label>
                  <input id="serie" type="text" placeholder="Ex: 1"
                    value={form.serie}
                    onChange={e => setForm({ ...form, serie: e.target.value.toUpperCase() })} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="numParcela">Nº Parcela</label>
                  <input id="numParcela" type="number" min={1}
                    value={form.numParcela}
                    onChange={e => setForm({ ...form, numParcela: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label htmlFor="dataEmissao">Data de Emissão *</label>
                  <input id="dataEmissao" type="date"
                    value={form.dataEmissao}
                    onChange={e => setForm({ ...form, dataEmissao: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="dataVencimento">Data de Vencimento *</label>
                  <input id="dataVencimento" type="date"
                    value={form.dataVencimento}
                    onChange={e => setForm({ ...form, dataVencimento: e.target.value })} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Valor da Parcela *</label>
                  <CurrencyInput value={form.valorParcela} onChange={v => setForm({ ...form, valorParcela: v })} />
                </div>
                <div className="form-group">
                  <label>Forma de Pagamento</label>
                  <div className="lookup-field">
                    <input type="text" readOnly className="lookup-input"
                      value={selectedForma?.nomeFormaPagamento ?? ''}
                      placeholder="Selecione a forma..." />
                    <button type="button" className="btn-lookup"
                      onClick={() => { setShowFormaLookup(true); setTimeout(() => formaSearchRef.current?.focus(), 50); }}>
                      <Search size={15} />
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select id="status" value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Pagamento */}
            <div className="form-section">
              <h2 className="form-section-title">Pagamento</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dataPagamento">Data de Pagamento</label>
                  <input id="dataPagamento" type="date"
                    value={form.dataPagamento ?? ''}
                    onChange={e => setForm({ ...form, dataPagamento: e.target.value || undefined })} />
                </div>
                <div className="form-group">
                  <label>Valor Pago</label>
                  <CurrencyInput value={form.valorPago ?? 0} onChange={v => setForm({ ...form, valorPago: v || undefined })} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Juros (R$)</label>
                  <CurrencyInput value={form.juros} onChange={v => setForm({ ...form, juros: v })} />
                </div>
                <div className="form-group">
                  <label>Multa (R$)</label>
                  <CurrencyInput value={form.multa} onChange={v => setForm({ ...form, multa: v })} />
                </div>
                <div className="form-group">
                  <label>Desconto (R$)</label>
                  <CurrencyInput value={form.desconto} onChange={v => setForm({ ...form, desconto: v })} />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="form-section">
              <h2 className="form-section-title">Observações</h2>
              <div className="form-group">
                <textarea rows={3} placeholder="Observações adicionais..."
                  value={form.observacao ?? ''}
                  onChange={e => setForm({ ...form, observacao: e.target.value.toUpperCase() || undefined })}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="form-page-footer">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/contas-pagar')}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lookup — Fornecedor */}
      {showFornecedorLookup && (
        <div className="modal-overlay" onClick={() => setShowFornecedorLookup(false)}>
          <div className="modal modal-lookup" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Selecionar Fornecedor</h2>
              <button className="modal-close" onClick={() => setShowFornecedorLookup(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="lookup-search-bar">
                <Search size={16} className="lookup-search-icon" />
                <input ref={fornecedorSearchRef} type="text" placeholder="Buscar fornecedor..."
                  value={fornecedorSearch} onChange={e => setFornecedorSearch(e.target.value)} />
              </div>
              <div className="lookup-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: 56 }}>#</th>
                      <th>Fornecedor</th>
                      <th style={{ width: 80 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fornecedoresFiltrados.length === 0 ? (
                      <tr><td colSpan={3} className="table-empty">Nenhum resultado.</td></tr>
                    ) : fornecedoresFiltrados.map(f => (
                      <tr key={f.id}>
                        <td className="col-id">{f.id}</td>
                        <td>{f.nome}</td>
                        <td>
                          <button className="btn-select" onClick={() => {
                            setSelectedFornecedor(f);
                            setForm(prev => ({ ...prev, fornecedorId: f.id }));
                            setShowFornecedorLookup(false);
                            setFornecedorSearch('');
                          }}>Selecionar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lookup — Forma de Pagamento */}
      {showFormaLookup && (
        <div className="modal-overlay" onClick={() => setShowFormaLookup(false)}>
          <div className="modal modal-lookup" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Selecionar Forma de Pagamento</h2>
              <button className="modal-close" onClick={() => setShowFormaLookup(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="lookup-search-bar">
                <Search size={16} className="lookup-search-icon" />
                <input ref={formaSearchRef} type="text" placeholder="Buscar forma de pagamento..."
                  value={formaSearch} onChange={e => setFormaSearch(e.target.value)} />
              </div>
              <div className="lookup-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: 56 }}>#</th>
                      <th>Forma de Pagamento</th>
                      <th style={{ width: 80 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formasFiltradas.length === 0 ? (
                      <tr><td colSpan={3} className="table-empty">Nenhum resultado.</td></tr>
                    ) : formasFiltradas.map(f => (
                      <tr key={f.id}>
                        <td className="col-id">{f.id}</td>
                        <td>{f.nomeFormaPagamento}</td>
                        <td>
                          <button className="btn-select" onClick={() => {
                            setSelectedForma(f);
                            setForm(prev => ({ ...prev, formaPagamentoId: f.id }));
                            setShowFormaLookup(false);
                            setFormaSearch('');
                          }}>Selecionar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
