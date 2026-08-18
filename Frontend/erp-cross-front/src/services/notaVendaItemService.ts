import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notavendaproduto';

export interface NotaVendaProduto {
  numeroNota: string;
  modelo: string;
  serie: string;
  clienteId: number;
  produtoId: number;
  quantidade: number;
  precoUnit: number;
  desconto: number;
  criadoEm: string;
  ativo: boolean;
}

export interface CreateNotaVendaProdutoDto {
  numeroNota: string;
  modelo: string;
  serie: string;
  clienteId: number;
  produtoId: number;
  quantidade: number;
  precoUnit: number;
  desconto?: number;
  ativo?: boolean;
}

export interface UpdateNotaVendaProdutoDto {
  quantidade: number;
  precoUnit: number;
  desconto: number;
  ativo: boolean;
}

export const NotaVendaProdutoService = {
  async getByNota(numeroNota: string, modelo: string, serie: string, clienteId: number) {
    return axios.get<NotaVendaProduto[]>(
      `${API_URL}/${numeroNota}/${modelo}/${serie}/${clienteId}`
    );
  },

  async getByKey(numeroNota: string, modelo: string, serie: string, clienteId: number, produtoId: number) {
    return axios.get<NotaVendaProduto>(
      `${API_URL}/${numeroNota}/${modelo}/${serie}/${clienteId}/${produtoId}`
    );
  },

  async create(dto: CreateNotaVendaProdutoDto) {
    return axios.post<NotaVendaProduto>(API_URL, dto);
  },

  async update(numeroNota: string, modelo: string, serie: string, clienteId: number, produtoId: number, dto: UpdateNotaVendaProdutoDto) {
    return axios.put<void>(
      `${API_URL}/${numeroNota}/${modelo}/${serie}/${clienteId}/${produtoId}`,
      dto
    );
  },

  async delete(numeroNota: string, modelo: string, serie: string, clienteId: number, produtoId: number) {
    return axios.delete(`${API_URL}/${numeroNota}/${modelo}/${serie}/${clienteId}/${produtoId}`);
  },
};

