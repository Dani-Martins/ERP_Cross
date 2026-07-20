import api from './api';

import type {
  CategoriaView,
  CategoriaCreate,
  CategoriaUpdate,
} from '../types/entities';

export const CategoriaService = {

  getAll: (q?: string) =>
    api.get<CategoriaView[]>('/Categoria', {
      params: { q },
    }),

  getById: (id: number) =>
    api.get<CategoriaView>(`/Categoria/${id}`),

  create: (data: CategoriaCreate) =>
    api.post<CategoriaView>('/Categoria', data),

  update: (id: number, data: CategoriaUpdate) =>
    api.put<void>(`/Categoria/${id}`, data),

  remove: (id: number) =>
    api.delete<void>(`/Categoria/${id}`),

};