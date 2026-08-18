import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { FileText, Search, Trash2, Edit2, Check } from 'lucide-react';
import { NotaVendaService } from '../services/notaVendaService';
import { ParcelaNotaVendaService } from '../services/parcelaNotaVendaService';
import type { NotaVendaCreate, NotaVendaItemCreate, ParcelaNotaVenda } from '../types/entities';
import ClienteLookupModal from '../components/ClienteLookupModal';
import CondicaoPagamentoLookupModal from '../components/CondicaoPagamentoLookupModal';
import ProdutoLookupModal from '../components/ProdutoLookupModal';
import CurrencyInput from '../components/CurrencyInput';
import './PaisesPage.css';

function toInputDate(value: string | null | undefined): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (value.includes('T')) return value.split('T')[0];
  const d = new Date(value);
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
}

const EMPTY: NotaVendaCreate = {
  numeroNota: '',
  modelo: '',
  serie: '',
  clienteId: 0,
  dataEmissao: new Date().toISOString().split('T')[0],
  dataChegada: '',
  transportadoraId: undefined,
  placaVeiculo: '',
  tipoFrete: 'CIF',
  valorFrete: 0,
  valorSeguro: 0,
  desconto: 0,
  outrosCustos: 0,
  totalProdutos: 0,
  condicaoPagamentoId: undefined,
  observacao: '',
  status: 'ABERTA',
  ativo: true,
  produtos: [],
  parcelas: [],
};

export default function NotaVendaFormPage() {
  const { numeroNota, modelo, serie, clienteId } = useParams<{
    numeroNota: string;
    modelo: string;
    serie: string;
    clienteId: string;
  }>();

  const navigate = useNavigate();

  const isEdit = !!(numeroNota && modelo && serie && clienteId);

  const [form, setForm] = useState<NotaVendaCreate>(EMPTY);
  const [nomeCondicao, setNomeCondicao] = useState('');
  const [nomeCliente, setNomeCliente] = useState('');
  const [produtos, setProdutos] = useState<NotaVendaItemCreate[]>([]);
  const [parcelas, setParcelas] = useState<ParcelaNotaVenda[]>([]);
  const [parcelasEditando, setParcelasEditando] = useState<Map<number, ParcelaNotaVenda>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showCondicaoModal, setShowCondicaoModal] = useState(false);
  const [showProdutoModal, setShowProdutoModal] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      setLoading(false);
      return;
    }

    NotaVendaService.getByKey(numeroNota!, modelo!, serie!, Number(clienteId))
      .then(res => {
        const n = res.data;
        setForm({
          numeroNota: n.numeroNota,
          modelo: n.modelo,
          serie: n.serie,
          clienteId: n.clienteId,
          dataEmissao: toInputDate(n.dataEmissao),
          dataChegada: toInputDate(n.dataChegada),
          transportadoraId: n.transportadoraId,
          placaVeiculo: n.placaVeiculo ?? '',
          tipoFrete: n.tipoFrete,
          valorFrete: n.valorFrete,
          desconto: n.desconto,
          outrosCustos: n.outrosCustos ?? 0,
          totalProdutos: n.totalProdutos,
          condicaoPagamentoId: n.condicaoPagamentoId,
          observacao: n.observacao ?? '',
          status: n.status ?? '',
          ativo: n.ativo,
          produtos: n.produtos ?? [],
          parcelas: n.parcelas ?? [],
        });
        setProdutos(n.produtos ?? []);
        setParcelas(n.parcelas ?? []);
        setNomeCliente(n.nomeCliente ?? '');
        setNomeCondicao(n.nomeCondicaoPagamento ?? '');
      })
      .catch(() => navigate('/notas-venda'))
      .finally(() => setLoading(false));
  }, [numeroNota, modelo, serie, clienteId, isEdit, navigate]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!form.numeroNota.trim()) {
      setError('Número da nota é obrigatório.');
      return;
    }
    if (!form.modelo.trim()) {
      setError('Modelo é obrigatório.');
      return;
    }
    if (!form.serie.trim()) {
      setError('Série é obrigatória.');
      return;
    }
    if (!form.clienteId) {
      setError('Cliente é obrigatório.');
      return;
    }
    if (!form.dataEmissao) {
      setError('Data de emissão é obrigatória.');
      return;
    }
    if (!form.condicaoPagamentoId) {
      setError('Condição de pagamento é obrigatória.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (isEdit) {
        await NotaVendaService.update(numeroNota!, modelo!, serie!, Number(clienteId), form);
      } else {
        await NotaVendaService.create(form);
      }
      navigate('/notas-venda');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      if (axiosErr.response?.status === 409) {
        setError(axiosErr.response.data?.message ?? 'Já existe uma nota com esses dados.');
      } else {
        setError('Erro ao salvar a nota de venda.');
      }
      setSaving(false);
    }
  }

  const calculatedTotalProdutos = produtos.reduce((sum, p) => {
    const subtotal = p.quantidade * p.precoUnit;
    const descontoReais = (subtotal * (p.desconto || 0)) / 100;
    return sum + (subtotal - descontoReais);
  }, 0);

  const totalPagar = calculatedTotalProdutos + Number(form.valorFrete) + Number(form.valorSeguro ?? 0) + Number(form.outrosCustos ?? 0);

  if (loading) {
    return (
      <div className="page-container">
        <div className="table-loading">Carregando...</div>
      </div>
    );
  }

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <div className="page-title-area">
            <FileText size={24} className="page-title-icon" />
            <h1 className="page-title">
              {isEdit ? 'Editar Nota de Venda' : 'Nova Nota de Venda'}
            </h1>
          </div>
        </div>

        <div className="form-card">
          <form onSubmit={handleSave} className="form-page">

            {/* Dados da Nota */}
            <div className="form-section">
              <h2 className="form-section-title">Dados da Nota</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Número da Nota *</label>
                  <input
                    type="number"
                    value={form.numeroNota}
                    disabled={isEdit}
                    onChange={e => setForm({ ...form, numeroNota: e.target.value })}
                    required
                    maxLength={20}
                    placeholder="Ex: 123, 1000, 50000"
                    title="Apenas números (máximo 20 dígitos)"
                  />
                </div>
                <div className="form-group">
                  <label>Modelo *</label>
                  <input
                    type="number"
                    value={form.modelo}
                    disabled={isEdit}
                    onChange={e => setForm({ ...form, modelo: e.target.value })}
                    required
                    maxLength={3}
                    minLength={2}
                    placeholder="Ex: 01, 04, 55"
                    title="Modelo da NF (01, 04, 55, 65, etc)"
                  />
                </div>
                <div className="form-group">
                  <label>Série *</label>
                  <input
                    type="text"
                    value={form.serie}
                    disabled={isEdit}
                    onChange={e => setForm({ ...form, serie: e.target.value.toUpperCase() })}
                    required
                    maxLength={10}
                    placeholder="Ex: 1, 001, A, A01"
                    title="Série da nota (alfanumérico, máximo 10 caracteres)"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Data de Emissão *</label>
                  <input
                    type="date"
                    value={form.dataEmissao}
                    onChange={e => setForm({ ...form, dataEmissao: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Data Chegada</label>
                  <input
                    type="date"
                    value={form.dataChegada || ''}
                    onChange={e => setForm({ ...form, dataChegada: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Tipo de Frete</label>
                  <select
                    value={form.tipoFrete}
                    onChange={e => setForm({ ...form, tipoFrete: e.target.value })}
                  >
                    <option value="CIF">CIF</option>
                    <option value="FOB">FOB</option>
                    <option value="SEM FRETE">Sem Frete</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cliente e Pagamento */}
            <div className="form-section">
              <h2 className="form-section-title">Cliente e Pagamento</h2>
              <div className="form-group">
                <label>Cliente *</label>
                <div className="lookup-field">
                  <input
                    type="text"
                    value={nomeCliente}
                    placeholder="Selecione um cliente..."
                    readOnly
                    className="lookup-input"
                  />
                  <button 
                    type="button" 
                    className="btn-lookup" 
                    onClick={() => setShowClienteModal(true)}
                    title="Pesquisar cliente"
                  >
                    <Search size={16} />
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Condição de Pagamento *</label>
                <div className="lookup-field">
                  <input
                    type="text"
                    value={nomeCondicao}
                    placeholder="Selecione uma condição..."
                    readOnly
                    className="lookup-input"
                  />
                  <button 
                    type="button" 
                    className="btn-lookup" 
                    onClick={() => setShowCondicaoModal(true)}
                    title="Pesquisar condição de pagamento"
                  >
                    <Search size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Produtos */}
            <div className="form-section">
              <h2 className="form-section-title">Produtos</h2>
              <div className="lookup-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>PRODUTO</th>
                      <th style={{ width: 80 }}>UNIDADE</th>
                      <th style={{ width: 80 }}>QTD</th>
                      <th style={{ width: 100 }}>VALOR UN.</th>
                      <th style={{ width: 100 }}>DESCONTO %</th>
                      <th style={{ width: 100 }}>TOTAL</th>
                      <th style={{ width: 50 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="table-empty">Nenhum produto adicionado.</td>
                      </tr>
                    ) : (
                      produtos.map((p, idx) => {
                        const subtotal = p.quantidade * p.precoUnit;
                        const descontoReais = (subtotal * (p.desconto || 0)) / 100;
                        const total = subtotal - descontoReais;
                        return (
                        <tr key={idx}>
                          <td className="col-name">{p.nomeProduto || 'Produto ' + (idx + 1)}</td>
                          <td>{p.unidadeMedida || '—'}</td>
                          <td>
                            <input
                              type="number"
                              step="1"
                              min="0"
                              value={p.quantidade}
                              onChange={e => {
                                const newProdutos = [...produtos];
                                newProdutos[idx].quantidade = Number(e.target.value);
                                setProdutos(newProdutos);
                              }}
                              className="produto-table-input"
                            />
                          </td>
                          <td>
                            R$ {Number(p.precoUnit).toFixed(2).replace('.', ',')}
                          </td>
                          <td>
                            <input
                              type="number"
                              step="1"
                              min="0"
                              max="100"
                              value={p.desconto || 0}
                              onChange={e => {
                                const newProdutos = [...produtos];
                                newProdutos[idx].desconto = Number(e.target.value);
                                setProdutos(newProdutos);
                              }}
                              className="produto-table-input"
                              title="Porcentagem de desconto (0-100%)"
                            />
                          </td>
                          <td>
                            R$ {total.toFixed(2).replace('.', ',')}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-icon"
                              onClick={() => setProdutos(produtos.filter((_, i) => i !== idx))}
                              title="Remover produto"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '16px' }}>
                <div style={{ marginTop: '0px' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setShowProdutoModal(true)}
                    style={{ fontSize: '0.9em', padding: '6px 12px' }}
                  >
                    + Adicionar Produto
                  </button>
                </div>
                <div style={{
                  fontSize: '1.1em',
                  fontWeight: '700',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span>Total dos Produtos:</span>
                  <span style={{ fontSize: '1.4em', fontWeight: '800', color: 'var(--text-primary)' }}>
                    R$ {calculatedTotalProdutos.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>

            {/* Valores */}
            <div className="form-section">
              <h2 className="form-section-title">Valores</h2>
              <div className="form-row">
                <div className="form-group" style={{ fontSize: '0.9em' }}>
                  <label>Valor do Frete</label>
                  <CurrencyInput
                    value={form.valorFrete}
                    onChange={value => setForm({ ...form, valorFrete: value })}
                  />
                </div>
                <div className="form-group" style={{ fontSize: '0.9em' }}>
                  <label>Valor Seguro</label>
                  <CurrencyInput
                    value={form.valorSeguro ?? 0}
                    onChange={value => setForm({ ...form, valorSeguro: value })}
                  />
                </div>
                <div className="form-group" style={{ fontSize: '0.9em' }}>
                  <label>Outras Despesas</label>
                  <CurrencyInput
                    value={form.outrosCustos ?? 0}
                    onChange={value => setForm({ ...form, outrosCustos: value })}
                  />
                </div>
              </div>
              <div style={{ marginTop: '16px', textAlign: 'right', paddingRight: '0px' }}>
                <div style={{
                  fontSize: '1.1em',
                  fontWeight: '700',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span>Total a Pagar:</span>
                  <span style={{ fontSize: '1.4em', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {totalPagar.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            </div>

            {isEdit && parcelas.length > 0 && (
              <div className="form-section">
                <h2 className="form-section-title">Parcelas</h2>
                <div className="lookup-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>PARCELA</th>
                        <th>FORMA PGTO</th>
                        <th>DATA VENCIMENTO</th>
                        <th style={{ width: 100 }}>VALOR</th>
                        <th style={{ width: 80 }}>AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parcelas.map((p, idx) => {
                        const editando = parcelasEditando.has(p.id);
                        const pEditada = parcelasEditando.get(p.id);
                        return (
                          <tr key={idx}>
                            <td>{p.numParcela || idx + 1}</td>
                            <td>{p.nomeFormaPagamento || '—'}</td>
                            <td>
                              {editando && pEditada ? (
                                <input
                                  type="date"
                                  value={toInputDate(pEditada.dataVencimento)}
                                  onChange={e =>
                                    setParcelasEditando(
                                      new Map(parcelasEditando).set(p.id, {
                                        ...pEditada,
                                        dataVencimento: e.target.value,
                                      })
                                    )
                                  }
                                  style={{ width: '100%' }}
                                />
                              ) : (
                                p.dataVencimento ? new Date(p.dataVencimento).toLocaleDateString('pt-BR') : '—'
                              )}
                            </td>
                            <td>
                              {editando && pEditada ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  value={pEditada.valorParcela}
                                  onChange={e =>
                                    setParcelasEditando(
                                      new Map(parcelasEditando).set(p.id, {
                                        ...pEditada,
                                        valorParcela: Number(e.target.value),
                                      })
                                    )
                                  }
                                  style={{ width: '100%' }}
                                />
                              ) : (
                                `R$ ${Number(p.valorParcela).toFixed(2).replace('.', ',')}`
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {editando ? (
                                <button
                                  type="button"
                                  className="btn-icon"
                                  onClick={() => {
                                    if (pEditada) {
                                      ParcelaNotaVendaService.update(p.id, {
                                        formaPagamentoId: pEditada.formaPagamentoId,
                                        dataVencimento: pEditada.dataVencimento,
                                        valorParcela: pEditada.valorParcela,
                                        pago: pEditada.pago,
                                        dataPagamento: pEditada.dataPagamento,
                                      })
                                        .then(() => {
                                          const novasParcelas = parcelas.map(x =>
                                            x.id === p.id ? pEditada : x
                                          );
                                          setParcelas(novasParcelas);
                                          setParcelasEditando(new Map());
                                        })
                                        .catch(err => console.error('Erro ao salvar parcela:', err));
                                    }
                                  }}
                                  title="Salvar"
                                >
                                  <Check size={16} />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="btn-icon"
                                  onClick={() =>
                                    setParcelasEditando(new Map(parcelasEditando).set(p.id, { ...p }))
                                  }
                                  title="Editar"
                                >
                                  <Edit2 size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Informações Adicionais */}
            <div className="form-section">
              <h2 className="form-section-title">Informações Adicionais</h2>
              <div className="form-group">
                <label>Observação</label>
                <textarea
                  rows={4}
                  value={form.observacao ?? ''}
                  onChange={e => setForm({ ...form, observacao: e.target.value })}
                />
              </div>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={form.status ?? ''}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="ABERTA">Aberta</option>
                    <option value="FATURADA">Faturada</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={form.ativo}
                      onChange={e => setForm({ ...form, ativo: e.target.checked })}
                    />
                    Ativo
                  </label>
                </div>
              </div>
              {error && <div className="form-error">{error}</div>}
            </div>

            <div className="form-page-footer">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/notas-venda')}>
                Cancelar
              </button>
            </div>

          </form>
        </div>
      </div>

      {showClienteModal && (
        <ClienteLookupModal
          onClose={() => setShowClienteModal(false)}
          onSelect={(id, nome) => {
            setForm({ ...form, clienteId: id });
            setNomeCliente(nome);
            setShowClienteModal(false);
          }}
        />
      )}

      {showCondicaoModal && (
        <CondicaoPagamentoLookupModal
          onClose={() => setShowCondicaoModal(false)}
          onSelect={(id, nome) => {
            const novaForm = { ...form, condicaoPagamentoId: id };
            setForm(novaForm);
            setNomeCondicao(nome);
            setShowCondicaoModal(false);

            // Se está em modo edição e tem numero, modelo, serie, clienteId, calcular parcelas
            if (isEdit && numeroNota && modelo && serie && clienteId) {
              const totalNota =
                novaForm.totalProdutos + novaForm.valorFrete + (novaForm.outrosCustos ?? 0) - novaForm.desconto;
              ParcelaNotaVendaService.calculateAndSave(
                numeroNota,
                modelo,
                serie,
                Number(clienteId),
                id,
                totalNota
              )
                .then(() => {
                  // Recarregar parcelas
                  return ParcelaNotaVendaService.getByNota(numeroNota, modelo, serie, Number(clienteId));
                })
                .then(res => {
                  setParcelas(res.data);
                  setParcelasEditando(new Map());
                })
                .catch(err => console.error('Erro ao calcular parcelas:', err));
            }
          }}
        />
      )}

      {showProdutoModal && (
        <ProdutoLookupModal
          onClose={() => setShowProdutoModal(false)}
          onSelect={(id, nomeProduto, _, nomeUnidade, precoVenda) => {
            setProdutos([...produtos, {
              idProduto: id,
              quantidade: 1,
              precoUnit: precoVenda || 0,
              idNotaVenda: 0,
              nomeProduto: nomeProduto,
              unidadeMedida: nomeUnidade || '',
              desconto: 0
            }]);
            setShowProdutoModal(false);
          }}
        />
      )}
    </>
  );
}