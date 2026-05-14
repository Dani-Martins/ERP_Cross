// Resposta de erro padronizada do backend
export interface ApiErrorResponse {
  code: string;
  message: string;
}

// Shape genérica de lista paginada (caso futuramente seja usada)
export interface ApiListResponse<T> {
  data: T[];
  total: number;
}
