import axios from 'axios';

const API_URL = 'http://localhost:5000/api/parcelanotacompra';

export interface ParcelaNotaCompra {
  id: number;
  numeroNota: string;
  modelo: string;
  serie: string;
  fornecedorId: number;
  numParcela: number;
  formaPagamentoId?: number;
  dataVencimento: string;
  valorParcela: number;
  pago: boolean;
  dataPagamento?: string;
  criadoEm: string;
  nomeFormaPagamento?: string;
}

export interface CreateParcelaNotaCompraDto {
  numeroNota: string;
  modelo: string;
  serie: string;
  fornecedorId: number;
  numParcela: number;
  formaPagamentoId?: number;
  dataVencimento: string;
  valorParcela: number;
  pago?: boolean;
  dataPagamento?: string;
}

export interface UpdateParcelaNotaCompraDto {
  formaPagamentoId?: number;
  dataVencimento: string;
  valorParcela: number;
  pago: boolean;
  dataPagamento?: string;
}

export const ParcelaNotaCompraService = {
  async getByNota(numeroNota: string, modelo: string, serie: string, fornecedorId: number) {
    return axios.get<ParcelaNotaCompra[]>(
      `${API_URL}/por-nota/${numeroNota}/${modelo}/${serie}/${fornecedorId}`
    );
  },

  async getById(id: number) {
    return axios.get<ParcelaNotaCompra>(`${API_URL}/${id}`);
  },

  async calculateAndSave(
    numeroNota: string,
    modelo: string,
    serie: string,
    fornecedorId: number,
    condicaoPagamentoId: number,
    totalNota: number
  ) {
    return axios.post(
      `${API_URL}/calcular/${numeroNota}/${modelo}/${serie}/${fornecedorId}/${condicaoPagamentoId}?totalNota=${totalNota}`
    );
  },

  async create(dto: CreateParcelaNotaCompraDto) {
    return axios.post<ParcelaNotaCompra>(API_URL, dto);
  },

  async update(id: number, dto: UpdateParcelaNotaCompraDto) {
    return axios.put<ParcelaNotaCompra>(`${API_URL}/${id}`, dto);
  },

  async delete(id: number) {
    return axios.delete(`${API_URL}/${id}`);
  }
};
