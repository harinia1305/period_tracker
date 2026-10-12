import React, { useState } from 'react';
import { adminService } from '../../services/adminService';
import { DeliveryPartner } from '../../models/types';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle2,
  MapPin,
  Star,
  Info,
} from 'lucide-react';

export const VerificationQueue: React.FC = () => {
  const { currentUser } = useAuth();
  const [partners, setPartners] = useState<DeliveryPartner[]>(() => adminService.getVerificationQueue());
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleUpdate = (partnerId: string, status: 'approved' | 'rejected') => {
    adminService.updatePartnerVerification(partnerId, status, currentUser.email);
    setPartners(adminService.getVerificationQueue());
    setActionNotice(`Partner updated to ${status}`);
    setTimeout(() => setActionNotice(null), 2000);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-[#4A1525]">Partner Verification Queue</h1>
        <p className="text-xs text-[#7A6E73]">
          Verify women delivery partners for safe, discreet period-care operations.
        </p>
      </div>

      {actionNotice && (
        <div className="p-3 bg-[#EBF4F0] border border-[#D2E7DE] rounded-2xl text-xs font-bold text-[#2F614C] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Verification Notice */}
      <div className="p-3.5 bg-[#F5EEEB] rounded-2xl border border-[#E8DCD5] text-xs text-[#8A5A44] flex items-start gap-2.5">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          <strong>Prototype Data:</strong> Fictional partner applications for demonstration.
          In production, identity documents and background checks are handled through compliant verification partners.
        </p>
      </div>

      {/* Partners List */}
      <div className="space-y-3">
        {partners.map(partner => (
          <div
            key={partner.id}
            className="bg-white rounded-3xl p-5 border border-[#F3ECE8] shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EBF4F0] text-[#3F755E] flex items-center justify-center font-black">
                  {partner.displayName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#4A1525]">{partner.displayName}</h3>
                  <p className="text-xs text-[#7A6E73] flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#3F755E]" />
                    <span>{partner.city} • {partner.serviceZone}</span>
                  </p>
                </div>
              </div>

              <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase ${
                partner.verificationStatus === 'approved'
                  ? 'bg-[#EBF4F0] text-[#2F614C]'
                  : partner.verificationStatus === 'rejected'
                  ? 'bg-[#FFF2EE] text-[#C8374D]'
                  : 'bg-[#FFF9F6] text-[#E27B66]'
              }`}>
                {partner.verificationStatus}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="p-2.5 bg-[#FAF7F5] rounded-xl border border-[#F3ECE8]">
                <span className="text-[10px] text-[#7A6E73] block uppercase">Rating</span>
                <span className="font-bold text-[#4A1525] flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 text-[#E27B66] fill-current" />
                  <span>{partner.rating}</span>
                </span>
              </div>
              <div className="p-2.5 bg-[#FAF7F5] rounded-xl border border-[#F3ECE8]">
                <span className="text-[10px] text-[#7A6E73] block uppercase">Completed</span>
                <span className="font-bold text-[#4A1525]">{partner.completedOrders} orders</span>
              </div>
              <div className="p-2.5 bg-[#FAF7F5] rounded-xl border border-[#F3ECE8]">
                <span className="text-[10px] text-[#7A6E73] block uppercase">Vehicle</span>
                <span className="font-bold text-[#4A1525] truncate">{partner.vehicleType}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F3ECE8]">
              {partner.verificationStatus !== 'rejected' && (
                <button
                  type="button"
                  onClick={() => handleUpdate(partner.id, 'rejected')}
                  className="px-3.5 py-1.5 rounded-xl border border-[#F5C7BC] text-[#C8374D] hover:bg-[#FFF2EE] text-xs font-semibold"
                >
                  Reject
                </button>
              )}
              {partner.verificationStatus !== 'approved' && (
                <button
                  type="button"
                  onClick={() => handleUpdate(partner.id, 'approved')}
                  className="px-4 py-1.5 rounded-xl bg-[#3F755E] hover:bg-[#2F614C] text-white text-xs font-bold shadow-xs"
                >
                  Approve Verification
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
