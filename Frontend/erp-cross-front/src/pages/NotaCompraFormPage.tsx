import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { FileDown, Search, Trash2 } from 'lucide-react';
import { NotaCompraService } from '../services/notaCompraService';
import { NotaCompraItemService } from '../services/notaCompraItemService';
import { ParcelaCondicaoPagamentoService } from '../services/parcelaCondicaoPagamentoService';
import { UnidadeMedidaService } from '../services/unidadeMedidaService';
import type { NotaCompraCreate, ParcelaNotaCompra, UnidadeMedidaView } from '../types/entities';
import CondicaoPagamentoLookupModal from '../components/CondicaoPagamentoLookupModal';
import FornecedorLookupModal from '../components/FornecedorLookupModal';
import TransportadoraLookupModal from '../components/TransportadoraLookupModal';
import ProdutoLookupModal from '../components/ProdutoLookupModal';
import VeiculoLookupModal from '../components/VeiculoLookupModal';
import CurrencyInput from '../components/CurrencyInput';
import './PaisesPage.css';

function toInputDate(value: string | null |undefined): string {
  if (!value) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(value))
    return value;

  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (br)
    return `${br[3]}-${br[2]}-${br[1]}`;

  if (value.includes('T'))
    return value.split('T')[0];

  const d = new Date(value);

  if (isNaN(d.getTime()))
    return '';

  return d.toISOString().split('T')[0];
}

// Tipo interno para uso no formulário (diferente do NotaCompraItemCreate)
interface ProdutoFormulario {
  idProduto: number;
  produtoId?: number;
  quantidade: number;
  precoUnit: number;
  desconto: number; // em percentual
  descontoUnit?: number; // em reais
  idNotaCompra?: number;
  notaCompraId?: number;
  nomeProduto?: string;
  unidadeMedidaId?: number;
  unidadeId?: number;
  nomeUnidade?: string;
  rateioCusto?: number;
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
  const [produtos, setProdutos] = useState<ProdutoFormulario[]>([]);
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
  const [showVeiculoModal, setShowVeiculoModal] = useState(false);
  const [notaValidada, setNotaValidada] = useState(false);
  const [parcelas, setParcelas] = useState<ParcelaNotaCompra[]>([]);
  const [unidades, setUnidades] = useState<UnidadeMedidaView[]>([]);

  useEffect(() => {
    UnidadeMedidaService.getAll()
      .then(res => setUnidades(res.data))
      .catch(() => setUnidades([]));
  }, []);

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
        setNotaValidada(true); // Auto-validate when editing
        
        // Carregar produtos
        return NotaCompraItemService.getByNotaCompraId(Number(id));
      })
      .then(res => {
        // Converter do formato backend para o formato interno do frontend
        setProdutos(res.data.map(item => ({
          idProduto: item.produtoId,
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnit: item.precoUnit,
          descontoUnit: item.descontoUnit,
          desconto: item.precoUnit > 0 ? Math.round((item.descontoUnit / item.precoUnit) * 10000) / 100 : 0,
          idNotaCompra: item.notaCompraId,
          notaCompraId: item.notaCompraId,
          nomeProduto: item.nomeProduto,
          unidadeMedidaId: item.unidadeId,
          unidadeId: item.unidadeId,
          nomeUnidade: item.nomeUnidade,
          rateioCusto: item.rateio,
        })));
      })
      .catch(() => navigate('/notas-compra'))
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  // Gera as parcelas a partir da condição de pagamento escolhida e do total da nota
  useEffect(() => {
    if (!form.condicaoPagamentoId) {
      setParcelas([]);
      return;
    }

    const calculatedTotalProd = produtos.reduce((sum, p) => {
      const subtotal = p.quantidade * p.precoUnit;
      const descontoReais = (subtotal * (p.desconto || 0)) / 100;
      return sum + (subtotal - descontoReais);
    }, 0);

    const totalPag =
      calculatedTotalProd +
      Number(form.valorFrete) +
      Number(form.valorSeguro) +
      Number(form.outrasDespesas);

    if (totalPag <= 0) {
      setParcelas([]);
      return;
    }

    let cancelado = false;

    ParcelaCondicaoPagamentoService.getByCondicaoId(form.condicaoPagamentoId)
      .then(res => {
        if (cancelado) return;

        const base = form.dataEmissao ? new Date(form.dataEmissao + 'T00:00:00') : new Date();
        const defs = [...res.data].sort((a, b) => a.numero - b.numero);
        let acumulado = 0;

        const geradas: ParcelaNotaCompra[] = defs.map((d, i) => {
          const ultima = i === defs.length - 1;
          const valor = ultima
            ? Math.round((totalPag - acumulado) * 100) / 100
            : Math.round(totalPag * d.percentual) / 100;
          acumulado += valor;

          const venc = new Date(base);
          venc.setDate(venc.getDate() + d.dias);

          return {
            id: d.id,
            numParcela: d.numero,
            formaPagamentoId: d.formaPagamentoId,
            nomeFormaPagamento: d.nomeFormaPagamento,
            dataVencimento: toInputDate(venc.toISOString()),
            valorParcela: valor,
            pago: false,
          };
        });

        setParcelas(geradas);
      })
      .catch(() => setParcelas([]));

    return () => { cancelado = true; };
  }, [form.condicaoPagamentoId, form.dataEmissao, form.valorFrete, form.valorSeguro, form.outrasDespesas, form.tipoFrete, produtos]);

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

    if (!form.transportadoraId) {
      setError('Transportadora é obrigatória.');
      return;
    }

    if (!form.placaVeiculo?.trim()) {
      setError('Placa do veículo é obrigatória.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const formToSave = { 
        ...form, 
        totalProdutos: calculatedTotalProdutos,
        // Enviar datas como string YYYY-MM-DD (sem hora)
        dataEmissao: form.dataEmissao || new Date().toISOString().split('T')[0],
        dataChegada: form.dataChegada || undefined,
      };

      let notaId: number;

      if (isEdit) {
        notaId = Number(id);
        await NotaCompraService.update(notaId, formToSave);
        
        // Deletar TODOS os produtos antigos antes de salvar os novos
        const produtosAtuais = await NotaCompraItemService.getByNotaCompraId(notaId);
        await Promise.all(produtosAtuais.data.map(prod => NotaCompraItemService.remove(prod.id)));
      } else {
        const response = await NotaCompraService.create(formToSave);
        notaId = response.data.id;
      }

      // Salvar produtos
      for (const produto of produtos) {
        const descontoReais = Math.round((produto.precoUnit * (produto.desconto || 0)) / 100 * 100) / 100; // Arredondar para 2 casas
        await NotaCompraItemService.create({
          notaCompraId: notaId,
          produtoId: produto.idProduto,
          unidadeId: produto.unidadeMedidaId || 0,
          quantidade: produto.quantidade,
          precoUnit: produto.precoUnit,
          descontoUnit: descontoReais,
          ativo: true,
        });
      }

      navigate('/notas-compra');

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
    (form.tipoFrete === 'FOB' ? Number(form.valorFrete) : 0) +
    Number(form.valorSeguro) +
    Number(form.outrasDespesas);

  const canFillForm = form.numeroNota.trim() !== '' && 
                      form.modelo.trim() !== '' && 
                      form.serie.trim() !== '';

  const canValidateNota = canFillForm && form.fornecedorId > 0 && !notaValidada;

  const maxDataPermitida = new Date().toISOString().split('T')[0];

  function handleValidateNota() {
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

    setError('');
    setNotaValidada(true);
  }

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
                    disabled={isEdit || notaValidada}
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
                    disabled={isEdit || notaValidada}
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
                    disabled={isEdit || notaValidada}
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

                <div className="form-group lookup-code-group">
                  <label>Cód.</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="text"
                      value={form.fornecedorId > 0 ? form.fornecedorId : ''}
                      placeholder="ID"
                      readOnly
                      disabled={notaValidada}
                      className="lookup-input"
                      style={{ width: '100%', textAlign: 'center' }}
                    />
                    <button
                      type="button"
                      className="btn-lookup"
                      disabled={notaValidada}
                      onClick={() => setShowFornecedorModal(true)}
                      title="Pesquisar fornecedor"
                      style={{ padding: '4px 8px' }}
                    >
                      <Search size={16} />
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Fornecedor *</label>
                  <input
                    type="text"
                    value={nomeFornecedor}
                    placeholder="Selecione um fornecedor..."
                    readOnly
                    disabled={notaValidada}
                    className="lookup-input"
                  />
                </div>

              </div>

              {!isEdit && (
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {!notaValidada ? (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleValidateNota}
                      disabled={!canValidateNota}
                      title={!canValidateNota ? 'Preencha número, modelo, série e fornecedor' : 'Validar e liberar preenchimento dos demais campos'}
                    >
                      ✓ Validar Nota
                    </button>
                  ) : (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '0.9em',
                      fontWeight: 500
                    }}>
                      ✓ Nota Validada
                    </span>
                  )}
                </div>
              )}

              <div className="form-row">

                <div className="form-group">
                  <label>Data de Emissão *</label>

                  <input
                    type="date"
                    value={form.dataEmissao}
                    max={maxDataPermitida}
                    disabled={!notaValidada}
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
                    min={form.dataEmissao}
                    max={maxDataPermitida}
                    disabled={!notaValidada}
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
            {!notaValidada && !isEdit && (
              <div style={{
                padding: '12px',
                marginBottom: '16px',
                backgroundColor: '#fef3c7',
                border: '1px solid #fcd34d',
                borderRadius: '4px',
                color: '#78350f',
                fontSize: '0.9em',
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                <span>⚠️</span>
                <span><strong>Atenção:</strong> Valide a nota preenchendo número, modelo, série e fornecedor para liberar os demais campos.</span>
              </div>
            )}
            {/* Transporte */}
            <div className="form-section">
              <h2 className="form-section-title">
                Transporte
              </h2>

              <div className="form-row">
                <div className="form-group lookup-code-group">
                  <label>Cód.</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="text"
                      value={form.transportadoraId ?? 0 > 0 ? form.transportadoraId ?? 0 : ''}
                      placeholder="ID"
                      readOnly
                      className="lookup-input"
                      style={{ width: '100%', textAlign: 'center' }}
                    />
                    <button
                      type="button"
                      className="btn-lookup"
                      disabled={!notaValidada}
                      onClick={() => setShowTransportadoraModal(true)}
                      title="Pesquisar transportadora"
                      style={{ padding: '4px 8px' }}
                    >
                      <Search size={16} />
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Transportadora *</label>
                  <input
                    type="text"
                    value={nomeTransportadora}
                    placeholder="Selecione uma transportadora..."
                    readOnly
                    disabled={!notaValidada}
                    className="lookup-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Placa do Veículo *</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={form.placaVeiculo ?? ''}
                      disabled={true}
                      placeholder="Selecione um veículo"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => setShowVeiculoModal(true)}
                      disabled={!form.transportadoraId || !notaValidada}
                      title={!notaValidada ? 'Valide a nota primeiro' : !form.transportadoraId ? 'Selecione uma transportadora primeiro' : 'Selecionar veículo'}
                    >
                      <Search size={16} />
                    </button>
                  </div>
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
                      <th style={{ width: 40 }}>CÓDIGO</th>
                      <th>PRODUTO</th>
                      <th style={{ width: 90 }}>QTD</th>
                      <th style={{ width: 80 }}>VALOR UN.</th>
                      <th style={{ width: 90 }}>DESC. %</th>
                      <th style={{ width: 120 }}>PREÇO LÍQ. UN.</th>
                      <th style={{ width: 110 }}>UNIDADE</th>
                      <th style={{ width: 100 }}>TOTAL</th>
                      <th style={{ width: 100 }}>RATEIO</th>
                      <th style={{ width: 50 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="table-empty">Nenhum produto adicionado.</td>
                      </tr>
                    ) : (
                      produtos.map((p, idx) => {
                        const subtotal = p.quantidade * p.precoUnit;
                        const descontoReais = (subtotal * (p.desconto || 0)) / 100;
                        const total = subtotal - descontoReais;
                        
                        // Calcular rateio por valor total
                        const totalProdutosCalc = produtos.reduce((sum, prod) => {
                          const st = prod.quantidade * prod.precoUnit;
                          const desc = (st * (prod.desconto || 0)) / 100;
                          return sum + (st - desc);
                        }, 0);
                        
                        const custoAditional = (form.tipoFrete === 'FOB' ? Number(form.valorFrete) : 0) + Number(form.valorSeguro) + Number(form.outrasDespesas);
                        const rateioProd = totalProdutosCalc > 0 ? (total / totalProdutosCalc) * custoAditional : 0;
                        
                        return (
                        <tr key={idx}>
                          <td className="col-code">{p.idProduto}</td>
                          <td className="col-name">{p.nomeProduto || 'Produto ' + (idx + 1)}</td>
                          <td>
                            <input
                              type="number"
                              step="1"
                              min="0"
                              disabled={!notaValidada}
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
                              disabled={!notaValidada}
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
                            R$ {(p.precoUnit * (1 - (p.desconto || 0) / 100)).toFixed(2).replace('.', ',')}
                          </td>
                          <td>
                            <select
                              disabled={!notaValidada}
                              value={p.unidadeMedidaId || ''}
                              onChange={e => {
                                const newProdutos = [...produtos];
                                const unidadeSelecionada = unidades.find(u => u.id === Number(e.target.value));
                                newProdutos[idx].unidadeMedidaId = Number(e.target.value);
                                newProdutos[idx].nomeUnidade = unidadeSelecionada?.nomeUnidade;
                                setProdutos(newProdutos);
                              }}
                              className="produto-table-select"
                            >
                              <option value="">Selecione...</option>
                              {unidades.map(u => (
                                <option key={u.id} value={u.id}>{u.nomeUnidade}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            R$ {total.toFixed(2).replace('.', ',')}
                          </td>
                          <td>
                            R$ {rateioProd.toFixed(2).replace('.', ',')}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-icon"
                              disabled={!notaValidada}
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
                    disabled={!notaValidada}
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

              <div className="form-group" style={{ fontSize: '0.9em', marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Tipo Frete</label>
                <div className="tipo-frete-selector">
                  <button
                    type="button"
                    className={`tipo-frete-btn ${form.tipoFrete === 'CIF' ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, tipoFrete: 'CIF' })}
                    disabled={!notaValidada}
                  >
                    CIF
                  </button>
                  <button
                    type="button"
                    className={`tipo-frete-btn ${form.tipoFrete === 'FOB' ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, tipoFrete: 'FOB' })}
                    disabled={!notaValidada}
                  >
                    FOB
                  </button>
                </div>
              </div>

              <div className="form-row">

                {form.tipoFrete === 'FOB' && (
                  <div className="form-group" style={{ fontSize: '0.9em' }}>
                    <label>Valor do Frete</label>
                    <CurrencyInput
                      disabled={!notaValidada}
                      value={form.valorFrete}
                      onChange={value => setForm({ ...form, valorFrete: value })}
                    />
                  </div>
                )}
                <div className="form-group" style={{ fontSize: '0.9em' }}>
                  <label>Valor Seguro</label>
                  <CurrencyInput
                    disabled={!notaValidada}
                    value={form.valorSeguro ?? 0}
                    onChange={value => setForm({ ...form, valorSeguro: value })}
                  />
                </div>
                <div className="form-group" style={{ fontSize: '0.9em' }}>
                  <label>Outras Despesas</label>
                  <CurrencyInput
                    disabled={!notaValidada}
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

            {/* Formas de Pagamento */}
            <div className="form-section">

              <h2 className="form-section-title">
                Formas de Pagamento
              </h2>

              <div className="form-row">

                <div className="form-group lookup-code-group">
                  <label>Cód.</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="text"
                      value={form.condicaoPagamentoId ?? 0 > 0 ? form.condicaoPagamentoId ?? 0 : ''}
                      placeholder="ID"
                      readOnly
                      className="lookup-input"
                      style={{ width: '100%', textAlign: 'center' }}
                    />
                    <button
                      type="button"
                      className="btn-lookup"
                      disabled={!notaValidada}
                      onClick={() =>
                        setShowCondicaoModal(true)
                      }
                      title="Pesquisar condição de pagamento"
                      style={{ padding: '4px 8px' }}
                    >
                      <Search size={16} />
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Condição de Pagamento *</label>
                  <input
                    type="text"
                    value={nomeCondicao}
                    placeholder="Selecione uma condição..."
                    readOnly
                    disabled={!notaValidada}
                    className="lookup-input"
                  />
                </div>

              </div>

            </div>

            {parcelas.length > 0 && notaValidada && (
              <div className="form-section">
                <h2 className="form-section-title">Parcelas</h2>
                <div className="lookup-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>PARCELA</th>
                        <th>FORMA DE PAGAMENTO</th>
                        <th>DATA VENCIMENTO</th>
                        <th>VALOR DA PARCELA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parcelas.map(p => (
                        <tr key={p.numParcela}>
                          <td>{p.numParcela}</td>
                          <td>{p.nomeFormaPagamento || '—'}</td>
                          <td>{new Date(p.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                          <td>R$ {Number(p.valorParcela).toFixed(2).replace('.', ',')}</td>
                        </tr>
                      ))}
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
                  disabled={!notaValidada}
                  value={form.observacao ?? ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      observacao: e.target.value
                    })
                  }
                />
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
                  navigate('/notas-compra')
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
              unidadeMedidaId: unidades.length > 0 ? unidades[0].id : undefined,
              nomeUnidade: unidades.length > 0 ? unidades[0].nomeUnidade : undefined,
              rateioCusto: 0,
            }]);
            setShowProdutoModal(false);
          }}
        />
      )}

      {showVeiculoModal && (
        <VeiculoLookupModal
          onClose={() => setShowVeiculoModal(false)}
          onSelect={(_, placa) => {
            setForm({ ...form, placaVeiculo: placa });
            setShowVeiculoModal(false);
          }}
        />
      )}

    </>
  );
}