import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { deliveryPartnerService } from '../../services/deliveryPartnerService';
import {
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  FileText,
  LogOut,
  CheckCircle2,
} from 'lucide-react';

export const PartnerSafetyScreen: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const partner = deliveryPartnerService.getCurrentPartner();

  const [issueType, setIssueType] = useState('address_issue');
  const [issueNote, setIssueNote] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedMessage('Issue logged with dispatch operations. Support will call back shortly.');
    setIssueNote('');
    setTimeout(() => setSubmittedMessage(null), 3000);
  };

  const handleEmergencySOS = () => {
    if (window.confirm('Trigger mock Emergency SOS dispatch alert?')) {
      alert('Mock SOS Alert sent to Indiranagar Operations lead and emergency contacts.');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-[#1F2E26]">Earnings & Partner Safety</h1>
        <p className="text-xs text-[#7A6E73]">
          Earnings breakdown, security guidelines, and incident reporting.
        </p>
      </div>

      {/* Earnings Summary Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#D2E7DE] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#3F755E]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2E26]">Earnings Overview</h3>
          </div>
          <span className="text-[10px] text-[#7A6E73]">Weekly cycle payout</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-4 bg-[#F5F8F6] rounded-2xl border border-[#D2E7DE]">
            <span className="text-[10px] text-[#7A6E73] block uppercase font-medium">This Week</span>
            <span className="text-2xl font-black text-[#2F614C]">₹{partner.weeklyEarningsInr}</span>
          </div>
          <div className="p-4 bg-[#F5F8F6] rounded-2xl border border-[#D2E7DE]">
            <span className="text-[10px] text-[#7A6E73] block uppercase font-medium">Lifetime Total</span>
            <span className="text-2xl font-black text-[#1F2E26]">₹{partner.totalEarningsInr}</span>
          </div>
        </div>

        <p className="text-[11px] text-[#7A6E73] text-center">
          Base payout: ₹85 per discreet delivery + 100% of customer tips.
        </p>
      </div>

      {/* SOS Emergency Dispatch Button */}
      <div className="bg-[#FFF2EE] rounded-3xl p-5 border border-[#F5C7BC] space-y-3">
        <div className="flex items-center gap-2 text-[#C8374D]">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-sm font-bold">Partner Safety Center</h3>
        </div>
        <p className="text-xs text-[#7A6E73] leading-relaxed">
          If you feel unsafe during delivery, tap SOS to instantly alert our response team and notify local operations.
        </p>
        <button
          type="button"
          onClick={handleEmergencySOS}
          className="w-full py-3 rounded-2xl bg-[#C8374D] hover:bg-[#A92A3D] text-white font-black text-xs shadow-md transition-colors min-h-[44px]"
        >
          TRIGGER EMERGENCY SOS (MOCK)
        </button>
      </div>

      {/* Safety Protocol Standards */}
      <div className="bg-white rounded-3xl p-5 border border-[#D2E7DE] shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#3F755E]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2E26]">Delivery Safety Guidelines</h3>
        </div>

        <div className="space-y-2 text-xs text-[#5C4A50]">
          <div className="p-2.5 rounded-xl bg-[#F5F8F6] border border-[#D2E7DE]">
            <p className="font-bold text-[#1F2E26]">Masked Direct Communication</p>
            <p className="text-[11px] mt-0.5 text-[#7A6E73]">
              Never give your personal mobile number to customers. All calls route via the secure proxy.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#F5F8F6] border border-[#D2E7DE]">
            <p className="font-bold text-[#1F2E26]">Discreet Brown Box Requirement</p>
            <p className="text-[11px] mt-0.5 text-[#7A6E73]">
              Packages must remain sealed. Never open or inspect sensitive personal items inside.
            </p>
          </div>
        </div>
      </div>

      {/* Issue Report Form */}
      <div className="bg-white rounded-3xl p-5 border border-[#D2E7DE] shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#3F755E]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2E26]">Report Delivery Issue</h3>
        </div>

        {submittedMessage && (
          <div className="p-3 bg-[#EBF4F0] border border-[#D2E7DE] rounded-xl text-xs text-[#2F614C] font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{submittedMessage}</span>
          </div>
        )}

        <form onSubmit={handleReportIssue} className="space-y-3 text-xs">
          <div>
            <label className="text-[#7A6E73] block mb-1">Issue Category</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#F5F8F6] border border-[#D2E7DE] focus:outline-none"
            >
              <option value="address_issue">Inaccessible address or gate locked</option>
              <option value="customer_unavailable">Customer not responding to proxy call</option>
              <option value="package_damaged">Damaged or torn packaging tape</option>
              <option value="safety_concern">Unsafe environment or street harassment</option>
              <option value="other">Other issue</option>
            </select>
          </div>

          <div>
            <label className="text-[#7A6E73] block mb-1">Details</label>
            <textarea
              rows={2}
              required
              value={issueNote}
              onChange={(e) => setIssueNote(e.target.value)}
              placeholder="Describe the issue for the dispatch team..."
              className="w-full p-2.5 rounded-xl bg-[#F5F8F6] border border-[#D2E7DE] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#3F755E] hover:bg-[#2F614C] text-white font-bold text-xs shadow-xs min-h-[44px]"
          >
            Submit Report to Hub
          </button>
        </form>
      </div>

      {/* Logout */}
      <div className="text-center pt-1">
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/auth/login');
          }}
          className="text-xs font-bold text-[#7A6E73] hover:text-[#C8374D] flex items-center justify-center gap-1.5 mx-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Partner Portal</span>
        </button>
      </div>
    </div>
  );
};
