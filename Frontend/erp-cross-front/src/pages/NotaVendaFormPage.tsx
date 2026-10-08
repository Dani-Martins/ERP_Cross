import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { FileDown, Search, Trash2 } from 'lucide-react';
import { NotaVendaService, NotaVendaItemService } from '../services/notaVendaService';
import { ParcelaCondicaoPagamentoService } from '../services/parcelaCondicaoPagamentoService';
import { UnidadeMedidaService } from '../services/unidadeMedidaService';
import type { NotaVendaCreate, ParcelaNotaCompra, UnidadeMedidaView } from '../types/entities';
import CondicaoPagamentoLookupModal from '../components/CondicaoPagamentoLookupModal';
import ClienteLookupModal from '../components/ClienteLookupModal';
import TransportadoraLookupModal from '../components/TransportadoraLookupModal';
import ProdutoLookupModal from '../components/ProdutoLookupModal';
import VeiculoLookupModal from '../components/VeiculoLookupModal';
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

// Tipo interno para uso no formulário (diferente do NotaVendaItemCreate)
interface ProdutoFormulario {
  idProduto: number;
  produtoId?: number;
  quantidade: number;
  precoUnit: number;
  desconto: number; // em percentual
  descontoUnit?: number; // em reais
  idNotaVenda?: number;
  notaVendaId?: number;
  nomeProduto?: string;
  unidadeMedidaId?: number;
  unidadeId?: number;
  nomeUnidade?: string;
}

const EMPTY: NotaVendaCreate = {
  clienteId: 0,

  numeroNota: '',
  modelo: '',
  serie: '',

  dataEmissao: new Date().toISOString().split('T')[0],
  dataChegada: '',

  tipoFrete: 'CIF',

  valorFrete: 0,
  valorSeguro: 0,
  desconto: 0,
  outrosCustos: 0,

  totalProdutos: 0,

  condicaoPagamentoId: undefined,

  transportadoraId: undefined,

  placaVeiculo: '',

  observacao: '',

  status: 'ABERTA',

  ativo: true,
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
  const [produtos, setProdutos] = useState<ProdutoFormulario[]>([]);
  const [nomeCliente, setNomeCliente] = useState('');
  const [nomeTransportadora, setNomeTransportadora] = useState('');
  const [nomeCondicao, setNomeCondicao] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showCondicaoModal, setShowCondicaoModal] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
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

    NotaVendaService.getByKey(numeroNota!, modelo!, serie!, Number(clienteId))
      .then(res => {
        const n = res.data;
        setForm({
          clienteId: n.clienteId,
          numeroNota: n.numeroNota,
          modelo: n.modelo,
          serie: n.serie,
          dataEmissao: toInputDate(n.dataEmissao),
          dataChegada: '',
          tipoFrete: 'CIF',
          valorFrete: 0,
          valorSeguro: 0,
          desconto: n.desconto,
          outrosCustos: 0,
          totalProdutos: n.totalProdutos,
          condicaoPagamentoId: n.condicaoPagamentoId,
          transportadoraId: n.transportadoraId,
          placaVeiculo: n.placaVeiculo ?? '',
          observacao: n.observacao ?? '',
          status: n.status ?? 'ABERTA',
          ativo: n.ativo,
        });
        setNomeCliente(n.nomeCliente ?? '');
        setNomeTransportadora(n.nomeTransportadora ?? '');
        setNomeCondicao(n.nomeCondicaoPagamento ?? '');
        setNotaValidada(true); // Auto-validate when editing
        
        // Carregar produtos
        return NotaVendaItemService.getAll();
      })
      .then(res => {
        // Filtrar apenas os produtos desta nota
        const produtosDaNota = res.data.filter(item => 
          item.idNotaVenda && 
          (numeroNota ? item.nomeProduto : true) // placeholder - backend deve filtrar
        );
        
        // Converter do formato backend para o formato interno do frontend
        setProdutos(produtosDaNota.map(item => ({
          idProduto: item.idProduto,
          produtoId: item.idProduto,
          quantidade: item.quantidade,
          precoUnit: item.precoUnit,
          descontoUnit: item.desconto ? item.precoUnit * (item.desconto / 100) : 0,
          desconto: item.desconto || 0,
          idNotaVenda: item.idNotaVenda,
          notaVendaId: item.idNotaVenda,
          nomeProduto: item.nomeProduto,
        })));
      })
      .catch(() => navigate('/notas-venda'))
      .finally(() => setLoading(false));
  }, [numeroNota, modelo, serie, clienteId, isEdit, navigate]);

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

    const totalPag = calculatedTotalProd;

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
  }, [form.condicaoPagamentoId, form.dataEmissao, produtos]);

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
      const formToSave = { 
        ...form, 
        totalProdutos: calculatedTotalProdutos,
        // Enviar datas como string YYYY-MM-DD (sem hora)
        dataEmissao: form.dataEmissao || new Date().toISOString().split('T')[0],
        dataChegada: form.dataChegada || undefined,
      };

      if (isEdit) {
        await NotaVendaService.update(numeroNota!, modelo!, serie!, Number(clienteId), formToSave);
        
        // Deletar TODOS os produtos antigos antes de salvar os novos (usando NotaVendaItemService que trabalha com ID)
        const produtosAtuais = await NotaVendaItemService.getAll();
        const produtosDaNota = produtosAtuais.data.filter(p => p.idNotaVenda === form.condicaoPagamentoId); // placeholder
        await Promise.all(produtosDaNota.map(prod => NotaVendaItemService.remove(prod.id)));
      } else {
        await NotaVendaService.create(formToSave);
      }

      navigate('/notas-venda');

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
          'Erro ao salvar a nota de venda.'
        );

      }

      setSaving(false);

    }

  }

  const totalProdutosSemDesconto = produtos.reduce((sum, p) => {
    const subtotal = p.quantidade * p.precoUnit;
    return sum + subtotal;
  }, 0);

  const totalComDesconto = produtos.reduce((sum, p) => {
    const subtotal = p.quantidade * p.precoUnit;
    const descontoReais = (subtotal * (p.desconto || 0)) / 100;
    return sum + (subtotal - descontoReais);
  }, 0);

  const calculatedTotalProdutos = totalProdutosSemDesconto;
  const totalPagar = totalComDesconto;

  const canFillForm = form.numeroNota.trim() !== '' && 
                      form.modelo.trim() !== '' && 
                      form.serie.trim() !== '';

  const canValidateNota = canFillForm && form.clienteId > 0 && !notaValidada;

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
    if (!form.clienteId) {
      setError('Cliente é obrigatório.');
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
                ? 'Editar Nota de Venda'
                : 'Nova Nota de Venda'}
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
                      value={form.clienteId > 0 ? form.clienteId : ''}
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
                      onClick={() => setShowClienteModal(true)}
                      title="Pesquisar cliente"
                      style={{ padding: '4px 8px' }}
                    >
                      <Search size={16} />
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Cliente *</label>
                  <input
                    type="text"
                    value={nomeCliente}
                    placeholder="Selecione um cliente..."
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
                      title={!canValidateNota ? 'Preencha número, modelo, série e cliente' : 'Validar e liberar preenchimento dos demais campos'}
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

              </div>

            </div>
                        {/* Cliente e Pagamento */}
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
                <span><strong>Atenção:</strong> Valide a nota preenchendo número, modelo, série e cliente para liberar os demais campos.</span>
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
                  <label>Transportadora</label>
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
                  <label>Placa do Veículo</label>
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
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '16px', gap: '32px' }}>
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
                  display: 'flex',
                  gap: '40px',
                  alignItems: 'center'
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
                    <span>Total dos Produtos:</span>
                    <span style={{ fontSize: '1.4em', fontWeight: '800', color: 'var(--text-primary)' }}>
                      R$ {calculatedTotalProdutos.toFixed(2).replace('.', ',')}
                    </span>
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
                    <span>Total a Receber:</span>
                    <span style={{ fontSize: '1.4em', fontWeight: '800', color: 'var(--text-primary)' }}>
                      R$ {totalPagar.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
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
                  navigate('/notas-venda')
                }
              >
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
            setForm({
              ...form,
              clienteId: id
            });
            setNomeCliente(nome);
            setShowClienteModal(false);
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
          onSelect={(id, nomeProduto, _, __, precoVenda) => {
            setProdutos([...produtos, {
              idProduto: id,
              quantidade: 1,
              precoUnit: precoVenda || 0,
              desconto: 0,
              idNotaVenda: 0,
              nomeProduto: nomeProduto,
              unidadeMedidaId: unidades.length > 0 ? unidades[0].id : undefined,
              nomeUnidade: unidades.length > 0 ? unidades[0].nomeUnidade : undefined,
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
