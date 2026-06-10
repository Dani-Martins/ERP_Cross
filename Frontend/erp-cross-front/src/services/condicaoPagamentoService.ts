import api from './api';
import type { CondicaoPagamentoView, CondicaoPagamentoCreate, CondicaoPagamentoUpdate } from '../types/entities';

export const CondicaoPagamentoService = {
  getAll: (q?: string) => api.get<CondicaoPagamentoView[]>('/CondicaoPagamento', { params: q ? { q } : undefined }),
  getById: (id: number) => api.get<CondicaoPagamentoView>(`/CondicaoPagamento/${id}`),
  create: (data: CondicaoPagamentoCreate) => api.post<CondicaoPagamentoView>('/CondicaoPagamento', data),
  update: (id: number, data: CondicaoPagamentoUpdate) => api.put<void>(`/CondicaoPagamento/${id}`, data),
  remove: (id: number) => api.delete<void>(`/CondicaoPagamento/${id}`),
};
