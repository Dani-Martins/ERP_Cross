import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Users,
  Dumbbell,
  Package,
  Wallet,
  FileText,
  Building2,
  Map,
  Globe,
  UserCircle,
  UserCog,
  Truck,
  Award,
  Star,
  UserCheck,
  Box,
  CreditCard,
  CalendarClock,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  PackageOpen,
  type LucideIcon,
} from 'lucide-react';
import './Sidebar.css';

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Localização',
    icon: MapPin,
    items: [
      { label: 'Cidades', to: '/cidades', icon: Building2 },
      { label: 'Estados', to: '/estados', icon: Map },
      { label: 'Países', to: '/paises', icon: Globe },
    ],
  },
  {
    label: 'Pessoas',
    icon: Users,
    items: [
      { label: 'Clientes', to: '/clientes', icon: UserCircle },
      { label: 'Funcionários', to: '/funcionarios', icon: UserCog },
      { label: 'Fornecedores', to: '/fornecedores', icon: Truck },
      { label: 'Cargos', to: '/cargos', icon: Award },
    ],
  },
  {
    label: 'Academia',
    icon: Dumbbell,
    items: [
      { label: 'Planos', to: '/planos', icon: Star },
      { label: 'Matrículas', to: '/matriculas', icon: UserCheck },
    ],
  },
  {
    label: 'Produtos',
    icon: Package,
    items: [
      { label: 'Produtos', to: '/produtos', icon: Box },
    ],
  },
  {
    label: 'Financeiro',
    icon: Wallet,
    items: [
      { label: 'Formas de Pagamento', to: '/formas-pagamento', icon: CreditCard },
      { label: 'Condições de Pagamento', to: '/condicoes-pagamento', icon: CalendarClock },
      { label: 'Contas a Receber', to: '/contas-receber', icon: TrendingUp },
      { label: 'Contas a Pagar', to: '/contas-pagar', icon: TrendingDown },
    ],
  },
  {
    label: 'Notas',
    icon: FileText,
    items: [
      { label: 'Notas de Venda', to: '/notas-venda', icon: ShoppingCart },
      { label: 'Notas de Compra', to: '/notas-compra', icon: PackageOpen },
    ],
  },
];

export default function Sidebar() {
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  function toggleGroup(label: string) {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  }

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-name">
          <span className="vital">Vital</span><span className="trainer">Trainer</span>
        </div>
        <div className="sidebar-brand-sub">Centro de Treinamento</div>
      </div>

      <ul className="sidebar-nav">
        <li>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
        </li>

        {navGroups.map((group) => {
          const isOpen = openGroups.includes(group.label);
          const Icon = group.icon;
          return (
            <li key={group.label} className="nav-group">
              <button
                className={`nav-group-header${isOpen ? ' open' : ''}`}
                onClick={() => toggleGroup(group.label)}
              >
                <span className="nav-group-label">
                  <span className="nav-group-icon"><Icon size={18} /></span>
                  {group.label}
                </span>
                <span className={`nav-group-arrow${isOpen ? ' rotated' : ''}`}>›</span>
              </button>
              {isOpen && (
                <ul className="nav-group-items">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          className={({ isActive }) => isActive ? 'active' : ''}
                        >
                          <ItemIcon size={15} />
                          {item.label}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
