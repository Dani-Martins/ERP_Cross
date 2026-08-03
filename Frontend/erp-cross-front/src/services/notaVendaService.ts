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
  getAll(q?: string) {
    return api.get<NotaVendaView[]>('/NotaVenda', { params: { q } });
  },

  getByKey(
    numeroNota: string,
    modelo: string,
    serie: string,
    clienteId: number
  ) {
    return api.get<NotaVendaView>(
      `/NotaVenda/${numeroNota}/${modelo}/${serie}/${clienteId}`
    );
  },

  create(data: NotaVendaCreate) {
    return api.post<NotaVendaView>('/NotaVenda', data);
  },

  update(
    numeroNota: string,
    modelo: string,
    serie: string,
    clienteId: number,
    data: NotaVendaUpdate
  ) {
    return api.put<void>(
      `/NotaVenda/${numeroNota}/${modelo}/${serie}/${clienteId}`,
      data
    );
  },

  remove(
    numeroNota: string,
    modelo: string,
    serie: string,
    clienteId: number
  ) {
    return api.delete<void>(
      `/NotaVenda/${numeroNota}/${modelo}/${serie}/${clienteId}`
    );
  },
};

export const NotaVendaItemService = {
  getAll(q?: string) {
    return api.get<NotaVendaItemView[]>('/NotaVendaProduto', { params: { q } });
  },

  getById(id: number) {
    return api.get<NotaVendaItemView>(`/NotaVendaProduto/${id}`);
  },

  create(data: NotaVendaItemCreate) {
    return api.post<NotaVendaItemView>('/NotaVendaProduto', data);
  },

  update(id: number, data: NotaVendaItemUpdate) {
    return api.put<void>(`/NotaVendaProduto/${id}`, data);
  },

  remove(id: number) {
    return api.delete<void>(`/NotaVendaProduto/${id}`);
  },
};