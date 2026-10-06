import { useState, useEffect } from 'react';
import { X, Search, Trash2 } from 'lucide-react';
import { CondicaoPagamentoService } from '../services/condicaoPagamentoService';
import { ParcelaCondicaoPagamentoService } from '../services/parcelaCondicaoPagamentoService';
import { FormaPagamentoService } from '../services/formaPagamentoService';
import type { CondicaoPagamentoCreate, FormaPagamentoView } from '../types/entities';
import FormaPagamentoLookupModal from './FormaPagamentoLookupModal';
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
  const [nextId, setNextId] = useState<string>('');
  const [nomeBase, setNomeBase] = useState('');
  const [form, setForm] = useState<CondicaoPagamentoCreate>({
    nomeCondicao: '', taxaJuros: 0, multa: 0, desconto: 0, ativo: true,
  });
  const [selectedForma, setSelectedForma] = useState<FormaPagamentoView | null>(null);
  const [parcelas, setParcelas] = useState<ParcelaLocal[]>([]);
  const [numGerar, setNumGerar] = useState(1);
  const [showFormaLookup, setShowFormaLookup] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    CondicaoPagamentoService.getAll()
      .then(res => {
        const maxId = res.data.length > 0 ? Math.max(...res.data.map(c => c.id)) : 0;
        setNextId(String(maxId + 1));
      });
  }, []);

  const aceitaParcela = selectedForma?.aceitaParcela ?? false;
  const somaPercent = parcelas.reduce((acc, p) => acc + (Number(p.percentual) || 0), 0);
  const somaOk = Math.abs(somaPercent - 100) < 0.01;
  const nomeCompleto = nomeBase
    ? selectedForma ? `${nomeBase} (${selectedForma.nomeFormaPagamento.toUpperCase()})` : nomeBase
    : '';

  function handleSelectForma(forma: FormaPagamentoView) {
    setSelectedForma(forma);
    setShowFormaLookup(false);
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

  function handleAdicionar() {
    if (!selectedForma) return;
    setParcelas(prev => [...prev, {
      _key: nextKey(),
      numero: prev.length + 1,
      dias: 0,
      percentual: 0,
      formaPagamentoId: selectedForma.id,
    }]);
  }

  function handleRemover(key: number) {
    setParcelas(prev => prev.filter(p => p._key !== key).map((p, i) => ({ ...p, numero: i + 1 })));
  }

  function updateParcela(key: number, field: 'dias' | 'percentual', value: number) {
    setParcelas(prev => prev.map(p => p._key === key ? { ...p, [field]: value } : p));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!nomeBase.trim()) { setError('Condição de Pagamento é obrigatória.'); return; }
    if (!selectedForma) { setError('Selecione a Forma de Pagamento.'); return; }
    if (aceitaParcela) {
      if (parcelas.length === 0) { setError('Adicione pelo menos uma parcela.'); return; }
      if (!somaOk) { setError(`Soma dos percentuais deve ser 100%. Atual: ${somaPercent.toFixed(2)}%`); return; }
    }

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
        <div className="modal modal-condicao-create" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Nova Condição de Pagamento</h2>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>
          <form onSubmit={handleSave}>
            <div className="modal-form">

              <div className="form-group id-field">
                <label>Código</label>
                <input id="id" type="text" readOnly value={nextId} />
              </div>

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
                    onClick={() => setShowFormaLookup(true)}>
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
                <div style={{ marginTop: 18 }}>
                  <div style={{ borderTop: '1px solid var(--border-color)', margin: '8px 0 16px' }} />
                  <h3 className="form-section-title" style={{ marginBottom: 12 }}>Parcelas</h3>

                  <div className="parcelas-toolbar" style={{ marginTop: 8 }}>
                    <div className="parcelas-gerar-group">
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={numGerar}
                        onChange={e => setNumGerar(Math.max(1, Number(e.target.value)))}
                        className="parcelas-num-input"
                        placeholder="Nº Parcelas"
                      />
                      <button type="button" className="btn-primary" onClick={handleGerar}>
                        Gerar Parcelas
                      </button>
                    </div>

                    <button type="button" className="btn-secondary" onClick={handleAdicionar}>
                      + Adicionar Parcela
                    </button>

                    <div className={`parcelas-soma ${somaOk ? 'soma-ok' : 'soma-err'}`}>
                      Soma: {somaPercent.toFixed(2)}%
                      <span className={`soma-badge ${somaOk ? 'soma-badge-ok' : ''}`}>
                        {somaOk ? '✓ 100%' : '≠ 100%'}
                      </span>
                    </div>
                  </div>

                  {parcelas.length === 0 ? (
                    <div className="table-empty" style={{ padding: '24px' }}>
                      Nenhuma parcela. Use "Gerar Parcelas" ou "Adicionar Parcela".
                    </div>
                  ) : (
                    <div className="lookup-table-wrap" style={{ maxHeight: 'none', marginTop: 8 }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th style={{ width: 48 }}>Nº</th>
                            <th style={{ width: 170 }}>Dias até vencimento</th>
                            <th>Percentual (%)</th>
                            <th style={{ width: 48 }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {parcelas.map(p => (
                            <tr key={p._key}>
                              <td className="col-id">{p.numero}</td>
                              <td>
                                <input
                                  type="number"
                                  min={0}
                                  value={p.dias}
                                  className="parcela-cell-input"
                                  onChange={e => updateParcela(p._key, 'dias', Number(e.target.value))}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  step={0.01}
                                  value={p.percentual}
                                  className="parcela-cell-input"
                                  onChange={e => updateParcela(p._key, 'percentual', Number(e.target.value))}
                                />
                              </td>
                              <td>
                                <button type="button" className="btn-icon btn-delete" onClick={() => handleRemover(p._key)} title="Remover">
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
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
        <FormaPagamentoLookupModal
          onSelect={(id) => {
            FormaPagamentoService.getAll().then(res => {
              const formasAtualizadas = res.data.filter(f => f.ativo);
              const forma = formasAtualizadas.find(f => f.id === id);
              if (forma) {
                handleSelectForma(forma);
              }
            });
          }}
          onClose={() => setShowFormaLookup(false)}
          zBase={zBase + 100}
        />
      )}
    </>
  );
}
