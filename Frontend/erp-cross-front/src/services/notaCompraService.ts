import api from './api';
import type {
  NotaCompraView, NotaCompraCreate, NotaCompraUpdate,
  NotaCompraItemView, NotaCompraItemCreate, NotaCompraItemUpdate,
} from '../types/entities';

export const NotaCompraService = {
  getAll: () => api.get<NotaCompraView[]>('/NotaCompra'),
  getById: (id: number) => api.get<NotaCompraView>(`/NotaCompra/${id}`),
  create: (data: NotaCompraCreate) => api.post<NotaCompraView>('/NotaCompra', data),
  update: (id: number, data: NotaCompraUpdate) => api.put<void>(`/NotaCompra/${id}`, data),
  remove: (id: number) => api.delete<void>(`/NotaCompra/${id}`),
};

export const NotaCompraItemService = {
  getAll: () => api.get<NotaCompraItemView[]>('/NotaCompraItem'),
  getById: (id: number) => api.get<NotaCompraItemView>(`/NotaCompraItem/${id}`),
  create: (data: NotaCompraItemCreate) => api.post<NotaCompraItemView>('/NotaCompraItem', data),
  update: (id: number, data: NotaCompraItemUpdate) => api.put<void>(`/NotaCompraItem/${id}`, data),
  remove: (id: number) => api.delete<void>(`/NotaCompraItem/${id}`),
};
