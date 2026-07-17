// ── País ──────────────────────────────────────────────────────────────────────
export interface PaisView {
  id: number;
  nomePais: string;
  sigla: string;
  ddi: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}
export interface PaisCreate {
  nomePais: string;
  sigla: string;
  ddi: string;
  ativo: boolean;
}
export type PaisUpdate = PaisCreate;

// ── Estado ───────────────────────────────────────────────────────────────────
export interface EstadoView {
  id: number;
  nomeEstado: string;
  uf: string;
  idPais: number;
  nomePais?: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}
export interface EstadoCreate {
  nomeEstado: string;
  uf: string;
  idPais: number;
  ativo: boolean;
}
export type EstadoUpdate = EstadoCreate;

// ── Cidade ────────────────────────────────────────────────────────────────────
export interface CidadeView {
  id: number;
  nomeCidade: string;
  ddd: string;
  idEstado: number;
  nomeEstado?: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}
export interface CidadeCreate {
  nomeCidade: string;
  ddd: string;
  idEstado: number;
  ativo: boolean;
}
export type CidadeUpdate = CidadeCreate;

// ── Cargo ─────────────────────────────────────────────────────────────────────
export interface CargoView {
  id: number;
  nomeCargo: string;
  descricao?: string;
  salarioBase: number;
  exigeCnh: boolean;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface CargoCreate {
  nomeCargo: string;
  descricao?: string;
  salarioBase: number;
  exigeCnh: boolean;
  ativo: boolean;
}

export type CargoUpdate = CargoCreate;

// ── Fornecedor ────────────────────────────────────────────────────────────────
export interface FornecedorView {
  id: number;
  nome: string;
  nomeFantasia?: string;
  cpfCnpj: string;
  rgIe?: string;
  contato2?: string;
  celular?: string;
  email?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  idCidade: number;
  nomeCidade?: string;
  idCondicaoPagamento: number;
  nomeCondicaoPagamento?: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface FornecedorCreate {
  nome: string;
  nomeFantasia?: string;
  cpfCnpj: string;
  rgIe?: string;
  contato2?: string;
  celular?: string;
  email?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  idCidade: number;
  idCondicaoPagamento: number;
  ativo: boolean;
}

export type FornecedorUpdate = FornecedorCreate;

// ── Funcionário ───────────────────────────────────────────────────────────────
export interface FuncionarioView {
  id: number;
  nome: string;
  cpfCnpj: string;
  rgIe?: string;
  contato2?: string;
  celular?: string;
  email?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  idCidade: number;
  nomeCidade?: string;
  idCargo?: number;
  nomeCargo?: string;
  pis?: string;
  ctps?: string;
  salario?: number;
  dataAdmissao?: string;
  dataDemissao?: string;
  sexo?: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}
export interface FuncionarioCreate {
  nome: string;
  cpfCnpj: string;
  rgIe?: string;
  contato2?: string;
  celular?: string;
  email?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  idCidade: number;
  idCargo?: number;
  pis?: string;
  ctps?: string;
  salario?: number;
  dataAdmissao?: string;
  dataDemissao?: string;
  sexo?: string;
  ativo: boolean;
}
export type FuncionarioUpdate = FuncionarioCreate;

// ── Cliente ───────────────────────────────────────────────────────────────────
export interface ClienteView {
  id: number;
  nome: string;
  nomeFantasia?: string;
  cpfCnpj: string;
  rgIe?: string;
  contato2?: string;
  celular?: string;
  email?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  idCidade: number;
  nomeCidade?: string;
  pf: boolean;
  dataNascimento?: string;
  sexo?: string;
  idCondicaoPagamento?: number;
  nomeCondicaoPagamento?: string;
  limiteCredito: number;
  funcionalKids: boolean;
  nomeResponsavel?: string;
  cpfResponsavel?: string;
  parentescoResponsavel?: string;
  observacao?: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}
export interface ClienteCreate {
  nome: string;
  nomeFantasia?: string;
  cpfCnpj: string;
  rgIe?: string;
  contato2?: string;
  celular?: string;
  email?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  idCidade: number;
  pf: boolean;
  dataNascimento?: string;
  sexo?: string;
  idCondicaoPagamento?: number;
  limiteCredito: number;
  funcionalKids: boolean;
  nomeResponsavel?: string;
  cpfResponsavel?: string;
  parentescoResponsavel?: string;
  observacao?: string;
  ativo: boolean;
}
export type ClienteUpdate = ClienteCreate;

// ── Produto ───────────────────────────────────────────────────────────────────
export interface ProdutoView {
  id: number;
  nomeProduto: string;
  unidadeId?: number;
  marcaId?: number;
  categoriaId?: number;
  descricao?: string;
  codigoBarras?: string;
  custoCompra: number;
  precoVenda: number;
  lucroPercentual: number;
  estoque: number;
  estoqueMinimo: number;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
  nomeUnidade?: string;
  nomeMarca?: string;
  nomeCategoria?: string;
}
export interface ProdutoCreate {
  nomeProduto: string;
  unidadeId?: number;
  marcaId?: number;
  categoriaId?: number;
  descricao?: string;
  codigoBarras?: string;
  custoCompra: number;
  lucroPercentual: number;
  estoque: number;
  estoqueMinimo: number;
  ativo: boolean;
}
export type ProdutoUpdate = ProdutoCreate;

// ── Plano ─────────────────────────────────────────────────────────────────────
export interface PlanoView {
  id: number;
  nome: string;
  descricao?: string;
  valor: number;
  duracaoDias: number;
}
export interface PlanoCreate {
  nome: string;
  descricao?: string;
  valor: number;
  duracaoDias: number;
}
export type PlanoUpdate = PlanoCreate;

// ── Matrícula ─────────────────────────────────────────────────────────────────
export interface MatriculaView {
  id: number;
  dataInicio: string;
  dataFim: string;
  idCliente: number;
  nomeCliente?: string;
  idPlano: number;
  nomePlano?: string;
}
export interface MatriculaCreate {
  dataInicio: string;
  idCliente: number;
  idPlano: number;
}
export type MatriculaUpdate = MatriculaCreate;

// ── Forma de Pagamento ────────────────────────────────────────────────────────
export interface FormaPagamentoView {
  id: number;
  nomeFormaPagamento: string;
  aceitaParcela: boolean;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}
export interface FormaPagamentoCreate {
  nomeFormaPagamento: string;
  aceitaParcela: boolean;
  ativo: boolean;
}
export type FormaPagamentoUpdate = FormaPagamentoCreate;

// ── Condição de Pagamento ─────────────────────────────────────────────────────
export interface CondicaoPagamentoView {
  id: number;
  nomeCondicao: string;
  taxaJuros: number;
  multa: number;
  desconto: number;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}
export interface CondicaoPagamentoCreate {
  nomeCondicao: string;
  taxaJuros: number;
  multa: number;
  desconto: number;
  ativo: boolean;
}
export type CondicaoPagamentoUpdate = CondicaoPagamentoCreate;

// ── Parcela Condição de Pagamento ─────────────────────────────────────────────
export interface ParcelaCondicaoPagamentoView {
  id: number;
  numero: number;
  dias: number;
  percentual: number;
  condicaoPagamentoId: number;
  nomeCondicao?: string;
  formaPagamentoId: number;
  nomeFormaPagamento?: string;
  ativo: boolean;
}
export interface ParcelaCondicaoPagamentoCreate {
  numero: number;
  dias: number;
  percentual: number;
  condicaoPagamentoId: number;
  formaPagamentoId: number;
  ativo: boolean;
}
export type ParcelaCondicaoPagamentoUpdate = ParcelaCondicaoPagamentoCreate;

// ── Conta a Receber ───────────────────────────────────────────────────────────
export interface ContaReceberView {
  id: number;
  numeroNota: string;
  modelo: string;
  serie: string;
  clienteId: number;
  nomeCliente?: string;
  numParcela: number;
  valorParcela: number;
  dataEmissao: string;
  dataVencimento: string;
  dataRecebimento?: string;
  valorRecebido?: number;
  juros: number;
  multa: number;
  desconto: number;
  status: string;
  ativo: boolean;
  formaPagamentoId?: number;
  nomeFormaPagamento?: string;
  observacao?: string;
  criadoEm: string;
  atualizadoEm?: string;
}
export interface ContaReceberCreate {
  numeroNota: string;
  modelo: string;
  serie: string;
  clienteId: number;
  numParcela: number;
  valorParcela: number;
  dataEmissao: string;
  dataVencimento: string;
  dataRecebimento?: string;
  valorRecebido?: number;
  juros: number;
  multa: number;
  desconto: number;
  status: string;
  ativo: boolean;
  formaPagamentoId?: number;
  observacao?: string;
}
export type ContaReceberUpdate = ContaReceberCreate;

export interface ContaReceberLoteCreate {
  clienteId: number;
  valorTotal: number;
  dataEmissao: string;
  observacao?: string;
  status: string;
  ativo: boolean;
}

export interface ContaReceberBaixaLote {
  ids: number[];
  dataRecebimento: string;
}

// ── Conta a Pagar ─────────────────────────────────────────────────────────────
export interface ContaPagarView {
  id: number;
  notaCompraId?: number;
  fornecedorId: number;
  nomeFornecedor?: string;
  modelo: string;
  serie: string;
  numeroNota: string;
  numParcela: number;
  valorParcela: number;
  dataEmissao: string;
  dataVencimento: string;
  dataPagamento?: string;
  valorPago?: number;
  juros: number;
  multa: number;
  desconto: number;
  status: string;
  ativo: boolean;
  formaPagamentoId?: number;
  nomeFormaPagamento?: string;
  observacao?: string;
  criadoEm: string;
  atualizadoEm?: string;
}
export interface ContaPagarCreate {
  notaCompraId?: number;
  fornecedorId: number;
  modelo: string;
  serie: string;
  numeroNota: string;
  numParcela: number;
  valorParcela: number;
  dataEmissao: string;
  dataVencimento: string;
  dataPagamento?: string;
  valorPago?: number;
  juros: number;
  multa: number;
  desconto: number;
  status: string;
  ativo: boolean;
  formaPagamentoId?: number;
  observacao?: string;
}
export type ContaPagarUpdate = ContaPagarCreate;

// ── Nota de Venda ─────────────────────────────────────────────────────────────
export interface NotaVendaView {
  numeroNota: string;
  modelo: string;
  serie: string;
  clienteId: number;
  nomeCliente?: string;
  dataEmissao: string;
  transportadoraId?: number;
  nomeTransportadora?: string;
  placaVeiculo?: string;
  tipoFrete: string;
  valorFrete: number;
  desconto: number;
  totalProdutos: number;
  totalPagar: number;
  condicaoPagamentoId?: number;
  nomeCondicaoPagamento?: string;
  observacao?: string;
  status?: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm?: string;
  dataCriacao: string;
  dataAtualizacao?: string;
}
export interface NotaVendaCreate {
  numeroNota: string;
  modelo: string;
  serie: string;
  clienteId: number;
  dataEmissao: string;
  transportadoraId?: number;
  placaVeiculo?: string;
  tipoFrete: string;
  valorFrete: number;
  desconto: number;
  totalProdutos: number;
  condicaoPagamentoId?: number;
  observacao?: string;
  status?: string;
  ativo: boolean;
}
export type NotaVendaUpdate = NotaVendaCreate;

// ── Item de Nota de Venda ─────────────────────────────────────────────────────
export interface NotaVendaItemView {
  id: number;
  quantidade: number;
  precoUnit: number;
  total: number;
  idNotaVenda: number;
  idProduto: number;
  nomeProduto?: string;
}
export interface NotaVendaItemCreate {
  quantidade: number;
  precoUnit: number;
  idNotaVenda: number;
  idProduto: number;
}
export type NotaVendaItemUpdate = NotaVendaItemCreate;

// ── Nota de Compra ────────────────────────────────────────────────────────────
export interface NotaCompraView {
  id: number;
  fornecedorId: number;
  nomeFornecedor?: string;
  numeroNota: string;
  modelo: string;
  serie: string;
  dataEmissao: string;
  chaveAcesso?: string;
  tipoFrete: string;
  valorFrete: number;
  valorSeguro: number;
  outrasDespesas: number;
  totalProdutos: number;
  totalPagar: number;
  condicaoPagamentoId?: number;
  nomeCondicaoPagamento?: string;
  transportadoraId?: number;
  nomeTransportadora?: string;
  placaVeiculo?: string;
  observacao?: string;
  status?: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm?: string;
}
export interface NotaCompraCreate {
  fornecedorId: number;
  numeroNota: string;
  modelo: string;
  serie: string;
  dataEmissao: string;
  chaveAcesso?: string;
  tipoFrete: string;
  valorFrete: number;
  valorSeguro: number;
  outrasDespesas: number;
  totalProdutos: number;
  condicaoPagamentoId?: number;
  transportadoraId?: number;
  placaVeiculo?: string;
  observacao?: string;
  status?: string;
  ativo: boolean;
}
export type NotaCompraUpdate = NotaCompraCreate;

// ── Item de Nota de Compra ────────────────────────────────────────────────────
export interface NotaCompraItemView {
  id: number;
  quantidade: number;
  precoUnit: number;
  descontoUnit: number;
  liquidoUnit: number;
  total: number;
  rateio: number;
  custoFinalUnit: number;
  custoFinal: number;
  idNotaCompra: number;
  idProduto: number;
  nomeProduto?: string;
}
export interface NotaCompraItemCreate {
  quantidade: number;
  precoUnit: number;
  descontoUnit: number;
  idNotaCompra: number;
  idProduto: number;
}
export type NotaCompraItemUpdate = NotaCompraItemCreate;

// ── Unidade de Medida ────────────────────────────────────────────────────────
export interface UnidadeMedidaView {
  id: number;
  nomeUnidade: string;
  sigla?: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface UnidadeMedidaCreate {
  nomeUnidade: string;
  sigla?: string;
  ativo: boolean;
}

export type UnidadeMedidaUpdate = UnidadeMedidaCreate;

// ── Marca ────────────────────────────────────────────────────────────────────
export interface MarcaView {
  id: number;
  nomeMarca: string;
  descricao?: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface MarcaCreate {
  nomeMarca: string;
  descricao?: string;
  ativo: boolean;
}

export type MarcaUpdate = MarcaCreate;
