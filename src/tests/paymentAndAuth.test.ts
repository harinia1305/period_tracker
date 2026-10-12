import { describe, it, expect, beforeEach } from 'vitest';
import { googleAuthService, PRECONFIGURED_GOOGLE_ACCOUNTS } from '../services/googleAuthService';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import { PaymentDetails } from '../models/types';

describe('Payment & Google Authentication Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides preconfigured verified Google accounts', () => {
    expect(PRECONFIGURED_GOOGLE_ACCOUNTS.length).toBeGreaterThanOrEqual(3);
    const maya = PRECONFIGURED_GOOGLE_ACCOUNTS.find(a => a.email === 'maya.patel@gmail.com');
    expect(maya).toBeDefined();
    expect(maya?.verifiedEmail).toBe(true);
    expect(maya?.accessToken).toContain('ya29');
  });

  it('authenticates user with Google profile and sets welcome Care Wallet balance', async () => {
    const maya = PRECONFIGURED_GOOGLE_ACCOUNTS[0];
    const loggedUser = await authService.loginWithGoogle(maya, 'user');

    expect(loggedUser.googleEmail).toBe(maya.email);
    expect(loggedUser.googleVerified).toBe(true);
    expect(loggedUser.walletBalanceInr).toBe(500);
  });

  it('allows deducting and adding Care Wallet credit', async () => {
    const maya = PRECONFIGURED_GOOGLE_ACCOUNTS[0];
    await authService.loginWithGoogle(maya, 'user');

    // Deduct ₹200
    const afterDeduct = await authService.deductWalletBalance(200);
    expect(afterDeduct.walletBalanceInr).toBe(300);

    // Add ₹150
    const afterAdd = await authService.addWalletBalance(150);
    expect(afterAdd.walletBalanceInr).toBe(450);
  });

  it('creates an order with full payment details and 4-digit delivery PIN', () => {
    const payment: PaymentDetails = {
      method: 'gpay',
      methodLabel: 'Google Pay (UPI)',
      provider: 'Google Pay',
      transactionId: 'TXN_GPAY_12345678',
      status: 'paid',
      amountInr: 599,
      paidAt: new Date().toISOString(),
      invoiceNumber: 'INV-2026-9999',
      upiId: 'maya.patel@okaxis',
    };

    const order = orderService.createOrder({
      userId: 'usr_maya_demo',
      items: [{ productId: 'prod_cup_silicone', quantity: 1, unitPriceInr: 599, productName: 'Menstrual Cup' }],
      totalInr: 599,
      deliveryFeeInr: 0,
      discreetPackaging: true,
      verifiedPartnerPreference: true,
      addressLabel: 'Indiranagar 12th Main, Bengaluru',
      maskedPhone: '+91 ••••• ••492',
      payment,
    });

    expect(order.id).toBeDefined();
    expect(order.status).toBe('requested');
    expect(order.payment).toBeDefined();
    expect(order.payment?.method).toBe('gpay');
    expect(order.payment?.status).toBe('paid');
    expect(order.deliveryOtp).toBeDefined();
    expect(order.deliveryOtp?.length).toBe(4);
  });

  it('supports custom Google sign in profile generation', async () => {
    const custom = await googleAuthService.signInWithCustomGoogle('test.user@gmail.com', 'Test User');
    expect(custom.email).toBe('test.user@gmail.com');
    expect(custom.verifiedEmail).toBe(true);
    expect(custom.name).toBe('Test User');
  });
});
