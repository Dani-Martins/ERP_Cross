import api from './api';
import type { PaisView, PaisCreate, PaisUpdate } from '../types/entities';

export const PaisService = {
  getAll: (q?: string) => api.get<PaisView[]>('/Pais', { params: q ? { q } : undefined }),
  getById: (id: number) => api.get<PaisView>(`/Pais/${id}`),
  create: (data: PaisCreate) => api.post<PaisView>('/Pais', data),
  update: (id: number, data: PaisUpdate) => api.put<void>(`/Pais/${id}`, data),
  remove: (id: number) => api.delete<void>(`/Pais/${id}`),
};
