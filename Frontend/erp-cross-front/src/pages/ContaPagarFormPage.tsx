import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TrendingDown, Search } from 'lucide-react';
import { ContaPagarService } from '../services/contasService';
import { FornecedorService } from '../services/fornecedorService';
import { FormaPagamentoService } from '../services/formaPagamentoService';
import type { ContaPagarCreate, ContaPagarParcelaInput, FornecedorView, FormaPagamentoView } from '../types/entities';
import FornecedorLookupModal from '../components/FornecedorLookupModal';
import FormaPagamentoLookupModal from '../components/FormaPagamentoLookupModal';
import type { AxiosError } from 'axios';
import CurrencyInput from '../components/CurrencyInput';
import './PaisesPage.css';

const today = () => new Date().toISOString().substring(0, 10);

type FormState = Omit<ContaPagarCreate, 'parcelas'>;
type ParcelaRow = { dataPagamento?: string; percentual: number };

// Divide 100% igualmente; a última absorve a diferença
function percentuaisIguais(n: number) {
  const base = Math.floor((100 / n) * 100) / 100;
  return Array.from({ length: n }, (_, i) =>
    i === n - 1 ? Math.round((100 - base * (n - 1)) * 100) / 100 : base);
}

const EMPTY: FormState = {
  fornecedorId: 0, modelo: '', serie: '', numeroNota: '',
  dataEmissao: today(),
  juros: 0, multa: 0, desconto: 0,
  status: 'ABERTO', ativo: true,
};

function addDays(iso: string, days: number) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().substring(0, 10);
}

export default function ContaPagarFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [parcelas, setParcelas] = useState<ParcelaRow[]>([{ percentual: 100 }]);
  // null = vencimento padrão calculado a partir da emissão
  const [vencPrimeira, setVencPrimeira] = useState<string | null>(null);
  const [valorBruto, setValorBruto] = useState(0);
  const [selectedFornecedor, setSelectedFornecedor] = useState<FornecedorView | null>(null);
  const [selectedForma, setSelectedForma] = useState<FormaPagamentoView | null>(null);
  const [fornecedores, setFornecedores] = useState<FornecedorView[]>([]);
  const [formas, setFormas] = useState<FormaPagamentoView[]>([]);
  const [showFornecedorLookup, setShowFornecedorLookup] = useState(false);
  const [showFormaLookup, setShowFormaLookup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [nextId, setNextId] = useState('1');

  useEffect(() => {
    if (!isEdit) {
      ContaPagarService.getAll()
        .then(res => {
          const maxId = res.data.length > 0
            ? Math.max(...res.data.map(c => c.id))
            : 0;
          setNextId(String(maxId + 1));
        })
        .catch(() => setNextId('1'));
    }
    Promise.all([
      FornecedorService.getAll().then(r => setFornecedores(r.data)),
      FormaPagamentoService.getAll().then(r => setFormas(r.data.filter(f => f.ativo))),
    ]).then(() => {
      if (isEdit) {
        ContaPagarService.getById(Number(id)).then(r => {
          const c = r.data;
          setForm({
            notaCompraId: c.notaCompraId,
            fornecedorId: c.fornecedorId,
            modelo: c.modelo, serie: c.serie, numeroNota: c.numeroNota,
            dataEmissao: isoDate(c.dataEmissao),
            juros: c.juros, multa: c.multa, desconto: c.desconto,
            status: c.status, ativo: c.ativo, formaPagamentoId: c.formaPagamentoId, observacao: c.observacao,
          })
          ContaPagarService.getParcelas(c.id).then(p => {
            // Desfaz juros e desconto de cada parcela para recuperar o valor base e o percentual
            const bases = p.data.map((x, i) => {
              const fator = Math.pow(1 + c.juros / 100, i) * (1 - c.desconto / 100);
              return x.valorParcela / (fator > 0 ? fator : 1);
            });
            const soma = bases.reduce((s, v) => s + v, 0);
            setValorBruto(Math.round(soma * 100) / 100);
            setParcelas(p.data.map((x, i) => ({
              dataPagamento: x.pago && x.dataPagamento ? isoDate(x.dataPagamento) : undefined,
              percentual: soma > 0 ? Math.round((bases[i] / soma) * 10000) / 100 : 0,
            })));
            if (p.data.length > 0) setVencPrimeira(isoDate(p.data[0].dataVencimento));
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
          setNextId(String(c.id));
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

  // Com mais de uma parcela, a 1ª vence 30 dias após a emissão; com uma só, no dia da emissão
  const primeiroVenc = vencPrimeira ?? (parcelas.length > 1 ? addDays(form.dataEmissao, 30) : form.dataEmissao);
  const vencimentos = parcelas.map((_, i) => addDays(primeiroVenc, 30 * i));

  // Valor bruto distribuído conforme o percentual de cada parcela
  // Mesma regra das notas: valor \u00d7 percentual de cada parcela, a \u00faltima fecha o total
  const valoresBase = parcelas.reduce<number[]>((acc, p, i) => {
    const ultima = i === parcelas.length - 1;
    const acumulado = acc.reduce((s, v) => s + v, 0);
    acc.push(ultima
      ? Math.round((valorBruto - acumulado) * 100) / 100
      : Math.round(valorBruto * (p.percentual || 0)) / 100);
    return acc;
  }, []);

  // Juros compostos por parcela (a 1ª não tem); o desconto vale enquanto não houver atraso
  const valoresNoPrazo = valoresBase.map((base, i) =>
    Math.round(base * Math.pow(1 + form.juros / 100, i) * (1 - form.desconto / 100) * 100) / 100);

  // Pago com atraso perde o desconto e ganha multa
  const valores = valoresNoPrazo.map((noPrazo, i) => {
    const pag = parcelas[i].dataPagamento;
    if (!pag) return noPrazo;
    const dias = Math.round((Date.parse(pag) - Date.parse(vencimentos[i])) / 86400000);
    if (dias <= 0) return noPrazo;
    const semDesconto = form.desconto < 100 ? noPrazo / (1 - form.desconto / 100) : noPrazo;
    return Math.round(semDesconto * (1 + form.multa / 100) * 100) / 100;
  });
  const valorTotal = valores.reduce((s, v) => s + v, 0);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fornecedorId) { setError('Selecione o Fornecedor.'); return; }
    if (!form.numeroNota.trim()) { setError('Número da nota é obrigatório.'); return; }
    if (valorBruto <= 0) { setError('Informe o valor total da compra.'); return; }
    if (!form.formaPagamentoId) { setError('Forma de Pagamento é obrigatória.'); return; }

    setSaving(true);
    setError('');
    try {
      const itens: ContaPagarParcelaInput[] = parcelas.map((p, i) => ({
        dataVencimento: vencimentos[i], dataPagamento: p.dataPagamento, valorParcela: valoresNoPrazo[i],
      }));
      const payload = { ...form, parcelas: itens, formaPagamentoId: selectedForma?.id };
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

  const fmtMoeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  function setQtdParcelas(qtd: number) {
    const n = Math.min(360, Math.max(1, qtd || 1));
    setParcelas(prev => {
      const pct = percentuaisIguais(n);
      return pct.map((percentual, i) => ({ dataPagamento: prev[i]?.dataPagamento, percentual }));
    });
  }

  function updateParcela(i: number, patch: Partial<ParcelaRow>) {
    setParcelas(prev => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }

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

            {/* Dados da Nota */}
            <div className="form-section">
              <h2 className="form-section-title">Dados da Nota</h2>

              <div className="form-group id-field">
                <label htmlFor="id">Código</label>
                <input id="id" type="text" readOnly value={nextId} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dataEmissao">Data de Emissão *</label>
                  <input id="dataEmissao" type="date" value={form.dataEmissao} max={today()} onChange={e => { setForm({ ...form, dataEmissao: e.target.value }); if (!isEdit) setVencPrimeira(null); }} />
                </div>
                <div className="form-group">
                  <label htmlFor="numeroNota">Número da Nota *</label>
                  <input id="numeroNota" type="text" placeholder="Ex: 000001" value={form.numeroNota} onChange={e => setForm({ ...form, numeroNota: e.target.value.toUpperCase() })} />
                </div>
                <div className="form-group">
                  <label htmlFor="serie">Série</label>
                  <input id="serie" type="text" placeholder="Ex: 1" value={form.serie} onChange={e => setForm({ ...form, serie: e.target.value.toUpperCase() })} />
                </div>
                <div className="form-group">
                  <label htmlFor="modelo">Modelo</label>
                  <input id="modelo" type="text" placeholder="Ex: 55" value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value.toUpperCase() })} />
                </div>
              </div>
            </div>

            {/* Fornecedor e Forma de Pagamento */}
            <div className="form-section">
              <h2 className="form-section-title">Fornecedor e Pagamento</h2>

              <div className="form-row">
                <div className="form-group lookup-code-group">
                  <label>Cód.</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input type="text" value={form.fornecedorId > 0 ? form.fornecedorId : ''} placeholder="ID" readOnly className="lookup-input" style={{ width: '100%', textAlign: 'center' }} />
                    <button type="button" className="btn-lookup" onClick={() => setShowFornecedorLookup(true)} title="Pesquisar fornecedor" style={{ padding: '4px 8px' }}>
                      <Search size={16} />
                    </button>
                  </div>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Fornecedor *</label>
                  <input type="text" readOnly className="lookup-input" value={selectedFornecedor?.nome ?? ''} placeholder="Selecione um fornecedor..." />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group lookup-code-group">
                  <label>Cód.</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input type="text" value={(form.formaPagamentoId ?? 0) > 0 ? form.formaPagamentoId ?? 0 : ''} placeholder="ID" readOnly className="lookup-input" style={{ width: '100%', textAlign: 'center' }} />
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

            {/* Valor da compra */}
            <div className="form-section">
              <h2 className="form-section-title">Valor da Compra</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="valorBruto">Valor Total *</label>
                  <CurrencyInput id="valorBruto" value={valorBruto} onChange={setValorBruto} />
                </div>
                <div className="form-group" style={{ flex: '0 0 100px' }}>
                  <label htmlFor="numParcela">Nº de Parcelas *</label>
                  <input id="numParcela" type="number" min={1} value={parcelas.length} onChange={e => setQtdParcelas(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            {/* Taxas */}
            <div className="form-section">
              <h2 className="form-section-title">Taxas</h2>

              <div className="form-row">
                <div className="form-group" style={{ flex: '0 0 120px' }}>
                  <label htmlFor="taxaJuros">Juros por parcela (%)</label>
                  <input id="taxaJuros" type="number" min={0} step={0.01} placeholder="0,00" value={form.juros} onChange={e => setForm({ ...form, juros: Number(e.target.value) })} style={{ width: '100%' }} />
                </div>
                <div className="form-group" style={{ flex: '0 0 120px' }}>
                  <label htmlFor="multa">Multa por atraso (%)</label>
                  <input id="multa" type="number" min={0} step={0.01} placeholder="0,00" value={form.multa} onChange={e => setForm({ ...form, multa: Number(e.target.value) })} style={{ width: '100%' }} />
                </div>
                <div className="form-group" style={{ flex: '0 0 120px' }}>
                  <label htmlFor="desconto">Desconto pontualidade (%)</label>
                  <input id="desconto" type="number" min={0} step={0.01} placeholder="0,00" value={form.desconto} onChange={e => setForm({ ...form, desconto: Number(e.target.value) })} style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            {/* Parcelas */}
            <div className="form-section">
              <h2 className="form-section-title">Parcelas</h2>
              <p className="form-hint">Preencha a data de pagamento apenas nas parcelas que já foram pagas.</p>

              <table className="data-table" style={{ marginTop: 12 }}>
                <thead>
                  <tr><th>Parcela</th><th>Vencimento</th><th>Valor</th><th>Data de Pagamento</th></tr>
                </thead>
                <tbody>
                  {parcelas.map((p, i) => (
                    <tr key={i}>
                      <td>{i + 1}/{parcelas.length}</td>
                      <td>
                        <div className="form-group">
                          <input type="date" value={vencimentos[i]} disabled={i > 0}
                            onChange={e => e.target.value && setVencPrimeira(e.target.value)} />
                        </div>
                      </td>
                      <td>{fmtMoeda(valores[i])}</td>
                      <td>
                        <div className="form-group">
                          <input type="date" value={p.dataPagamento ?? ''} max={today()} onChange={e => updateParcela(i, { dataPagamento: e.target.value || undefined })} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sumário de Total */}
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              padding: '20px',
              borderRadius: '4px',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '1.1em',
                fontWeight: '700',
                color: 'var(--text-secondary)',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span>Total:</span>
                <span style={{ fontSize: '1.4em', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {fmtMoeda(valorTotal)}
                </span>
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
        <FornecedorLookupModal
          onClose={() => setShowFornecedorLookup(false)}
          onSelect={(id, _nome) => {
            setSelectedFornecedor(fornecedores.find(f => f.id === id) || null);
            setForm(prev => ({ ...prev, fornecedorId: id }));
            setShowFornecedorLookup(false);
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
