import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deliveryPartnerService } from '../../services/deliveryPartnerService';
import {
  ShieldCheck,
  Power,
  MapPin,
  Star,
  ArrowRight,
  Inbox,
  Navigation,
  Shield,
} from 'lucide-react';

export const PartnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [partner] = useState(() => deliveryPartnerService.getCurrentPartner());
  const [isAvailable, setIsAvailable] = useState(partner.isAvailable);

  const incomingRequests = deliveryPartnerService.getIncomingRequests();
  const activeOrders = deliveryPartnerService.getActiveOrders(partner.id);

  const handleToggleOnline = () => {
    const updated = deliveryPartnerService.toggleAvailability(partner.id);
    setIsAvailable(updated);
  };

  return (
    <div className="space-y-5">
      {/* Partner Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#3F755E]">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Woman Delivery Partner</span>
          </div>
          <h1 className="text-2xl font-black text-[#1F2E26]">
            Welcome, {partner.displayName}
          </h1>
        </div>

        {/* Online / Offline Switch */}
        <button
          type="button"
          onClick={handleToggleOnline}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-bold text-xs shadow-xs transition-all min-h-[44px] ${
            isAvailable
              ? 'bg-[#3F755E] text-white'
              : 'bg-white border border-[#E5DAD4] text-[#7A6E73]'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{isAvailable ? 'Online' : 'Offline'}</span>
        </button>
      </div>

      {/* Verification Status & Hub Banner */}
      <div className="bg-white rounded-3xl p-5 border border-[#D2E7DE] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#3F755E]">Partner Hub</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#EBF4F0] text-[#2F614C] text-[11px] font-bold border border-[#D2E7DE]">
            {partner.verificationStatus.toUpperCase()} (Prototype)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-center">
          <div className="p-3 bg-[#F5F8F6] rounded-2xl border border-[#D2E7DE]">
            <span className="text-[10px] text-[#7A6E73] block uppercase font-medium">Rating</span>
            <span className="text-base font-black text-[#1F2E26] flex items-center justify-center gap-1">
              <Star className="w-3.5 h-3.5 text-[#E27B66] fill-current" />
              <span>{partner.rating}</span>
            </span>
          </div>
          <div className="p-3 bg-[#F5F8F6] rounded-2xl border border-[#D2E7DE]">
            <span className="text-[10px] text-[#7A6E73] block uppercase font-medium">Completed</span>
            <span className="text-base font-black text-[#1F2E26]">{partner.completedOrders}</span>
          </div>
          <div className="p-3 bg-[#F5F8F6] rounded-2xl border border-[#D2E7DE]">
            <span className="text-[10px] text-[#7A6E73] block uppercase font-medium">Week Payout</span>
            <span className="text-base font-black text-[#2F614C]">₹{partner.weeklyEarningsInr}</span>
          </div>
          <div className="p-3 bg-[#F5F8F6] rounded-2xl border border-[#D2E7DE]">
            <span className="text-[10px] text-[#7A6E73] block uppercase font-medium">Zone</span>
            <span className="text-xs font-bold text-[#1F2E26] truncate" title={partner.serviceZone}>
              Indiranagar
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#7A6E73] pt-1">
          <MapPin className="w-3.5 h-3.5 text-[#3F755E] shrink-0" />
          <span>Active Hub: <strong>{partner.serviceZone}</strong> ({partner.vehicleType})</span>
        </div>
      </div>

      {/* Active Order Banner if any */}
      {activeOrders.length > 0 && (
        <div
          onClick={() => navigate('/partner/active')}
          className="p-4 rounded-3xl bg-gradient-to-r from-[#1F2E26] to-[#2F614C] text-white shadow-md cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#A2E2C4]">Active Delivery in Progress</span>
              <h3 className="text-sm font-bold">{activeOrders[0].id}</h3>
              <p className="text-xs text-white/80 mt-0.5">Status: {activeOrders[0].status.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white text-[#1F2E26] flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Incoming Requests Shortcut Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#D2E7DE] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-[#3F755E]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2E26]">
              Incoming Delivery Requests ({incomingRequests.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={() => navigate('/partner/requests')}
            className="text-xs font-bold text-[#3F755E] hover:underline"
          >
            View All
          </button>
        </div>

        {incomingRequests.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#7A6E73] bg-[#F5F8F6] rounded-2xl border border-[#D2E7DE]">
            No pending requests in your zone right now. We will notify you when a new care package is ordered.
          </div>
        ) : (
          <div className="space-y-2">
            {incomingRequests.slice(0, 2).map(req => (
              <div
                key={req.id}
                className="p-3.5 rounded-2xl bg-[#F5F8F6] border border-[#D2E7DE] flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1F2E26]">{req.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF4F0] text-[#2F614C] font-semibold">
                      Discreet Box
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A6E73] mt-0.5">
                    {req.items.length} items • Payout: <strong className="text-[#2F614C]">₹85</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/partner/requests')}
                  className="px-3 py-1.5 rounded-xl bg-[#3F755E] text-white text-xs font-bold shadow-xs hover:bg-[#2F614C]"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safety Reminder */}
      <div className="p-4 rounded-3xl bg-[#EBF4F0] border border-[#D2E7DE] flex items-start gap-3 text-xs text-[#2F614C]">
        <Shield className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Privacy & Safety Protocol</p>
          <p className="text-[11px] mt-0.5 leading-relaxed text-[#1F2E26]">
            Customer menstrual logs and personal notes are never exposed to delivery partners.
            Always confirm discreet plain box packaging before completing handover.
          </p>
        </div>
      </div>
    </div>
  );
};
