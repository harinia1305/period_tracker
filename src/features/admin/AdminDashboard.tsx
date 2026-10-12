import React from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import {
  Users,
  Calendar,
  Package,
  UserCheck,
  ArrowRight,
  Shield,
  FileText,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const kpis = adminService.getKpis();
  const recentAudits = adminService.getAuditLogs().slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-[#4A1525]">Operations Dashboard</h1>
        <p className="text-xs text-[#7A6E73]">
          Platform oversight, partner verification queues, order fulfillment, and audit logging.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-3xl p-5 border border-[#F3ECE8] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7A6E73] uppercase">Active Users</span>
            <div className="w-8 h-8 rounded-full bg-[#FFF5F7] text-[#781D42] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#4A1525]">{kpis.activeUsersCount}</div>
          <p className="text-[11px] text-[#3F755E] font-medium">+12% this month</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#F3ECE8] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7A6E73] uppercase">Logs This Week</span>
            <div className="w-8 h-8 rounded-full bg-[#FFF5F7] text-[#781D42] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#4A1525]">{kpis.logsThisWeekCount}</div>
          <p className="text-[11px] text-[#7A6E73]">Symptom & cycle entries</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#F3ECE8] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7A6E73] uppercase">Open Orders</span>
            <div className="w-8 h-8 rounded-full bg-[#FFF9F6] text-[#E27B66] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#E27B66]">{kpis.openOrdersCount}</div>
          <p className="text-[11px] text-[#7A6E73]">In dispatch / transit</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#F3ECE8] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7A6E73] uppercase">Pending Partner Verifications</span>
            <div className="w-8 h-8 rounded-full bg-[#EBF4F0] text-[#3F755E] flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#3F755E]">{kpis.pendingVerificationsCount}</div>
          <p className="text-[11px] text-[#7A6E73]">Awaiting background check</p>
        </div>
      </div>

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/admin/verification')}
          className="bg-white rounded-3xl p-5 border border-[#F3ECE8] shadow-xs hover:border-[#8A5A44] transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#EBF4F0] text-[#3F755E] flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-[#8A5A44] group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-bold text-sm text-[#4A1525]">Partner Verification Queue</h3>
          <p className="text-xs text-[#7A6E73]">
            Review applications from women delivery partners, inspect prototype IDs, and approve onboarding.
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/orders')}
          className="bg-white rounded-3xl p-5 border border-[#F3ECE8] shadow-xs hover:border-[#8A5A44] transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF9F6] text-[#E27B66] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-[#8A5A44] group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-bold text-sm text-[#4A1525]">Order Fulfillment Management</h3>
          <p className="text-xs text-[#7A6E73]">
            Inspect order statuses, discreet packaging indicators, and partner dispatch timelines.
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/audit')}
          className="bg-white rounded-3xl p-5 border border-[#F3ECE8] shadow-xs hover:border-[#8A5A44] transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#F5EEEB] text-[#8A5A44] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-[#8A5A44] group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-bold text-sm text-[#4A1525]">Audit Logs & CSV Export</h3>
          <p className="text-xs text-[#7A6E73]">
            Immutable operations log and synthetic prototype CSV export tools.
          </p>
        </div>
      </div>

      {/* Recent Audit Activities */}
      <div className="bg-white rounded-3xl p-5 border border-[#F3ECE8] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#8A5A44]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A1525]">Recent Audit Activity</h3>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/audit')}
            className="text-xs font-bold text-[#8A5A44] hover:underline"
          >
            View Full Log
          </button>
        </div>

        <div className="divide-y divide-[#F3ECE8] text-xs">
          {recentAudits.map(log => (
            <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-bold text-[#4A1525] uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full bg-[#FAF7F5] border border-[#F3ECE8]">
                  {log.action}
                </span>
                <p className="text-[#5C4A50] mt-1">{log.details}</p>
              </div>
              <span className="text-[11px] text-[#8E7E84] whitespace-nowrap">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
