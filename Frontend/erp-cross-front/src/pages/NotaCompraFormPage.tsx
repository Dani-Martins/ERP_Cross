import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { FileDown, Search, Trash2 } from 'lucide-react';
import { NotaCompraService } from '../services/notaCompraService';
import { ParcelaNotaCompraService } from '../services/parcelaNotaCompraService';
import type { NotaCompraCreate, NotaCompraItemCreate, ParcelaNotaCompra } from '../types/entities';
import CondicaoPagamentoLookupModal from '../components/CondicaoPagamentoLookupModal';
import FornecedorLookupModal from '../components/FornecedorLookupModal';
import TransportadoraLookupModal from '../components/TransportadoraLookupModal';
import ProdutoLookupModal from '../components/ProdutoLookupModal';
import CurrencyInput from '../components/CurrencyInput';
import './PaisesPage.css';

function toInputDate(value: string | null |undefined): string {
  if (!value) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(value))
    return value;

  if (value.includes('T'))
    return value.split('T')[0];

  const d = new Date(value);

  if (isNaN(d.getTime()))
    return '';

  return d.toISOString().split('T')[0];
}
const EMPTY: NotaCompraCreate = {
  fornecedorId: 0,

  numeroNota: '',
  modelo: '',
  serie: '',

  dataEmissao: new Date().toISOString().split('T')[0],
  dataChegada: '',

  tipoFrete: 'CIF',

  valorFrete: 0,
  valorSeguro: 0,
  outrasDespesas: 0,

  totalProdutos: 0,

  condicaoPagamentoId: undefined,

  transportadoraId: undefined,

  placaVeiculo: '',

  observacao: '',

  status: 'ABERTA',

  ativo: true,
};
export default function NotaCompraFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState<NotaCompraCreate>(EMPTY);
  const [produtos, setProdutos] = useState<NotaCompraItemCreate[]>([]);
  const [nomeFornecedor, setNomeFornecedor] = useState('');
  const [nomeTransportadora, setNomeTransportadora] = useState('');
  const [nomeCondicao, setNomeCondicao] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showCondicaoModal, setShowCondicaoModal] = useState(false);
  const [showFornecedorModal, setShowFornecedorModal] = useState(false);
  const [showTransportadoraModal, setShowTransportadoraModal] = useState(false);
  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [parcelas, setParcelas] = useState<ParcelaNotaCompra[]>([]);
  const [parcelasEditando, setParcelasEditando] = useState<Map<number, ParcelaNotaCompra>>(new Map());
  useEffect(() => {
    if (!isEdit) {
      setLoading(false);
      return;
    }

    NotaCompraService.getById(Number(id))
      .then(res => {
        const n = res.data;
        setForm({
          fornecedorId: n.fornecedorId,
          numeroNota: n.numeroNota,
          modelo: n.modelo,
          serie: n.serie,
          dataEmissao: toInputDate(n.dataEmissao),
          dataChegada: toInputDate(n.dataChegada),
          tipoFrete: n.tipoFrete,
          valorFrete: n.valorFrete,
          valorSeguro: n.valorSeguro,
          outrasDespesas: n.outrasDespesas,
          totalProdutos: n.totalProdutos,
          condicaoPagamentoId: n.condicaoPagamentoId,
          transportadoraId: n.transportadoraId,
          placaVeiculo: n.placaVeiculo ?? '',
          observacao: n.observacao ?? '',
          status: n.status ?? 'ABERTA',
          ativo: n.ativo,
        });
        setNomeFornecedor(n.nomeFornecedor ?? '');
        setNomeTransportadora(n.nomeTransportadora ?? '');
        setNomeCondicao(n.nomeCondicaoPagamento ?? '');
      })
      .catch(() => navigate('/nota-compras'))
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);
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

    if (!form.fornecedorId) {
      setError('Fornecedor é obrigatório.');
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

        await NotaCompraService.update(
          Number(id),
          form
        );

      } else {

        await NotaCompraService.create(form);

      }

      navigate('/nota-compras');

    } catch (err) {

      const axiosErr =
        err as AxiosError<{ message: string }>;

      if (axiosErr.response?.status === 409) {

        setError(
          axiosErr.response.data?.message ??
          'Já existe uma nota com esses dados.'
        );

      } else {

        setError(
          'Erro ao salvar a nota de compra.'
        );

      }

      setSaving(false);

    }

  }

  const calculatedTotalProdutos = produtos.reduce((sum, p) => {
    const subtotal = p.quantidade * p.precoUnit;
    const descontoReais = (subtotal * (p.desconto || 0)) / 100;
    return sum + (subtotal - descontoReais);
  }, 0);

  const totalPagar =
    calculatedTotalProdutos +
    Number(form.valorFrete) +
    Number(form.valorSeguro) +
    Number(form.outrasDespesas);

  const canFillForm = form.numeroNota.trim() !== '' && 
                      form.modelo.trim() !== '' && 
                      form.serie.trim() !== '';

  if (loading) {

    return (
      <div className="page-container">
        <div className="table-loading">
          Carregando...
        </div>
      </div>
    );

  }
    return (
    <>
      <div className="page-container">

        <div className="page-header">
          <div className="page-title-area">
            <FileDown size={24} className="page-title-icon" />

            <h1 className="page-title">
              {isEdit
                ? 'Editar Nota de Compra'
                : 'Nova Nota de Compra'}
            </h1>
          </div>
        </div>

        <div className="form-card">

          <form
            onSubmit={handleSave}
            className="form-page nota-compra-form"
          >

            {/* Dados da Nota */}
            <div className="form-section">

              <h2 className="form-section-title">
                Dados da Nota
              </h2>

              <div className="form-row">

                <div className="form-group">
                  <label>Número da Nota *</label>

                  <input
                    type="text"
                    value={form.numeroNota}
                    disabled={isEdit}
                    onChange={e =>
                      setForm({
                        ...form,
                        numeroNota: e.target.value.toUpperCase()
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Modelo *</label>

                  <input
                    type="text"
                    value={form.modelo}
                    disabled={isEdit}
                    onChange={e =>
                      setForm({
                        ...form,
                        modelo: e.target.value.toUpperCase()
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Série *</label>

                  <input
                    type="text"
                    value={form.serie}
                    disabled={isEdit}
                    onChange={e =>
                      setForm({
                        ...form,
                        serie: e.target.value.toUpperCase()
                      })
                    }
                  />
                </div>

              </div>

              <div className="form-row">

                <div className="form-group">
                  <label>Data de Emissão *</label>

                  <input
                    type="date"
                    value={form.dataEmissao}
                    onChange={e =>
                      setForm({
                        ...form,
                        dataEmissao: e.target.value
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Data de Chegada</label>

                  <input
                    type="date"
                    value={form.dataChegada ?? ''}
                    onChange={e =>
                      setForm({
                        ...form,
                        dataChegada: e.target.value
                      })
                    }
                  />
                </div>

              </div>

            </div>
                        {/* Fornecedor e Pagamento */}
            <div className="form-section">

              <h2 className="form-section-title">
                Fornecedor e Pagamento
              </h2>

              <div className="form-group">
                <label>Fornecedor *</label>
                <div className="lookup-field">
                  <input
                    type="text"
                    value={nomeFornecedor}
                    placeholder="Selecione um fornecedor..."
                    readOnly
                    disabled={!canFillForm}
                    className="lookup-input"
                  />
                  <button
                    type="button"
                    className="btn-lookup"
                    disabled={!canFillForm}
                    onClick={() => setShowFornecedorModal(true)}
                    title="Pesquisar fornecedor"
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
                    disabled={!canFillForm}
                    className="lookup-input"
                  />

                  <button
                    type="button"
                    className="btn-lookup"
                    disabled={!canFillForm}
                    onClick={() =>
                      setShowCondicaoModal(true)
                    }
                    title="Pesquisar condição de pagamento"
                  >
                    <Search size={16} />
                  </button>

                </div>

              </div>

            </div>

            {/* Transporte */}
            <div className="form-section">
              <h2 className="form-section-title">
                Transporte
              </h2>

              <div className="form-row">
                <div className="form-group">
                  <label>Transportadora</label>
                  <div className="lookup-field">
                    <input
                      type="text"
                      value={nomeTransportadora}
                      placeholder="Selecione uma transportadora..."
                      readOnly
                      disabled={!canFillForm}
                      className="lookup-input"
                    />
                    <button
                      type="button"
                      className="btn-lookup"
                      disabled={!canFillForm}
                      onClick={() => setShowTransportadoraModal(true)}
                      title="Pesquisar transportadora"
                    >
                      <Search size={16} />
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Tipo de Frete</label>
                  <select
                    value={form.tipoFrete}
                    disabled={!canFillForm}
                    onChange={e =>
                      setForm({
                        ...form,
                        tipoFrete: e.target.value
                      })
                    }
                  >
                    <option value="CIF">CIF</option>
                    <option value="FOB">FOB</option>
                    <option value="SEM FRETE">
                      Sem Frete
                    </option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Placa do Veículo</label>
                  <input
                    type="text"
                    value={form.placaVeiculo ?? ''}
                    disabled={!canFillForm}
                    onChange={e =>
                      setForm({
                        ...form,
                        placaVeiculo: e.target.value.toUpperCase()
                      })
                    }
                  />
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
                        <td colSpan={6} className="table-empty">Nenhum produto adicionado.</td>
                      </tr>
                    ) : (
                      produtos.map((p, idx) => {
                        const subtotal = p.quantidade * p.precoUnit;
                        const descontoReais = (subtotal * (p.desconto || 0)) / 100;
                        const total = subtotal - descontoReais;
                        return (
                        <tr key={idx}>
                          <td className="col-name">{p.nomeProduto || 'Produto ' + (idx + 1)}</td>
                          <td>
                            <input
                              type="number"
                              step="1"
                              min="0"
                              disabled={!canFillForm}
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
                              disabled={!canFillForm}
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
                              disabled={!canFillForm}
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
                    disabled={!canFillForm}
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

              <h2 className="form-section-title">
                Valores
              </h2>

              <div className="form-row">

                <div className="form-group" style={{ fontSize: '0.9em' }}>
                  <label>Valor do Frete</label>
                  <CurrencyInput
                    disabled={!canFillForm}
                    value={form.valorFrete}
                    onChange={value => setForm({ ...form, valorFrete: value })}
                  />
                </div>
                <div className="form-group" style={{ fontSize: '0.9em' }}>
                  <label>Valor Seguro</label>
                  <CurrencyInput
                    disabled={!canFillForm}
                    value={form.valorSeguro ?? 0}
                    onChange={value => setForm({ ...form, valorSeguro: value })}
                  />
                </div>
                <div className="form-group" style={{ fontSize: '0.9em' }}>
                  <label>Outras Despesas</label>
                  <CurrencyInput
                    disabled={!canFillForm}
                    value={form.outrasDespesas ?? 0}
                    onChange={value => setForm({ ...form, outrasDespesas: value })}
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
                    R$ {totalPagar.toFixed(2).replace('.', ',')}
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
                        <th style={{ width: 120 }}>DATA VENCIMENTO</th>
                        <th style={{ width: 120 }}>FORMA PAGAMENTO</th>
                        <th style={{ width: 100 }}>VALOR</th>
                        <th style={{ width: 80 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {parcelas.map((p, idx) => {
                        const editando = parcelasEditando.has(p.id);
                        const pEditada = parcelasEditando.get(p.id);
                        return (
                          <tr key={p.id}>
                            <td>{p.numParcela || idx + 1}</td>
                            <td>
                              {editando ? (
                                <input
                                  type="date"
                                  value={pEditada?.dataVencimento || ''}
                                  onChange={e =>
                                    setParcelasEditando(
                                      new Map(parcelasEditando).set(p.id, {
                                        ...pEditada!,
                                        dataVencimento: e.target.value,
                                      })
                                    )
                                  }
                                  className="produto-table-input"
                                />
                              ) : (
                                new Date(p.dataVencimento).toLocaleDateString('pt-BR')
                              )}
                            </td>
                            <td>{p.nomeFormaPagamento || '—'}</td>
                            <td>
                              {editando ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  value={pEditada?.valorParcela || 0}
                                  onChange={e =>
                                    setParcelasEditando(
                                      new Map(parcelasEditando).set(p.id, {
                                        ...pEditada!,
                                        valorParcela: Number(e.target.value),
                                      })
                                    )
                                  }
                                  className="produto-table-input"
                                />
                              ) : (
                                `R$ ${Number(p.valorParcela).toFixed(2).replace('.', ',')}`
                              )}
                            </td>
                            <td>
                              {editando ? (
                                <>
                                  <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={() => {
                                      if (pEditada) {
                                        ParcelaNotaCompraService.update(p.id, {
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
                                    style={{ fontSize: '0.8em', padding: '4px 8px' }}
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setParcelasEditando(new Map(parcelasEditando).set(p.id, { ...p }))}
                                    style={{ fontSize: '0.8em', padding: '4px 8px', marginLeft: '4px' }}
                                  >
                                    Cancelar
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  className="btn-icon"
                                  onClick={() => setParcelasEditando(new Map(parcelasEditando).set(p.id, { ...p }))}
                                  title="Editar parcela"
                                >
                                  ✎
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

              <h2 className="form-section-title">
                Informações Adicionais
              </h2>

              <div className="form-group">
                <label>Observação</label>

                <textarea
                  rows={4}
                  disabled={!canFillForm}
                  value={form.observacao ?? ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      observacao: e.target.value
                    })
                  }
                />
              </div>

              <div className="form-row">

                <div className="form-group">
                  <label>Status</label>

                  <select
                    value={form.status ?? ''}
                    disabled={!canFillForm}
                    onChange={e =>
                      setForm({
                        ...form,
                        status: e.target.value
                      })
                    }
                  >
                    <option value="ABERTA">
                      Aberta
                    </option>

                    <option value="FINALIZADA">
                      Finalizada
                    </option>

                    <option value="CANCELADA">
                      Cancelada
                    </option>
                  </select>
                </div>

                <div className="form-group checkbox-group">
                  <label>

                    <input
                      type="checkbox"
                      disabled={!canFillForm}
                      checked={form.ativo}
                      onChange={e =>
                        setForm({
                          ...form,
                          ativo: e.target.checked
                        })
                      }
                    />

                    Ativo

                  </label>
                </div>

              </div>

              {error && (
                <div className="form-error">
                  {error}
                </div>
              )}

            </div>

            <div className="form-page-footer">

              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving
                  ? 'Salvando...'
                  : 'Salvar'}
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  navigate('/nota-compras')
                }
              >
                Cancelar
              </button>

            </div>

          </form>

        </div>

      </div>

      {showFornecedorModal && (
        <FornecedorLookupModal
          onClose={() => setShowFornecedorModal(false)}
          onSelect={(id, nome) => {
            setForm({
              ...form,
              fornecedorId: id
            });
            setNomeFornecedor(nome);
            setShowFornecedorModal(false);
          }}
        />
      )}

      {showTransportadoraModal && (
        <TransportadoraLookupModal
          onClose={() => setShowTransportadoraModal(false)}
          onSelect={(id, nome) => {
            setForm({
              ...form,
              transportadoraId: id
            });
            setNomeTransportadora(nome);
            setShowTransportadoraModal(false);
          }}
        />
      )}

      {showCondicaoModal && (
        <CondicaoPagamentoLookupModal
          onClose={() =>
            setShowCondicaoModal(false)
          }
          onSelect={(id, nome) => {

            setForm({
              ...form,
              condicaoPagamentoId: id
            });

            setNomeCondicao(nome);

            setShowCondicaoModal(false);

            // Calcular parcelas se a nota está em edição e tem os dados necessários
            if (isEdit && form.numeroNota && form.modelo && form.serie && form.fornecedorId && totalPagar > 0) {
              ParcelaNotaCompraService.calculateAndSave(
                form.numeroNota,
                form.modelo,
                form.serie,
                form.fornecedorId,
                id,
                totalPagar
              )
                .then(() => {
                  // Recarregar parcelas
                  return ParcelaNotaCompraService.getByNota(form.numeroNota, form.modelo, form.serie, form.fornecedorId);
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
          onSelect={(id, nomeProduto, _, __, ___, custoCompra) => {
            setProdutos([...produtos, {
              idProduto: id,
              quantidade: 1,
              precoUnit: custoCompra || 0,
              desconto: 0,
              idNotaCompra: 0,
              nomeProduto: nomeProduto,
            }]);
            setShowProdutoModal(false);
          }}
        />
      )}

    </>
  );
}