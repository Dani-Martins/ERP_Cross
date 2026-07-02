import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TrendingUp, Search } from 'lucide-react';
import { ContaReceberService } from '../services/contasService';
import { ClienteService } from '../services/clienteService';
import { FormaPagamentoService } from '../services/formaPagamentoService';
import { ParcelaCondicaoPagamentoService } from '../services/parcelaCondicaoPagamentoService';
import { CondicaoPagamentoService } from '../services/condicaoPagamentoService';
import type { ContaReceberCreate, ContaReceberLoteCreate, ClienteView, FormaPagamentoView, ParcelaCondicaoPagamentoView, CondicaoPagamentoView } from '../types/entities';
import type { AxiosError } from 'axios';
import CurrencyInput from '../components/CurrencyInput';
import './PaisesPage.css';

const STATUS_OPTIONS = ['ABERTO', 'PAGO', 'CANCELADO'];

function addDias(dataIso: string, dias: number): string {
  const d = new Date(dataIso + 'T00:00:00');
  d.setDate(d.getDate() + dias);
  return d.toISOString().substring(0, 10);
}

const today = () => new Date().toISOString().substring(0, 10);

const EMPTY: ContaReceberCreate = {
  numeroNota: '', modelo: '', serie: '', clienteId: 0,
  numParcela: 1, valorParcela: 0,
  dataEmissao: today(), dataVencimento: today(),
  juros: 0, multa: 0, desconto: 0,
  status: 'ABERTO', ativo: true,
};

export default function ContaReceberFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<ContaReceberCreate>(EMPTY);
  const [selectedCliente, setSelectedCliente] = useState<ClienteView | null>(null);
  const [selectedForma, setSelectedForma] = useState<FormaPagamentoView | null>(null);
  const [parcelasCondicao, setParcelasCondicao] = useState<ParcelaCondicaoPagamentoView[]>([]);
  const [valorTotal, setValorTotal] = useState(0);
  const [condicoes, setCondicoes] = useState<CondicaoPagamentoView[]>([]);
  const [selectedCondicaoId, setSelectedCondicaoId] = useState<number | undefined>();
  const [clientes, setClientes] = useState<ClienteView[]>([]);
  const [formas, setFormas] = useState<FormaPagamentoView[]>([]);
  const [showClienteLookup, setShowClienteLookup] = useState(false);
  const [showFormaLookup, setShowFormaLookup] = useState(false);
  const [showCondicaoLookup, setShowCondicaoLookup] = useState(false);
  const [clienteSearch, setClienteSearch] = useState('');
  const [formaSearch, setFormaSearch] = useState('');
  const [condicaoSearch, setCondicaoSearch] = useState('');
  const clienteSearchRef = useRef<HTMLInputElement>(null);
  const formaSearchRef = useRef<HTMLInputElement>(null);
  const condicaoSearchRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      ClienteService.getAll().then(r => setClientes(r.data.filter(c => c.ativo))),
      FormaPagamentoService.getAll().then(r => setFormas(r.data.filter(f => f.ativo))),
      CondicaoPagamentoService.getAll().then(r => setCondicoes(r.data.filter(c => c.ativo))),
    ]).then(() => {
      if (isEdit) {
        ContaReceberService.getById(Number(id)).then(r => {
          const c = r.data;
          setForm({
            numeroNota: c.numeroNota, modelo: c.modelo, serie: c.serie,
            clienteId: c.clienteId, numParcela: c.numParcela, valorParcela: c.valorParcela,
            dataEmissao: isoDate(c.dataEmissao), dataVencimento: isoDate(c.dataVencimento),
            dataRecebimento: c.dataRecebimento ? isoDate(c.dataRecebimento) : undefined,
            valorRecebido: c.valorRecebido, juros: c.juros, multa: c.multa, desconto: c.desconto,
            status: c.status, ativo: c.ativo, formaPagamentoId: c.formaPagamentoId, observacao: c.observacao,
          });
          setClientes(prev => {
            const found = prev.find(x => x.id === c.clienteId);
            if (found) setSelectedCliente(found);
            return prev;
          });
          setFormas(prev => {
            const found = prev.find(x => x.id === c.formaPagamentoId);
            if (found) setSelectedForma(found);
            return prev;
          });
        }).catch(() => navigate('/contas-receber'));
      } else {
        // Preencher automaticamente para nova conta
        ContaReceberService.getProximoNumero().then(r => {
          const proximo = String(r.data).padStart(6, '0');
          setForm(prev => ({ ...prev, numeroNota: proximo, modelo: 'SE', serie: '001' }));
        }).catch(() => {}); // ignora se falhar
      }
    }).finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  function isoDate(s: string) {
    if (!s) return today();
    const parts = s.split('/');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return s.substring(0, 10);
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(clienteSearch.toLowerCase()) ||
    (c.nomeFantasia ?? '').toLowerCase().includes(clienteSearch.toLowerCase())
  );
  const formasFiltradas = formas.filter(f =>
    f.nomeFormaPagamento.toLowerCase().includes(formaSearch.toLowerCase())
  );

  async function carregarParcelas(condicaoId: number) {
    try {
      const parcelas = (await ParcelaCondicaoPagamentoService.getByCondicaoId(condicaoId)).data;
      const ativas = parcelas.filter(p => p.ativo).sort((a, b) => a.numero - b.numero);
      setParcelasCondicao(ativas);
      const primeira = ativas[0];
      if (primeira) {
        setForm(prev => ({ ...prev, dataVencimento: addDias(prev.dataEmissao, primeira.dias) }));
        const forma = formas.find(f => f.id === primeira.formaPagamentoId);
        if (forma) setSelectedForma(forma);
      }
    } catch {
      setParcelasCondicao([]);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clienteId) { setError('Selecione o Cliente.'); return; }

    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        if (!form.numeroNota.trim()) { setError('Número da nota é obrigatório.'); setSaving(false); return; }
        if (form.valorParcela <= 0) { setError('Valor da parcela deve ser maior que zero.'); setSaving(false); return; }
        await ContaReceberService.update(Number(id), { ...form, formaPagamentoId: selectedForma?.id });
      } else {
        if (valorTotal <= 0) { setError('Informe o valor total.'); setSaving(false); return; }
        if (parcelasCondicao.length === 0) { setError('O cliente não possui condição de pagamento com parcelas cadastradas.'); setSaving(false); return; }
        const lote: ContaReceberLoteCreate = {
          clienteId: form.clienteId,
          valorTotal,
          dataEmissao: form.dataEmissao,
          observacao: form.observacao,
          status: form.status,
          ativo: true,
        };
        await ContaReceberService.createLote(lote);
      }
      navigate('/contas-receber');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      setError(axiosErr.response?.data?.message ?? 'Erro ao salvar. Verifique os dados e tente novamente.');
      setSaving(false);
    }
  }

  if (loading) return <div className="page-container"><div className="table-loading">Carregando...</div></div>;

  const previewParcelas = (!isEdit && parcelasCondicao.length > 0 && valorTotal > 0)
    ? parcelasCondicao.map(p => ({
        numero: p.numero,
        dataVencimento: addDias(form.dataEmissao, p.dias),
        valor: Math.round(valorTotal * p.percentual / 100 * 100) / 100,
        nomeFormaPagamento: p.nomeFormaPagamento ?? '—',
      }))
    : [];

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <div className="page-title-area">
            <TrendingUp size={24} className="page-title-icon" />
            <h1 className="page-title">{isEdit ? 'Editar Conta a Receber' : 'Nova Conta a Receber'}</h1>
          </div>
        </div>

        <div className="form-card">
          <form onSubmit={handleSave} className="form-page">

            {!isEdit ? (
              /* ───── MODO CRIAÇÃO ───── */
              <>
                <div className="form-section">
                  <h2 className="form-section-title">Dados do Plano</h2>

                  <div className="form-group">
                    <label>Cliente *</label>
                    <div className="lookup-field">
                      <input type="text" readOnly className="lookup-input"
                        value={selectedCliente ? `${selectedCliente.nome}${selectedCliente.nomeFantasia ? ` — ${selectedCliente.nomeFantasia}` : ''}` : ''}
                        placeholder="Selecione o cliente..." />
                      <button type="button" className="btn-lookup"
                        onClick={() => { setShowClienteLookup(true); setTimeout(() => clienteSearchRef.current?.focus(), 50); }}>
                        <Search size={15} />
                      </button>
                    </div>
                  </div>

                  {selectedCliente && !selectedCliente.idCondicaoPagamento && (
                    <p style={{ color: '#d97706', margin: '8px 0' }}>
                      ⚠️ Este cliente não possui condição de pagamento definida. Cadastre-a no perfil do cliente.
                    </p>
                  )}
                  {selectedCliente && selectedCliente.idCondicaoPagamento && parcelasCondicao.length === 0 && (
                    <p style={{ color: '#d97706', margin: '8px 0' }}>
                      ⚠️ A condição de pagamento deste cliente não possui parcelas cadastradas.
                    </p>
                  )}

                  {selectedCliente && (
                    <div className="form-group">
                      <label>Condição de Pagamento</label>
                      <div className="lookup-field">
                        <input type="text" readOnly className="lookup-input"
                          value={condicoes.find(c => c.id === selectedCondicaoId)?.nomeCondicao ?? ''}
                          placeholder="Selecione a condição..." />
                        <button type="button" className="btn-lookup"
                          onClick={() => { setShowCondicaoLookup(true); setTimeout(() => condicaoSearchRef.current?.focus(), 50); }}>
                          <Search size={15} />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label>Valor Total *</label>
                      <CurrencyInput value={valorTotal} onChange={setValorTotal} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="dataEmissao">Data de Emissão *</label>
                      <input id="dataEmissao" type="date"
                        value={form.dataEmissao}
                        onChange={e => setForm({ ...form, dataEmissao: e.target.value })} />
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

                {previewParcelas.length > 0 && (
                  <div className="form-section">
                    <h2 className="form-section-title">Parcelas que serão geradas</h2>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Nº</th>
                          <th>Vencimento</th>
                          <th>Valor</th>
                          <th>Forma de Pagamento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewParcelas.map(p => (
                          <tr key={p.numero}>
                            <td>{p.numero}</td>
                            <td>{new Date(p.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                            <td>{p.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                            <td>{p.nomeFormaPagamento}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="form-section">
                  <h2 className="form-section-title">Observações</h2>
                  <div className="form-group">
                    <textarea rows={3} placeholder="Observações adicionais..."
                      value={form.observacao ?? ''}
                      onChange={e => setForm({ ...form, observacao: e.target.value || undefined })}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>
              </>
            ) : (
              /* ───── MODO EDIÇÃO ───── */
              <>
                <div className="form-section">
                  <h2 className="form-section-title">Dados do Documento</h2>

                  <div className="form-group">
                    <label>Cliente *</label>
                    <div className="lookup-field">
                      <input type="text" readOnly className="lookup-input"
                        value={selectedCliente ? `${selectedCliente.nome}${selectedCliente.nomeFantasia ? ` — ${selectedCliente.nomeFantasia}` : ''}` : ''}
                        placeholder="Selecione o cliente..." />
                      <button type="button" className="btn-lookup"
                        onClick={() => { setShowClienteLookup(true); setTimeout(() => clienteSearchRef.current?.focus(), 50); }}>
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
                      <input id="modelo" type="text" placeholder="Ex: SE"
                        value={form.modelo}
                        onChange={e => setForm({ ...form, modelo: e.target.value.toUpperCase() })} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="serie">Série</label>
                      <input id="serie" type="text" placeholder="Ex: 001"
                        value={form.serie}
                        onChange={e => setForm({ ...form, serie: e.target.value.toUpperCase() })} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="numParcela">Nº Parcela</label>
                      <input id="numParcela" type="number" min={1}
                        value={form.numParcela}
                        onChange={e => {
                          const num = Number(e.target.value);
                          const parcela = parcelasCondicao.find(p => p.numero === num);
                          setForm(prev => ({
                            ...prev,
                            numParcela: num,
                            ...(parcela ? { dataVencimento: addDias(prev.dataEmissao, parcela.dias) } : {}),
                          }));
                          if (parcela) {
                            const forma = formas.find(f => f.id === parcela.formaPagamentoId);
                            if (forma) setSelectedForma(forma);
                          }
                        }} />
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

                <div className="form-section">
                  <h2 className="form-section-title">Recebimento</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="dataRecebimento">Data de Recebimento</label>
                      <input id="dataRecebimento" type="date"
                        value={form.dataRecebimento ?? ''}
                        onChange={e => setForm({ ...form, dataRecebimento: e.target.value || undefined })} />
                    </div>
                    <div className="form-group">
                      <label>Valor Recebido</label>
                      <CurrencyInput value={form.valorRecebido ?? 0} onChange={v => setForm({ ...form, valorRecebido: v || undefined })} />
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

                <div className="form-section">
                  <h2 className="form-section-title">Observações</h2>
                  <div className="form-group">
                    <textarea rows={3} placeholder="Observações adicionais..."
                      value={form.observacao ?? ''}
                      onChange={e => setForm({ ...form, observacao: e.target.value || undefined })}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>
              </>
            )}

            {error && <p className="form-error">{error}</p>}

            <div className="form-page-footer">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Salvando...' : (isEdit ? 'Salvar' : 'Confirmar')}
              </button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/contas-receber')}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lookup — Cliente */}
      {showClienteLookup && (
        <div className="modal-overlay" onClick={() => setShowClienteLookup(false)}>
          <div className="modal modal-lookup" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Selecionar Cliente</h2>
              <button className="modal-close" onClick={() => setShowClienteLookup(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="lookup-search-bar">
                <Search size={16} className="lookup-search-icon" />
                <input ref={clienteSearchRef} type="text" placeholder="Buscar cliente..."
                  value={clienteSearch} onChange={e => setClienteSearch(e.target.value)} />
              </div>
              <div className="lookup-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: 56 }}>#</th>
                      <th>Nome</th>
                      <th style={{ width: 80 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesFiltrados.length === 0 ? (
                      <tr><td colSpan={3} className="table-empty">Nenhum resultado.</td></tr>
                    ) : clientesFiltrados.map(c => (
                      <tr key={c.id}>
                        <td className="col-id">{c.id}</td>
                        <td>{c.nome}{c.nomeFantasia ? ` — ${c.nomeFantasia}` : ''}</td>
                        <td>
                          <button className="btn-select" onClick={async () => {
                            setSelectedCliente(c);
                            setForm(prev => ({ ...prev, clienteId: c.id }));
                            setShowClienteLookup(false);
                            setClienteSearch('');
                            if (c.idCondicaoPagamento) {
                              setSelectedCondicaoId(c.idCondicaoPagamento);
                              await carregarParcelas(c.idCondicaoPagamento);
                            } else {
                              setSelectedCondicaoId(undefined);
                              setParcelasCondicao([]);
                            }
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

      {/* Lookup — Condição de Pagamento */}
      {showCondicaoLookup && (
        <div className="modal-overlay" onClick={() => setShowCondicaoLookup(false)}>
          <div className="modal modal-lookup" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Selecionar Condição de Pagamento</h2>
              <button className="modal-close" onClick={() => setShowCondicaoLookup(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="lookup-search-bar">
                <Search size={16} className="lookup-search-icon" />
                <input ref={condicaoSearchRef} type="text" placeholder="Buscar condição..."
                  value={condicaoSearch} onChange={e => setCondicaoSearch(e.target.value)} />
              </div>
              <div className="lookup-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: 56 }}>#</th>
                      <th>Condição de Pagamento</th>
                      <th style={{ width: 80 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {condicoes.filter(c => c.nomeCondicao.toLowerCase().includes(condicaoSearch.toLowerCase())).length === 0 ? (
                      <tr><td colSpan={3} className="table-empty">Nenhum resultado.</td></tr>
                    ) : condicoes.filter(c => c.nomeCondicao.toLowerCase().includes(condicaoSearch.toLowerCase())).map(c => (
                      <tr key={c.id}>
                        <td className="col-id">{c.id}</td>
                        <td>{c.nomeCondicao}</td>
                        <td>
                          <button className="btn-select" onClick={async () => {
                            setSelectedCondicaoId(c.id);
                            setShowCondicaoLookup(false);
                            setCondicaoSearch('');
                            await carregarParcelas(c.id);
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
