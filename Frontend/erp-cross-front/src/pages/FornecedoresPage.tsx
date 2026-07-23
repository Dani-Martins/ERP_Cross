import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Pencil,
  Eye,
  Trash2,
  Truck
} from 'lucide-react';

import { FornecedorService } from '../services/fornecedorService';
import type { FornecedorView } from '../types/entities';
import './PaisesPage.css';

export default function FornecedoresPage() {

  const navigate = useNavigate();

  const [fornecedores, setFornecedores] = useState<FornecedorView[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function carregar() {
    setLoading(true);

    try {
      const res = await FornecedorService.getAll(search);
      setFornecedores(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleDelete(id: number) {

    if (!window.confirm('Deseja realmente excluir este fornecedor?'))
      return;

    await FornecedorService.delete(id);

    carregar();
  }

  return (
    <div className="page-container">

      <div className="page-header">

        <div className="page-title-area">

            <Truck
                size={24}
                className="page-title-icon"
            />

            <h1 className="page-title">
                Fornecedores
            </h1>

            <span className="page-count">
                {fornecedores.length}
            </span>

        </div>

        <button
          className="btn-primary"
          onClick={() => navigate('/fornecedores/novo')}
        >
          <Plus size={16} />
          Novo Fornecedor
        </button>

      </div>

      <div className="toolbar">

        <div className="search-box">

          <Search size={16} />

          <input
            type="text"
            placeholder="Buscar por nome, CNPJ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter')
                carregar();
            }}
          />

        </div>

      </div>
            {loading ? (
        <div className="table-loading">
          Carregando fornecedores...
        </div>
      ) : fornecedores.length === 0 ? (
        <div className="table-empty">
          Nenhum fornecedor encontrado.
        </div>
      ) : (
        <div className="table-card">

          <table className="data-table">

            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF/CNPJ</th>
                <th>Cidade</th>
                <th>Condição de Pagamento</th>
                <th>Status</th>
                <th style={{ width: 170 }}>Ações</th>
              </tr>
            </thead>

            <tbody>

              {fornecedores.map(fornecedor => (

                <tr key={fornecedor.id}>

                  <td className="col-name">

                    <div className="table-main">
                        {fornecedor.nome}
                    </div>

                    <div className="table-sub">
                        {fornecedor.nomeFantasia}
                    </div>

                  </td>

                  <td>{fornecedor.cpfCnpj}</td>

                  <td>{fornecedor.nomeCidade ?? '—'}</td>

                  <td>
                    {fornecedor.nomeCondicaoPagamento ?? '—'}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        fornecedor.ativo
                          ? 'status-active'
                          : 'status-inactive'
                      }`}
                    >
                      {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>

                  <td>

                    <div className="table-actions">

                      <button
                        className="btn-icon btn-view"
                        title="Visualizar"
                        onClick={() =>
                          navigate(`/fornecedores/${fornecedor.id}`)
                        }
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="btn-icon btn-edit"
                        title="Editar"
                        onClick={() =>
                          navigate(`/fornecedores/editar/${fornecedor.id}`)
                        }
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="btn-icon btn-delete"
                        title="Excluir"
                        onClick={() => handleDelete(fornecedor.id)}
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