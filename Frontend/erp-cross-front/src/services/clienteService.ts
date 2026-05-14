import api from './api';
import type { ClienteView, ClienteCreate, ClienteUpdate } from '../types/entities';

export const ClienteService = {
  getAll: () => api.get<ClienteView[]>('/Cliente'),
  getById: (id: number) => api.get<ClienteView>(`/Cliente/${id}`),
  create: (data: ClienteCreate) => api.post<ClienteView>('/Cliente', data),
  update: (id: number, data: ClienteUpdate) => api.put<void>(`/Cliente/${id}`, data),
  remove: (id: number) => api.delete<void>(`/Cliente/${id}`),
};
