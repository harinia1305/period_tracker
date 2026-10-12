import React from 'react';
import { Outlet } from 'react-router-dom';
import { RoleSwitcherBar } from '../../components/navigation/RoleSwitcherBar';
import { AdminNavbar } from '../../components/navigation/AdminNavbar';
import { Shield } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF7F5] flex flex-col antialiased text-[#2D2327]">
      <RoleSwitcherBar />
      <AdminNavbar />

      {/* Admin Operations Sub-banner */}
      <div className="bg-[#F5EEEB] border-b border-[#E8DCD5] py-1 px-4 text-center">
        <p className="text-[11px] text-[#8A5A44] font-medium flex items-center justify-center gap-1.5 max-w-6xl mx-auto">
          <Shield className="w-3.5 h-3.5 text-[#8A5A44]" />
          <span>
            Operations Management. Synthetic demo seed data loaded. Real identity documents are not collected.
          </span>
        </p>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 pb-20">
        <Outlet />
      </main>
    </div>
  );
};
