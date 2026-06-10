import api from './api';
import type { FormaPagamentoView, FormaPagamentoCreate, FormaPagamentoUpdate } from '../types/entities';

export const FormaPagamentoService = {
  getAll: (q?: string) => api.get<FormaPagamentoView[]>('/FormaPagamento', { params: q ? { q } : undefined }),
  getById: (id: number) => api.get<FormaPagamentoView>(`/FormaPagamento/${id}`),
  create: (data: FormaPagamentoCreate) => api.post<FormaPagamentoView>('/FormaPagamento', data),
  update: (id: number, data: FormaPagamentoUpdate) => api.put<void>(`/FormaPagamento/${id}`, data),
  remove: (id: number) => api.delete<void>(`/FormaPagamento/${id}`),
};
