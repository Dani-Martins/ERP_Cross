import api from './api';
import type {
  ContaReceberView, ContaReceberCreate, ContaReceberUpdate, ContaReceberLoteCreate, ContaReceberBaixaLote, ContaReceberParcelasCreate,
  ContaPagarView, ContaPagarCreate, ContaPagarUpdate, ContaPagarParcela,
} from '../types/entities';

export const ContaReceberService = {
  getAll: () => api.get<ContaReceberView[]>('/ContaReceber'),
  sincronizarNotasVenda: () => api.post<{ parcelasCriadas: number }>('/ContaReceber/sincronizar-notas-venda'),
  getById: (id: number) => api.get<ContaReceberView>(`/ContaReceber/${id}`),
  getProximoNumero: () => api.get<number>('/ContaReceber/proximo-numero'),
  create: (data: ContaReceberCreate) => api.post<ContaReceberView>('/ContaReceber', data),
  createParcelas: (data: ContaReceberParcelasCreate) => api.post<ContaReceberView[]>('/ContaReceber/parcelas', data),
  createLote: (data: ContaReceberLoteCreate) => api.post<ContaReceberView[]>('/ContaReceber/lote', data),
  baixaLote: (data: ContaReceberBaixaLote) => api.post<{ atualizadas: number }>('/ContaReceber/baixa-lote', data),
  receber: (id: number, dataRecebimento: string) => api.post<void>(`/ContaReceber/${id}/receber`, { dataRecebimento }),
  cancelar: (id: number) => api.post<void>(`/ContaReceber/${id}/cancelar`),
  update: (id: number, data: ContaReceberUpdate) => api.put<void>(`/ContaReceber/${id}`, data),
  remove: (id: number) => api.delete<void>(`/ContaReceber/${id}`),
};

export const ContaPagarService = {
  getAll: () => api.get<ContaPagarView[]>('/ContaPagar'),
  getById: (id: number) => api.get<ContaPagarView>(`/ContaPagar/${id}`),
  create: (data: ContaPagarCreate) => api.post<ContaPagarView>('/ContaPagar', data),
  getParcelas: (id: number) => api.get<ContaPagarParcela[]>(`/ContaPagar/${id}/parcelas`),
  pagarParcela: (parcelaId: number, dataPagamento: string) =>
    api.post<void>(`/ContaPagar/parcelas/${parcelaId}/pagar`, { dataPagamento }),
  cancelarParcela: (parcelaId: number) => api.post<void>(`/ContaPagar/parcelas/${parcelaId}/cancelar`),
  cancelar: (id: number) => api.post<void>(`/ContaPagar/${id}/cancelar`),
  sincronizarNotas: () => api.post<{ criadas: number }>('/ContaPagar/sincronizar-notas'),
  update: (id: number, data: ContaPagarUpdate) => api.put<void>(`/ContaPagar/${id}`, data),
  remove: (id: number) => api.delete<void>(`/ContaPagar/${id}`),
};
