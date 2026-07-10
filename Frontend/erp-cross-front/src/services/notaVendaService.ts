import api from './api';
import type {
  NotaVendaView,
  NotaVendaCreate,
  NotaVendaUpdate,
  NotaVendaItemView,
  NotaVendaItemCreate,
  NotaVendaItemUpdate,
} from '../types/entities';

export const NotaVendaService = {
  getAll: () =>
    api.get<NotaVendaView[]>('/NotaVenda'),

  getByKey: (
    numeroNota: string,
    modelo: string,
    serie: string,
    clienteId: number
  ) =>
    api.get<NotaVendaView>(
      `/NotaVenda/${numeroNota}/${modelo}/${serie}/${clienteId}`
    ),

  create: (data: NotaVendaCreate) =>
    api.post<NotaVendaView>('/NotaVenda', data),

  update: (
    numeroNota: string,
    modelo: string,
    serie: string,
    clienteId: number,
    data: NotaVendaUpdate
  ) =>
    api.put<void>(
      `/NotaVenda/${numeroNota}/${modelo}/${serie}/${clienteId}`,
      data
    ),

  remove: (
    numeroNota: string,
    modelo: string,
    serie: string,
    clienteId: number
  ) =>
    api.delete<void>(
      `/NotaVenda/${numeroNota}/${modelo}/${serie}/${clienteId}`
    ),
};

export const NotaVendaItemService = {
  getAll: () => api.get<NotaVendaItemView[]>('/NotaVendaProduto'),
  getById: (id: number) => api.get<NotaVendaItemView>(`/NotaVendaProduto/${id}`),
  create: (data: NotaVendaItemCreate) => api.post<NotaVendaItemView>('/NotaVendaProduto', data),
  update: (id: number, data: NotaVendaItemUpdate) => api.put<void>(`/NotaVendaProduto/${id}`, data),
  remove: (id: number) => api.delete<void>(`/NotaVendaProduto/${id}`),
};