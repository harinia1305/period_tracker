import React, { useState } from 'react';
import { adminService } from '../../services/adminService';
import { AuditLogEntry } from '../../models/types';
import {
  Download,
  Shield,
  CheckCircle2,
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const [logs] = useState<AuditLogEntry[]>(() => adminService.getAuditLogs());
  const [notice, setNotice] = useState<string | null>(null);

  const downloadCsv = (dataset: 'orders' | 'logs' | 'partners' | 'audit', filename: string) => {
    const csvContent = adminService.exportMockCsv(dataset);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setNotice(`Exported ${filename} successfully`);
    setTimeout(() => setNotice(null), 2500);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#4A1525]">Audit Log & Compliance Exports</h1>
          <p className="text-xs text-[#7A6E73]">
            Track administrative actions and generate mock CSV reports for internal records.
          </p>
        </div>

        {/* CSV Export Dropdown / Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => downloadCsv('orders', 'period_love_orders_export.csv')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#F3ECE8] hover:border-[#8A5A44] text-xs font-bold text-[#4A1525] shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#8A5A44]" />
            <span>Orders CSV</span>
          </button>

          <button
            type="button"
            onClick={() => downloadCsv('partners', 'period_love_partners_export.csv')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#F3ECE8] hover:border-[#8A5A44] text-xs font-bold text-[#4A1525] shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#8A5A44]" />
            <span>Partners CSV</span>
          </button>

          <button
            type="button"
            onClick={() => downloadCsv('audit', 'period_love_audit_trail.csv')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#8A5A44] hover:bg-[#6E4431] text-white text-xs font-bold shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Audit Trail CSV</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-[#EBF4F0] border border-[#D2E7DE] rounded-2xl text-xs font-bold text-[#2F614C] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl p-5 border border-[#F3ECE8] shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#8A5A44]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A1525]">
            Immutable Event Records ({logs.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#F3ECE8] text-[#8E7E84]">
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Actor</th>
                <th className="py-2.5 px-3 font-semibold">Action</th>
                <th className="py-2.5 px-3 font-semibold">Target Entity</th>
                <th className="py-2.5 px-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3ECE8] text-[#2D2327]">
              {logs.map(entry => (
                <tr key={entry.id} className="hover:bg-[#FAF7F5] transition-colors">
                  <td className="py-3 px-3 text-[#7A6E73] whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-3 font-medium">
                    <span className="block text-[#4A1525]">{entry.actorEmail}</span>
                    <span className="text-[10px] text-[#8E7E84] uppercase">{entry.role}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-[#FAF7F5] border border-[#F3ECE8] font-mono text-[10px] text-[#8A5A44] font-bold">
                      {entry.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-[#7A6E73]">
                    {entry.entityType}: {entry.entityId}
                  </td>
                  <td className="py-3 px-3 text-[#5C4A50] max-w-xs truncate" title={entry.details}>
                    {entry.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
