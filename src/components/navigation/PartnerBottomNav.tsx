import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  Inbox,
  Navigation,
  ShieldAlert,
} from 'lucide-react';

export const PartnerBottomNav: React.FC = () => {
  const navItems = [
    { to: '/partner/overview', label: 'Overview', icon: Activity },
    { to: '/partner/requests', label: 'Requests', icon: Inbox },
    { to: '/partner/active', label: 'Active Order', icon: Navigation },
    { to: '/partner/safety', label: 'Earnings & Safety', icon: ShieldAlert },
  ];

  return (
    <nav
      aria-label="Delivery partner navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5DAD4] px-2 py-1 shadow-lg"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl min-h-[48px] min-w-[56px] transition-all relative ${
                  isActive
                    ? 'text-[#3F755E] font-bold'
                    : 'text-[#8E7E84] hover:text-[#2D2327] font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  <span className="text-[10px] mt-1">{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#3F755E]" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
