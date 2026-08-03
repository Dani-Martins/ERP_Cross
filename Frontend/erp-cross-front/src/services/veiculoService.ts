import api from './api';
import type { VeiculoCreate, VeiculoUpdate, VeiculoView } from '../types/entities';

export const VeiculoService = {
  getAll: (q?: string) =>
    api.get<VeiculoView[]>('/Veiculo', { params: { q } }),

  getById: (id: number) =>
    api.get<VeiculoView>(`/Veiculo/${id}`),

  create: (data: VeiculoCreate) =>
    api.post<VeiculoView>('/Veiculo', data),

  update: (id: number, data: VeiculoUpdate) =>
    api.put<void>(`/Veiculo/${id}`, data),

  delete: (id: number) =>
    api.delete<void>(`/Veiculo/${id}`),
};