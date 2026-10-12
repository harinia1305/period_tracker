import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deliveryPartnerService } from '../../services/deliveryPartnerService';
import { useNotifications } from '../../context/NotificationContext';
import { Order } from '../../models/types';
import {
  Inbox,
  Navigation,
  CheckCircle2,
  Package,
  MapPin,
  Phone,
  Shield,
  KeyRound,
  CreditCard,
} from 'lucide-react';

export const PartnerRequests: React.FC = () => {
  const navigate = useNavigate();
  const partner = deliveryPartnerService.getCurrentPartner();
  const { sendNotification } = useNotifications();
  const [requests, setRequests] = useState<Order[]>(() => deliveryPartnerService.getIncomingRequests());
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAccept = (orderId: string) => {
    deliveryPartnerService.acceptOrder(partner.id, orderId);
    setFeedback(`Accepted order ${orderId}`);
    sendNotification(
      'Order Accepted',
      `Assigned to order ${orderId}. Please collect sealed kraft package from hub.`,
      'partner'
    );
    setTimeout(() => {
      navigate('/partner/active');
    }, 600);
  };

  const handleDecline = (orderId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== orderId));
    setFeedback(`Declined order ${orderId}`);
    setTimeout(() => setFeedback(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-[#1F2E26]">Delivery Requests</h1>
        <p className="text-xs text-[#7A6E73]">
          Nearby period-care orders in {partner.serviceZone}.
        </p>
      </div>

      {feedback && (
        <div className="p-3 rounded-2xl bg-[#EBF4F0] border border-[#D2E7DE] text-xs font-bold text-[#2F614C] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-[#D2E7DE] text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#F5F8F6] flex items-center justify-center mx-auto text-[#7A6E73]">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#1F2E26]">No open requests right now</h3>
          <p className="text-xs text-[#7A6E73]">
            You will be alerted as soon as a customer requests discreet delivery in your zone.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl p-5 border border-[#D2E7DE] shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1F2E26]">{req.id}</span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EBF4F0] text-[#2F614C]">
                    Discreet Kraft Box
                  </span>
                </div>
                <span className="text-xs font-black text-[#2F614C]">+₹85 Payout</span>
              </div>

              <div className="space-y-1 text-xs text-[#7A6E73]">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#3F755E]" />
                  <span>
                    Delivery Zone: <strong>Indiranagar Sector</strong> (Exact building revealed upon pickup)
                  </span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#3F755E]" />
                  <span>{req.items.length} items to collect from Wellness Hub</span>
                </p>
                <p className="flex items-center gap-1.5 text-gray-800 font-semibold">
                  <CreditCard className="w-3.5 h-3.5 text-[#781D42]" />
                  <span>
                    Payment:{' '}
                    {req.payment?.method === 'cod' ? 'Collect Cash on Delivery' : 'Prepaid Online (No Cash)'}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#D2E7DE]">
                <button
                  type="button"
                  onClick={() => handleDecline(req.id)}
                  className="flex-1 py-2.5 rounded-xl border border-[#D2E7DE] text-xs font-semibold text-[#7A6E73] hover:bg-[#F5F8F6] min-h-[44px]"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => handleAccept(req.id)}
                  className="flex-1 py-2.5 rounded-xl bg-[#3F755E] hover:bg-[#2F614C] text-white text-xs font-bold shadow-xs transition-colors min-h-[44px]"
                >
                  Accept Delivery
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ActiveOrderScreen: React.FC = () => {
  const navigate = useNavigate();
  const { sendNotification } = useNotifications();
  const partner = deliveryPartnerService.getCurrentPartner();
  const activeOrders = deliveryPartnerService.getActiveOrders(partner.id);
  const currentOrder = activeOrders[0] || null;

  const [advancing, setAdvancing] = useState(false);
  const [safetyChecked, setSafetyChecked] = useState(true);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  const handleNextStep = () => {
    if (!currentOrder) return;

    // Check delivery handover OTP if out for delivery
    if (currentOrder.status === 'out_for_delivery') {
      const expectedOtp = currentOrder.deliveryOtp || '4821';
      if (!enteredOtp || enteredOtp.trim() !== expectedOtp) {
        setOtpError(`Incorrect PIN. Expected ${expectedOtp} (or click Auto-Fill).`);
        return;
      }
    }

    setAdvancing(true);
    setOtpError(null);

    setTimeout(() => {
      const updated = deliveryPartnerService.advanceActiveOrder(currentOrder.id);
      setAdvancing(false);

      if (updated.status === 'out_for_delivery') {
        sendNotification(
          'Out for Delivery',
          `Order ${currentOrder.id} is on the way to ${currentOrder.addressLabel.split(',')[0]}`,
          'order'
        );
      } else if (updated.status === 'delivered') {
        sendNotification(
          'Delivery Completed!',
          `Order ${currentOrder.id} delivered safely. +₹85 credited to your earnings.`,
          'partner'
        );
        navigate('/partner/safety');
      }
    }, 450);
  };

  const getActionTitle = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Confirm Package Picked Up at Hub';
      case 'picked_up':
        return 'Start Out For Delivery';
      case 'out_for_delivery':
        return 'Verify Handover PIN & Complete Delivery';
      default:
        return 'Advance Status';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-[#1F2E26]">Active Delivery Route</h1>
        <p className="text-xs text-[#7A6E73]">
          Step-by-step guidance for safe, discreet period-care delivery.
        </p>
      </div>

      {!currentOrder ? (
        <div className="bg-white rounded-3xl p-8 border border-[#D2E7DE] text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#F5F8F6] flex items-center justify-center mx-auto text-[#7A6E73]">
            <Navigation className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#1F2E26]">No active order right now</h3>
          <p className="text-xs text-[#7A6E73]">
            Accept an incoming request from the Requests tab to start a route.
          </p>
          <button
            type="button"
            onClick={() => navigate('/partner/requests')}
            className="px-4 py-2 rounded-xl bg-[#3F755E] text-white text-xs font-bold shadow-xs"
          >
            Check Requests
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Order Status Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#D2E7DE] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#3F755E]">Active Order</span>
                <h2 className="text-lg font-black text-[#1F2E26]">{currentOrder.id}</h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#EBF4F0] text-[#2F614C] text-xs font-bold uppercase">
                {currentOrder.status.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Destination details (only revealed when accepted/picked up) */}
            <div className="p-3.5 rounded-2xl bg-[#F5F8F6] border border-[#D2E7DE] space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#3F755E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#1F2E26]">Customer Address</p>
                  <p className="text-[#5C4A50] mt-0.5">{currentOrder.addressLabel}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#D2E7DE]">
                <span className="text-[#7A6E73] flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#3F755E]" />
                  <span>Customer Phone: {currentOrder.maskedPhone} (Masked)</span>
                </span>
                <button
                  type="button"
                  onClick={() => alert('Simulating masked IVR call... Customer number is protected.')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#D2E7DE] text-[11px] font-bold text-[#3F755E] hover:bg-[#EBF4F0]"
                >
                  Call via Proxy
                </button>
              </div>

              {/* Payment details reminder */}
              <div className="pt-1 border-t border-[#D2E7DE] flex items-center justify-between">
                <span className="text-[#7A6E73]">Payment Handling:</span>
                <span className="font-bold text-[#1F2E26]">
                  {currentOrder.payment?.method === 'cod'
                    ? `Collect Cash: ₹${currentOrder.totalInr}`
                    : 'Prepaid Online - Do Not Collect Cash'}
                </span>
              </div>
            </div>

            {/* Package Checklist */}
            <div className="space-y-2 text-xs">
              <p className="font-bold text-[#1F2E26]">Discreet Verification Checklist:</p>
              <div className="space-y-1.5 text-[#5C4A50]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetyChecked}
                    onChange={(e) => setSafetyChecked(e.target.checked)}
                    className="w-4 h-4 accent-[#3F755E] rounded"
                  />
                  <span>Plain brown kraft package sealed with tamper-evident tape</span>
                </label>
              </div>
            </div>

            {/* Handover OTP Input (When out for delivery) */}
            {currentOrder.status === 'out_for_delivery' && (
              <div className="p-3 bg-[#EBF4F0] rounded-2xl border border-[#D2E7DE] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1F2E26] flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-[#3F755E]" />
                    <span>Customer 4-Digit Handover PIN</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setEnteredOtp(currentOrder.deliveryOtp || '4821')}
                    className="text-[11px] font-bold text-[#3F755E] underline"
                  >
                    Auto-Fill ({currentOrder.deliveryOtp || '4821'})
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Enter 4-digit PIN"
                  value={enteredOtp}
                  onChange={(e) => {
                    setEnteredOtp(e.target.value);
                    setOtpError(null);
                  }}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#D2E7DE] text-sm font-mono font-bold tracking-widest text-center"
                />
                {otpError && <p className="text-xs text-rose-600 font-semibold">{otpError}</p>}
              </div>
            )}

            {/* Step Progression Button */}
            <button
              type="button"
              disabled={advancing || !safetyChecked}
              onClick={handleNextStep}
              className={`w-full py-4 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 min-h-[48px] ${
                safetyChecked
                  ? 'bg-[#3F755E] hover:bg-[#2F614C] text-white'
                  : 'bg-[#F5F8F6] text-[#A18A92] cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{advancing ? 'Updating Status...' : getActionTitle(currentOrder.status)}</span>
            </button>
          </div>

          {/* Safety Hotkey Banner */}
          <div className="p-4 rounded-3xl bg-white border border-[#D2E7DE] shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-[#3F755E]" />
              <div>
                <p className="text-xs font-bold text-[#1F2E26]">Safety Check-in</p>
                <p className="text-[11px] text-[#7A6E73]">GPS live-shared with Indiranagar dispatch lead</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => alert('Check-in confirmed with dispatch hub! Status: Safe.')}
              className="px-3 py-1.5 rounded-xl bg-[#EBF4F0] text-[#2F614C] text-xs font-bold hover:bg-[#D2E7DE]"
            >
              Check In
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
