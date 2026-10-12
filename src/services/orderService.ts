import { Order, OrderStatus, OrderItem, PaymentDetails } from '../models/types';
import { generateSeedOrders } from '../data/seedData';

const ORDERS_KEY = 'period_love_orders';

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) {
      const seeded = generateSeedOrders();
      localStorage.setItem(ORDERS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch {
    return generateSeedOrders();
  }
}

function saveOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // ignore
  }
}

export const orderService = {
  getOrders(userId?: string): Order[] {
    const orders = loadOrders();
    if (userId) {
      return orders.filter(o => o.userId === userId);
    }
    return orders;
  },

  getOrderById(orderId: string): Order | null {
    const orders = loadOrders();
    return orders.find(o => o.id === orderId) || null;
  },

  createOrder(data: {
    userId: string;
    items: OrderItem[];
    totalInr: number;
    deliveryFeeInr: number;
    discreetPackaging: boolean;
    verifiedPartnerPreference: boolean;
    addressLabel: string;
    maskedPhone: string;
    payment?: PaymentDetails;
  }): Order {
    const orders = loadOrders();
    const now = new Date().toISOString();
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const newOrder: Order = {
      id: `ord_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      userId: data.userId,
      items: data.items,
      totalInr: data.totalInr,
      deliveryFeeInr: data.deliveryFeeInr,
      status: 'requested',
      discreetPackaging: data.discreetPackaging,
      verifiedPartnerPreference: data.verifiedPartnerPreference,
      addressLabel: data.addressLabel,
      maskedPhone: data.maskedPhone,
      deliveryOtp: randomOtp,
      payment: data.payment,
      createdAt: now,
      updatedAt: now,
    };

    orders.unshift(newOrder);
    saveOrders(orders);
    return newOrder;
  },

  updateStatus(
    orderId: string,
    status: OrderStatus,
    partnerInfo?: { id: string; name: string }
  ): Order {
    const orders = loadOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) {
      throw new Error(`Order ${orderId} not found`);
    }

    const order = orders[idx];
    order.status = status;
    order.updatedAt = new Date().toISOString();

    if (partnerInfo) {
      order.deliveryPartnerId = partnerInfo.id;
      order.deliveryPartnerName = partnerInfo.name;
    }

    orders[idx] = order;
    saveOrders(orders);
    return order;
  },

  cancelOrder(orderId: string): Order {
    const orders = loadOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) {
      throw new Error(`Order ${orderId} not found`);
    }

    const order = orders[idx];
    if (order.status === 'picked_up' || order.status === 'out_for_delivery' || order.status === 'delivered') {
      throw new Error('Orders that are already picked up or out for delivery cannot be cancelled.');
    }

    order.status = 'cancelled';
    order.updatedAt = new Date().toISOString();
    orders[idx] = order;
    saveOrders(orders);
    return order;
  },

  rateOrder(orderId: string, rating: number, feedback?: string): Order {
    const orders = loadOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) {
      throw new Error(`Order ${orderId} not found`);
    }

    orders[idx].customerRating = rating;
    orders[idx].ratingFeedback = feedback;
    orders[idx].updatedAt = new Date().toISOString();
    saveOrders(orders);
    return orders[idx];
  },
};
