import api from './api';
import type { PlanoView, PlanoCreate, PlanoUpdate } from '../types/entities';

export const PlanoService = {
  getAll: () => api.get<PlanoView[]>('/planos'),
  getById: (id: number) => api.get<PlanoView>(`/planos/${id}`),
  create: (data: PlanoCreate) => api.post<PlanoView>('/planos', data),
  update: (id: number, data: PlanoUpdate) => api.put<void>(`/planos/${id}`, data),
  remove: (id: number) => api.delete<void>(`/planos/${id}`),
};
