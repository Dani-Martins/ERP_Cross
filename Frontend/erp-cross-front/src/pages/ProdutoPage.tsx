import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Pencil,
  Eye,
  Trash2,
  Search
} from 'lucide-react';

import { ProdutoService } from '../services/produtoService';
import type { ProdutoView } from '../types/entities';

import './PaisesPage.css';

export default function ProdutoPage() {
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState<ProdutoView[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  async function carregar() {
    try {
      const res = await ProdutoService.getAll();
      setProdutos(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function excluir(id: number) {
    if (!confirm('Deseja realmente excluir este produto?'))
      return;

    await ProdutoService.remove(id);
    carregar();
  }

  const filtrados = produtos.filter(p =>
    p.nomeProduto.toLowerCase().includes(busca.toLowerCase())
  );

  return (
        <div className="page-container">

        <div className="page-header">
            <div className="page-title-area">
            <Package size={24} className="page-title-icon" />
            <h1 className="page-title">Produtos</h1>
            </div>

            <button
            className="btn-primary"
            onClick={() => navigate('/produtos/novo')}
            >
            <Plus size={16} />
            Novo Produto
            </button>
        </div>

        <div className="toolbar">
            <div className="search-box">
            <Search size={16} />
            <input
                type="text"
                placeholder="Pesquisar produto..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
            />
            </div>
        </div>

        {loading ? (
            <div className="table-loading">
            Carregando...
            </div>
        ) : filtrados.length === 0 ? (
            <div className="table-empty">
            Nenhum produto encontrado.
            </div>
        ) : (
            <div className="table-container">
            <table className="data-table">

                <thead>
                <tr>
                    <th>PRODUTO</th>
                    <th>CUSTO</th>
                    <th>LUCRO %</th>
                    <th>PREÇO</th>
                    <th>ESTOQUE</th>
                    <th style={{ width: 170 }}>AÇÕES</th>
                </tr>
                </thead>

                <tbody>
                                {filtrados.map(produto => (
                    <tr key={produto.id}>
                    <td className="col-name">
                        {produto.nomeProduto}
                    </td>

                    <td>
                        {produto.custoCompra.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                        })}
                    </td>

                    <td>
                        {produto.lucroPercentual.toFixed(2)}%
                    </td>

                    <td>
                        {produto.precoVenda.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                        })}
                    </td>

                    <td>
                        {produto.estoque}
                    </td>

                    <td>
                        <div className="table-actions">
                        <button
                            className="btn-icon"
                            title="Visualizar"
                            onClick={() => navigate(`/produtos/${produto.id}`)}
                        >
                            <Eye size={16} />
                        </button>

                        <button
                            className="btn-icon"
                            title="Editar"
                            onClick={() => navigate(`/produtos/editar/${produto.id}`)}
                        >
                            <Pencil size={16} />
                        </button>

                        <button
                            className="btn-icon btn-danger"
                            title="Excluir"
                            onClick={() => excluir(produto.id)}
                        >
                            <Trash2 size={16} />
                        </button>
                        </div>
                    </td>
                    </tr>
                ))}
                            </tbody>

            </table>
            </div>
        )}

        </div>
    );
}