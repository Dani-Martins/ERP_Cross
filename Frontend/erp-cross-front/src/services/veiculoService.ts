import api from './api';

import type {
  VeiculoCreate,
  VeiculoUpdate,
  VeiculoView,
} from '../types/entities';

export const VeiculoService = {

  getAll(q?: string) {
    return api.get<VeiculoView[]>('/Veiculo', {
      params: { q },
    });
  },

  getById(id: number) {
    return api.get<VeiculoView>(`/Veiculo/${id}`);
  },

  create(data: VeiculoCreate) {
    return api.post('/Veiculo', data);
  },

  update(
    id: number,
    data: VeiculoUpdate
  ) {
    return api.put(`/Veiculo/${id}`, data);
  },

  delete(id: number) {
    return api.delete(`/Veiculo/${id}`);
  },

};