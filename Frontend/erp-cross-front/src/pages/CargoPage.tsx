import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Plus,
  Pencil,
  Eye,
  Trash2
} from 'lucide-react';

import { CargoService } from '../services/cargoService';
import type { CargoView } from '../types/entities';

import './PaisesPage.css';

export default function CargoPage() {
  const navigate = useNavigate();

  const [cargos, setCargos] = useState<CargoView[]>([]);
  const [filtered, setFiltered] = useState<CargoView[]>([]);
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);

    try {
      const res = await CargoService.getAll();

      setCargos(res.data);
      setFiltered(res.data);
    } catch {
      setError('Erro ao carregar cargos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const texto = search.toLowerCase();

    setFiltered(
      cargos.filter(c =>
        c.nomeCargo.toLowerCase().includes(texto)
      )
    );
  }, [search, cargos]);

  async function handleDelete(id: number) {
    if (!confirm('Deseja realmente excluir este cargo?'))
      return;

    try {
      await CargoService.remove(id);

      loadData();
    } catch {
      alert('Erro ao excluir cargo.');
    }
  }
    return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-area">
          <Briefcase size={24} className="page-title-icon" />
          <h1 className="page-title">Cargos</h1>
        </div>

        <button
          className="btn-primary"
          onClick={() => navigate('/cargos/novo')}
        >
          <Plus size={18} />
          Novo Cargo
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Pesquisar cargo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-card">

        {loading && (
          <div className="table-loading">
            Carregando...
          </div>
        )}

        {!loading && error && (
          <div className="table-empty">
            {error}
          </div>
        )}

        {!loading && !error && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Salário Base</th>
                <th>Exige CNH</th>
                <th>Status</th>
                <th style={{ width: 170 }}>
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="table-empty">
                      Nenhum cargo encontrado.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(cargo => (
                  <tr key={cargo.id}>
                    <td className="col-name">
                      {cargo.nomeCargo}
                    </td>

                    <td>
                      {cargo.salarioBase.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </td>

                    <td>
                      {cargo.exigeCnh ? 'Sim' : 'Não'}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          cargo.ativo
                            ? 'status-active'
                            : 'status-inactive'
                        }`}
                      >
                        {cargo.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    <td>
                      <div className="actions">
                        <button
                          className="btn-icon"
                          title="Visualizar"
                          onClick={() =>
                            navigate(`/cargos/${cargo.id}`)
                          }
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          className="btn-icon"
                          title="Editar"
                          onClick={() =>
                            navigate(`/cargos/editar/${cargo.id}`)
                          }
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          className="btn-icon btn-danger"
                          title="Excluir"
                          onClick={() => handleDelete(cargo.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
                          </tbody>
            </table>
        )}
      </div>
    </div>
  );
}