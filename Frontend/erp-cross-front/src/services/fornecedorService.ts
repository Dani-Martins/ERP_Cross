import api from './api';
import type {
    FornecedorView,
    FornecedorCreate,
    FornecedorUpdate
} from '../types/entities';

export const FornecedorService = {

    getAll: (q?: string) =>
        api.get<FornecedorView[]>('/Fornecedor', {
            params: { q }
        }),

    getById: (id: number) =>
        api.get<FornecedorView>(`/Fornecedor/${id}`),

    create: (data: FornecedorCreate) =>
        api.post<FornecedorView>('/Fornecedor', data),

    update: (id: number, data: FornecedorUpdate) =>
        api.put<void>(`/Fornecedor/${id}`, data),

    delete: (id: number) =>
        api.delete<void>(`/Fornecedor/${id}`)
};