import React from 'react';
import { Outlet } from 'react-router-dom';
import { RoleSwitcherBar } from '../../components/navigation/RoleSwitcherBar';
import { PartnerBottomNav } from '../../components/navigation/PartnerBottomNav';
import { ShieldCheck } from 'lucide-react';

export const PartnerLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F8F6] flex flex-col antialiased text-[#1F2E26]">
      <RoleSwitcherBar />

      {/* Partner Safety & Prototype Notice Banner */}
      <div className="bg-[#EBF4F0] border-b border-[#D2E7DE] py-1.5 px-4 text-center">
        <p className="text-[11px] text-[#2F614C] font-medium flex items-center justify-center gap-1.5 max-w-2xl mx-auto">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-[#3F755E]" />
          <span>
            Verified Partner Portal. Customer addresses and numbers remain masked until order dispatch.
          </span>
        </p>
      </div>

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 pb-24 sm:pb-28">
        <Outlet />
      </main>

      <PartnerBottomNav />
    </div>
  );
};
