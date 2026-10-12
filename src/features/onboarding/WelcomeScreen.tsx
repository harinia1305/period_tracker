import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { GoogleAuthModal } from '../../components/auth/GoogleAuthModal';
import { PhoneVerificationModal } from '../../components/auth/PhoneVerificationModal';
import { PaymentGatewayModal } from '../../components/payment/PaymentGatewayModal';
import { OrderInvoiceModal } from '../../components/payment/OrderInvoiceModal';
import { GoogleUserProfile } from '../../services/googleAuthService';
import { Order, PaymentDetails } from '../../models/types';
import {
  Heart,
  ShieldCheck,
  Calendar,
  Truck,
  Sparkles,
  ArrowRight,
  Lock,
  ChevronRight,
  CreditCard,
  Smartphone,
  CheckCircle2,
  FileText,
  KeyRound,
  Shield,
  User,
} from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { switchRole, register, loginWithGoogle } = useAuth();
  const { sendNotification } = useNotifications();

  // Onboarding settings
  const [showPersonalize, setShowPersonalize] = useState(false);
  const [cycleDays, setCycleDays] = useState<number>(28);
  const [reminderOptIn, setReminderOptIn] = useState<boolean>(true);

  // Active showcase tabs
  const [activeFeatureTab, setActiveFeatureTab] = useState<'customer' | 'partner' | 'admin'>('customer');

  // Interactive Live Modals on Landing Page
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Sample order for tax invoice demonstration
  const sampleInvoiceOrder: Order = {
    id: 'ORD-2026-9481',
    userId: 'usr_maya',
    items: [
      { productId: 'p1', productName: 'Organic Cotton Overnight Pads (Pack of 12)', quantity: 1, unitPriceInr: 299 },
      { productId: 'p4', productName: 'Herbal Heating Cramp Patch (Pack of 3)', quantity: 2, unitPriceInr: 249 },
    ],
    totalInr: 797,
    deliveryFeeInr: 0,
    discreetPackaging: true,
    verifiedPartnerPreference: true,
    addressLabel: 'Indiranagar 12th Main, Apt 302, Bengaluru',
    maskedPhone: '+91 ••••• ••492',
    status: 'delivered',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deliveryOtp: '4821',
    payment: {
      method: 'gpay',
      methodLabel: 'Google Pay (UPI)',
      provider: 'Google Pay Tez',
      transactionId: 'TXN_GPAY_89410284',
      status: 'paid',
      amountInr: 297,
      paidAt: new Date().toISOString(),
      invoiceNumber: 'INV-2026-8819',
      usedWalletCreditInr: 500,
    },
  };

  const handleStartAsUser = async () => {
    if (showPersonalize) {
      await register({
        displayName: 'Maya Patel',
        email: 'maya@example.com',
        role: 'user',
        averageCycleDays: cycleDays,
      });
    } else {
      await switchRole('user');
    }
    sendNotification('Customer Session Active', 'Signed in as Maya Patel with ₹500 Welcome Care Wallet.', 'health');
    navigate('/app/home');
  };

  const handleStartAsPartner = async () => {
    await switchRole('delivery_partner');
    sendNotification('Partner Dispatch Active', 'Priya Sharma logged in. Assigned to Indiranagar Hub.', 'partner');
    navigate('/partner/overview');
  };

  const handleStartAsAdmin = async () => {
    await switchRole('admin');
    sendNotification('Operations Lead Authenticated', 'Aarohi Sen logged in with master console access.', 'info');
    navigate('/admin/overview');
  };

  const handleGoogleSuccess = async (googleUser: GoogleUserProfile) => {
    await loginWithGoogle(googleUser, 'user');
    sendNotification(`Google Verified: ${googleUser.name}`, 'OAuth token verified and shield badge issued.', 'payment');
    navigate('/app/home');
  };

  const handlePaymentTestSuccess = (details: PaymentDetails) => {
    sendNotification(
      'Payment Test Succeeded!',
      `Transaction ${details.transactionId} authorized via ${details.methodLabel}. Invoice generated.`,
      'payment'
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] text-[#2D2327] flex flex-col font-sans selection:bg-[#FCE8ED] selection:text-[#781D42]">
      {/* Top Announcement Bar */}
      <div className="bg-[#4A1525] text-white py-2 px-4 text-xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">Bengaluru Care Dispatch Network: Indiranagar & Koramangala Active</span>
            <span className="hidden sm:inline text-white/50">•</span>
            <span className="hidden sm:inline text-white/80">Average Discreet Delivery: 14 mins</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#F3ABB9] font-bold">🎁 ₹500 Welcome Bonus in Period Love Care Wallet</span>
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="underline text-white/90 hover:text-white"
            >
              Test Checkout
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#F3ECE8] shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#781D42] to-[#A3305D] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-[#4A1525]">Period Love</span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#FCE8ED] text-[#781D42]">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-[#7A6E73] -mt-0.5 font-medium hidden sm:block">
                Empathetic Cycle Intelligence & Discreet Care
              </p>
            </div>
          </div>

          {/* Quick Nav Anchors */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#7A6E73]">
            <a href="#features" className="hover:text-[#781D42] transition-colors">
              Platform Features
            </a>
            <a href="#portals" className="hover:text-[#781D42] transition-colors">
              3 Dedicated Portals
            </a>
            <a href="#payment-gateway" className="hover:text-[#781D42] transition-colors">
              Payment Gateway
            </a>
            <a href="#safe-handover" className="hover:text-[#781D42] transition-colors">
              Handover PIN
            </a>
            <a href="#digital-invoice" className="hover:text-[#781D42] transition-colors">
              Tax Invoices
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-300 hover:border-gray-400 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-2xs"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google One-Tap</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/auth/login')}
              className="px-4 py-2 rounded-xl bg-[#781D42] hover:bg-[#4A1525] text-white text-xs font-bold shadow-sm transition-all"
            >
              Sign In / Switch Role
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 px-4 sm:px-6 bg-gradient-to-b from-[#FFF5F7] via-[#FAF7F5] to-[#FAF7F5]">
        {/* Glow ambient background circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#FCE8ED]/80 via-[#FFF0F4]/60 to-[#EBF4F0]/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#F3ECE8] shadow-xs text-xs font-semibold text-[#781D42]">
            <Sparkles className="w-4 h-4 text-[#C85C74]" />
            <span>Complete Mobile Application & Web Experience</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#781D42]" />
            <span className="text-[#3F755E] font-bold">Google Auth & RBI Tokenized Payments</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#4A1525] tracking-tight leading-[1.15]">
            Empathetic Cycle Intelligence. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#781D42] via-[#C85C74] to-[#E27B66]">
              Discreet 10-Minute Care Delivery.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#7A6E73] leading-relaxed font-normal">
            Period Love redefines wellness with fluid 2D finger-paint cycle tracking, verified Google identity verification,
            dedicated portals for Customers, Partners, and Admins, comprehensive payment methods (UPI, QR, Cards, Care Wallet),
            and anti-tamper 4-digit handover PIN security.
          </p>

          {/* 3 Quick Role Entrance Pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleStartAsUser}
              className="py-3.5 px-6 rounded-2xl bg-[#781D42] hover:bg-[#4A1525] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 group min-h-[48px]"
            >
              <User className="w-4 h-4" />
              <span>Explore as User (Maya Patel)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={handleStartAsPartner}
              className="py-3.5 px-5 rounded-2xl bg-white border border-[#D2E7DE] hover:bg-[#F5F8F6] text-[#1F2E26] font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2 min-h-[48px]"
            >
              <Truck className="w-4 h-4 text-[#3F755E]" />
              <span>Deliver with Us (Partner Priya)</span>
            </button>

            <button
              type="button"
              onClick={handleStartAsAdmin}
              className="py-3.5 px-5 rounded-2xl bg-white border border-[#E8DCD5] hover:bg-[#FAF7F5] text-[#5C3D2E] font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2 min-h-[48px]"
            >
              <Shield className="w-4 h-4 text-[#8A5A44]" />
              <span>Operations Admin (Aarohi Sen)</span>
            </button>
          </div>

          {/* Interactive Feature Demo Pills Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-3 py-1.5 rounded-full bg-[#FFF5F7] border border-[#FCE8ED] text-[#781D42] font-semibold hover:bg-[#FCE8ED] transition-colors flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Test Payment Gateway (All Methods)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(true)}
              className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Test Google Auth Modal</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPhoneModalOpen(true)}
              className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Test SMS OTP (482190)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(true)}
              className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>View Sample Tax Invoice</span>
            </button>
          </div>
        </div>
      </section>

      {/* Interactive 3-Role Showcase Section */}
      <section id="portals" className="py-12 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-[#4A1525]">
            Three Tailored Portals for Every Role
          </h2>
          <p className="text-xs sm:text-sm text-[#7A6E73] max-w-xl mx-auto">
            Each participant in the Period Love ecosystem has an isolated, purpose-built interface designed for privacy, speed, and trust.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="max-w-md mx-auto bg-white p-1.5 rounded-2xl border border-[#F3ECE8] shadow-xs grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setActiveFeatureTab('customer')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeFeatureTab === 'customer'
                ? 'bg-[#781D42] text-white shadow-xs'
                : 'text-[#7A6E73] hover:text-[#2D2327]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFeatureTab('partner')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeFeatureTab === 'partner'
                ? 'bg-[#3F755E] text-white shadow-xs'
                : 'text-[#7A6E73] hover:text-[#2D2327]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Partner</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFeatureTab('admin')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeFeatureTab === 'admin'
                ? 'bg-[#8A5A44] text-white shadow-xs'
                : 'text-[#7A6E73] hover:text-[#2D2327]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F3ECE8] shadow-sm max-w-4xl mx-auto">
          {activeFeatureTab === 'customer' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF5F7] text-[#781D42] text-xs font-bold">
                  <User className="w-3.5 h-3.5" />
                  <span>Customer Experience • Maya Patel</span>
                </div>
                <h3 className="text-2xl font-black text-[#4A1525]">
                  Intuitive Rhythm Painting & Care On Demand
                </h3>
                <p className="text-xs text-[#7A6E73] leading-relaxed">
                  Log periods effortlessly by dragging custom shades across dates with our 2D HSV gradient picker.
                  Order organic pads, cramp heat patches, soothing teas, and pain relief in unbranded kraft boxes,
                  with automatic deductions from your ₹500 Care Wallet.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#4A1525]">
                    <CheckCircle2 className="w-4 h-4 text-[#781D42]" />
                    <span>2D Gradient finger-paint cycle logging</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#4A1525]">
                    <CheckCircle2 className="w-4 h-4 text-[#781D42]" />
                    <span>Google One-Tap verified identity badge</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#4A1525]">
                    <CheckCircle2 className="w-4 h-4 text-[#781D42]" />
                    <span>₹500 Welcome Balance in Period Love Care Wallet</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#4A1525]">
                    <CheckCircle2 className="w-4 h-4 text-[#781D42]" />
                    <span>4-Digit Delivery Verification Handover PIN (e.g. 4821)</span>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStartAsUser}
                    className="py-3 px-6 rounded-2xl bg-[#781D42] hover:bg-[#4A1525] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <span>Launch Maya's Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Visual Card Preview */}
              <div className="bg-[#FAF7F5] rounded-2xl p-5 border border-[#F3ECE8] space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5DAD4]">
                  <div>
                    <span className="text-xs font-bold text-[#4A1525]">Maya Patel</span>
                    <span className="block text-[10px] text-gray-500">maya@example.com</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF4F0] text-[#2F614C] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Google Verified</span>
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#F3ECE8] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Care Wallet</span>
                    <span className="block text-sm font-black text-[#781D42]">₹500.00 Balance</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                    Ready to Apply
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#F3ECE8] space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Current Cycle Phase</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">Luteal Phase (Day 22 of 28)</span>
                    <span className="text-[10px] text-[#C85C74] font-semibold">Predicted in 6 days</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'partner' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF4F0] text-[#2F614C] text-xs font-bold">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Delivery Partner Portal • Priya Sharma</span>
                </div>
                <h3 className="text-2xl font-black text-[#1F2E26]">
                  Safe, Discreet Deliveries with Handover PIN
                </h3>
                <p className="text-xs text-[#7A6E73] leading-relaxed">
                  Delivery partners navigate an active delivery pipeline with full safety features.
                  Package contents remain 100% confidential. Deliveries are finalized strictly when the customer's
                  unique 4-digit handover PIN is validated in the Active Route screen.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#1F2E26]">
                    <CheckCircle2 className="w-4 h-4 text-[#3F755E]" />
                    <span>Verified Women Delivery Partner badge opt-in</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#1F2E26]">
                    <CheckCircle2 className="w-4 h-4 text-[#3F755E]" />
                    <span>Anti-tamper 4-digit customer handover PIN verification</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#1F2E26]">
                    <CheckCircle2 className="w-4 h-4 text-[#3F755E]" />
                    <span>Zero sensitive item names disclosed on partner manifest</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#1F2E26]">
                    <CheckCircle2 className="w-4 h-4 text-[#3F755E]" />
                    <span>Instant +₹85 payout crediting per completed order</span>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStartAsPartner}
                    className="py-3 px-6 rounded-2xl bg-[#3F755E] hover:bg-[#2F614C] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <span>Open Partner Dispatch Route</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Visual Partner Card */}
              <div className="bg-[#F5F8F6] rounded-2xl p-5 border border-[#D2E7DE] space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#D2E7DE]">
                  <div>
                    <span className="text-xs font-bold text-[#1F2E26]">Priya Sharma</span>
                    <span className="block text-[10px] text-gray-500">Electric Scooter • Indiranagar Hub</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3F755E] text-white">
                    Active On Duty
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#D2E7DE] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Today's Earnings</span>
                    <span className="block text-sm font-black text-[#2F614C]">₹680.00 (8 Deliveries)</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                    100% On-Time
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#D2E7DE] space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Safety Verification</span>
                  <p className="text-xs font-semibold text-gray-800">
                    Handover PIN required at recipient door step before completion.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'admin' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5EEEB] text-[#8A5A44] text-xs font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Operations • Aarohi Sen</span>
                </div>
                <h3 className="text-2xl font-black text-[#5C3D2E]">
                  Enterprise Operations, Inventory & Audit Logs
                </h3>
                <p className="text-xs text-[#7A6E73] leading-relaxed">
                  Operations leads supervise fulfillment hubs, review partner KYC submissions, inspect live inventory stock levels,
                  and audit transaction security with Google Workspace Enterprise SSO or Master Key ADMIN-PROT-2026.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#5C3D2E]">
                    <CheckCircle2 className="w-4 h-4 text-[#8A5A44]" />
                    <span>Google Workspace Enterprise SSO integration</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#5C3D2E]">
                    <CheckCircle2 className="w-4 h-4 text-[#8A5A44]" />
                    <span>Master security key & 2FA Operations PIN (9924)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#5C3D2E]">
                    <CheckCircle2 className="w-4 h-4 text-[#8A5A44]" />
                    <span>Real-time dispatch oversight & KYC verification queues</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#5C3D2E]">
                    <CheckCircle2 className="w-4 h-4 text-[#8A5A44]" />
                    <span>Tamper-evident system audit log stream</span>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStartAsAdmin}
                    className="py-3 px-6 rounded-2xl bg-[#8A5A44] hover:bg-[#5C3D2E] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <span>Open Admin Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Visual Admin Card */}
              <div className="bg-[#FAF7F5] rounded-2xl p-5 border border-[#E8DCD5] space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8DCD5]">
                  <div>
                    <span className="text-xs font-bold text-[#5C3D2E]">Aarohi Sen</span>
                    <span className="block text-[10px] text-gray-500">Operations Lead • Master Access</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8A5A44] text-white">
                    Master Key Authenticated
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-[#E8DCD5]">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Active Orders</span>
                    <span className="block text-sm font-black text-gray-900 mt-0.5">24 Live</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E8DCD5]">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Hub Stock</span>
                    <span className="block text-sm font-black text-emerald-600 mt-0.5">100% In-Stock</span>
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#E8DCD5] space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Security Status</span>
                  <p className="text-xs text-gray-700 font-semibold">
                    Encrypted audit stream online. 2FA operations active.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Feature Deep Dive: Payment Gateway (All Payment Methods) */}
      <section id="payment-gateway" className="py-12 px-4 sm:px-6 bg-white border-y border-[#F3ECE8]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF5F7] text-[#781D42] text-xs font-bold">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Full-Stack Payment System</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#4A1525]">
              Comprehensive Multi-Payment Gateway
            </h2>
            <p className="text-xs sm:text-sm text-[#7A6E73] max-w-xl mx-auto">
              Every major Indian payment mode supported with seamless simulation, RBI-compliant tokenization, and live 3D Secure verification.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Payment Method Cards */}
            <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#F3ECE8] text-center space-y-1.5 hover:shadow-xs transition-shadow">
              <span className="text-2xl block">⚡</span>
              <h4 className="text-xs font-bold text-gray-900">UPI Apps</h4>
              <p className="text-[11px] text-gray-500">GPay, PhonePe, Paytm, BHIM</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#F3ECE8] text-center space-y-1.5 hover:shadow-xs transition-shadow">
              <span className="text-2xl block">📱</span>
              <h4 className="text-xs font-bold text-gray-900">Dynamic QR</h4>
              <p className="text-[11px] text-gray-500">3-Minute live countdown timer</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#F3ECE8] text-center space-y-1.5 hover:shadow-xs transition-shadow">
              <span className="text-2xl block">💳</span>
              <h4 className="text-xs font-bold text-gray-900">Cards + 3DS</h4>
              <p className="text-[11px] text-gray-500">Visa, Mastercard, RuPay, Amex</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#F3ECE8] text-center space-y-1.5 hover:shadow-xs transition-shadow">
              <span className="text-2xl block">🏦</span>
              <h4 className="text-xs font-bold text-gray-900">Net Banking</h4>
              <p className="text-[11px] text-gray-500">HDFC, ICICI, SBI + 25 Banks</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#F3ECE8] text-center space-y-1.5 hover:shadow-xs transition-shadow">
              <span className="text-2xl block">🎁</span>
              <h4 className="text-xs font-bold text-gray-900">Care Wallet</h4>
              <p className="text-[11px] text-[#781D42] font-semibold">₹500 Welcome Bonus Credit</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#F3ECE8] text-center space-y-1.5 hover:shadow-xs transition-shadow">
              <span className="text-2xl block">📦</span>
              <h4 className="text-xs font-bold text-gray-900">Discreet COD</h4>
              <p className="text-[11px] text-gray-500">Plain brown kraft box handover</p>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="py-3 px-8 rounded-2xl bg-[#781D42] hover:bg-[#4A1525] text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Launch Interactive Payment Checkout Dialog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive: Anti-Tamper Handover PIN & Digital Tax Invoices */}
      <section id="safe-handover" className="py-12 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Card 1: 4-Digit Handover PIN */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F3ECE8] shadow-sm flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EBF4F0] text-[#3F755E] flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-[#1F2E26]">Safe Handover with 4-Digit Customer PIN</h3>
              <p className="text-xs text-[#7A6E73] leading-relaxed">
                When an order is created, the system generates a unique 4-digit Delivery Verification PIN (e.g. 4821)
                visible only in the customer's Order Tracker. The delivery partner must enter this PIN in their
                Active Route screen to complete delivery, eliminating delivery mix-ups and ensuring tamper-free handover.
              </p>
              <div className="p-4 bg-[#F5F8F6] rounded-2xl border border-[#D2E7DE] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                    Delivery Verification PIN
                  </span>
                  <span className="block text-2xl font-mono font-black text-[#2F614C] tracking-widest mt-0.5">
                    4 8 2 1
                  </span>
                </div>
                <span className="px-3 py-1 rounded-xl bg-white text-xs font-bold text-[#3F755E] border border-[#D2E7DE]">
                  Confidential to Customer
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F3ECE8]">
              <button
                type="button"
                onClick={handleStartAsPartner}
                className="w-full py-2.5 rounded-xl border border-[#D2E7DE] hover:bg-[#F5F8F6] text-xs font-bold text-[#2F614C] flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Test PIN Verification in Partner Active Route</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Digital Tax Invoice */}
          <div id="digital-invoice" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F3ECE8] shadow-sm flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF5F7] text-[#781D42] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-[#4A1525]">Digital Tax Invoice & Receipt Viewer</h3>
              <p className="text-xs text-[#7A6E73] leading-relaxed">
                Instant GST tax invoices with itemized product breakdowns, applied Care Wallet credits,
                discreet delivery fee waivers, unique transaction identifiers (TXN_...), and official circular
                "PAID & AUTHENTICATED" stamps ready for 1-click printing or PDF export.
              </p>
              <div className="p-4 bg-[#FFF5F7] rounded-2xl border border-[#FCE8ED] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Sample Invoice</span>
                  <span className="block text-sm font-mono font-bold text-gray-900 mt-0.5">INV-2026-8819</span>
                  <span className="text-[11px] text-[#781D42] font-semibold">₹297 Paid (₹500 Wallet Credit Applied)</span>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-[#781D42] text-[#781D42] flex flex-col items-center justify-center rotate-[-12deg] select-none text-[8px] font-bold">
                  <span>PAID</span>
                  <span>STAMP</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F3ECE8]">
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(true)}
                className="w-full py-2.5 rounded-xl border border-[#FCE8ED] hover:bg-[#FFF5F7] text-xs font-bold text-[#781D42] flex items-center justify-center gap-1.5 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>View Full Tax Invoice & Receipt Modal</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Optional Fast Cycle Personalization Accordion */}
      <section className="py-8 px-4 sm:px-6 max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-3xl p-6 border border-[#F3ECE8] shadow-xs space-y-4">
          <button
            type="button"
            onClick={() => setShowPersonalize(!showPersonalize)}
            className="flex items-center justify-between w-full text-xs font-bold text-[#781D42]"
          >
            <div className="flex items-center gap-2 text-left">
              <Calendar className="w-4 h-4" />
              <span>Personalize Your Cycle Settings Before Launch (Optional)</span>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${showPersonalize ? 'rotate-90' : ''}`} />
          </button>

          {showPersonalize && (
            <div className="space-y-4 pt-3 border-t border-[#F3ECE8] text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[#7A6E73]">Average Cycle Length</label>
                  <span className="font-bold text-[#4A1525]">{cycleDays} days</span>
                </div>
                <input
                  type="range"
                  min="21"
                  max="40"
                  value={cycleDays}
                  onChange={(e) => setCycleDays(Number(e.target.value))}
                  className="w-full accent-[#781D42]"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="font-semibold text-[#2D2327]">Discreet cycle reminders</p>
                  <p className="text-[11px] text-[#7A6E73]">Private notifications with calm wording</p>
                </div>
                <input
                  type="checkbox"
                  checked={reminderOptIn}
                  onChange={(e) => setReminderOptIn(e.target.checked)}
                  className="w-4 h-4 accent-[#781D42] rounded"
                />
              </div>

              <button
                type="button"
                onClick={handleStartAsUser}
                className="w-full py-3 rounded-2xl bg-[#781D42] hover:bg-[#4A1525] text-white font-bold text-xs shadow-sm transition-all"
              >
                Save & Continue as Maya Patel
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Safety & Medical Non-Alarming Disclaimer */}
      <section className="py-6 px-4 sm:px-6 max-w-2xl mx-auto w-full text-center text-[11px] text-[#8E7E84] space-y-1">
        <p className="flex items-center justify-center gap-1.5 font-medium">
          <Lock className="w-3.5 h-3.5 text-[#781D42]" />
          <span>Local storage encryption. No sensitive health logs shared with partners or advertisers.</span>
        </p>
        <p>
          Tracking insights are estimates and not medical advice. Contact a qualified healthcare professional for concerns.
        </p>
      </section>

      {/* Site Footer */}
      <footer className="mt-auto py-8 px-4 sm:px-6 bg-white border-t border-[#F3ECE8] text-xs text-[#7A6E73]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#781D42] text-white flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-bold text-[#4A1525]">Period Love</span>
            <span>•</span>
            <span className="text-[11px]">Empathetic Cycle Care & Delivery</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              type="button"
              onClick={handleStartAsUser}
              className="hover:text-[#781D42] transition-colors"
            >
              Customer Portal
            </button>
            <button
              type="button"
              onClick={handleStartAsPartner}
              className="hover:text-[#3F755E] transition-colors"
            >
              Partner Portal
            </button>
            <button
              type="button"
              onClick={handleStartAsAdmin}
              className="hover:text-[#8A5A44] transition-colors"
            >
              Admin Portal
            </button>
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="hover:text-[#781D42] transition-colors"
            >
              Payment Test
            </button>
          </div>

          <span className="text-[11px] text-gray-400">
            © {new Date().getFullYear()} Period Love Care Hub. All rights reserved.
          </span>
        </div>
      </footer>

      {/* Interactive Modals Available on Landing Page */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleGoogleSuccess}
        roleHint="user"
      />

      <PhoneVerificationModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        phone="+91 98450 12811"
        onVerified={() => {
          sendNotification('SMS Phone Verified', 'OTP (482190) confirmed.', 'partner');
        }}
      />

      <PaymentGatewayModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmountInr={797}
        walletBalanceInr={500}
        onPaymentSuccess={handlePaymentTestSuccess}
      />

      <OrderInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        order={sampleInvoiceOrder}
      />
    </div>
  );
};
