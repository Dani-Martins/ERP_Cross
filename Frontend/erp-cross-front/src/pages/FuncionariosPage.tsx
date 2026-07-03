import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    UserCircle,
    Plus,
    Search,
    X,
    Eye,
    Pencil,
    Trash2
} from 'lucide-react';

import { FuncionarioService } from '../services/funcionarioService';
import type { FuncionarioView } from '../types/entities';

import './PaisesPage.css';

/**
 * Máscara de CPF
 * Exibe apenas parte do documento.
 */
function maskCpf(cpf: string): string {

    const d = cpf.replace(/\D/g, '');

    if (d.length !== 11)
        return cpf;

    return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`;
}

export default function FuncionariosPage() {

    const navigate = useNavigate();

    const [all, setAll] = useState<FuncionarioView[]>([]);

    const [search, setSearch] = useState('');

    const [filterStatus, setFilterStatus] = useState<
        'todos' | 'ativos' | 'inativos'
    >('ativos');

    const [loading, setLoading] = useState(true);

    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {

        setLoading(true);

        try {

            const response = await FuncionarioService.getAll();

            setAll(response.data);

        }
        finally {

            setLoading(false);

        }

    };

    const filtered = all.filter(f => {

        const matchStatus =
            filterStatus === 'todos'
                ? true
                : filterStatus === 'ativos'
                    ? f.ativo
                    : !f.ativo;

        const s = search.toLowerCase();

        const matchSearch =
            !s ||

            f.nome.toLowerCase().includes(s) ||

            f.cpfCnpj.includes(s) ||

            (f.nomeCargo?.toLowerCase().includes(s) ?? false) ||

            (f.nomeCidade?.toLowerCase().includes(s) ?? false);

        return matchStatus && matchSearch;

    });

    async function handleDelete() {

        if (deleteId == null)
            return;

        setDeleting(true);

        await FuncionarioService.remove(deleteId);

        setDeleteId(null);

        setDeleting(false);

        load();

    }
        return (
        <div className="page-container">
            <div className="page-header">

                <div className="page-title-area">
                    <UserCircle
                        size={24}
                        className="page-title-icon"
                    />

                    <h1 className="page-title">
                        Funcionários
                    </h1>

                    <span className="page-badge">
                        {filtered.length}
                    </span>
                </div>

                <div className="page-actions">

                    <div className="filter-select-group">
                        <label>Status:</label>

                        <select
                            value={filterStatus}
                            onChange={e =>
                                setFilterStatus(
                                    e.target.value as typeof filterStatus
                                )
                            }
                        >
                            <option value="ativos">
                                Ativos
                            </option>

                            <option value="inativos">
                                Inativos
                            </option>

                            <option value="todos">
                                Todos
                            </option>

                        </select>
                    </div>

                    <div className="search-box">

                        <Search
                            size={15}
                            className="search-icon"
                        />

                        <input
                            type="text"
                            placeholder="Buscar por nome, CPF, cargo ou cidade..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />

                        {search && (

                            <button
                                className="search-clear"
                                onClick={() => setSearch('')}
                            >

                                <X size={14} />

                            </button>

                        )}

                    </div>

                    <button
                        className="btn-primary"
                        onClick={() => navigate('/funcionarios/novo')}
                    >

                        <Plus size={16} />

                        Novo Funcionário

                    </button>

                </div>

            </div>

            <div className="table-card">

                {loading ? (

                    <div className="table-loading">

                        Carregando...

                    </div>

                ) : filtered.length === 0 ? (

                    <div className="table-empty">

                        Nenhum funcionário encontrado.

                    </div>

                ) : (

                    <table className="data-table">

                        <thead>

                            <tr>

                                <th className="col-id">#</th>

                                <th>Funcionário</th>

                                <th>CPF</th>

                                <th>Cargo</th>

                                <th>Cidade</th>

                                <th>Salário</th>

                                <th>Status</th>

                                <th className="col-actions">

                                    Ações

                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {filtered.map(f => (

                                <tr key={f.id}>

                                    <td className="col-id">
                                        {f.id}
                                    </td>

                                    <td className="col-name">
                                        {f.nome}
                                    </td>

                                    <td>
                                        <span className="tag">
                                            {maskCpf(f.cpfCnpj)}
                                        </span>
                                    </td>

                                    <td>
                                        {f.nomeCargo ?? '—'}
                                    </td>

                                    <td>
                                        {f.nomeCidade ?? '—'}
                                    </td>

                                    <td>

                                        {f.salario != null
                                            ? f.salario.toLocaleString(
                                                'pt-BR',
                                                {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                }
                                            )
                                            : '—'}

                                    </td>

                                    <td>

                                        <span
                                            className={`status-badge ${f.ativo
                                                    ? 'status-active'
                                                    : 'status-inactive'
                                                }`}
                                        >

                                            {f.ativo
                                                ? 'Ativo'
                                                : 'Inativo'}

                                        </span>

                                    </td>

                                    <td className="col-actions">

                                        <button
                                            className="btn-icon btn-view"
                                            title="Visualizar"
                                            onClick={() =>
                                                navigate(
                                                    `/funcionarios/visualizar/${f.id}`
                                                )
                                            }
                                        >

                                            <Eye size={16} />

                                        </button>

                                        <button
                                            className="btn-icon btn-edit"
                                            title="Editar"
                                            onClick={() =>
                                                navigate(
                                                    `/funcionarios/editar/${f.id}`
                                                )
                                            }
                                        >

                                            <Pencil size={16} />

                                        </button>

                                        <button
                                            className="btn-icon btn-delete"
                                            title="Excluir"
                                            onClick={() =>
                                                setDeleteId(f.id)
                                            }
                                        >

                                            <Trash2 size={16} />

                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                )}

            </div>
                        {deleteId != null && (

                <div
                    className="modal-overlay"
                    onClick={() => setDeleteId(null)}
                >

                    <div
                        className="modal modal-sm"
                        onClick={e => e.stopPropagation()}
                    >

                        <div className="modal-header">

                            <h2>

                                Confirmar Exclusão

                            </h2>

                            <button
                                className="modal-close"
                                onClick={() => setDeleteId(null)}
                            >

                                <X size={18} />

                            </button>

                        </div>

                        <div className="modal-body">

                            <p>

                                Tem certeza que deseja excluir este funcionário?
                                Esta ação só pode ser desfeita por um Administrador.

                            </p>

                        </div>

                        <div className="modal-footer">

                            <button
                                className="btn-danger"
                                onClick={handleDelete}
                                disabled={deleting}
                            >

                                {deleting
                                    ? 'Excluindo...'
                                    : 'Excluir'}

                            </button>

                            <button
                                className="btn-secondary"
                                onClick={() => setDeleteId(null)}
                            >

                                Cancelar

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}