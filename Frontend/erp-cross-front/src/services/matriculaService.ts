import api from './api';
import type { MatriculaView, MatriculaCreate, MatriculaUpdate } from '../types/entities';

export const MatriculaService = {
  getAll: () => api.get<MatriculaView[]>('/matriculas'),
  getById: (id: number) => api.get<MatriculaView>(`/matriculas/${id}`),
  create: (data: MatriculaCreate) => api.post<MatriculaView>('/matriculas', data),
  update: (id: number, data: MatriculaUpdate) => api.put<void>(`/matriculas/${id}`, data),
  remove: (id: number) => api.delete<void>(`/matriculas/${id}`),
};
