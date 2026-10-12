import React from 'react';
import { Outlet } from 'react-router-dom';
import { RoleSwitcherBar } from '../../components/navigation/RoleSwitcherBar';
import { UserBottomNav } from '../../components/navigation/UserBottomNav';
import { AlertCircle } from 'lucide-react';

export const UserLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF7F5] flex flex-col antialiased text-[#2D2327]">
      <RoleSwitcherBar />

      {/* Global Non-Alarming Health Notice Banner */}
      <div className="bg-[#FFF5F7] border-b border-[#FCE8ED] py-1.5 px-4 text-center">
        <p className="text-[11px] text-[#781D42] font-medium flex items-center justify-center gap-1.5 max-w-2xl mx-auto">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#DE738A]" />
          <span>
            Tracking insights are estimates and not medical advice. Contact a qualified healthcare professional for concerns.
          </span>
        </p>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 pb-24 sm:pb-28">
        <Outlet />
      </main>

      <UserBottomNav />
    </div>
  );
};
