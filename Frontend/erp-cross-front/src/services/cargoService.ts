import api from './api';
import type { CargoView, CargoCreate, CargoUpdate } from '../types/entities';

export const CargoService = {
  getAll: () => api.get<CargoView[]>('/Cargo'),
  getById: (id: number) => api.get<CargoView>(`/Cargo/${id}`),
  create: (data: CargoCreate) => api.post<CargoView>('/Cargo', data),
  update: (id: number, data: CargoUpdate) => api.put<void>(`/Cargo/${id}`, data),
  remove: (id: number) => api.delete<void>(`/Cargo/${id}`),
};
