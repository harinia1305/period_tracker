import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Calendar,
  Sparkles,
  ShoppingBag,
  User as UserIcon,
} from 'lucide-react';
import { cartService } from '../../services/cartService';

export const UserBottomNav: React.FC = () => {
  const [cartCount, setCartCount] = useState<number>(() => {
    return cartService.calculateTotals(cartService.getItems()).itemCount;
  });

  useEffect(() => {
    const handleStorage = () => {
      setCartCount(cartService.calculateTotals(cartService.getItems()).itemCount);
    };
    window.addEventListener('storage', handleStorage);
    // Poll briefly for in-tab cart updates
    const interval = setInterval(handleStorage, 1000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { to: '/app/home', label: 'Home', icon: Home },
    { to: '/app/calendar', label: 'Calendar', icon: Calendar },
    { to: '/app/insights', label: 'Insights', icon: Sparkles },
    { to: '/app/shop', label: 'Care Shop', icon: ShoppingBag, badge: cartCount },
    { to: '/app/profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <nav
      aria-label="User navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#F3ECE8] px-2 py-1 shadow-lg"
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
                    ? 'text-[#781D42] font-bold'
                    : 'text-[#8E7E84] hover:text-[#4A1525] font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-[#781D42] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] mt-1">{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#781D42]" />
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
