import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserCog,
  TrendingUp, TrendingDown, Dumbbell, Truck, Box,
} from 'lucide-react';
import Header from '../layout/Header';
import { ClienteService } from '../services/clienteService';
import { FuncionarioService } from '../services/funcionarioService';
import { ProdutoService } from '../services/produtoService';
import { ContaReceberService, ContaPagarService } from '../services/contasService';
import { FornecedorService } from '../services/fornecedorService';
import './Dashboard.css';

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  to: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    clientes: 0,
    funcionarios: 0,
    produtos: 0,
    contasReceber: 0,
    contasPagar: 0,
    fornecedores: 0,
    estoqueTotal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [clientes, funcionarios, produtos, receber, pagar, fornecedores] =
          await Promise.allSettled([
            ClienteService.getAll(),
            FuncionarioService.getAll(),
            ProdutoService.getAll(),
            ContaReceberService.getAll(),
            ContaPagarService.getAll(),
            FornecedorService.getAll(),
          ]);

        setStats({
          clientes: clientes.status === 'fulfilled' ? clientes.value.data.length : 0,
          funcionarios: funcionarios.status === 'fulfilled' ? funcionarios.value.data.length : 0,
          produtos: produtos.status === 'fulfilled' ? produtos.value.data.length : 0,
          contasReceber: receber.status === 'fulfilled'
            ? receber.value.data.filter((c) => c.status !== 'Pago').length : 0,
          contasPagar: pagar.status === 'fulfilled'
            ? pagar.value.data.filter((c) => c.status !== 'Pago').length : 0,
          fornecedores: fornecedores.status === 'fulfilled' ? fornecedores.value.data.length : 0,
          estoqueTotal: produtos.status === 'fulfilled'
            ? produtos.value.data.reduce((sum, p) => sum + p.estoque, 0) : 0,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const cards: StatCard[] = [
    { label: 'Clientes', value: stats.clientes, icon: <Users size={28} />, color: 'gold', to: '/clientes' },
    { label: 'Funcionários', value: stats.funcionarios, icon: <UserCog size={28} />, color: 'dark', to: '/funcionarios' },
    { label: 'Fornecedores', value: stats.fornecedores, icon: <Truck size={28} />, color: 'gold', to: '/fornecedores' },
    { label: 'Produtos', value: stats.produtos, icon: <Box size={28} />, color: 'dark', to: '/produtos' },
    { label: 'Itens em Estoque', value: stats.estoqueTotal, icon: <Dumbbell size={28} />, color: 'gold', to: '/produtos' },
    { label: 'Contas a Receber', value: stats.contasReceber, icon: <TrendingUp size={28} />, color: 'green', to: '/contas-receber' },
    { label: 'Contas a Pagar', value: stats.contasPagar, icon: <TrendingDown size={28} />, color: 'red', to: '/contas-pagar' },
  ];

  return (
    <>
      <Header title="Dashboard" />
      <main className="page-content">

        <div className="dashboard-banner">
          <div className="banner-text">
            <span className="banner-welcome">Bem-vindo ao</span>
            <h2 className="banner-title">
              <span className="vital">Vital</span><span className="trainer">Trainer</span> ERP
            </h2>
            <p className="banner-sub">Centro de Treinamento — Sistema de Gestão</p>
          </div>
          <div className="banner-icon"><Dumbbell size={72} strokeWidth={1.2} /></div>
        </div>

        <h3 className="section-title">Visão Geral</h3>

        {loading ? (
          <div className="dashboard-loading">Carregando dados...</div>
        ) : (
          <div className="stats-grid">
            {cards.map((card) => (
              <button
                key={card.label}
                className={`stat-card stat-card--${card.color}`}
                onClick={() => navigate(card.to)}
              >
                <div className="stat-card-icon">{card.icon}</div>
                <div className="stat-card-info">
                  <span className="stat-card-value">{card.value}</span>
                  <span className="stat-card-label">{card.label}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        <h3 className="section-title">Acesso Rápido</h3>
        <div className="quick-access">
          {[
            { label: 'Nova Matrícula', to: '/matriculas' },
            { label: 'Novo Cliente', to: '/clientes' },
            { label: 'Nova Nota de Venda', to: '/notas-venda' },
            { label: 'Nova Nota de Compra', to: '/notas-compra' },
            { label: 'Contas a Receber', to: '/contas-receber' },
            { label: 'Contas a Pagar', to: '/contas-pagar' },
          ].map((item) => (
            <button
              key={item.label}
              className="quick-btn"
              onClick={() => navigate(item.to)}
            >
              {item.label}
            </button>
          ))}
        </div>

      </main>
    </>
  );
}
