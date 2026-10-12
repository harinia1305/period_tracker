import React, { useState, useEffect } from 'react';
import { useNotifications, AppNotification } from '../../context/NotificationContext';
import {
  Smartphone,
  Maximize2,
  Wifi,
  BatteryCharging,
  Signal,
  Bell,
  X,
  Heart,
  Truck,
  CreditCard,
  ShieldCheck,
  Vibrate,
} from 'lucide-react';

interface MobileAppContainerProps {
  children: React.ReactNode;
}

export const MobileAppContainer: React.FC<MobileAppContainerProps> = ({ children }) => {
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  const {
    activeBanner,
    dismissBanner,
    notifications,
    unreadCount,
    markAsRead,
    clearAll,
    hapticEnabled,
    toggleHaptic,
  } = useNotifications();

  // Keep live mobile clock updated
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'order':
        return <Truck className="w-4 h-4 text-[#3F755E]" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-[#781D42]" />;
      case 'partner':
        return <ShieldCheck className="w-4 h-4 text-[#3F755E]" />;
      case 'health':
        return <Heart className="w-4 h-4 text-[#DE738A]" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className={`min-h-screen ${isMobileFrame ? 'bg-[#181315] py-4 sm:py-8 px-2 flex flex-col items-center justify-center' : 'bg-[#FAF7F5]'}`}>
      {/* Floating View Switcher Bar */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-[#2D0B16]/95 backdrop-blur-md text-white px-3.5 py-2 rounded-full shadow-2xl border border-[#781D42]/40 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setIsMobileFrame(!isMobileFrame)}
          className="flex items-center gap-1.5 hover:text-[#F3ABB9] transition-colors"
          title="Toggle Mobile Device Frame / Full Responsive View"
        >
          {isMobileFrame ? (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-[#DE738A]" />
              <span>Full Width View</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-[#DE738A]" />
              <span>Mobile App Mode</span>
            </>
          )}
        </button>

        <span className="w-px h-3.5 bg-white/20" />

        <button
          type="button"
          onClick={() => setShowNotificationCenter(true)}
          className="relative p-1 hover:text-[#F3ABB9] transition-colors"
          title="Notifications"
        >
          <Bell className="w-3.5 h-3.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#DE738A] text-[9px] font-bold rounded-full flex items-center justify-center text-white">
              {unreadCount}
            </span>
          )}
        </button>

        <span className="w-px h-3.5 bg-white/20" />

        <button
          type="button"
          onClick={toggleHaptic}
          className={`p-1 transition-colors ${hapticEnabled ? 'text-emerald-400' : 'text-gray-400'}`}
          title={hapticEnabled ? 'Haptic/Vibration: ON' : 'Haptic/Vibration: OFF'}
        >
          <Vibrate className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Content Area */}
      {isMobileFrame ? (
        <div className="relative w-full max-w-[410px] h-[860px] bg-[#FAF7F5] rounded-[52px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-[10px] border-[#2B2326] ring-1 ring-white/10 overflow-hidden flex flex-col antialiased">
          {/* Mobile Hardware Top Bezel & Dynamic Island */}
          <div className="bg-[#2D0B16] text-[#FAF7F5] pt-3 px-6 pb-2 select-none relative z-50 flex items-center justify-between text-xs">
            {/* Live Clock */}
            <span className="font-semibold text-[13px] tracking-tight">{currentTime || '9:41'}</span>

            {/* Dynamic Island Pill */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-24 h-5 bg-black rounded-full flex items-center justify-between px-2.5 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-[#1A1A1A] ring-1 ring-white/10" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 animate-pulse" />
            </div>

            {/* Status Icons: 5G, WiFi, Battery */}
            <div className="flex items-center gap-2 text-white/90">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-0.5 text-[11px] font-bold">
                <span>98%</span>
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Interactive Native Push Notification Dropdown Banner */}
          {activeBanner && (
            <div className="absolute top-12 left-3 right-3 z-50 animate-in slide-in-from-top-4 duration-300">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-gray-100 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getNotifIcon(activeBanner.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#781D42]">
                        Period Love Push
                      </span>
                      <span className="text-[9px] text-gray-400">• now</span>
                    </div>
                    <p className="font-bold text-gray-900 mt-0.5">{activeBanner.title}</p>
                    <p className="text-[11px] text-gray-600 leading-snug">{activeBanner.message}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={dismissBanner}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Scrollable Mobile Screen Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
            {children}
          </div>

          {/* Mobile Bottom Home Gesture Bar */}
          <div className="h-6 bg-[#FAF7F5] flex items-center justify-center shrink-0 select-none pb-1">
            <div className="w-32 h-1 bg-gray-400/80 rounded-full" />
          </div>
        </div>
      ) : (
        /* Full Responsive View */
        <div className="w-full flex-1 flex flex-col">
          {/* Active Push Banner in Full View */}
          {activeBanner && (
            <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-in slide-in-from-top duration-300">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-gray-200 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getNotifIcon(activeBanner.type)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#781D42]">
                      Period Love App Notification
                    </span>
                    <p className="font-bold text-gray-900 mt-0.5">{activeBanner.title}</p>
                    <p className="text-[11px] text-gray-600">{activeBanner.message}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={dismissBanner}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {children}
        </div>
      )}

      {/* Notification Center Modal */}
      {showNotificationCenter && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-gray-100 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#781D42]" />
                <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#FFF5F7] text-[#781D42] text-[10px] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowNotificationCenter(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {notifications.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                      n.read
                        ? 'border-gray-100 bg-gray-50 text-gray-600'
                        : 'border-[#FCE8ED] bg-[#FFF5F7] text-gray-900 font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {getNotifIcon(n.type)}
                        <span className="font-bold text-xs">{n.title}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1 pl-5.5">{n.message}</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={clearAll}
                className="text-gray-500 hover:text-gray-900 text-[11px]"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setShowNotificationCenter(false)}
                className="px-3 py-1.5 rounded-xl bg-[#781D42] text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
