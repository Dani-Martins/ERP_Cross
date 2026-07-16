import api from './api';

import type {
  UnidadeMedidaView,
  UnidadeMedidaCreate,
  UnidadeMedidaUpdate,
} from '../types/entities';

export const UnidadeMedidaService = {

  getAll: (q?: string) =>
    api.get<UnidadeMedidaView[]>('/UnidadeMedida', {
      params: { q },
    }),

  getById: (id: number) =>
    api.get<UnidadeMedidaView>(`/UnidadeMedida/${id}`),

  create: (data: UnidadeMedidaCreate) =>
    api.post<UnidadeMedidaView>('/UnidadeMedida', data),

  update: (id: number, data: UnidadeMedidaUpdate) =>
    api.put<void>(`/UnidadeMedida/${id}`, data),

  remove: (id: number) =>
    api.delete<void>(`/UnidadeMedida/${id}`),

};