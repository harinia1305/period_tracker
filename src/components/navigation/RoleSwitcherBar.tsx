import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../models/types';
import { privacyService } from '../../services/privacyService';
import {
  Sparkles,
  User,
  Truck,
  Shield,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RoleSwitcherBar: React.FC = () => {
  const { currentUser, switchRole } = useAuth();
  const [resetting, setResetting] = useState(false);
  const navigate = useNavigate();

  const handleRoleChange = async (role: Role) => {
    await switchRole(role);
    if (role === 'user') {
      navigate('/app/home');
    } else if (role === 'delivery_partner') {
      navigate('/partner/overview');
    } else if (role === 'admin') {
      navigate('/admin/overview');
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to clean prototype seed state?')) {
      setResetting(true);
      privacyService.resetDemoData();
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  };

  return (
    <header
      role="banner"
      className="bg-[#2D0B16] text-[#FAF7F5] px-3 py-2 text-xs border-b border-[#4A1525] shadow-xs sticky top-0 z-40"
    >
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-bold tracking-wide text-[#F3ABB9]">
            <Sparkles className="w-3.5 h-3.5 text-[#DE738A]" />
            <span>PERIOD LOVE</span>
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#4A1525] text-[10px] text-[#F3ECE8] border border-[#781D42]/40">
            MVP Prototype
          </span>
        </div>

        {/* 1-Click Role Switcher */}
        <div className="flex items-center gap-1 bg-[#1A050C] p-1 rounded-full border border-[#4A1525]">
          <span className="text-[10px] text-[#A18A92] px-2 hidden md:inline">Demo Role:</span>

          <button
            type="button"
            onClick={() => handleRoleChange('user')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition-all text-xs ${
              currentUser.role === 'user'
                ? 'bg-[#781D42] text-white shadow-xs'
                : 'text-[#CBBFB9] hover:text-white'
            }`}
          >
            <User className="w-3 h-3" />
            <span>User</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('delivery_partner')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition-all text-xs ${
              currentUser.role === 'delivery_partner'
                ? 'bg-[#3F755E] text-white shadow-xs'
                : 'text-[#CBBFB9] hover:text-white'
            }`}
          >
            <Truck className="w-3 h-3" />
            <span>Partner</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition-all text-xs ${
              currentUser.role === 'admin'
                ? 'bg-[#8A5A44] text-white shadow-xs'
                : 'text-[#CBBFB9] hover:text-white'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Admin</span>
          </button>
        </div>

        {/* Active Demo Profile Badge & Reset Data */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1 text-[11px] text-[#F3ECE8]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3F755E]" />
            <span>Active: {currentUser.displayName}</span>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/auth/login?role=${currentUser.role}`)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#4A1525] hover:bg-[#641C33] text-[11px] font-medium transition-colors border border-[#781D42]/60"
            title="Go to dedicated login screen for this role"
          >
            <span>Logins</span>
          </button>

          <button
            type="button"
            onClick={handleResetData}
            disabled={resetting}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#4A1525] hover:bg-[#641C33] text-[11px] font-medium transition-colors border border-[#781D42]/60"
            title="Reset storage to original seed state"
          >
            <RotateCcw className={`w-3 h-3 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
