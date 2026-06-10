import api from './api';
import type { CondicaoPagamentoView } from '../types/entities';

export const CondicaoPagamentoService = {
  getAll: (q?: string) => api.get<CondicaoPagamentoView[]>('/CondicaoPagamento', { params: q ? { q } : undefined }),
  getById: (id: number) => api.get<CondicaoPagamentoView>(`/CondicaoPagamento/${id}`),
};
