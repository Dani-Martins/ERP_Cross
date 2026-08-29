import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { Search, UserCircle } from 'lucide-react';
import { FuncionarioService } from '../services/funcionarioService';
import { CidadeService } from '../services/cidadeService';
import { CargoService } from '../services/cargoService';
import type { FuncionarioCreate } from '../types/entities';
import { formatCPF, validateCPF, formatRG, validateRG, formatPhone, formatCEP, formatPIS, validatePIS } from '../utils/formatting';
import CidadeLookupModal from '../components/CidadeLookupModal';
import CargoLookupModal from '../components/CargoLookupModal';
import CurrencyInput from '../components/CurrencyInput';
import './PaisesPage.css';

function toInputDate(value?: string | null): string {

    if (!value)
        return '';

    // Já está em formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(value))
        return value;

    // ISO 8601 com T
    if (value.includes('T'))
        return value.split('T')[0];

    // Formato brasileiro dd/MM/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        const [dia, mes, ano] = value.split('/');
        return `${ano}-${mes}-${dia}`;
    }

    return '';

}

function getHoje(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

function formatDateToBrasileiro(dateStr: string): string {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [ano, mes, dia] = dateStr.split('-');
        return `${dia}/${mes}/${ano}`;
    }
    return '';
}

const EMPTY: FuncionarioCreate = {

    nome: '',
    cpfCnpj: '',
    rgIe: '',

    contato2: '',
    celular: '',
    email: '',

    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',

    idCidade: 0,
    idCargo: undefined,

    pis: '',

    salario: undefined,

    dataAdmissao: '',
    dataDemissao: '',

    sexo: '',

    ativo: true

};

export default function FuncionarioFormPage() {

    const { id } = useParams<{ id: string }>();

    const navigate = useNavigate();

    const isEdit = Boolean(id);

    const [form, setForm] = useState<FuncionarioCreate>(EMPTY);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState('');

    const [buscandoCEP, setBuscandoCEP] = useState(false);

    const [showCidadeModal, setShowCidadeModal] = useState(false);

    const [showCargoModal, setShowCargoModal] = useState(false);

    const [nomeCidade, setNomeCidade] = useState('');

    const [nomeCargo, setNomeCargo] = useState('');

    useEffect(() => {

        if (!isEdit) {

            // Pré-preencher Data de Admissão com a data atual (YYYY-MM-DD)
            const hoje = getHoje();

            setForm(prev => ({

                ...prev,

                dataAdmissao: hoje

            }));

            setLoading(false);

            return;

        }

        FuncionarioService.getById(Number(id))

            .then(res => {

                const f = res.data;

                const dataAdmConvertida = toInputDate(f.dataAdmissao);

                setForm({

                    nome: f.nome,
                    cpfCnpj: f.cpfCnpj,
                    rgIe: f.rgIe ?? '',

                    contato2: f.contato2 ?? '',
                    celular: f.celular ?? '',
                    email: f.email ?? '',

                    cep: f.cep ?? '',
                    endereco: f.endereco ?? '',
                    numero: f.numero ?? '',
                    complemento: f.complemento ?? '',
                    bairro: f.bairro ?? '',

                    idCidade: f.idCidade,
                    idCargo: f.idCargo,

                    pis: f.pis ?? '',

                    salario: f.salario,

                    dataAdmissao: dataAdmConvertida,

                    dataDemissao: toInputDate(f.dataDemissao),

                    sexo: f.sexo ?? '',

                    ativo: f.ativo

                });

                setNomeCidade(f.nomeCidade ?? '');

                setNomeCargo(f.nomeCargo ?? '');

            })

            .catch(() => navigate('/funcionarios'))

            .finally(() => setLoading(false));

    }, [id]);

    useEffect(() => {

        if (!form.idCargo) return;

        const cargoId = form.idCargo;

        CargoService.getById(cargoId)

            .then(res => {

                if (res.data?.salarioBase) {

                    setForm(prev => ({

                        ...prev,

                        salario: res.data.salarioBase

                    }));

                }

            })

            .catch(() => {

                // Silenciosamente ignorar erro se cargo não for encontrado

            });

    }, [form.idCargo]);

    async function buscarEnderecoPorCEP(cep: string) {

        const clean = cep.replace(/\D/g, '');

        if (clean.length !== 8)
            return;

        setBuscandoCEP(true);

        try {

            const res = await fetch(
                `https://viacep.com.br/ws/${clean}/json/`
            );

            if (!res.ok)
                return;

            const data = await res.json();

            if (data.erro)
                return;

            setForm(prev => ({

                ...prev,

                endereco:
                    prev.endereco?.trim()
                        ? prev.endereco
                        : data.logradouro?.toUpperCase(),

                bairro:
                    prev.bairro?.trim()
                        ? prev.bairro
                        : data.bairro?.toUpperCase()

            }));

            const cidades = await CidadeService.getAll(data.localidade);

            const match = cidades.data.find(

                c =>
                    c.nomeCidade.toUpperCase() ===
                    data.localidade.toUpperCase()

            );

            if (match) {

                setForm(prev =>

                    prev.idCidade

                        ? prev

                        : {

                            ...prev,

                            idCidade: match.id

                        }

                );

                setNomeCidade(match.nomeCidade);

            }

        }

        finally {

            setBuscandoCEP(false);

        }

    }

    async function handleSave(
        e: React.FormEvent
    ) {

        e.preventDefault();

        if (!form.nome.trim()) {

            setError('Nome é obrigatório.');

            return;

        }

        if (!validateCPF(form.cpfCnpj)) {

            setError('CPF inválido.');

            return;

        }

        if (form.rgIe && !validateRG(form.rgIe)) {

            setError('RG inválido.');

            return;

        }

        if (form.pis && !validatePIS(form.pis)) {

            setError('PIS inválido.');

            return;

        }

        if (!form.idCargo) {

            setError('Cargo é obrigatório.');

            return;

        }

        if (!form.idCidade) {

            setError('Cidade é obrigatória.');

            return;

        }

        if (!form.pis || !form.pis.trim()) {

            setError('PIS é obrigatório.');

            return;

        }

        if (!validatePIS(form.pis)) {

            setError('PIS inválido.');

            return;

        }

        if (!form.celular || !form.celular.trim()) {

            setError('Celular é obrigatório.');

            return;

        }

        if (!form.cep || !form.cep.trim()) {

            setError('CEP é obrigatório.');

            return;

        }

        if (!form.endereco || !form.endereco.trim()) {

            setError('Logradouro é obrigatório.');

            return;

        }

        if (!form.numero || !form.numero.trim()) {

            setError('Número é obrigatório.');

            return;

        }

        if (!form.bairro || !form.bairro.trim()) {

            setError('Bairro é obrigatório.');

            return;

        }

        if (form.salario === undefined || form.salario === 0) {

            setError('Salário é obrigatório.');

            return;

        }

        if (!form.dataAdmissao || !form.dataAdmissao.trim()) {

            setError('Data de Admissão é obrigatória.');

            return;

        }

        setSaving(true);

        setError('');

        try {

            const dataToSend = {
                ...form,
                dataAdmissao: form.dataAdmissao ? formatDateToBrasileiro(form.dataAdmissao) : '',
                dataDemissao: form.dataDemissao ? formatDateToBrasileiro(form.dataDemissao) : ''
            };

            if (isEdit)

                await FuncionarioService.update(
                    Number(id),
                    dataToSend
                );

            else

                await FuncionarioService.create(dataToSend);

            navigate('/funcionarios');

        }

        catch (err) {

            const axiosErr =
                err as AxiosError<{ message: string }>;

            setError(

                axiosErr.response?.data?.message ??

                'Erro ao salvar funcionário.'

            );

            setSaving(false);

        }

    }

    if (loading) {

        return (

            <div className="page-container">

                <div className="table-loading">

                    Carregando...

                </div>

            </div>

        );

    }

    return (
            <>
        <div className="page-container">

            <div className="page-header">

                <div className="page-title-area">

                    <UserCircle
                        size={24}
                        className="page-title-icon"
                    />

                    <h1 className="page-title">

                        {isEdit
                            ? 'Editar Funcionário'
                            : 'Novo Funcionário'}

                    </h1>

                </div>

            </div>

            <div className="form-card">

                <form
                    onSubmit={handleSave}
                    className="form-page"
                >

                    {/* ==========================
                        DADOS PRINCIPAIS
                    ========================== */}

                    <div className="form-section">

                        <h2 className="form-section-title">

                            Dados Principais

                        </h2>

                        <div className="form-row">

                            <div
                                className="form-group"
                                style={{ gridColumn: 'span 2' }}
                            >

                                <label>

                                    Funcionário *

                                </label>

                                <input
                                    type="text"
                                    placeholder="Ex: JOÃO DA SILVA"
                                    value={form.nome}
                                    autoFocus
                                    onChange={e =>
                                        setForm({
                                            ...form,
                                            nome: e.target.value.toUpperCase()
                                        })
                                    }
                                />

                            </div>

                        </div>

                        <div className="form-row">

                            <div className="form-group">

                                <label>

                                    CPF *

                                </label>

                                <input
                                    type="text"
                                    maxLength={14}
                                    placeholder="000.000.000-00"
                                    value={form.cpfCnpj}
                                    onChange={e =>
                                        setForm({
                                            ...form,
                                            cpfCnpj: formatCPF(e.target.value)
                                        })
                                    }
                                />

                            </div>

                            <div className="form-group">

                                <label>

                                    RG

                                </label>

                                <input
                                    type="text"
                                    maxLength={12}
                                    placeholder="00.000.000-0"
                                    value={form.rgIe}
                                    onChange={e =>
                                        setForm({
                                            ...form,
                                            rgIe: formatRG(e.target.value)
                                        })
                                    }
                                />

                            </div>

                        </div>

                        <div className="form-row">

                            <div className="form-group">

                                <label>

                                    Sexo

                                </label>

                                <select
                                    value={form.sexo}
                                    onChange={e =>
                                        setForm({
                                            ...form,
                                            sexo: e.target.value
                                        })
                                    }
                                >

                                    <option value="">

                                        Não informado

                                    </option>

                                    <option value="M">

                                        Masculino

                                    </option>

                                    <option value="F">

                                        Feminino

                                    </option>

                                    <option value="O">

                                        Outro

                                    </option>

                                </select>

                            </div>

                            <div className="form-group">

                                <label>

                                    Cargo *

                                </label>

                                <div className="lookup-field">

                                    <input
                                        type="text"
                                        readOnly
                                        className="lookup-input"
                                        placeholder="Selecione um cargo..."
                                        value={nomeCargo}
                                    />

                                    <button
                                        type="button"
                                        className="btn-lookup"
                                        onClick={() =>
                                            setShowCargoModal(true)
                                        }
                                    >

                                        <Search size={16} />

                                    </button>

                                </div>

                            </div>

                        </div>

                        <div className="form-row">

                            <div className="form-group">

                                <label htmlFor="pis">

                                    PIS *

                                </label>

                                <input
                                    id="pis"
                                    type="text"
                                    placeholder="000.00000.00-0"
                                    value={form.pis}
                                    onChange={e =>
                                        setForm({
                                            ...form,
                                            pis: formatPIS(e.target.value)
                                        })
                                    }
                                />

                            </div>

                        </div>

                        <div className="form-row">

                            <div className="form-group">

                                <label htmlFor="salario">

                                    Salário *

                                </label>

                                <CurrencyInput
                                    id="salario"
                                    value={form.salario ?? 0}
                                    onChange={value =>
                                        setForm({

                                            ...form,

                                            salario: value

                                        })
                                    }
                                    placeholder="R$ 0,00"
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="dataAdmissao">

                                    Data de Admissão *

                                </label>

                                <input
                                    id="dataAdmissao"
                                    type="date"
                                    max={getHoje()}
                                    value={form.dataAdmissao}
                                    onChange={e =>
                                        setForm({

                                            ...form,

                                            dataAdmissao:
                                                e.target.value

                                        })
                                    }
                                />

                            </div>

                        </div>

                        <div className="form-row">

                            <div className="form-group">

                                <label htmlFor="dataDemissao">

                                    Data de Demissão

                                </label>

                                <input
                                    id="dataDemissao"
                                    type="date"
                                    max={getHoje()}
                                    value={form.dataDemissao}
                                    onChange={e =>
                                        setForm({

                                            ...form,

                                            dataDemissao:
                                                e.target.value

                                        })
                                    }
                                />

                            </div>

                            <div
                                className="form-group form-check"
                                style={{
                                    justifyContent: 'center'
                                }}
                            >

                                <label htmlFor="ativo">

                                    <input
                                        id="ativo"
                                        type="checkbox"
                                        checked={form.ativo}
                                        onChange={e => {
                                            const novoStatus = e.target.checked;
                                            setForm(prev => ({
                                                ...prev,
                                                ativo: novoStatus,
                                                dataDemissao: !novoStatus ? getHoje() : ''
                                            }));
                                        }}
                                    />

                                    Ativo

                                </label>

                            </div>

                        </div>

                    </div>
                                        {/* ==========================
                        CONTATO
                    ========================== */}

                    <div className="form-section">

                        <h2 className="form-section-title">

                            Contato

                        </h2>

                        <div className="form-row">

                            <div className="form-group">

                                <label>

                                    Celular *

                                </label>

                                <input
                                    type="text"
                                    placeholder="(99) 99999-9999"
                                    maxLength={15}
                                    value={form.celular}
                                    onChange={e =>
                                        setForm({
                                            ...form,
                                            celular: formatPhone(e.target.value)
                                        })
                                    }
                                />

                            </div>

                            <div className="form-group">

                                <label>

                                    Telefone / Contato 2

                                </label>

                                <input
                                    type="text"
                                    placeholder="(99) 99999-9999"
                                    maxLength={15}
                                    value={form.contato2}
                                    onChange={e =>
                                        setForm({
                                            ...form,
                                            contato2: formatPhone(e.target.value)
                                        })
                                    }
                                />

                            </div>

                        </div>

                        <div className="form-group">

                            <label>

                                E-mail

                            </label>

                            <input
                                type="email"
                                placeholder="email@empresa.com"
                                value={form.email}
                                onChange={e =>
                                    setForm({
                                        ...form,
                                        email: e.target.value.toUpperCase()
                                    })
                                }
                            />

                        </div>

                    </div>

                    {/* ==========================
                        ENDEREÇO
                    ========================== */}

                    <div className="form-section">

                        <h2 className="form-section-title">

                            Endereço

                        </h2>

                        <div className="form-row">

                            <div className="form-group">

                                <label>

                                    CEP *

                                </label>

                                <input
                                    type="text"
                                    maxLength={9}
                                    placeholder="00000-000"
                                    value={form.cep}
                                    onChange={e => {

                                        const cep = formatCEP(e.target.value);

                                        setForm({
                                            ...form,
                                            cep
                                        });

                                        if (
                                            cep.replace(/\D/g, '').length === 8
                                        ) {

                                            buscarEnderecoPorCEP(cep);

                                        }

                                    }}
                                />

                                {buscandoCEP && (

                                    <span
                                        style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--text-muted)',
                                            marginTop: 4,
                                            display: 'block'
                                        }}
                                    >

                                        Buscando endereço...

                                    </span>

                                )}

                            </div>

                            <div className="form-group">

                                <label>

                                    Bairro *

                                </label>

                                <input
                                    type="text"
                                    value={form.bairro}
                                    onChange={e =>
                                        setForm({

                                            ...form,

                                            bairro:
                                                e.target.value.toUpperCase()

                                        })
                                    }
                                />

                            </div>

                        </div>

                        <div className="form-row">

                            <div
                                className="form-group"
                                style={{
                                    gridColumn: 'span 2'
                                }}
                            >

                                <label>

                                    Logradouro *

                                </label>

                                <input
                                    type="text"
                                    value={form.endereco}
                                    onChange={e =>
                                        setForm({

                                            ...form,

                                            endereco:
                                                e.target.value.toUpperCase()

                                        })
                                    }
                                />

                            </div>

                        </div>

                        <div className="form-row">

                            <div className="form-group">

                                <label>

                                    Número *

                                </label>

                                <input
                                    type="text"
                                    value={form.numero}
                                    onChange={e =>
                                        setForm({

                                            ...form,

                                            numero:
                                                e.target.value

                                        })
                                    }
                                />

                            </div>

                            <div className="form-group">

                                <label>

                                    Complemento

                                </label>

                                <input
                                    type="text"
                                    value={form.complemento}
                                    onChange={e =>
                                        setForm({

                                            ...form,

                                            complemento:
                                                e.target.value.toUpperCase()

                                        })
                                    }
                                />

                            </div>

                        </div>
                                                <div className="form-group">

                            <label>

                                Cidade *

                            </label>

                            <div className="lookup-field">

                                <input
                                    type="text"
                                    readOnly
                                    className="lookup-input"
                                    placeholder="Selecione uma cidade..."
                                    value={nomeCidade}
                                />

                                <button
                                    type="button"
                                    className="btn-lookup"
                                    onClick={() => setShowCidadeModal(true)}
                                >

                                    <Search size={16} />

                                </button>

                            </div>

                        </div>

                    </div>

                    {error && (

                        <p className="form-error">

                            {error}

                        </p>

                    )}

                    <div className="form-page-footer">

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={saving}
                        >

                            {saving
                                ? 'Salvando...'
                                : 'Salvar'}

                        </button>

                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => navigate('/funcionarios')}
                        >

                            Cancelar

                        </button>

                    </div>

                </form>

            </div>

        </div>

        {showCidadeModal && (

            <CidadeLookupModal

                onSelect={(idCidade, cidadeNome) => {

                    setForm(prev => ({

                        ...prev,

                        idCidade

                    }));

                    setNomeCidade(cidadeNome);

                    setShowCidadeModal(false);

                }}

                onClose={() => setShowCidadeModal(false)}

            />

        )}

        {showCargoModal && (

            <CargoLookupModal

                onSelect={(idCargo, cargoNome) => {

                    setForm(prev => ({

                        ...prev,

                        idCargo

                    }));

                    setNomeCargo(cargoNome);

                    setShowCargoModal(false);

                }}

                onClose={() => setShowCargoModal(false)}

            />

        )}

    </>

);
}