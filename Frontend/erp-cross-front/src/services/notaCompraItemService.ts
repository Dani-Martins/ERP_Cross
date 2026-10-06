import axios from 'axios';
import type { NotaCompraItemCreate, NotaCompraItemView } from '../types/entities';

const api = axios.create({
  baseURL: 'http://localhost:5015/api',
});

export const NotaCompraItemService = {
  async getAll() {
    return api.get<NotaCompraItemView[]>('/NotaCompraItem');
  },

  async getByNotaCompraId(notaCompraId: number) {
    return api.get<NotaCompraItemView[]>(`/NotaCompraItem/nota/${notaCompraId}`);
  },

  async getById(id: number) {
    return api.get<NotaCompraItemView>(`/NotaCompraItem/${id}`);
  },

  async create(dto: NotaCompraItemCreate) {
    return api.post<NotaCompraItemView>('/NotaCompraItem', dto);
  },

  async update(id: number, dto: NotaCompraItemCreate) {
    return api.put<void>(`/NotaCompraItem/${id}`, dto);
  },

  async remove(id: number) {
    return api.delete<void>(`/NotaCompraItem/${id}`);
  },
};
