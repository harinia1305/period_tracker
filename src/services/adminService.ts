import { AuditLogEntry, DeliveryPartner } from '../models/types';
import { SEED_AUDIT_LOGS } from '../data/seedData';
import { orderService } from './orderService';
import { deliveryPartnerService } from './deliveryPartnerService';
import { dailyLogService } from './dailyLogService';
import { addDays, getTodayKey } from '../utils/dateUtils';

const AUDIT_STORAGE_KEY = 'period_love_audit_logs';

function loadAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(SEED_AUDIT_LOGS));
      return SEED_AUDIT_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_AUDIT_LOGS;
  }
}

function saveAuditLogs(logs: AuditLogEntry[]): void {
  try {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // ignore
  }
}

export const adminService = {
  getKpis(): {
    activeUsersCount: number;
    logsThisWeekCount: number;
    openOrdersCount: number;
    pendingVerificationsCount: number;
  } {
    const orders = orderService.getOrders();
    const openOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;

    const partners = deliveryPartnerService.getAllPartners();
    const pendingVerifications = partners.filter(p => p.verificationStatus === 'pending').length;

    // Get logs for the primary demo user as representative sample
    const logs = dailyLogService.getLogs('usr_maya_demo');
    const today = getTodayKey();
    const weekAgo = addDays(today, -7);
    const logsThisWeek = logs.filter(l => l.date >= weekAgo && l.date <= today).length;

    return {
      activeUsersCount: 142, // Seeded platform active count
      logsThisWeekCount: logsThisWeek + 48,
      openOrdersCount: openOrders,
      pendingVerificationsCount: pendingVerifications,
    };
  },

  getVerificationQueue(): DeliveryPartner[] {
    return deliveryPartnerService.getAllPartners();
  },

  updatePartnerVerification(partnerId: string, status: 'approved' | 'rejected', adminEmail: string): void {
    const partners = deliveryPartnerService.getAllPartners();
    const target = partners.find(p => p.id === partnerId);
    if (target) {
      target.verificationStatus = status;
      localStorage.setItem('period_love_delivery_partners', JSON.stringify(partners));

      this.logAudit({
        actorId: 'admin_session',
        actorEmail: adminEmail,
        role: 'admin',
        action: status === 'approved' ? 'APPROVE_PARTNER' : 'REJECT_PARTNER',
        entityType: 'delivery_partner',
        entityId: partnerId,
        details: `Updated partner ${target.displayName} verification to ${status}.`,
      });
    }
  },

  getAuditLogs(): AuditLogEntry[] {
    return loadAuditLogs();
  },

  logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const logs = loadAuditLogs();
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newEntry);
    saveAuditLogs(logs);
  },

  exportMockCsv(dataset: 'orders' | 'logs' | 'partners' | 'audit'): string {
    if (dataset === 'orders') {
      const orders = orderService.getOrders();
      const headers = 'Order ID,User ID,Total (INR),Status,Discreet Packaging,Created At\n';
      const rows = orders.map(o => `"${o.id}","${o.userId}",${o.totalInr},"${o.status}",${o.discreetPackaging},"${o.createdAt}"`).join('\n');
      return headers + rows;
    } else if (dataset === 'partners') {
      const partners = deliveryPartnerService.getAllPartners();
      const headers = 'Partner ID,Name,City,Status,Rating,Completed Orders,Vehicle\n';
      const rows = partners.map(p => `"${p.id}","${p.displayName}","${p.city}","${p.verificationStatus}",${p.rating},${p.completedOrders},"${p.vehicleType}"`).join('\n');
      return headers + rows;
    } else if (dataset === 'audit') {
      const logs = loadAuditLogs();
      const headers = 'Timestamp,Actor,Role,Action,Entity,Details\n';
      const rows = logs.map(l => `"${l.timestamp}","${l.actorEmail}","${l.role}","${l.action}","${l.entityType}","${l.details}"`).join('\n');
      return headers + rows;
    }
    return 'No data';
  },
};
