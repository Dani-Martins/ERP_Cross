import api from './api';
import type { ParcelaCondicaoPagamentoView, ParcelaCondicaoPagamentoCreate, ParcelaCondicaoPagamentoUpdate } from '../types/entities';

export const ParcelaCondicaoPagamentoService = {
  getByCondicaoId: (condicaoId: number) =>
    api.get<ParcelaCondicaoPagamentoView[]>(`/ParcelaCondicaoPagamento/condicao/${condicaoId}`),
  create: (data: ParcelaCondicaoPagamentoCreate) =>
    api.post<ParcelaCondicaoPagamentoView>('/ParcelaCondicaoPagamento', data),
  update: (id: number, data: ParcelaCondicaoPagamentoUpdate) =>
    api.put<void>(`/ParcelaCondicaoPagamento/${id}`, data),
  remove: (id: number) =>
    api.delete<void>(`/ParcelaCondicaoPagamento/${id}`),
};
