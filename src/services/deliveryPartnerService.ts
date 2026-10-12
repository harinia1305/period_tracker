import { DeliveryPartner, Order } from '../models/types';
import { SEED_DELIVERY_PARTNERS } from '../data/seedData';
import { orderService } from './orderService';

const PARTNERS_KEY = 'period_love_delivery_partners';

function loadPartners(): DeliveryPartner[] {
  try {
    const raw = localStorage.getItem(PARTNERS_KEY);
    if (!raw) {
      localStorage.setItem(PARTNERS_KEY, JSON.stringify(SEED_DELIVERY_PARTNERS));
      return SEED_DELIVERY_PARTNERS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_DELIVERY_PARTNERS;
  }
}

function savePartners(partners: DeliveryPartner[]): void {
  try {
    localStorage.setItem(PARTNERS_KEY, JSON.stringify(partners));
  } catch {
    // ignore
  }
}

export const deliveryPartnerService = {
  getAllPartners(): DeliveryPartner[] {
    return loadPartners();
  },

  getPartnerById(id: string): DeliveryPartner | null {
    const partners = loadPartners();
    return partners.find(p => p.id === id) || null;
  },

  getCurrentPartner(): DeliveryPartner {
    const partners = loadPartners();
    // Default to Priya Sharma
    return partners[0] || SEED_DELIVERY_PARTNERS[0];
  },

  toggleAvailability(partnerId: string): boolean {
    const partners = loadPartners();
    const target = partners.find(p => p.id === partnerId);
    if (target) {
      target.isAvailable = !target.isAvailable;
      savePartners(partners);
      return target.isAvailable;
    }
    return false;
  },

  getIncomingRequests(): Order[] {
    // Returns unassigned orders with 'requested' status
    const all = orderService.getOrders();
    return all.filter(o => o.status === 'requested');
  },

  getActiveOrders(partnerId: string): Order[] {
    const all = orderService.getOrders();
    return all.filter(
      o => o.deliveryPartnerId === partnerId &&
           (o.status === 'accepted' || o.status === 'picked_up' || o.status === 'out_for_delivery')
    );
  },

  acceptOrder(partnerId: string, orderId: string): Order {
    const partner = this.getPartnerById(partnerId) || this.getCurrentPartner();
    return orderService.updateStatus(orderId, 'accepted', {
      id: partner.id,
      name: `${partner.displayName} (Verified Partner)`,
    });
  },

  declineOrder(_partnerId: string, _orderId: string): void {
    // In mock demo, decline simply ignores the order for this partner
  },

  advanceActiveOrder(orderId: string): Order {
    const order = orderService.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    let nextStatus = order.status;
    if (order.status === 'accepted') {
      nextStatus = 'picked_up';
    } else if (order.status === 'picked_up') {
      nextStatus = 'out_for_delivery';
    } else if (order.status === 'out_for_delivery') {
      nextStatus = 'delivered';
      // Update partner earnings
      if (order.deliveryPartnerId) {
        const partners = loadPartners();
        const p = partners.find(part => part.id === order.deliveryPartnerId);
        if (p) {
          p.completedOrders += 1;
          const payout = 85; // Mock partner payout per order
          p.weeklyEarningsInr += payout;
          p.totalEarningsInr += payout;
          savePartners(partners);
        }
      }
    }

    return orderService.updateStatus(orderId, nextStatus);
  },
};
