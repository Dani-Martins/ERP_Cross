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

  cancelarConta(numeroNota: string, modelo: string, serie: string, clienteId: number) {
    return api.post<void>(`/NotaVenda/${numeroNota}/${modelo}/${serie}/${clienteId}/cancelar-conta`);
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
  getByNota(
    numeroNota: string,
    modelo: string,
    serie: string,
    clienteId: number
  ) {
    return api.get<NotaVendaItemView[]>(
      `/NotaVendaProduto/${numeroNota}/${modelo}/${serie}/${clienteId}`
    );
  },

  create(data: NotaVendaItemCreate) {
    return api.post<NotaVendaItemView>('/NotaVendaProduto', data);
  },

  update(
    numeroNota: string,
    modelo: string,
    serie: string,
    clienteId: number,
    produtoId: number,
    data: NotaVendaItemUpdate
  ) {
    return api.put<void>(
      `/NotaVendaProduto/${numeroNota}/${modelo}/${serie}/${clienteId}/${produtoId}`,
      data
    );
  },

  remove(
    numeroNota: string,
    modelo: string,
    serie: string,
    clienteId: number,
    produtoId: number
  ) {
    return api.delete<void>(
      `/NotaVendaProduto/${numeroNota}/${modelo}/${serie}/${clienteId}/${produtoId}`
    );
  },
};