import { useEffect, useRef, useState } from 'react';
import { X, Search } from 'lucide-react';
import { CondicaoPagamentoService } from '../services/condicaoPagamentoService';
import { ParcelaCondicaoPagamentoService } from '../services/parcelaCondicaoPagamentoService';
import { FormaPagamentoService } from '../services/formaPagamentoService';
import type { CondicaoPagamentoCreate, FormaPagamentoView } from '../types/entities';
import '../pages/PaisesPage.css';

interface Props {
  onCreated: (id: number, nome: string) => void;
  onClose: () => void;
  zBase?: number;
}

interface ParcelaLocal {
  _key: number;
  numero: number;
  dias: number;
  percentual: number;
  formaPagamentoId: number;
}

let _key = 1;
function nextKey() { return _key++; }

export default function CondicaoPagamentoCreateModal({ onCreated, onClose, zBase = 1100 }: Props) {
  const [nomeBase, setNomeBase] = useState('');
  const [form, setForm] = useState<CondicaoPagamentoCreate>({
    nomeCondicao: '', taxaJuros: 0, multa: 0, desconto: 0, ativo: true,
  });
  const [formas, setFormas] = useState<FormaPagamentoView[]>([]);
  const [selectedForma, setSelectedForma] = useState<FormaPagamentoView | null>(null);
  const [parcelas, setParcelas] = useState<ParcelaLocal[]>([]);
  const [numGerar, setNumGerar] = useState(1);
  const [showFormaLookup, setShowFormaLookup] = useState(false);
  const [formaSearch, setFormaSearch] = useState('');
  const formaSearchRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    FormaPagamentoService.getAll().then(r => setFormas(r.data.filter(f => f.ativo)));
  }, []);

  const aceitaParcela = selectedForma?.aceitaParcela ?? false;
  const somaPercent = parcelas.reduce((acc, p) => acc + (Number(p.percentual) || 0), 0);
  const somaOk = Math.abs(somaPercent - 100) < 0.01;
  const nomeCompleto = nomeBase
    ? selectedForma ? `${nomeBase} (${selectedForma.nomeFormaPagamento.toUpperCase()})` : nomeBase
    : '';
  const formasFiltradas = formas.filter(f =>
    f.nomeFormaPagamento.toLowerCase().includes(formaSearch.toLowerCase())
  );

  function handleSelectForma(forma: FormaPagamentoView) {
    setSelectedForma(forma);
    setShowFormaLookup(false);
    setFormaSearch('');
    const derivado = nomeBase ? `${nomeBase} (${forma.nomeFormaPagamento.toUpperCase()})` : '';
    setForm(prev => ({ ...prev, nomeCondicao: derivado }));
    if (!forma.aceitaParcela) {
      setParcelas([{ _key: nextKey(), numero: 1, dias: 0, percentual: 100, formaPagamentoId: forma.id }]);
    } else {
      setParcelas(prev => prev.map(p => ({ ...p, formaPagamentoId: forma.id })));
    }
  }

  function handleGerar() {
    if (!selectedForma) return;
    const n = Math.max(1, numGerar);
    const base = parseFloat((100 / n).toFixed(2));
    setParcelas(Array.from({ length: n }, (_, i) => ({
      _key: nextKey(), numero: i + 1, dias: (i + 1) * 30,
      percentual: i < n - 1 ? base : parseFloat((100 - base * (n - 1)).toFixed(2)),
      formaPagamentoId: selectedForma.id,
    })));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!nomeBase.trim()) { setError('Condição de Pagamento é obrigatória.'); return; }
    if (!selectedForma) { setError('Selecione a Forma de Pagamento.'); return; }
    if (aceitaParcela && !somaOk) { setError(`Soma dos percentuais deve ser 100%. Atual: ${somaPercent.toFixed(2)}%`); return; }

    setSaving(true);
    setError('');
    try {
      const res = await CondicaoPagamentoService.create({ ...form, nomeCondicao: nomeCompleto });
      const condicaoId = res.data.id;
      await Promise.all(parcelas.map(p =>
        ParcelaCondicaoPagamentoService.create({
          numero: p.numero, dias: p.dias, percentual: p.percentual,
          condicaoPagamentoId: condicaoId, formaPagamentoId: selectedForma.id, ativo: true,
        })
      ));
      onCreated(condicaoId, nomeCompleto);
    } catch {
      setError('Erro ao salvar. Verifique os dados e tente novamente.');
      setSaving(false);
    }
  }

  return (
    <>
      <div className="modal-overlay" style={{ zIndex: zBase }} onClick={onClose}>
        <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Nova Condição de Pagamento</h2>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>
          <form onSubmit={handleSave}>
            <div className="modal-form">

              <div className="form-group">
                <label>Condição de Pagamento *</label>
                <input
                  type="text"
                  placeholder="Ex: À VISTA, 30/60 DIAS..."
                  value={nomeBase}
                  onChange={e => {
                    const v = e.target.value.toUpperCase();
                    setNomeBase(v);
                    const derivado = selectedForma ? `${v} (${selectedForma.nomeFormaPagamento.toUpperCase()})` : v;
                    setForm(prev => ({ ...prev, nomeCondicao: derivado }));
                  }}
                  autoFocus
                />
                {nomeCompleto && (
                  <small style={{ color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                    Nome completo: <strong>{nomeCompleto}</strong>
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Forma de Pagamento *</label>
                <div className="lookup-field">
                  <input type="text" readOnly className="lookup-input"
                    value={selectedForma?.nomeFormaPagamento ?? ''}
                    placeholder="Selecione a forma de pagamento..." />
                  <button type="button" className="btn-lookup"
                    onClick={() => { setShowFormaLookup(true); setTimeout(() => formaSearchRef.current?.focus(), 50); }}>
                    <Search size={15} />
                  </button>
                </div>
                {selectedForma && (
                  <small style={{ color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                    {selectedForma.aceitaParcela ? '✓ Aceita parcelamento' : '— Pagamento à vista (sem parcelas)'}
                  </small>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Juros por atraso (%/mês)</label>
                  <input type="number" min={0} step={0.01} placeholder="0,00"
                    value={form.taxaJuros}
                    onChange={e => setForm({ ...form, taxaJuros: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Multa por atraso (%)</label>
                  <input type="number" min={0} step={0.01} placeholder="0,00"
                    value={form.multa}
                    onChange={e => setForm({ ...form, multa: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Desconto pontualidade (%)</label>
                  <input type="number" min={0} step={0.01} placeholder="0,00"
                    value={form.desconto}
                    onChange={e => setForm({ ...form, desconto: Number(e.target.value) })} />
                </div>
              </div>

              {aceitaParcela && (
                <>
                  <div style={{ borderTop: '1px solid var(--border-color)', margin: '8px 0 16px' }} />
                  <h3 className="form-section-title" style={{ marginBottom: 12 }}>Parcelas</h3>
                  <div className="parcelas-toolbar" style={{ marginTop: 8 }}>
                    <div className="parcelas-gerar-group">
                      <input type="number" min={1} max={99} value={numGerar}
                        onChange={e => setNumGerar(Math.max(1, Number(e.target.value)))}
                        className="parcelas-num-input" placeholder="Nº Parcelas" />
                      <button type="button" className="btn-primary" onClick={handleGerar}>
                        Gerar Parcelas
                      </button>
                    </div>
                    <div className={`parcelas-soma ${somaOk ? 'soma-ok' : 'soma-err'}`}>
                      Soma: {somaPercent.toFixed(2)}%
                      <span className={`soma-badge ${somaOk ? 'soma-badge-ok' : ''}`}>
                        {somaOk ? '✓ 100%' : '≠ 100%'}
                      </span>
                    </div>
                  </div>
                  {parcelas.length > 0 && (
                    <div className="lookup-table-wrap" style={{ maxHeight: 'none', marginTop: 8 }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th style={{ width: 48 }}>Nº</th>
                            <th>Dias</th>
                            <th>Percentual (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parcelas.map(p => (
                            <tr key={p._key}>
                              <td className="col-id">{p.numero}</td>
                              <td>
                                <input type="number" min={0} value={p.dias} className="parcela-cell-input"
                                  onChange={e => setParcelas(prev => prev.map(x => x._key === p._key ? { ...x, dias: Number(e.target.value) } : x))} />
                              </td>
                              <td>
                                <input type="number" min={0} max={100} step={0.01} value={p.percentual} className="parcela-cell-input"
                                  onChange={e => setParcelas(prev => prev.map(x => x._key === p._key ? { ...x, percentual: Number(e.target.value) } : x))} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {error && <p className="form-error">{error}</p>}
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>

      {/* Lookup Forma de Pagamento */}
      {showFormaLookup && (
        <div className="modal-overlay" style={{ zIndex: zBase + 100 }} onClick={() => setShowFormaLookup(false)}>
          <div className="modal modal-lookup" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Selecionar Forma de Pagamento</h2>
              <button className="modal-close" onClick={() => setShowFormaLookup(false)}><X size={18} /></button>
            </div>
            <div className="modal-body lookup-modal-body">
              <div className="lookup-search-bar">
                <Search size={15} className="lookup-search-icon" />
                <input ref={formaSearchRef} type="text" placeholder="Pesquisar por nome..."
                  value={formaSearch} onChange={e => setFormaSearch(e.target.value)} autoFocus />
              </div>
              <div className="lookup-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>FORMA DE PAGAMENTO</th>
                      <th style={{ width: 100 }}>PARCELA</th>
                      <th style={{ width: 110 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formasFiltradas.length === 0 ? (
                      <tr><td colSpan={3} className="table-empty">Nenhum resultado.</td></tr>
                    ) : formasFiltradas.map(f => (
                      <tr key={f.id}>
                        <td>{f.nomeFormaPagamento}</td>
                        <td>{f.aceitaParcela ? 'Sim' : 'Não'}</td>
                        <td>
                          <button className="btn-select" onClick={() => handleSelectForma(f)}>
                            Selecionar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" type="button" onClick={() => setShowFormaLookup(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
