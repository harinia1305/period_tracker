import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { cartService } from '../../services/cartService';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus, PaymentDetails } from '../../models/types';
import { formatFriendlyDate } from '../../utils/dateUtils';
import { PaymentGatewayModal } from '../../components/payment/PaymentGatewayModal';
import { OrderInvoiceModal } from '../../components/payment/OrderInvoiceModal';
import {
  ShieldCheck,
  Star,
  XCircle,
  MapPin,
  Phone,
  EyeOff,
  ArrowRight,
  CreditCard,
  FileText,
  KeyRound,
} from 'lucide-react';

export const OrderFlowScreen: React.FC = () => {
  const { currentUser, deductWalletBalance } = useAuth();
  const { sendNotification } = useNotifications();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isCheckoutMode = searchParams.get('checkout') === 'true';

  // Checkout State
  const [address, setAddress] = useState<string>('Indiranagar 12th Main, Apt 302, Bengaluru');
  const [discreetPackaging, setDiscreetPackaging] = useState<boolean>(true);
  const [partnerPreference, setPartnerPreference] = useState<boolean>(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);

  // Orders List
  const [orders, setOrders] = useState<Order[]>(() => orderService.getOrders(currentUser.id));
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(() => {
    const list = orderService.getOrders(currentUser.id);
    return list.length > 0 ? list[0] : null;
  });

  // Invoice Modal
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Rating Modal
  const [ratingOrder, setRatingOrder] = useState<Order | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [ratingFeedback, setRatingFeedback] = useState<string>('');

  const cartItems = cartService.getItems();
  const totals = cartService.calculateTotals(cartItems);

  const refreshOrders = () => {
    const updated = orderService.getOrders(currentUser.id);
    setOrders(updated);
    if (selectedOrder) {
      const refreshedSelected = updated.find((o) => o.id === selectedOrder.id) || null;
      setSelectedOrder(refreshedSelected);
    } else if (updated.length > 0 && !isCheckoutMode) {
      setSelectedOrder(updated[0]);
    }
  };

  const handleOpenPayment = () => {
    if (cartItems.length === 0) return;
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (paymentDetails: PaymentDetails) => {
    if (paymentDetails.usedWalletCreditInr && paymentDetails.usedWalletCreditInr > 0) {
      await deductWalletBalance(paymentDetails.usedWalletCreditInr);
    }

    const newOrder = orderService.createOrder({
      userId: currentUser.id,
      items: cartService.toOrderItems(cartItems),
      totalInr: totals.totalInr,
      deliveryFeeInr: totals.deliveryFeeInr,
      discreetPackaging,
      verifiedPartnerPreference: partnerPreference,
      addressLabel: address,
      maskedPhone: currentUser.maskedPhone || '+91 ••••• ••492',
      payment: paymentDetails,
    });

    cartService.clearCart();
    refreshOrders();
    setSelectedOrder(newOrder);

    sendNotification(
      'Order Confirmed!',
      `Care order ${newOrder.id} placed via ${paymentDetails.methodLabel}. Dispatched to Indiranagar hub.`,
      'order'
    );

    navigate('/app/orders');
  };

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm('Cancel this mock order?')) {
      try {
        orderService.cancelOrder(orderId);
        refreshOrders();
        sendNotification('Order Cancelled', `Order ${orderId} has been cancelled.`, 'info');
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleSubmitRating = () => {
    if (!ratingOrder) return;
    orderService.rateOrder(ratingOrder.id, ratingScore, ratingFeedback);
    refreshOrders();
    setRatingOrder(null);
    sendNotification('Feedback Submitted', 'Thank you for rating your delivery partner!', 'health');
  };

  const getStatusStep = (status: OrderStatus): number => {
    switch (status) {
      case 'requested':
        return 1;
      case 'accepted':
        return 2;
      case 'picked_up':
        return 3;
      case 'out_for_delivery':
        return 4;
      case 'delivered':
        return 5;
      case 'cancelled':
        return 0;
      default:
        return 1;
    }
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#4A1525]">
            {isCheckoutMode ? 'Review & Checkout' : 'Care Delivery Orders'}
          </h1>
          <p className="text-xs text-[#7A6E73]">
            {isCheckoutMode
              ? 'Private, discreet packaging with verified delivery partner preference.'
              : 'Track active deliveries and view past orders.'}
          </p>
        </div>
        {!isCheckoutMode && (
          <button
            type="button"
            onClick={() => navigate('/app/shop')}
            className="text-xs font-bold text-[#781D42] hover:underline"
          >
            + Order More
          </button>
        )}
      </div>

      {/* CHECKOUT FLOW */}
      {isCheckoutMode ? (
        <div className="space-y-4">
          {/* Cart Summary */}
          <div className="bg-white rounded-3xl p-5 border border-[#F3ECE8] shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A1525]">Items in Bag</h3>
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center text-xs">
                  <span className="text-[#2D2327]">
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="font-bold text-[#4A1525]">
                    ₹{item.product.priceInr * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#F3ECE8] space-y-1 text-xs">
              <div className="flex justify-between text-[#7A6E73]">
                <span>Subtotal</span>
                <span>₹{totals.subtotalInr}</span>
              </div>
              <div className="flex justify-between text-[#7A6E73]">
                <span>Discreet Delivery</span>
                <span>{totals.deliveryFeeInr === 0 ? 'FREE' : `₹${totals.deliveryFeeInr}`}</span>
              </div>
              <div className="flex justify-between text-base font-black text-[#4A1525] pt-1">
                <span>Total Due</span>
                <span>₹{totals.totalInr}</span>
              </div>
            </div>
          </div>

          {/* Address selection (mock addresses) */}
          <div className="bg-white rounded-3xl p-5 border border-[#F3ECE8] shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#781D42]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A1525]">Delivery Location</h3>
            </div>

            <div className="space-y-2">
              {[
                'Indiranagar 12th Main, Apt 302, Bengaluru',
                'Koramangala 4th Block, 80 Feet Road, Bengaluru',
                'HSR Layout Sector 2, Villa 14, Bengaluru',
              ].map((addr) => (
                <label
                  key={addr}
                  className={`flex items-start gap-2.5 p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                    address === addr
                      ? 'border-[#781D42] bg-[#FFF5F7] font-semibold text-[#781D42]'
                      : 'border-[#F3ECE8] bg-[#FAF7F5] text-[#7A6E73]'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={address === addr}
                    onChange={() => setAddress(addr)}
                    className="mt-0.5 accent-[#781D42]"
                  />
                  <span>{addr}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-[#FAF7F5] rounded-xl text-[11px] text-[#7A6E73]">
              <EyeOff className="w-3.5 h-3.5 text-[#3F755E]" />
              <span>Exact building & door details are hidden until partner picks up package.</span>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-3xl p-5 border border-[#F3ECE8] shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A1525]">
              Privacy & Partner Preferences
            </h3>

            <div className="space-y-2.5">
              <label className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF7F5] border border-[#F3ECE8] cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={discreetPackaging}
                  onChange={(e) => setDiscreetPackaging(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-[#781D42] rounded"
                />
                <div>
                  <p className="font-bold text-[#4A1525]">Discreet Unbranded Packaging (Included)</p>
                  <p className="text-[11px] text-[#7A6E73] mt-0.5">
                    Plain kraft box with zero product names or period logos on the exterior.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl bg-[#EBF4F0] border border-[#D2E7DE] cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={partnerPreference}
                  onChange={(e) => setPartnerPreference(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-[#3F755E] rounded"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#3F755E]" />
                    <p className="font-bold text-[#1F2E26]">Verified Women Delivery Partner Preference</p>
                  </div>
                  <p className="text-[11px] text-[#2F614C] mt-0.5">
                    Priority dispatch to operational women partners in your local hub with verified identity & safety badges.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Open Payment Gateway Button */}
          <button
            type="button"
            disabled={cartItems.length === 0}
            onClick={handleOpenPayment}
            className="w-full py-4 rounded-2xl bg-[#781D42] hover:bg-[#4A1525] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 min-h-[48px]"
          >
            <CreditCard className="w-4 h-4" />
            <span>Select Payment Method & Pay (₹{totals.totalInr})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* ORDERS LIST & TRACKING VIEW */
        <div className="space-y-4">
          {/* Active / Selected Order Live Tracker */}
          {selectedOrder && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#F3ECE8] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E7E84]">
                    Order Tracker
                  </span>
                  <h2 className="text-lg font-black text-[#4A1525]">{selectedOrder.id}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      selectedOrder.status === 'delivered'
                        ? 'bg-[#EBF4F0] text-[#2F614C]'
                        : selectedOrder.status === 'cancelled'
                        ? 'bg-[#FFF2EE] text-[#C8374D]'
                        : 'bg-[#FFF5F7] text-[#781D42] animate-pulse'
                    }`}
                  >
                    {selectedOrder.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Progress Stepper (Timeline) */}
              {selectedOrder.status !== 'cancelled' && (
                <div className="py-2">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#F3ECE8] -translate-y-1/2 z-0" />
                    <div
                      className="absolute top-1/2 left-0 h-1 bg-[#781D42] -translate-y-1/2 z-0 transition-all duration-500"
                      style={{
                        width: `${((getStatusStep(selectedOrder.status) - 1) / 4) * 100}%`,
                      }}
                    />

                    {[
                      { step: 1, label: 'Requested' },
                      { step: 2, label: 'Accepted' },
                      { step: 3, label: 'Packed' },
                      { step: 4, label: 'On Way' },
                      { step: 5, label: 'Delivered' },
                    ].map((st) => {
                      const currentStep = getStatusStep(selectedOrder.status);
                      const isComplete = currentStep >= st.step;
                      return (
                        <div key={st.step} className="flex flex-col items-center relative z-10">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                              isComplete
                                ? 'bg-[#781D42] text-white'
                                : 'bg-[#F3ECE8] text-[#8E7E84]'
                            }`}
                          >
                            {isComplete ? '✓' : st.step}
                          </div>
                          <span className="text-[10px] mt-1 text-[#7A6E73] hidden sm:inline">
                            {st.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Delivery OTP Security Box */}
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <div className="p-3 bg-[#FFF5F7] rounded-2xl border border-[#FCE8ED] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#781D42]" />
                    <div>
                      <p className="text-xs font-bold text-[#4A1525]">Delivery Verification PIN</p>
                      <p className="text-[11px] text-[#7A6E73]">
                        Share this 4-digit code with partner to confirm safe handover:
                      </p>
                    </div>
                  </div>
                  <span className="text-base font-mono font-black text-[#781D42] tracking-widest px-3 py-1 bg-white rounded-xl border border-[#FCE8ED]">
                    {selectedOrder.deliveryOtp || '4821'}
                  </span>
                </div>
              )}

              {/* Delivery Partner Info Card */}
              {selectedOrder.deliveryPartnerName && selectedOrder.status !== 'cancelled' && (
                <div className="p-3.5 rounded-2xl bg-[#FAF7F5] border border-[#F3ECE8] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#3F755E] text-white flex items-center justify-center font-bold text-sm">
                      P
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#2D2327]">
                        {selectedOrder.deliveryPartnerName}
                      </p>
                      <p className="text-[11px] text-[#3F755E] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified Women Delivery Partner (Indiranagar Hub)</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#781D42] flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>Masked Call</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Items in this Order */}
              <div className="space-y-1.5 text-xs">
                <p className="font-bold text-[#4A1525]">
                  Package Contents ({selectedOrder.items.length} items):
                </p>
                <div className="divide-y divide-[#F3ECE8]">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="py-1.5 flex justify-between">
                      <span className="text-[#5C4A50]">
                        {it.quantity}x {it.productName || 'Care product'}
                      </span>
                      <span className="font-bold text-[#4A1525]">
                        ₹{it.unitPriceInr * it.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details & Digital Invoice Action */}
              <div className="p-3 bg-[#FAF7F5] rounded-2xl border border-[#F3ECE8] flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-[#4A1525]">
                    <CreditCard className="w-3.5 h-3.5 text-[#781D42]" />
                    <span>Payment: {selectedOrder.payment?.methodLabel || 'Digital Payment'}</span>
                  </div>
                  {selectedOrder.payment?.transactionId && (
                    <p className="text-[10px] text-gray-500 font-mono">
                      {selectedOrder.payment.transactionId}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setInvoiceOrder(selectedOrder)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-[#E5DAD4] hover:bg-[#FAF7F5] text-xs font-bold text-[#781D42] transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Tax Invoice</span>
                </button>
              </div>

              {/* Order Actions: Cancel or Rate */}
              <div className="pt-2 flex items-center justify-between">
                {(selectedOrder.status === 'requested' || selectedOrder.status === 'accepted') && (
                  <button
                    type="button"
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#C8374D] hover:underline"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cancel Order</span>
                  </button>
                )}

                {selectedOrder.status === 'delivered' && (
                  <button
                    type="button"
                    onClick={() => {
                      setRatingOrder(selectedOrder);
                      setRatingScore(selectedOrder.customerRating || 5);
                      setRatingFeedback(selectedOrder.ratingFeedback || '');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FFF5F7] text-[#781D42] border border-[#FCE8ED] text-xs font-bold hover:bg-[#FCE8ED]"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>
                      {selectedOrder.customerRating
                        ? `Rated ${selectedOrder.customerRating}★`
                        : 'Rate Experience'}
                    </span>
                  </button>
                )}

                <div className="text-right ml-auto">
                  <span className="text-xs text-[#7A6E73]">Total: </span>
                  <strong className="text-sm text-[#4A1525]">₹{selectedOrder.totalInr}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Past Orders List */}
          <div className="bg-white rounded-3xl p-5 border border-[#F3ECE8] shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A1525]">
              Your Order History
            </h3>
            {orders.length === 0 ? (
              <p className="text-xs text-[#7A6E73] py-4 text-center">No past orders yet.</p>
            ) : (
              <div className="space-y-2">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                      selectedOrder?.id === ord.id
                        ? 'border-[#781D42] bg-[#FFF5F7]'
                        : 'border-[#F3ECE8] hover:border-[#DE738A] bg-white'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#4A1525]">{ord.id}</span>
                        <span className="text-[10px] text-[#8E7E84]">
                          {ord.items.length} items
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7A6E73]">
                        {formatFriendlyDate(ord.createdAt.split('T')[0])} •{' '}
                        {ord.payment?.methodLabel || 'Paid'}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-[#4A1525]">₹{ord.totalInr}</p>
                      <span className="text-[10px] font-bold text-[#781D42] uppercase">
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmountInr={totals.totalInr}
        walletBalanceInr={currentUser.walletBalanceInr || 500}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Digital Tax Invoice Modal */}
      <OrderInvoiceModal
        order={invoiceOrder}
        isOpen={Boolean(invoiceOrder)}
        onClose={() => setInvoiceOrder(null)}
      />

      {/* Delivery Rating Modal */}
      {ratingOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-[#F3ECE8]">
            <h3 className="text-base font-bold text-[#4A1525]">Rate Delivery Partner</h3>
            <p className="text-xs text-[#7A6E73]">
              How was your discreet delivery experience with {ratingOrder.deliveryPartnerName || 'your partner'}?
            </p>

            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingScore(star)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      ratingScore >= star
                        ? 'text-[#E27B66] fill-[#E27B66]'
                        : 'text-[#E5DAD4]'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={ratingFeedback}
              onChange={(e) => setRatingFeedback(e.target.value)}
              placeholder="Optional notes on speed, discretion, or care..."
              className="w-full p-2.5 rounded-xl bg-[#FAF7F5] border border-[#E5DAD4] text-xs focus:outline-none focus:ring-1 focus:ring-[#781D42]"
            />

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRatingOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7A6E73]"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleSubmitRating}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#781D42] text-white"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
