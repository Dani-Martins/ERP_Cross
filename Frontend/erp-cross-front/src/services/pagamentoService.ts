import api from './api';
import type {
  CondicaoPagamentoView, CondicaoPagamentoCreate, CondicaoPagamentoUpdate,
  ParcelaCondicaoPagamentoView, ParcelaCondicaoPagamentoCreate, ParcelaCondicaoPagamentoUpdate,
} from '../types/entities';

export const CondicaoPagamentoService = {
  getAll: () => api.get<CondicaoPagamentoView[]>('/CondicaoPagamento'),
  getById: (id: number) => api.get<CondicaoPagamentoView>(`/CondicaoPagamento/${id}`),
  create: (data: CondicaoPagamentoCreate) => api.post<CondicaoPagamentoView>('/CondicaoPagamento', data),
  update: (id: number, data: CondicaoPagamentoUpdate) => api.put<void>(`/CondicaoPagamento/${id}`, data),
  remove: (id: number) => api.delete<void>(`/CondicaoPagamento/${id}`),
};

export const ParcelaCondicaoPagamentoService = {
  getAll: () => api.get<ParcelaCondicaoPagamentoView[]>('/ParcelaCondicaoPagamento'),
  getById: (id: number) => api.get<ParcelaCondicaoPagamentoView>(`/ParcelaCondicaoPagamento/${id}`),
  create: (data: ParcelaCondicaoPagamentoCreate) => api.post<ParcelaCondicaoPagamentoView>('/ParcelaCondicaoPagamento', data),
  update: (id: number, data: ParcelaCondicaoPagamentoUpdate) => api.put<void>(`/ParcelaCondicaoPagamento/${id}`, data),
  remove: (id: number) => api.delete<void>(`/ParcelaCondicaoPagamento/${id}`),
};
