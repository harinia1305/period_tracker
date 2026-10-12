import { describe, it, expect, beforeEach } from 'vitest';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import { Product } from '../models/types';

describe('cartService & orderService', () => {
  const dummyProduct1: Product = {
    id: 'prod_1',
    name: 'Organic Cotton Pads',
    category: 'pads',
    description: 'Soft pads',
    priceInr: 300,
    stock: 20,
  };

  const dummyProduct2: Product = {
    id: 'prod_2',
    name: 'Comfort Relief Gel Sheet',
    category: 'otc_comfort',
    description: 'Soothing cooling sheet',
    priceInr: 150,
    stock: 10,
    requiresPharmacistGuidance: true,
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('calculates totals, delivery fee, and flags pharmacist products correctly', () => {
    cartService.addItem(dummyProduct1, 1);
    const totals1 = cartService.calculateTotals(cartService.getItems());
    // Subtotal 300 <= 500 => Delivery fee 49 => Total 349
    expect(totals1.subtotalInr).toBe(300);
    expect(totals1.deliveryFeeInr).toBe(49);
    expect(totals1.totalInr).toBe(349);
    expect(totals1.hasPharmacistItem).toBe(false);

    // Add pharmacist item
    cartService.addItem(dummyProduct2, 2); // 150 * 2 = 300
    const totals2 = cartService.calculateTotals(cartService.getItems());
    // Subtotal 600 > 500 => Delivery fee 0 => Total 600
    expect(totals2.subtotalInr).toBe(600);
    expect(totals2.deliveryFeeInr).toBe(0);
    expect(totals2.totalInr).toBe(600);
    expect(totals2.hasPharmacistItem).toBe(true);
  });

  it('creates an order in requested status and advances status correctly', () => {
    const newOrder = orderService.createOrder({
      userId: 'usr_maya_demo',
      items: [{ productId: 'prod_1', quantity: 1, unitPriceInr: 300 }],
      totalInr: 349,
      deliveryFeeInr: 49,
      discreetPackaging: true,
      verifiedPartnerPreference: true,
      addressLabel: '12th Main Apt 302',
      maskedPhone: '+91 ••••• ••492',
    });

    expect(newOrder.status).toBe('requested');
    expect(newOrder.discreetPackaging).toBe(true);

    // Accept order
    const accepted = orderService.updateStatus(newOrder.id, 'accepted', {
      id: 'dp_priya',
      name: 'Priya S.',
    });
    expect(accepted.status).toBe('accepted');
    expect(accepted.deliveryPartnerId).toBe('dp_priya');

    // Picked up
    const pickedUp = orderService.updateStatus(newOrder.id, 'picked_up');
    expect(pickedUp.status).toBe('picked_up');

    // Cancelling after pickup should throw error
    expect(() => orderService.cancelOrder(newOrder.id)).toThrow();
  });
});
