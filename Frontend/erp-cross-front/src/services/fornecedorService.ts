import api from './api';
import type { FornecedorView, FornecedorCreate, FornecedorUpdate } from '../types/entities';

export const FornecedorService = {
  getAll: () => api.get<FornecedorView[]>('/Fornecedor'),
  getById: (id: number) => api.get<FornecedorView>(`/Fornecedor/${id}`),
  create: (data: FornecedorCreate) => api.post<FornecedorView>('/Fornecedor', data),
  update: (id: number, data: FornecedorUpdate) => api.put<void>(`/Fornecedor/${id}`, data),
  remove: (id: number) => api.delete<void>(`/Fornecedor/${id}`),
};
