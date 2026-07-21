import api from './api';

import type {
  TransportadoraView,
  TransportadoraCreate,
  TransportadoraUpdate,
} from '../types/entities';

export const TransportadoraService = {

  getAll: (q?: string) =>
    api.get<TransportadoraView[]>('/Transportadora', {
      params: { q },
    }),

  getById: (id: number) =>
    api.get<TransportadoraView>(`/Transportadora/${id}`),

  create: (data: TransportadoraCreate) =>
    api.post<TransportadoraView>('/Transportadora', data),

  update: (
    id: number,
    data: TransportadoraUpdate
  ) =>
    api.put<void>(
      `/Transportadora/${id}`,
      data
    ),

  remove: (id: number) =>
    api.delete<void>(`/Transportadora/${id}`),

};