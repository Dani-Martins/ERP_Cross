import axios from 'axios';

const API_URL = 'http://localhost:5000/api/parcelanotavenda';

export interface ParcelaNotaVenda {
  id: number;
  numeroNota: string;
  modelo: string;
  serie: string;
  clienteId: number;
  numParcela: number;
  formaPagamentoId?: number;
  dataVencimento: string;
  valorParcela: number;
  pago: boolean;
  dataPagamento?: string;
  criadoEm: string;
  nomeFormaPagamento?: string;
}

export interface CreateParcelaNotaVendaDto {
  numeroNota: string;
  modelo: string;
  serie: string;
  clienteId: number;
  numParcela: number;
  formaPagamentoId?: number;
  dataVencimento: string;
  valorParcela: number;
  pago?: boolean;
  dataPagamento?: string;
}

export interface UpdateParcelaNotaVendaDto {
  formaPagamentoId?: number;
  dataVencimento: string;
  valorParcela: number;
  pago: boolean;
  dataPagamento?: string;
}

export const ParcelaNotaVendaService = {
  async getByNota(numeroNota: string, modelo: string, serie: string, clienteId: number) {
    return axios.get<ParcelaNotaVenda[]>(
      `${API_URL}/por-nota/${numeroNota}/${modelo}/${serie}/${clienteId}`
    );
  },

  async getById(id: number) {
    return axios.get<ParcelaNotaVenda>(`${API_URL}/${id}`);
  },

  async calculateAndSave(
    numeroNota: string,
    modelo: string,
    serie: string,
    clienteId: number,
    condicaoPagamentoId: number,
    totalNota: number
  ) {
    return axios.post(
      `${API_URL}/calcular/${numeroNota}/${modelo}/${serie}/${clienteId}/${condicaoPagamentoId}?totalNota=${totalNota}`
    );
  },

  async create(dto: CreateParcelaNotaVendaDto) {
    return axios.post<ParcelaNotaVenda>(API_URL, dto);
  },

  async update(id: number, dto: UpdateParcelaNotaVendaDto) {
    return axios.put<ParcelaNotaVenda>(`${API_URL}/${id}`, dto);
  },

  async delete(id: number) {
    return axios.delete(`${API_URL}/${id}`);
  },
};
