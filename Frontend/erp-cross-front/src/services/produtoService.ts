import api from './api';
import type { ProdutoView, ProdutoCreate, ProdutoUpdate } from '../types/entities';

export const ProdutoService = {
  getAll: () => api.get<ProdutoView[]>('/Produto'),
  getById: (id: number) => api.get<ProdutoView>(`/Produto/${id}`),
  create: (data: ProdutoCreate) => api.post<ProdutoView>('/Produto', data),
  update: (id: number, data: ProdutoUpdate) => api.put<void>(`/Produto/${id}`, data),
  remove: (id: number) => api.delete<void>(`/Produto/${id}`),
};
