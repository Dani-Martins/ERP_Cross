import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TrendingUp, Search } from 'lucide-react';
import { ContaReceberService } from '../services/contasService';
import { ClienteService } from '../services/clienteService';
import { FormaPagamentoService } from '../services/formaPagamentoService';
import type { ContaReceberCreate, ContaReceberParcelasCreate, ClienteView, FormaPagamentoView } from '../types/entities';
import type { AxiosError } from 'axios';
import CurrencyInput from '../components/CurrencyInput';
import ClienteLookupModal from '../components/ClienteLookupModal';
import FormaPagamentoLookupModal from '../components/FormaPagamentoLookupModal';
import './PaisesPage.css';

const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().substring(0, 10);

type ParcelaRow = { dataRecebimento?: string; percentual: number };

function percentuaisIguais(n: number) {
  const base = Math.floor((100 / n) * 100) / 100;
  return Array.from({ length: n }, (_, i) => i === n - 1
    ? Math.round((100 - base * (n - 1)) * 100) / 100
    : base);
}

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().substring(0, 10);
}

const EMPTY: ContaReceberCreate = {
  numeroNota: '', modelo: '', serie: '', clienteId: 0,
  numParcela: 1, valorParcela: 0,
  dataEmissao: today(), dataVencimento: today(),
  juros: 0, multa: 0, desconto: 0,
  status: 'ABERTO', ativo: true,
};

function fmtMoeda(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ContaReceberFormPage({ contaId, onClose }: { contaId?: number; onClose?: () => void } = {}) {
  const routeParams = useParams<{ id: string }>();
  const id = contaId?.toString() ?? routeParams.id;
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<ContaReceberCreate>(EMPTY);
  const [parcelas, setParcelas] = useState<ParcelaRow[]>([{ percentual: 100 }]);
  const [valorTotal, setValorTotal] = useState(0);
  const [vencPrimeira, setVencPrimeira] = useState<string | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<ClienteView | null>(null);
  const [selectedForma, setSelectedForma] = useState<FormaPagamentoView | null>(null);
  const [clientes, setClientes] = useState<ClienteView[]>([]);
  const [formas, setFormas] = useState<FormaPagamentoView[]>([]);
  const [showClienteLookup, setShowClienteLookup] = useState(false);
  const [showFormaLookup, setShowFormaLookup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [nextId, setNextId] = useState('1');

  useEffect(() => {
    if (!isEdit) {
      ContaReceberService.getAll()
        .then(res => {
          const maxId = res.data.length > 0
            ? Math.max(...res.data.map(c => c.id))
            : 0;
          setNextId(String(maxId + 1));
        })
        .catch(() => setNextId('1'));
    }
    Promise.all([
      ClienteService.getAll().then(r => setClientes(r.data.filter(c => c.ativo))),
      FormaPagamentoService.getAll().then(r => setFormas(r.data.filter(f => f.ativo))),
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
          setNextId(String(c.id));
        }).catch(() => navigate('/contas-receber'));
      }
    }).finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  function isoDate(s: string) {
    if (!s) return today();
    const parts = s.split('/');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return s.substring(0, 10);
  }

  const primeiroVencimento = vencPrimeira ?? (parcelas.length > 1 ? addDays(form.dataEmissao, 30) : form.dataEmissao);
  const vencimentos = parcelas.map((_, index) => addDays(primeiroVencimento, 30 * index));
  const valoresParcelas = parcelas.reduce<number[]>((values, parcela, index) => {
    const accumulated = values.reduce((sum, value) => sum + value, 0);
    const amount = index === parcelas.length - 1
      ? Math.round((valorTotal - accumulated) * 100) / 100
      : Math.round(valorTotal * parcela.percentual) / 100;
    values.push(amount);
    return values;
  }, []);

  function setQtdParcelas(qtd: number) {
    const count = Math.min(360, Math.max(1, qtd || 1));
    setForm(current => ({ ...current, numParcela: count }));
    setParcelas(current => percentuaisIguais(count).map((percentual, index) => ({
      dataRecebimento: current[index]?.dataRecebimento,
      percentual,
    })));
  }

  function updateParcela(index: number, patch: Partial<ParcelaRow>) {
    setParcelas(current => current.map((parcela, itemIndex) => itemIndex === index ? { ...parcela, ...patch } : parcela));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        if (!form.clienteId) { setError('Selecione o Cliente.'); setSaving(false); return; }
        if (!form.numeroNota.trim()) { setError('Número da nota é obrigatório.'); setSaving(false); return; }
        if (form.valorParcela <= 0) { setError('Valor da parcela deve ser maior que zero.'); setSaving(false); return; }
        await ContaReceberService.update(Number(id), { ...form, formaPagamentoId: selectedForma?.id });
      } else {
        if (!form.clienteId) { setError('Selecione o Cliente.'); setSaving(false); return; }
        if (!form.numeroNota.trim() || !form.modelo.trim() || !form.serie.trim()) { setError('Número, modelo e série são obrigatórios.'); setSaving(false); return; }
        if (valorTotal <= 0) { setError('Informe um valor total maior que zero.'); setSaving(false); return; }
        if (!selectedForma) { setError('Selecione a Forma de Pagamento.'); setSaving(false); return; }

        const payload: ContaReceberParcelasCreate = {
          numeroNota: form.numeroNota,
          modelo: form.modelo,
          serie: form.serie,
          clienteId: form.clienteId,
          dataEmissao: form.dataEmissao,
          formaPagamentoId: selectedForma.id,
          juros: form.juros,
          multa: form.multa,
          desconto: form.desconto,
          observacao: form.observacao,
          parcelas: parcelas.map((parcela, index) => ({
            numParcela: index + 1,
            dataVencimento: vencimentos[index],
            valorParcela: valoresParcelas[index],
            dataRecebimento: parcela.dataRecebimento,
          })),
        };
        await ContaReceberService.createParcelas(payload);
      }
      if (onClose) onClose();
      else navigate('/contas-receber');
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
                  <h2 className="form-section-title">Dados do Documento</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="dataEmissao">Data de Emissão *</label>
                      <input id="dataEmissao" type="date" value={form.dataEmissao}
                        max={today()} onChange={e => { setForm({ ...form, dataEmissao: e.target.value }); setVencPrimeira(null); }} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="numeroNota">Número da Nota *</label>
                      <input id="numeroNota" type="text" value={form.numeroNota}
                        onChange={e => setForm({ ...form, numeroNota: e.target.value.toUpperCase() })} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="serie">Série *</label>
                      <input id="serie" type="text" value={form.serie}
                        onChange={e => setForm({ ...form, serie: e.target.value.toUpperCase() })} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="modelo">Modelo *</label>
                      <input id="modelo" type="text" value={form.modelo}
                        onChange={e => setForm({ ...form, modelo: e.target.value.toUpperCase() })} />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h2 className="form-section-title">Cliente e Forma de Pagamento</h2>
                  <div className="form-row">
                    <div className="form-group lookup-code-group">
                      <label>Cód.</label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input type="text" value={form.clienteId || ''} placeholder="ID" readOnly className="lookup-input" style={{ width: '100%', textAlign: 'center' }} />
                        <button type="button" className="btn-lookup" onClick={() => setShowClienteLookup(true)} title="Pesquisar cliente" style={{ padding: '4px 8px' }}>
                          <Search size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Cliente *</label>
                      <input type="text" readOnly className="lookup-input" value={selectedCliente?.nome ?? ''} placeholder="Selecione um cliente..." />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group lookup-code-group">
                      <label>Cód.</label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input type="text" value={selectedForma?.id ?? ''} placeholder="ID" readOnly className="lookup-input" style={{ width: '100%', textAlign: 'center' }} />
                        <button type="button" className="btn-lookup" onClick={() => setShowFormaLookup(true)} title="Pesquisar forma de pagamento" style={{ padding: '4px 8px' }}>
                          <Search size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Forma de Pagamento *</label>
                      <input type="text" readOnly className="lookup-input" value={selectedForma?.nomeFormaPagamento ?? ''} placeholder="Selecione uma forma de pagamento..." />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h2 className="form-section-title">Valor e Parcelamento</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Valor Total *</label>
                      <CurrencyInput value={valorTotal} onChange={setValorTotal} />
                    </div>
                    <div className="form-group" style={{ flex: '0 0 130px' }}>
                      <label htmlFor="numParcela">Nº de Parcelas *</label>
                      <input id="numParcela" type="number" min={1} max={360} value={form.numParcela}
                        onChange={e => setQtdParcelas(Number(e.target.value))} />
                    </div>
                  </div>
                  <table className="data-table" style={{ marginTop: 12 }}>
                    <thead><tr><th>Parcela</th><th>Vencimento</th><th>Valor</th><th>Data de Recebimento</th></tr></thead>
                    <tbody>
                      {parcelas.map((parcela, index) => (
                        <tr key={index}>
                          <td>{index + 1}/{parcelas.length}</td>
                          <td><input type="date" value={vencimentos[index]} disabled={index > 0}
                            onChange={e => e.target.value && setVencPrimeira(e.target.value)} /></td>
                          <td>{fmtMoeda(valoresParcelas[index] ?? 0)}</td>
                          <td><input type="date" value={parcela.dataRecebimento ?? ''} max={today()}
                            onChange={e => updateParcela(index, { dataRecebimento: e.target.value || undefined })} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, fontWeight: 700, marginTop: 16 }}>
                    <span>Total:</span><span>{fmtMoeda(valoresParcelas.reduce((sum, value) => sum + value, 0))}</span>
                  </div>
                </div>

                <div className="form-section">
                  <h2 className="form-section-title">Observações</h2>
                  <div className="form-group">
                    <textarea rows={3} placeholder="Observações adicionais..." value={form.observacao ?? ''}
                      onChange={e => setForm({ ...form, observacao: e.target.value.toUpperCase() || undefined })} style={{ resize: 'vertical' }} />
                  </div>
                </div>
              </>
            ) : (
              /* ───── MODO EDIÇÃO ───── */
              <>
                <div className="form-section">
                  <h2 className="form-section-title">Dados do Documento</h2>

                  <div className="form-group">
                    <label htmlFor="id">Código *</label>
                    <input
                      id="id"
                      type="text"
                      readOnly
                      value={nextId}
                      style={{
                        width: '120px',
                        padding: '6px',
                        fontSize: '0.8rem',
                        textAlign: 'center'
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Cliente *</label>
                    <div className="lookup-field">
                      <input type="text" readOnly className="lookup-input"
                        value={selectedCliente?.nome ?? ''}
                        placeholder="Selecione o cliente..." />
                      <button type="button" className="btn-lookup"
                        onClick={() => setShowClienteLookup(true)}>
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
                          onClick={() => setShowFormaLookup(true)}>
                          <Search size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h2 className="form-section-title">Taxas</h2>
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
                      onChange={e => setForm({ ...form, observacao: e.target.value.toUpperCase() || undefined })}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>
              </>
            )}

            {error && <p className="form-error">{error}</p>}

            <div className="form-page-footer">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => onClose ? onClose() : navigate('/contas-receber')}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lookup — Cliente */}
      {showClienteLookup && (
        <ClienteLookupModal
          onClose={() => setShowClienteLookup(false)}
          onSelect={(id, _nome) => {
            setSelectedCliente(clientes.find(c => c.id === id) || null);
            setForm(prev => ({ ...prev, clienteId: id }));
            setShowClienteLookup(false);
          }}
        />
      )}

      {/* Lookup — Forma de Pagamento */}
      {showFormaLookup && (
        <FormaPagamentoLookupModal
          onClose={() => setShowFormaLookup(false)}
          onSelect={(id, _nome) => {
            setSelectedForma(formas.find(f => f.id === id) || null);
            setForm(prev => ({ ...prev, formaPagamentoId: id }));
            setShowFormaLookup(false);
          }}
        />
      )}
    </>
  );
}


