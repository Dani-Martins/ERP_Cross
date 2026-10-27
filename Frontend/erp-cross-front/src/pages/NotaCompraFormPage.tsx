import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

// Tipo interno para uso no formulário (diferente do NotaCompraItemCreate)
interface ProdutoFormulario {
  idProduto: number;
  produtoId?: number;
  quantidade: number;
  precoUnit: number;
  descontoEntrada: string;
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

  dataEmissao: today(),
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
export default function NotaCompraFormPage({ onClose }: { onClose?: () => void } = {}) {
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
  const [descontoFocado, setDescontoFocado] = useState<number | null>(null);
  const [descontoTooltipPos, setDescontoTooltipPos] = useState<{ top: number; left: number; placement: 'top' | 'bottom' } | null>(null);
  const descontoInputRef = useRef<HTMLInputElement | null>(null);
  const [showCondicaoModal, setShowCondicaoModal] = useState(false);
  const [showFornecedorModal, setShowFornecedorModal] = useState(false);
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
          descontoEntrada: item.descontoUnit.toFixed(2).replace('.', ','),
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

    const calculatedTotalProd = produtos.reduce(
      (sum, p) => sum + calcularLinhaProduto(p.quantidade, p.precoUnit, p.descontoEntrada).total,
      0,
    );

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

    if (form.dataEmissao > maxDataPermitida) {
      setError('A data de emissão não pode ser posterior à data atual.');
      return;
    }

    if (!form.dataChegada) {
      setError('Data de chegada é obrigatória.');
      return;
    }

    if (form.dataChegada > maxDataPermitida) {
      setError('A data de chegada não pode ser posterior à data atual.');
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

    // Validação de duplicação: verificar se já existe uma nota com esses dados
    if (!isEdit) {
      try {
        const notasExistentes = await NotaCompraService.getAll();
        const duplicada = notasExistentes.data.some(nota => 
          nota.numeroNota === form.numeroNota &&
          nota.modelo === form.modelo &&
          nota.serie === form.serie
        );
        if (duplicada) {
          setError(`Já existe uma nota de compra com Número '${form.numeroNota}', Modelo '${form.modelo}' e Série '${form.serie}'.`);
          return;
        }
      } catch (err) {
        // Se houver erro ao buscar, continua o fluxo (deixa o backend validar)
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
        const { descontoUnit } = calcularLinhaProduto(produto.quantidade, produto.precoUnit, produto.descontoEntrada);
        await NotaCompraItemService.create({
          notaCompraId: notaId,
          produtoId: produto.idProduto,
          unidadeId: produto.unidadeMedidaId || 0,
          quantidade: produto.quantidade,
          precoUnit: produto.precoUnit,
          descontoUnit,
          ativo: true,
        });
      }

      if (onClose) onClose();
      else navigate('/notas-compra');

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
          axiosErr.response?.data?.message ??
          'Erro ao salvar a nota de compra.'
        );

      }

      setSaving(false);

    }

  }

  const calculatedTotalProdutos = produtos.reduce(
    (sum, p) => sum + calcularLinhaProduto(p.quantidade, p.precoUnit, p.descontoEntrada).total,
    0,
  );


  const totalPagar =
    calculatedTotalProdutos +
    (form.tipoFrete === 'FOB' ? Number(form.valorFrete) : 0) +
    Number(form.valorSeguro) +
    Number(form.outrasDespesas);

  const canFillForm = form.numeroNota.trim() !== '' && 
                      form.modelo.trim() !== '' && 
                      form.serie.trim() !== '';

  const canValidateNota = canFillForm && form.fornecedorId > 0 && !notaValidada;

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
    if (!form.fornecedorId) {
      setError('Fornecedor é obrigatório.');
      return;
    }

    // Validação de duplicação: verificar se já existe uma nota com esses dados
    try {
      const notasExistentes = await NotaCompraService.getAll();
      const duplicada = notasExistentes.data.some(nota => 
        nota.numeroNota === form.numeroNota &&
        nota.modelo === form.modelo &&
        nota.serie === form.serie
      );
      if (duplicada) {
        setError(`Já existe uma nota de compra com Número '${form.numeroNota}', Modelo '${form.modelo}' e Série '${form.serie}'.`);
        return;
      }
    } catch (err) {
      setError('Erro ao validar unicidade da nota.');
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
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {!notaValidada ? (
                    <>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleValidateNota}
                        disabled={!canValidateNota}
                        title={!canValidateNota ? 'Preencha número, modelo, série e fornecedor' : 'Validar e liberar preenchimento dos demais campos'}
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
                  <label>Data de Chegada *</label>

                  <input
                    type="date"
                    value={form.dataChegada ?? ''}
                    max={maxDataPermitida}
                    aria-invalid={Boolean(form.dataChegada && form.dataChegada > maxDataPermitida)}
                    disabled={!notaValidada}
                    onChange={e =>
                      setForm({
                        ...form,
                        dataChegada: e.target.value
                      })
                    }
                  />
                  {form.dataChegada && form.dataChegada > maxDataPermitida && (
                    <div className="form-error">A data de chegada não pode ser posterior à data atual.</div>
                  )}
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
            {/* Produtos */}
            <div className="form-section">
              <h2 className="form-section-title">Produtos</h2>
              <div className="lookup-table-wrap nota-compra-produtos-wrap">
                <table className="data-table nota-compra-produtos-table">
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
                        const calculo = calcularLinhaProduto(p.quantidade, p.precoUnit, p.descontoEntrada);
                        const { liquidoUnit, total } = calculo;
                        const unidadeSelecionada = unidades.find(unidade => unidade.id === p.unidadeMedidaId);

                        const despesasAdicionais = (form.tipoFrete === 'FOB' ? Number(form.valorFrete) : 0) + Number(form.valorSeguro) + Number(form.outrasDespesas);
                        const rateioProd = calculatedTotalProdutos > 0 && p.quantidade > 0
                          ? (total / calculatedTotalProdutos * despesasAdicionais) / p.quantidade
                          : 0;
                        
                        return (
                        <tr key={idx}>
                          <td className="col-code" data-label="Código">{p.idProduto}</td>
                          <td className="col-name" data-label="Produto">{p.nomeProduto || 'Produto ' + (idx + 1)}</td>
                          <td data-label="Unidade">
                            {unidadeSelecionada?.sigla ?? p.nomeUnidade ?? '—'}
                          </td>
                          <td data-label="Quantidade">
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
                          <td data-label="Valor unitário">
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
                          <td data-label="Desconto">
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
                          <td data-label="Preço líquido unitário">
                            R$ {liquidoUnit.toFixed(2).replace('.', ',')}
                          </td>
                          <td data-label="Total">
                            R$ {total.toFixed(2).replace('.', ',')}
                          </td>
                          <td data-label="Rateio">
                            R$ {(p.precoUnit + rateioProd).toFixed(2).replace('.', ',')}
                          </td>
                          <td className="nota-produto-actions">
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
                <div className="form-group nota-veiculo-field">
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

                        {/* Valores */}
            <div className="form-section">

              <h2 className="form-section-title">
                Valores
              </h2>

              <div className="nota-valores-row">
                <div className="form-group nota-tipo-frete-field">
                  <label>Tipo Frete</label>
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

                {form.tipoFrete === 'FOB' && (
                  <div className="form-group nota-valor-frete-field">
                    <label>Valor do Frete</label>
                    <CurrencyInput
                      disabled={!notaValidada}
                      value={form.valorFrete}
                      onChange={value => setForm({ ...form, valorFrete: value })}
                    />
                  </div>
                )}
                <div className="form-group nota-valor-despesa-field">
                  <label>Valor Seguro</label>
                  <CurrencyInput
                    disabled={!notaValidada}
                    value={form.valorSeguro ?? 0}
                    onChange={value => setForm({ ...form, valorSeguro: value })}
                  />
                </div>
                <div className="form-group nota-valor-despesa-field">
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
                onClick={() => onClose ? onClose() : navigate('/notas-compra')}
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
          onSelect={(id, nome, idCondicaoPagamento, nomeCondicaoPagamento) => {
            setForm(current => ({
              ...current,
              condicaoPagamentoId: idCondicaoPagamento || undefined,
              fornecedorId: id
            }));
            setNomeFornecedor(nome);
            setNomeCondicao(nomeCondicaoPagamento ?? '');
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
          tipo="compra"
          onClose={() => setShowProdutoModal(false)}
          onSelect={(id, nomeProduto, unidadeId, nomeUnidade) => {
            setProdutos([...produtos, {
              idProduto: id,
              quantidade: 1,
              precoUnit: 0,
              descontoEntrada: '',
              idNotaCompra: 0,
              nomeProduto: nomeProduto,
              unidadeMedidaId: unidadeId,
              nomeUnidade,
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