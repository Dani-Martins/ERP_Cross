import api from './api';
import type { EstadoView, EstadoCreate, EstadoUpdate } from '../types/entities';

export const EstadoService = {
  getAll: (q?: string) => api.get<EstadoView[]>('/Estado', { params: q ? { q } : undefined }),
  getById: (id: number) => api.get<EstadoView>(`/Estado/${id}`),
  create: (data: EstadoCreate) => api.post<EstadoView>('/Estado', data),
  update: (id: number, data: EstadoUpdate) => api.put<void>(`/Estado/${id}`, data),
  remove: (id: number) => api.delete<void>(`/Estado/${id}`),
};
