import api from './api';

import type {
  MarcaView,
  MarcaCreate,
  MarcaUpdate,
} from '../types/entities';

export const MarcaService = {

  getAll: (q?: string) =>
    api.get<MarcaView[]>('/Marca', {
      params: { q },
    }),

  getById: (id: number) =>
    api.get<MarcaView>(`/Marca/${id}`),

  create: (data: MarcaCreate) =>
    api.post<MarcaView>('/Marca', data),

  update: (id: number, data: MarcaUpdate) =>
    api.put<void>(`/Marca/${id}`, data),

  remove: (id: number) =>
    api.delete<void>(`/Marca/${id}`),

};