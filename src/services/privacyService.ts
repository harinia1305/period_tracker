import { dailyLogService } from './dailyLogService';
import { orderService } from './orderService';
import { authService } from './authService';
import { SEED_USERS, SEED_PRODUCTS, SEED_DELIVERY_PARTNERS, generateSeedDailyLogs, generateSeedOrders, SEED_AUDIT_LOGS } from '../data/seedData';

export const privacyService = {
  exportUserDataJson(userId: string): string {
    const logs = dailyLogService.getLogs(userId);
    const orders = orderService.getOrders(userId);
    const user = authService.getCurrentUser();

    const exportPackage = {
      app: 'Period Love',
      exportedAt: new Date().toISOString(),
      disclaimer: 'This data was exported directly from your private local storage.',
      profile: {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        maskedPhone: user.maskedPhone,
        averageCycleDays: user.averageCycleDays,
      },
      cycleLogs: logs,
      orders: orders.map(o => ({
        id: o.id,
        createdAt: o.createdAt,
        status: o.status,
        totalInr: o.totalInr,
        itemCount: o.items.length,
      })),
    };

    return JSON.stringify(exportPackage, null, 2);
  },

  exportUserDataCsv(userId: string): string {
    const logs = dailyLogService.getLogs(userId);
    const headers = 'Date,Flow Status,Color,Cramps (0-10),Back Pain,Headache,Bloating,Mood (1-5),Self Care Actions,Notes\n';
    const rows = logs.map(l => {
      const selfCare = (l.selfCareActions || []).join(';');
      const sanitizedNotes = (l.notes || '').replace(/"/g, '""');
      return `"${l.date}","${l.flowStatus}","${l.colorHex || ''}",${l.cramps ?? ''},${l.backPain ?? ''},${l.headache ?? ''},${l.bloating ?? ''},${l.mood ?? ''},"${selfCare}","${sanitizedNotes}"`;
    }).join('\n');

    return headers + rows;
  },

  deleteAccountData(userId: string): void {
    // Remove user cycle logs
    localStorage.removeItem(`period_love_logs_${userId}`);

    // Remove user orders
    const allOrders = orderService.getOrders();
    const remainingOrders = allOrders.filter(o => o.userId !== userId);
    localStorage.setItem('period_love_orders', JSON.stringify(remainingOrders));

    // Reset current user session to fresh initial state
    localStorage.removeItem('period_love_current_user');
  },

  resetDemoData(): void {
    // Clear all Period Love storage keys
    const keysToRemove = [
      'period_love_current_user',
      'period_love_all_users',
      'period_love_products',
      'period_love_orders',
      'period_love_delivery_partners',
      'period_love_audit_logs',
      'period_love_cart',
    ];

    // Also remove any period_love_logs_* keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('period_love_logs_')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(k => {
      try {
        localStorage.removeItem(k);
      } catch {
        // ignore
      }
    });

    // Reseed primary keys
    try {
      localStorage.setItem('period_love_all_users', JSON.stringify(SEED_USERS));
      localStorage.setItem('period_love_current_user', JSON.stringify(SEED_USERS[0]));
      localStorage.setItem('period_love_products', JSON.stringify(SEED_PRODUCTS));
      localStorage.setItem('period_love_delivery_partners', JSON.stringify(SEED_DELIVERY_PARTNERS));
      localStorage.setItem('period_love_orders', JSON.stringify(generateSeedOrders()));
      localStorage.setItem('period_love_audit_logs', JSON.stringify(SEED_AUDIT_LOGS));
      localStorage.setItem(`period_love_logs_${SEED_USERS[0].id}`, JSON.stringify(generateSeedDailyLogs(SEED_USERS[0].id)));
    } catch {
      // ignore
    }
  },
};
