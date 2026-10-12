import React, { useState, useEffect } from 'react';
import { PaymentMethod, PaymentDetails } from '../../models/types';
import {
  X,
  CreditCard,
  Clock,
  ArrowRight,
  Sparkles,
  Lock,
  RefreshCw,
} from 'lucide-react';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmountInr: number;
  walletBalanceInr: number;
  onPaymentSuccess: (details: PaymentDetails) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  totalAmountInr,
  walletBalanceInr,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('gpay');
  const [isProcessing, setIsProcessing] = useState(false);

  // UPI State
  const [upiId, setUpiId] = useState('');
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [qrTimer, setQrTimer] = useState(180);

  // Card State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('Maya Patel');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [show3DSecureModal, setShow3DSecureModal] = useState(false);
  const [cardOtp, setCardOtp] = useState('');

  // Bank State
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Wallet State
  const [selectedWallet, setSelectedWallet] = useState('Paytm Wallet');

  // Care Wallet partial deduction
  const [useWalletBalance, setUseWalletBalance] = useState(false);

  // QR Code timer countdown
  useEffect(() => {
    if (!isOpen || selectedMethod !== 'upi_qr') return;
    const interval = setInterval(() => {
      setQrTimer((prev) => (prev > 0 ? prev - 1 : 180));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, selectedMethod]);

  if (!isOpen) return null;

  // Amount calculation with Care Wallet deduction
  const appliedWalletCredit = useWalletBalance ? Math.min(walletBalanceInr, totalAmountInr) : 0;
  const netPayableInr = Math.max(0, totalAmountInr - appliedWalletCredit);

  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('5')) return 'Mastercard';
    if (clean.startsWith('60') || clean.startsWith('65')) return 'RuPay';
    if (clean.startsWith('37')) return 'Amex';
    return 'Card';
  };

  const handleCardNumberChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 2) {
      setExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setExpiry(cleaned);
    }
  };

  const handleVerifyUpi = () => {
    if (!upiId || !upiId.includes('@')) {
      alert('Please enter a valid UPI ID (e.g. yourname@okhdfcbank)');
      return;
    }
    setIsUpiVerified(true);
  };

  const executePayment = (method: PaymentMethod, label: string, provider: string, extra?: Partial<PaymentDetails>) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const transactionId = `TXN_${method.toUpperCase()}_${Date.now().toString().slice(-8)}`;

      const details: PaymentDetails = {
        method,
        methodLabel: label,
        provider,
        transactionId,
        status: method === 'cod' ? 'cod_pending' : 'paid',
        amountInr: netPayableInr,
        paidAt: new Date().toISOString(),
        invoiceNumber,
        usedWalletCreditInr: appliedWalletCredit,
        ...extra,
      };

      onPaymentSuccess(details);
      onClose();
    }, 700);
  };

  const handleInitiatePay = () => {
    if (netPayableInr === 0) {
      // Paid fully with Care Wallet credit
      executePayment('care_wallet', 'Period Love Care Wallet', 'Wallet Balance Full Coverage');
      return;
    }

    if (selectedMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 15) {
        alert('Please enter a valid 16-digit card number.');
        return;
      }
      if (!expiry || expiry.length < 5) {
        alert('Please enter a valid expiry date (MM/YY).');
        return;
      }
      if (!cvv || cvv.length < 3) {
        alert('Please enter a 3 or 4 digit CVV.');
        return;
      }
      // Open 3D Secure Bank OTP verification modal
      setShow3DSecureModal(true);
      return;
    }

    if (selectedMethod === 'gpay') {
      executePayment('gpay', 'Google Pay (UPI)', 'Google Pay Tez', { upiId: 'maya.patel@okaxis' });
    } else if (selectedMethod === 'phonepe') {
      executePayment('phonepe', 'PhonePe (UPI)', 'PhonePe Wallet & UPI', { upiId: 'maya@ybl' });
    } else if (selectedMethod === 'paytm') {
      executePayment('paytm', 'Paytm UPI', 'Paytm Payments Bank', { upiId: 'maya@paytm' });
    } else if (selectedMethod === 'bhim') {
      executePayment('bhim', 'BHIM UPI', 'National Payments Corp of India', { upiId: 'maya@upi' });
    } else if (selectedMethod === 'upi_id') {
      executePayment('upi_id', `UPI (${upiId || 'Direct'})`, 'Instant UPI Transfer', { upiId: upiId || 'maya@upi' });
    } else if (selectedMethod === 'upi_qr') {
      executePayment('upi_qr', 'Dynamic UPI QR Code', 'Scan & Pay Provider');
    } else if (selectedMethod === 'netbanking') {
      executePayment('netbanking', `Net Banking (${selectedBank})`, selectedBank, { bankName: selectedBank });
    } else if (selectedMethod === 'wallet') {
      executePayment('wallet', selectedWallet, selectedWallet, { walletProvider: selectedWallet });
    } else if (selectedMethod === 'care_wallet') {
      executePayment('care_wallet', 'Period Love Care Wallet', 'Period Love In-App Balance');
    } else if (selectedMethod === 'pay_later') {
      executePayment('pay_later', 'Period Love Pay Later (30 Days)', 'Care Creditline (0% Interest)');
    } else if (selectedMethod === 'cod') {
      executePayment('cod', 'Cash on Delivery (Discreet Handover)', 'Discreet Cash Payment');
    }
  };

  const handleConfirmCard3DSecure = () => {
    setShow3DSecureModal(false);
    const brand = getCardBrand(cardNumber);
    const masked = `•••• •••• •••• ${cardNumber.slice(-4) || '4281'}`;
    executePayment('card', `${brand} Credit/Debit Card`, `${brand} Secure Gateway`, {
      maskedCardNumber: masked,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 antialiased animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#FFF5F7] to-[#FAF7F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#781D42] text-white flex items-center justify-center shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black text-[#4A1525]">Period Love Checkout</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF4F0] text-[#2F614C]">
                  256-bit SSL
                </span>
              </div>
              <p className="text-xs text-[#7A6E73]">Select your preferred payment method</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-[#7A6E73] block">Total Payable</span>
            <span className="text-lg font-black text-[#781D42]">₹{netPayableInr}</span>
          </div>
        </div>

        {/* Care Wallet Balance Quick Deduction Option */}
        {walletBalanceInr > 0 && totalAmountInr > 0 && (
          <div className="mx-5 mt-4 p-3.5 rounded-2xl bg-[#FFF5F7] border border-[#FCE8ED] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#781D42] text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#F3ABB9]" />
              </div>
              <div>
                <p className="font-bold text-[#4A1525]">Period Love Care Wallet</p>
                <p className="text-[11px] text-[#7A6E73]">Available Credit: ₹{walletBalanceInr}</p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#781D42]">
              <input
                type="checkbox"
                checked={useWalletBalance}
                onChange={(e) => setUseWalletBalance(e.target.checked)}
                className="w-4 h-4 accent-[#781D42] rounded"
              />
              <span>Apply ₹{appliedWalletCredit || Math.min(walletBalanceInr, totalAmountInr)}</span>
            </label>
          </div>
        )}

        {/* Payment Methods Grid / Tabs */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Method Selector Tabs */}
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-1.5">
            {[
              { id: 'gpay', label: 'Google Pay', icon: '⚡' },
              { id: 'phonepe', label: 'PhonePe', icon: '🟣' },
              { id: 'upi_qr', label: 'UPI QR', icon: '📱' },
              { id: 'card', label: 'Cards', icon: '💳' },
              { id: 'netbanking', label: 'NetBanking', icon: '🏦' },
              { id: 'wallet', label: 'Wallets', icon: '👛' },
              { id: 'cod', label: 'COD', icon: '💵' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedMethod(tab.id as PaymentMethod)}
                className={`p-2.5 rounded-2xl border text-center transition-all ${
                  selectedMethod === tab.id
                    ? 'border-[#781D42] bg-[#FFF5F7] text-[#781D42] font-bold shadow-xs'
                    : 'border-gray-200 bg-[#FAF7F5] text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-base block">{tab.icon}</span>
                <span className="text-[11px] leading-tight block mt-0.5">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB 1: Google Pay */}
          {selectedMethod === 'gpay' && (
            <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-xs">
                    GPay
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Google Pay Instant UPI</p>
                    <p className="text-[11px] text-gray-500">Fast 1-click checkout with Google verification</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                You will receive an instant payment prompt on your linked Google Pay app for <strong>₹{netPayableInr}</strong>.
              </p>
            </div>
          )}

          {/* TAB 2: PhonePe & Other UPI Apps */}
          {(selectedMethod === 'phonepe' || selectedMethod === 'paytm' || selectedMethod === 'bhim') && (
            <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'phonepe', label: 'PhonePe', color: 'text-purple-600' },
                  { id: 'paytm', label: 'Paytm UPI', color: 'text-cyan-600' },
                  { id: 'bhim', label: 'BHIM UPI', color: 'text-orange-600' },
                ].map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedMethod(app.id as PaymentMethod)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      selectedMethod === app.id
                        ? 'border-[#781D42] bg-[#FFF5F7] text-[#781D42]'
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  >
                    {app.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                  Or Enter Any Custom VPA / UPI ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. yourname@okhdfcbank"
                    value={upiId}
                    onChange={(e) => {
                      setUpiId(e.target.value);
                      setIsUpiVerified(false);
                    }}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#781D42]"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyUpi}
                    className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700"
                  >
                    {isUpiVerified ? '✓ Verified' : 'Verify'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Dynamic UPI QR Code */}
          {selectedMethod === 'upi_qr' && (
            <div className="p-4 rounded-2xl border border-gray-200 bg-white text-center space-y-3">
              <div className="inline-block p-3 rounded-2xl bg-white border-2 border-gray-900 shadow-md">
                {/* Simulated QR Code Canvas SVG */}
                <svg className="w-36 h-36 mx-auto" viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="white" />
                  <path
                    fill="#1F2421"
                    d="M10 10h25v25h-25z M15 15h15v15h-15z M65 10h25v25h-25z M70 15h15v15h-15z M10 65h25v25h-25z M15 70h15v15h-15z M45 10h10v10h-10z M45 30h10v10h-10z M45 50h10v10h-10z M10 45h10v10h-10z M30 45h10v10h-10z M65 45h10v10h-10z M85 45h10v10h-10z M45 70h10v10h-10z M45 90h10v10h-10z M65 65h10v10h-10z M80 70h10v10h-10z M70 85h20v10h-20z"
                  />
                  <circle cx="50" cy="50" r="10" fill="#781D42" />
                  <path d="M47 48l2 2 4-4" stroke="white" strokeWidth="2" fill="none" />
                </svg>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-900">Scan using any UPI App</p>
                <p className="text-[11px] text-gray-500">Google Pay, PhonePe, Paytm, BHIM, Cred</p>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs text-amber-700 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  QR expires in {Math.floor(qrTimer / 60)}:{(qrTimer % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: Credit / Debit Cards */}
          {selectedMethod === 'card' && (
            <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-800">
                  {getCardBrand(cardNumber)} Card Details
                </span>
                <span className="text-[10px] text-gray-400">Visa, Mastercard, RuPay, Amex</span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="4242 •••• •••• 4242"
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 text-xs rounded-xl border border-gray-200 font-mono focus:outline-none focus:ring-1 focus:ring-[#781D42]"
                  />
                  <CreditCard className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">Valid Thru</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 font-mono focus:outline-none focus:ring-1 focus:ring-[#781D42]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="•••"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 font-mono focus:outline-none focus:ring-1 focus:ring-[#781D42]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="Maya Patel"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#781D42]"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-[11px] text-gray-600">
                <input
                  type="checkbox"
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#781D42] rounded"
                />
                <span>Save card securely per RBI tokenization guidelines</span>
              </label>
            </div>
          )}

          {/* TAB 5: Net Banking */}
          {selectedMethod === 'netbanking' && (
            <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-3">
              <span className="text-xs font-bold text-gray-800 block">Popular Indian Banks</span>
              <div className="grid grid-cols-3 gap-2">
                {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National'].map(
                  (bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                        selectedBank === bank
                          ? 'border-[#781D42] bg-[#FFF5F7] text-[#781D42]'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {bank}
                    </button>
                  )
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">Or Select from 25+ Other Banks</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#781D42]"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Bank of Baroda">Bank of Baroda</option>
                  <option value="Canara Bank">Canara Bank</option>
                  <option value="IndusInd Bank">IndusInd Bank</option>
                  <option value="Yes Bank">Yes Bank</option>
                  <option value="Union Bank of India">Union Bank of India</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 6: Digital Wallets */}
          {selectedMethod === 'wallet' && (
            <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-3">
              <span className="text-xs font-bold text-gray-800 block">Select Digital Wallet</span>
              <div className="grid grid-cols-2 gap-2">
                {['Paytm Wallet', 'PhonePe Wallet', 'Amazon Pay', 'Mobikwik'].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setSelectedWallet(w)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      selectedWallet === w
                        ? 'border-[#781D42] bg-[#FFF5F7] text-[#781D42] font-bold'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded-xl">
                Linked wallet account for Maya Patel will be debited for <strong>₹{netPayableInr}</strong>.
              </p>
            </div>
          )}

          {/* TAB 7: Cash on Delivery & Pay Later */}
          {selectedMethod === 'cod' && (
            <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  COD
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Discreet Cash Handover</p>
                  <p className="text-[11px] text-gray-500">Pay cash or UPI upon package handover</p>
                </div>
              </div>

              <div className="p-3 bg-[#FAF7F5] rounded-xl border border-[#F3ECE8] text-[11px] text-[#7A6E73] space-y-1">
                <p>• Plain unbranded box handover with no product names listed on receipt.</p>
                <p>• A 4-digit handover OTP will be sent to your phone upon partner arrival.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Payment Action */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-2xl text-xs font-semibold text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleInitiatePay}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-[#781D42] hover:bg-[#4A1525] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processing Secure Payment...
              </span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>
                  Pay ₹{netPayableInr} {appliedWalletCredit > 0 ? `(Saved ₹${appliedWalletCredit})` : ''}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3D Secure Bank OTP Verification Modal Simulation */}
      {show3DSecureModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-black text-blue-900">VERIFIED BY VISA / 3D SECURE</span>
              <button
                type="button"
                onClick={() => setShow3DSecureModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-900">Bank OTP Authorization</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Authenticating payment of <strong>₹{netPayableInr}</strong> to Period Love Care.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-600 block">Enter One-Time Password</label>
              <input
                type="text"
                placeholder="123456"
                value={cardOtp}
                onChange={(e) => setCardOtp(e.target.value)}
                className="w-full px-3 py-2 text-sm text-center font-mono font-bold tracking-widest rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => setCardOtp('123456')}
                className="text-blue-600 font-bold hover:underline"
              >
                ⚡ Quick Auto-Fill OTP
              </button>
              <span className="text-gray-400">Resend in 28s</span>
            </div>

            <button
              type="button"
              onClick={handleConfirmCard3DSecure}
              className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md transition-colors"
            >
              Authorize & Complete Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
