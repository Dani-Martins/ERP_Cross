import api from './api';
import type { FuncionarioView, FuncionarioCreate, FuncionarioUpdate } from '../types/entities';

export const FuncionarioService = {
  getAll: () => api.get<FuncionarioView[]>('/Funcionario'),
  getById: (id: number) => api.get<FuncionarioView>(`/Funcionario/${id}`),
  create: (data: FuncionarioCreate) => api.post<FuncionarioView>('/Funcionario', data),
  update: (id: number, data: FuncionarioUpdate) => api.put<void>(`/Funcionario/${id}`, data),
  remove: (id: number) => api.delete<void>(`/Funcionario/${id}`),
};
