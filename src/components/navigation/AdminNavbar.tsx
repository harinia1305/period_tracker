import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Package,
  ShoppingBag,
  FileText,
} from 'lucide-react';

export const AdminNavbar: React.FC = () => {
  const navItems = [
    { to: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/verification', label: 'Partner Verifications', icon: UserCheck },
    { to: '/admin/orders', label: 'Orders', icon: Package },
    { to: '/admin/products', label: 'Catalog', icon: ShoppingBag },
    { to: '/admin/audit', label: 'Audit & Export', icon: FileText },
  ];

  return (
    <nav className="bg-white border-b border-[#F3ECE8] shadow-xs px-4 py-2 sticky top-[45px] z-30">
      <div className="max-w-6xl mx-auto flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-1 sm:gap-2">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[40px] ${
                    isActive
                      ? 'bg-[#8A5A44] text-white shadow-xs'
                      : 'text-[#7A6E73] hover:bg-[#FAF7F5] hover:text-[#4A1525]'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
