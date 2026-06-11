import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarClock, Plus, Search, Trash2 } from 'lucide-react';
import { CondicaoPagamentoService } from '../services/condicaoPagamentoService';
import { ParcelaCondicaoPagamentoService } from '../services/parcelaCondicaoPagamentoService';
import { FormaPagamentoService } from '../services/formaPagamentoService';
import type { CondicaoPagamentoCreate, FormaPagamentoView } from '../types/entities';
import type { AxiosError } from 'axios';
import './PaisesPage.css';

interface ParcelaLocal {
  _key: number;
  id?: number;
  numero: number;
  dias: number;
  percentual: number;
  formaPagamentoId: number;
}

let _keyCounter = 1;
function nextKey() { return _keyCounter++; }

const EMPTY: CondicaoPagamentoCreate = {
  nomeCondicao: '', taxaJuros: 0, multa: 0, desconto: 0, ativo: true,
};

export default function CondicaoPagamentoFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<CondicaoPagamentoCreate>(EMPTY);
  const [nomeBase, setNomeBase] = useState('');
  const [parcelas, setParcelas] = useState<ParcelaLocal[]>([]);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [formas, setFormas] = useState<FormaPagamentoView[]>([]);
  const [selectedForma, setSelectedForma] = useState<FormaPagamentoView | null>(null);
  const [showFormaLookup, setShowFormaLookup] = useState(false);
  const [formaSearch, setFormaSearch] = useState('');
  const formaSearchRef = useRef<HTMLInputElement>(null);
  const [numGerar, setNumGerar] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Nome completo derivado: "BASE (FORMA)"
  const nomeCompleto = nomeBase
    ? selectedForma ? `${nomeBase} (${selectedForma.nomeFormaPagamento.toUpperCase()})` : nomeBase
    : '';

  useEffect(() => {
    FormaPagamentoService.getAll().then(res => {
      const ativas = res.data.filter(f => f.ativo);
      setFormas(ativas);

      if (isEdit) {
        CondicaoPagamentoService.getById(Number(id))
          .then(res2 => {
            const c = res2.data;
            setForm({ nomeCondicao: c.nomeCondicao, taxaJuros: c.taxaJuros, multa: c.multa, desconto: c.desconto, ativo: c.ativo });

            return ParcelaCondicaoPagamentoService.getByCondicaoId(Number(id)).then(res3 => {
              const ps = res3.data;
              setParcelas(ps.map(p => ({
                _key: nextKey(), id: p.id, numero: p.numero,
                dias: p.dias, percentual: Number(p.percentual),
                formaPagamentoId: p.formaPagamentoId,
              })));
              if (ps.length > 0) {
                const forma = ativas.find(f => f.id === ps[0].formaPagamentoId) ?? null;
                setSelectedForma(forma);
                const suffix = forma ? ` (${forma.nomeFormaPagamento.toUpperCase()})` : '';
                const base = suffix && c.nomeCondicao.endsWith(suffix)
                  ? c.nomeCondicao.slice(0, -suffix.length)
                  : c.nomeCondicao;
                setNomeBase(base);
              } else {
                setNomeBase(c.nomeCondicao);
              }
            });
          })
          .catch(() => navigate('/condicoes-pagamento'))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, [id, isEdit, navigate]);

  // Quando troca a forma e ela não aceita parcela → força 1 parcela 100%
  function handleSelectForma(forma: FormaPagamentoView) {
    setSelectedForma(forma);
    setShowFormaLookup(false);
    setFormaSearch('');
    // Atualiza form.nomeCondicao com o nome derivado usando o nomeBase atual
    const derivado = nomeBase
      ? `${nomeBase} (${forma.nomeFormaPagamento.toUpperCase()})`
      : '';
    setForm(prev => ({ ...prev, nomeCondicao: derivado }));
    if (!forma.aceitaParcela) {
      setDeletedIds(prev => [...prev, ...parcelas.filter(p => p.id).map(p => p.id!)]);
      setParcelas([{ _key: nextKey(), numero: 1, dias: 0, percentual: 100, formaPagamentoId: forma.id }]);
    } else {
      // Atualiza o formaPagamentoId de todas as parcelas existentes
      setParcelas(prev => prev.map(p => ({ ...p, formaPagamentoId: forma.id })));
    }
  }

  const aceitaParcela = selectedForma?.aceitaParcela ?? false;
  const somaPercent = parcelas.reduce((acc, p) => acc + (Number(p.percentual) || 0), 0);
  const somaOk = Math.abs(somaPercent - 100) < 0.01;
  const formasFiltradas = formas.filter(f =>
    f.nomeFormaPagamento.toLowerCase().includes(formaSearch.toLowerCase())
  );

  function handleGerar() {
    if (!selectedForma) return;
    const n = Math.max(1, numGerar);
    const base = parseFloat((100 / n).toFixed(2));
    const novas: ParcelaLocal[] = Array.from({ length: n }, (_, i) => ({
      _key: nextKey(),
      numero: i + 1,
      dias: (i + 1) * 30,
      percentual: i < n - 1 ? base : parseFloat((100 - base * (n - 1)).toFixed(2)),
      formaPagamentoId: selectedForma.id,
    }));
    setDeletedIds(prev => [...prev, ...parcelas.filter(p => p.id).map(p => p.id!)]);
    setParcelas(novas);
  }

  function handleAdicionar() {
    if (!selectedForma) return;
    setParcelas(prev => [...prev, {
      _key: nextKey(), numero: prev.length + 1, dias: 0, percentual: 0,
      formaPagamentoId: selectedForma.id,
    }]);
  }

  function handleRemover(key: number) {
    setParcelas(prev => {
      const removed = prev.find(p => p._key === key);
      if (removed?.id) setDeletedIds(d => [...d, removed.id!]);
      return prev.filter(p => p._key !== key).map((p, i) => ({ ...p, numero: i + 1 }));
    });
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
      if (!somaOk) { setError(`A soma dos percentuais deve ser 100%. Atual: ${somaPercent.toFixed(2)}%`); return; }
    }

    setSaving(true);
    setError('');
    try {
      let condicaoId: number;
      const payload = { ...form, nomeCondicao: nomeCompleto };
      if (isEdit) {
        await CondicaoPagamentoService.update(Number(id), payload);
        condicaoId = Number(id);
      } else {
        const res = await CondicaoPagamentoService.create(payload);
        condicaoId = res.data.id;
      }

      await Promise.all(deletedIds.map(did => ParcelaCondicaoPagamentoService.remove(did)));
      await Promise.all(parcelas.map(p => {
        const payload = {
          numero: p.numero, dias: p.dias, percentual: p.percentual,
          condicaoPagamentoId: condicaoId, formaPagamentoId: selectedForma!.id, ativo: true,
        };
        return p.id
          ? ParcelaCondicaoPagamentoService.update(p.id, payload)
          : ParcelaCondicaoPagamentoService.create(payload);
      }));

      navigate('/condicoes-pagamento');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      if (axiosErr.response?.status === 409) {
        setError(axiosErr.response.data?.message ?? 'Conflito nos dados informados.');
      } else {
        const status = axiosErr.response?.status ?? 'sem resposta';
        const msg = axiosErr.response?.data?.message ?? axiosErr.message ?? '';
        setError(`Erro ${status}: ${msg}`);
      }
      setSaving(false);
    }
  }

  if (loading) return <div className="page-container"><div className="table-loading">Carregando...</div></div>;

  return (
    <>
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-area">
          <CalendarClock size={24} className="page-title-icon" />
          <h1 className="page-title">{isEdit ? 'Editar Condição de Pagamento' : 'Nova Condição de Pagamento'}</h1>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSave} className="form-page">
          <div className="form-section">
            <h2 className="form-section-title">Dados da Condição</h2>

            <div className="form-group">
              <label htmlFor="nomeBase">Condição de Pagamento *</label>
              <input
                id="nomeBase"
                type="text"
                placeholder="Ex: À VISTA, 30/60/90 DIAS..."
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

            {/* Forma de Pagamento — lookup */}
            <div className="form-group">
              <label>Forma de Pagamento *</label>
              <div className="lookup-field">
                <input
                  type="text"
                  readOnly
                  className="lookup-input"
                  value={selectedForma?.nomeFormaPagamento ?? ''}
                  placeholder="Selecione a forma de pagamento..."
                />
                <button
                  type="button"
                  className="btn-lookup"
                  onClick={() => { setShowFormaLookup(true); setTimeout(() => formaSearchRef.current?.focus(), 50); }}
                >
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
                <label htmlFor="taxaJuros">Juros por atraso (%/mês)</label>
                <input
                  id="taxaJuros"
                  type="number" min={0} step={0.01} placeholder="0,00"
                  value={form.taxaJuros}
                  onChange={e => setForm({ ...form, taxaJuros: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="multa">Multa por atraso (%)</label>
                <input
                  id="multa"
                  type="number" min={0} step={0.01} placeholder="0,00"
                  value={form.multa}
                  onChange={e => setForm({ ...form, multa: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="desconto">Desconto pontualidade (%)</label>
                <input
                  id="desconto"
                  type="number" min={0} step={0.01} placeholder="0,00"
                  value={form.desconto}
                  onChange={e => setForm({ ...form, desconto: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group form-check">
              <label>
                <input type="checkbox" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} />
                Ativo
              </label>
            </div>
          </div>

          {/* ── Parcelas — só exibe se a forma aceita parcelamento ─────────── */}
          {aceitaParcela && (
            <div className="form-section">
              <h2 className="form-section-title">Parcelas</h2>

              <div className="parcelas-toolbar">
                <div className="parcelas-gerar-group">
                  <input
                    type="number" min={1} max={99}
                    value={numGerar}
                    onChange={e => setNumGerar(Math.max(1, Number(e.target.value)))}
                    placeholder="Nº de Parcelas"
                    className="parcelas-num-input"
                  />
                  <button type="button" className="btn-primary" onClick={handleGerar}>
                    <CalendarClock size={15} /> Gerar Parcelas
                  </button>
                </div>
                <button type="button" className="btn-secondary" onClick={handleAdicionar}>
                  <Plus size={15} /> Adicionar Parcela
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
                <div className="lookup-table-wrap" style={{ maxHeight: 'none' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: 56 }}>Nº</th>
                        <th style={{ width: 140 }}>Dias até vencimento</th>
                        <th style={{ width: 150 }}>Percentual (%)</th>
                        <th style={{ width: 48 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {parcelas.map(p => (
                        <tr key={p._key}>
                          <td className="col-id">{p.numero}</td>
                          <td>
                            <input
                              type="number" min={0}
                              value={p.dias}
                              onChange={e => updateParcela(p._key, 'dias', Number(e.target.value))}
                              className="parcela-cell-input"
                            />
                          </td>
                          <td>
                            <input
                              type="number" min={0} max={100} step={0.01}
                              value={p.percentual}
                              onChange={e => updateParcela(p._key, 'percentual', Number(e.target.value))}
                              className="parcela-cell-input"
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

          <div className="form-page-footer">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/condicoes-pagamento')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    {/* ── Lookup Modal — Forma de Pagamento ─────────────────────────────── */}
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
              <input
                ref={formaSearchRef}
                type="text"
                placeholder="Buscar forma de pagamento..."
                value={formaSearch}
                onChange={e => setFormaSearch(e.target.value)}
              />
            </div>
            <div className="lookup-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 56 }}>#</th>
                    <th>Forma de Pagamento</th>
                    <th style={{ width: 120 }}>Parcela</th>
                    <th style={{ width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {formasFiltradas.length === 0 ? (
                    <tr><td colSpan={4} className="table-empty">Nenhum resultado.</td></tr>
                  ) : formasFiltradas.map(f => (
                    <tr key={f.id}>
                      <td className="col-id">{f.id}</td>
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
        </div>
      </div>
    )}
    </>
  );
}
