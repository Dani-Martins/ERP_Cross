import api from './api';
import type { CidadeView, CidadeCreate, CidadeUpdate } from '../types/entities';

export const CidadeService = {
  getAll: (q?: string) => api.get<CidadeView[]>('/Cidade', { params: q ? { q } : undefined }),
  getById: (id: number) => api.get<CidadeView>(`/Cidade/${id}`),
  create: (data: CidadeCreate) => api.post<CidadeView>('/Cidade', data),
  update: (id: number, data: CidadeUpdate) => api.put<void>(`/Cidade/${id}`, data),
  remove: (id: number) => api.delete<void>(`/Cidade/${id}`),
};
