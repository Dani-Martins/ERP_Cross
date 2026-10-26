import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
import CurrencyInput from '../components/CurrencyInput';
import { calcularLinhaProduto } from '../utils/calculoProduto';
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

function today(): string {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
}

// Tipo interno para uso no formulário (diferente do NotaVendaItemCreate)
interface ProdutoFormulario {
  idProduto: number;
  produtoId?: number;
  quantidade: number;
  precoUnit: number;
  descontoEntrada: string;
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

  dataEmissao: today(),
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
export default function NotaVendaFormPage({ onClose }: { onClose?: () => void } = {}) {
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
  const [descontoFocado, setDescontoFocado] = useState<number | null>(null);
  const [descontoTooltipPos, setDescontoTooltipPos] = useState<{ top: number; left: number; placement: 'top' | 'bottom' } | null>(null);
  const descontoInputRef = useRef<HTMLInputElement | null>(null);
  const [showCondicaoModal, setShowCondicaoModal] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showTransportadoraModal, setShowTransportadoraModal] = useState(false);
  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [showVeiculoModal, setShowVeiculoModal] = useState(false);
  const [notaValidada, setNotaValidada] = useState(false);
  const [parcelas, setParcelas] = useState<ParcelaNotaCompra[]>([]);
  const [unidades, setUnidades] = useState<UnidadeMedidaView[]>([]);

  useEffect(() => {
    if (descontoFocado === null) return;

    const atualizarPosicao = () => {
      const input = descontoInputRef.current;
      if (!input) return;
      const rect = input.getBoundingClientRect();
      const placement = rect.top >= 80 ? 'top' : 'bottom';
      setDescontoTooltipPos({
        top: placement === 'top' ? rect.top - 8 : rect.bottom + 8,
        left: Math.min(window.innerWidth - 90, Math.max(90, rect.left + rect.width / 2)),
        placement,
      });
    };

    atualizarPosicao();
    window.addEventListener('scroll', atualizarPosicao, true);
    window.addEventListener('resize', atualizarPosicao);
    return () => {
      window.removeEventListener('scroll', atualizarPosicao, true);
      window.removeEventListener('resize', atualizarPosicao);
    };
  }, [descontoFocado]);

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

    NotaVendaService.getByKey(numeroNota!, modelo!, serie!)
      .then(res => {
        const n = res.data;
        setForm({
          clienteId: n.clienteId,
          numeroNota: n.numeroNota,
          modelo: n.modelo,
          serie: n.serie,
          dataEmissao: toInputDate(n.dataEmissao),
          dataChegada: toInputDate(n.dataChegada),
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
          descontoEntrada: item.desconto
            ? ((item.precoUnit * item.desconto) / 100).toFixed(2).replace('.', ',')
            : '',
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

    const calculatedTotalProd = produtos.reduce(
      (sum, p) => sum + calcularLinhaProduto(p.quantidade, p.precoUnit, p.descontoEntrada).total,
      0,
    );

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

    if (form.dataEmissao > maxDataPermitida) {
      setError('A data de emissão não pode ser posterior à data atual.');
      return;
    }

    if (form.dataChegada && form.dataChegada > maxDataPermitida) {
      setError('A data de chegada não pode ser posterior à data atual.');
      return;
    }

    if (!form.condicaoPagamentoId) {
      setError('Condição de pagamento é obrigatória.');
      return;
    }

    // Validação de duplicação: verificar se já existe uma nota com esses dados
    if (!isEdit) {
      try {
        const existing = await NotaVendaService.getByKey(form.numeroNota, form.modelo, form.serie);
        if (existing && existing.data) {
          setError(`Já existe uma nota de venda com Número '${form.numeroNota}', Modelo '${form.modelo}' e Série '${form.serie}' para este cliente.`);
          return;
        }
      } catch (err) {
        // Se retorna erro 404, é ok - não existe nota duplicada
      }
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

      if (onClose) onClose();
      else navigate('/notas-venda');

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

  const calculatedTotalProdutos = produtos.reduce(
    (sum, p) => sum + calcularLinhaProduto(p.quantidade, p.precoUnit, p.descontoEntrada).total,
    0,
  );
  const totalPagar = calculatedTotalProdutos;

  const canFillForm = form.numeroNota.trim() !== '' && 
                      form.modelo.trim() !== '' && 
                      form.serie.trim() !== '';

  const canValidateNota = canFillForm && form.clienteId > 0 && !notaValidada;

  const maxDataPermitida = today();

  async function handleValidateNota() {
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

    // Validação de duplicação: verificar se já existe uma nota com esses dados
    try {
      const existing = await NotaVendaService.getByKey(form.numeroNota, form.modelo, form.serie);
      if (existing && existing.data) {
        setError(`Já existe uma nota de venda com Número '${form.numeroNota}', Modelo '${form.modelo}' e Série '${form.serie}'.`);
        return;
      }
    } catch (err) {
      // Se retorna erro 404, é ok - não existe nota duplicada
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

              <div className="form-row nota-identificacao-row">

                <div className="form-group">
                  <label>Número da Nota *</label>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={9}
                    value={form.numeroNota}
                    disabled={isEdit || notaValidada}
                    onChange={e =>
                      setForm({
                        ...form,
                        numeroNota: e.target.value.replace(/\D/g, '').slice(0, 9)
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Modelo *</label>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    value={form.modelo}
                    disabled={isEdit || notaValidada}
                    onChange={e =>
                      setForm({
                        ...form,
                        modelo: e.target.value.replace(/\D/g, '').slice(0, 3)
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Série *</label>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    value={form.serie}
                    disabled={isEdit || notaValidada}
                    onChange={e =>
                      setForm({
                        ...form,
                        serie: e.target.value.replace(/\D/g, '').slice(0, 3)
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
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {!notaValidada ? (
                    <>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleValidateNota}
                        disabled={!canValidateNota}
                        title={!canValidateNota ? 'Preencha número, modelo, série e cliente' : 'Validar e liberar preenchimento dos demais campos'}
                      >
                        ✓ Validar Nota
                      </button>
                      {error && (
                        <div style={{
                          width: '100%',
                          padding: '8px 12px',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '0.9em',
                        }}>
                          {error}
                        </div>
                      )}
                    </>
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
                    aria-invalid={form.dataEmissao > maxDataPermitida}
                    disabled={!notaValidada}
                    onChange={e =>
                      setForm({
                        ...form,
                        dataEmissao: e.target.value
                      })
                    }
                  />
                  {form.dataEmissao > maxDataPermitida && (
                    <div className="form-error">A data de emissão não pode ser posterior à data atual.</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Data de Chegada</label>
                  <input
                    type="date"
                    value={form.dataChegada ?? ''}
                    max={maxDataPermitida}
                    aria-invalid={Boolean(form.dataChegada && form.dataChegada > maxDataPermitida)}
                    disabled={!notaValidada}
                    onChange={e => setForm({ ...form, dataChegada: e.target.value })}
                  />
                  {form.dataChegada && form.dataChegada > maxDataPermitida && (
                    <div className="form-error">A data de chegada não pode ser posterior à data atual.</div>
                  )}
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

              <div className="form-row nota-transporte-row">
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

                <div className="form-group nota-transportadora-field">
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
                <div className="form-group nota-veiculo-field">
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
              <div className="lookup-table-wrap nota-venda-produtos-wrap">
                <table className="data-table nota-venda-produtos-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>CÓDIGO</th>
                      <th>PRODUTO</th>
                      <th style={{ width: 100 }}>UNIDADE</th>
                      <th style={{ width: 100 }}>QTD</th>
                      <th style={{ width: 140 }}>VALOR UN.</th>
                      <th style={{ width: 100 }}>DESCONTO</th>
                      <th style={{ width: 120 }}>PREÇO LÍQ. UN.</th>
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
                        const calculo = calcularLinhaProduto(p.quantidade, p.precoUnit, p.descontoEntrada);
                        const { liquidoUnit, total } = calculo;
                        const unidadeSelecionada = unidades.find(unidade => unidade.id === p.unidadeMedidaId);
                        
                        return (
                        <tr key={idx}>
                          <td className="col-code">{p.idProduto}</td>
                          <td className="col-name">{p.nomeProduto || 'Produto ' + (idx + 1)}</td>
                          <td>
                            {unidadeSelecionada?.sigla ?? p.nomeUnidade ?? '—'}
                          </td>
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
                            <CurrencyInput
                              disabled={!notaValidada}
                              value={p.precoUnit}
                              onChange={value => {
                                const newProdutos = [...produtos];
                                newProdutos[idx].precoUnit = value;
                                setProdutos(newProdutos);
                              }}
                              className="produto-table-input"
                            />
                          </td>
                          <td>
                            <div className="discount-input-wrap">
                              <input
                                type="text"
                                inputMode="text"
                                disabled={!notaValidada}
                                value={p.descontoEntrada}
                                placeholder="Ex.: 10 ou 10,50"
                                onFocus={event => {
                                  descontoInputRef.current = event.currentTarget;
                                  setDescontoFocado(idx);
                                }}
                                onBlur={() => {
                                  descontoInputRef.current = null;
                                  setDescontoFocado(null);
                                  setDescontoTooltipPos(null);
                                }}
                                onChange={e => {
                                  const newProdutos = [...produtos];
                                  newProdutos[idx].descontoEntrada = e.target.value;
                                  setProdutos(newProdutos);
                                }}
                                className="produto-table-input"
                              />
                            </div>
                          </td>
                          <td>
                            R$ {liquidoUnit.toFixed(2).replace('.', ',')}
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
                onClick={() => onClose ? onClose() : navigate('/notas-venda')}
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
          onSelect={(id, nome, idCondicaoPagamento, nomeCondicaoPagamento) => {
            setForm(current => ({
              ...current,
              condicaoPagamentoId: idCondicaoPagamento || undefined,
              clienteId: id
            }));
            setNomeCliente(nome);
            setNomeCondicao(nomeCondicaoPagamento ?? '');
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
          tipo="venda"
          onClose={() => setShowProdutoModal(false)}
          onSelect={(id, nomeProduto, unidadeId, nomeUnidade) => {
            setProdutos([...produtos, {
              idProduto: id,
              quantidade: 1,
              precoUnit: 0,
              descontoEntrada: '',
              idNotaVenda: 0,
              nomeProduto: nomeProduto,
              unidadeMedidaId: unidadeId,
              nomeUnidade,
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

      {descontoFocado !== null && descontoTooltipPos && produtos[descontoFocado] && createPortal(
        <div
          className="discount-tooltip"
          data-placement={descontoTooltipPos.placement}
          role="tooltip"
          style={{
            left: descontoTooltipPos.left,
            top: descontoTooltipPos.top,
            transform: descontoTooltipPos.placement === 'top' ? 'translate(-50%, -100%)' : 'translateX(-50%)',
          }}
        >
          <span>Inteiro = percentual. Use vírgula para reais.</span>
          {produtos[descontoFocado].descontoEntrada.trim() && (() => {
            const produto = produtos[descontoFocado];
            const calculo = calcularLinhaProduto(produto.quantidade, produto.precoUnit, produto.descontoEntrada);
            return (
              <>
                <strong>{produto.descontoEntrada.includes(',') ? 'Valor informado' : 'Percentual informado'}: {produto.descontoEntrada.includes(',') ? `R$ ${calculo.descontoUnit.toFixed(2).replace('.', ',')}` : `${calculo.descontoPercentual.toFixed(2).replace('.', ',')}%`}</strong>
                <span>Equivale a {produto.descontoEntrada.includes(',') ? `${calculo.descontoPercentual.toFixed(2).replace('.', ',')}%` : `R$ ${calculo.descontoUnit.toFixed(2).replace('.', ',')}`}</span>
              </>
            );
          })()}
        </div>,
        document.body,
      )}

    </>
  );
}
