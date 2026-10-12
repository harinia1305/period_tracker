import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Role } from '../../models/types';
import { GoogleAuthModal } from '../../components/auth/GoogleAuthModal';
import { PhoneVerificationModal } from '../../components/auth/PhoneVerificationModal';
import { GoogleUserProfile } from '../../services/googleAuthService';
import {
  Heart,
  Mail,
  User,
  Shield,
  Truck,
  Sparkles,
  Info,
  KeyRound,
  Smartphone,
  ShieldCheck,
  Building,
} from 'lucide-react';

export const AuthScreens: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as Role) || 'user';
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [activeRoleTab, setActiveRoleTab] = useState<Role>(initialRole);
  const [isRegister, setIsRegister] = useState(initialMode === 'register');

  // Customer Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [cycleDays, setCycleDays] = useState(28);

  // Partner Form State
  const [partnerPhone, setPartnerPhone] = useState('+91 98450 12811');
  const [partnerVehicle, setPartnerVehicle] = useState('Electric Scooter');
  const [partnerHub, setPartnerHub] = useState('Indiranagar & Koramangala Hub');
  const [idType, setIdType] = useState('driving_license');
  const [isWomanPartnerBadge, setIsWomanPartnerBadge] = useState(true);

  // Admin Form State
  const [adminEmail, setAdminEmail] = useState('admin@periodlove.internal');
  const [adminSecurityKey, setAdminSecurityKey] = useState('ADMIN-PROT-2026');
  const [adminPin, setAdminPin] = useState('9924');

  // Modals & Feedback
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, register, loginWithGoogle, switchRole, isLoading } = useAuth();
  const { sendNotification } = useNotifications();
  const navigate = useNavigate();

  // 1-Click Fast Demo Logins
  const handleFastDemoLogin = async (role: Role) => {
    setError(null);
    try {
      await switchRole(role);
      if (role === 'user') {
        sendNotification('Signed in as Maya Patel', 'Welcome back to your cycle tracking calendar.', 'health');
        navigate('/app/home');
      } else if (role === 'delivery_partner') {
        sendNotification('Partner Portal Active', 'Welcome Priya Sharma. Ready for dispatch.', 'partner');
        navigate('/partner/overview');
      } else {
        sendNotification('Admin Console Authenticated', 'Aarohi Sen (Operations Lead) logged in.', 'info');
        navigate('/admin/overview');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to switch demo account');
    }
  };

  // Google OAuth Success Handler
  const handleGoogleSuccess = async (googleUser: GoogleUserProfile) => {
    try {
      await loginWithGoogle(googleUser, activeRoleTab);
      sendNotification(
        `Google Verified: ${googleUser.name}`,
        `Authenticated as ${activeRoleTab.replace('_', ' ')} with ${googleUser.email}`,
        'payment'
      );
      if (activeRoleTab === 'user') navigate('/app/home');
      else if (activeRoleTab === 'delivery_partner') navigate('/partner/overview');
      else navigate('/admin/overview');
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (activeRoleTab === 'user') {
        if (!email) {
          setError('Please provide an email address.');
          return;
        }
        if (isRegister) {
          if (!displayName) {
            setError('Please provide your name.');
            return;
          }
          await register({
            displayName,
            email,
            role: 'user',
            averageCycleDays: cycleDays,
          });
          sendNotification('Account Created!', 'Welcome to Period Love Care.', 'health');
        } else {
          await login(email);
        }
        navigate('/app/home');
      } else if (activeRoleTab === 'delivery_partner') {
        if (isRegister) {
          await register({
            displayName: displayName || 'Priya Sharma (Partner)',
            email: email || 'priya@example.com',
            role: 'delivery_partner',
            phone: partnerPhone,
          });
          sendNotification('Partner Registered', 'Documents submitted for verification queue.', 'partner');
        } else {
          await switchRole('delivery_partner');
          sendNotification('Partner Signed In', `Service Zone: ${partnerHub}`, 'partner');
        }
        navigate('/partner/overview');
      } else if (activeRoleTab === 'admin') {
        if (adminSecurityKey !== 'ADMIN-PROT-2026' && adminPin !== '9924') {
          setError('Invalid Admin Security Key or 2FA PIN. Use master key ADMIN-PROT-2026 or fast demo button.');
          return;
        }
        await switchRole('admin');
        sendNotification('Admin Session Granted', 'Full operations and audit permissions active.', 'info');
        navigate('/admin/overview');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Use the 1-click demo button below for instant testing.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex flex-col justify-center p-4 sm:p-6 text-[#2D2327]">
      <div className="max-w-md mx-auto w-full space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-[#781D42] text-white flex items-center justify-center mx-auto shadow-md">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-2xl font-black text-[#4A1525]">Period Love Portals</h2>
          <p className="text-xs text-[#7A6E73]">
            Dedicated access for Customers, Verified Delivery Partners, and Operations Admins.
          </p>
        </div>

        {/* 3 Dedicated Role Login Tabs */}
        <div className="bg-white p-1.5 rounded-2xl border border-[#F3ECE8] shadow-xs grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveRoleTab('user');
              setError(null);
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeRoleTab === 'user'
                ? 'bg-[#781D42] text-white shadow-xs'
                : 'text-[#7A6E73] hover:text-[#2D2327]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRoleTab('delivery_partner');
              setError(null);
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeRoleTab === 'delivery_partner'
                ? 'bg-[#3F755E] text-white shadow-xs'
                : 'text-[#7A6E73] hover:text-[#2D2327]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Partner</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRoleTab('admin');
              setError(null);
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeRoleTab === 'admin'
                ? 'bg-[#8A5A44] text-white shadow-xs'
                : 'text-[#7A6E73] hover:text-[#2D2327]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* ROLE 1: CUSTOMER / USER LOGIN & REGISTRATION */}
        {activeRoleTab === 'user' && (
          <div className="bg-white rounded-3xl p-5 border border-[#F3ECE8] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F3ECE8]">
              <div>
                <h3 className="text-sm font-bold text-[#4A1525]">
                  {isRegister ? 'New Customer Account' : 'Customer Sign In'}
                </h3>
                <p className="text-[11px] text-[#7A6E73]">Cycle tracking & soothing care deliveries</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF5F7] text-[#781D42]">
                Maya Patel Portal
              </span>
            </div>

            {/* Google One-Tap / OAuth Button */}
            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(true)}
              className="w-full py-3 px-4 rounded-2xl border border-gray-300 hover:border-blue-500 hover:bg-gray-50/80 transition-all flex items-center justify-center gap-3 text-xs font-bold text-gray-700 shadow-xs"
            >
              {/* Google G SVG */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
              <span>Continue with Google (Verified)</span>
            </button>

            <div className="flex items-center gap-2 text-[10px] text-gray-400">
              <span className="flex-1 h-px bg-gray-200" />
              <span>OR EMAIL</span>
              <span className="flex-1 h-px bg-gray-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {error && (
                <div className="p-3 bg-[#FFF2EE] border border-[#F5C7BC] rounded-xl text-[#C8374D] text-xs">
                  {error}
                </div>
              )}

              {isRegister && (
                <div>
                  <label className="font-semibold text-[#4A1525] block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Maya Patel"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F5] border border-[#E5DAD4] focus:outline-none focus:ring-1 focus:ring-[#781D42]"
                  />
                </div>
              )}

              <div>
                <label className="font-semibold text-[#4A1525] block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="maya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F5] border border-[#E5DAD4] focus:outline-none focus:ring-1 focus:ring-[#781D42]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#4A1525] block mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F5] border border-[#E5DAD4] focus:outline-none focus:ring-1 focus:ring-[#781D42]"
                />
              </div>

              {isRegister && (
                <div>
                  <label className="font-semibold text-[#4A1525] block mb-1">
                    Cycle Length: {cycleDays} Days
                  </label>
                  <input
                    type="range"
                    min="21"
                    max="40"
                    value={cycleDays}
                    onChange={(e) => setCycleDays(Number(e.target.value))}
                    className="w-full accent-[#781D42]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-[#781D42] hover:bg-[#4A1525] text-white font-bold text-xs shadow-sm transition-all"
              >
                {isLoading ? 'Processing...' : isRegister ? 'Register & Start Tracking' : 'Sign In as User'}
              </button>
            </form>

            {/* Quick Demo Button */}
            <div className="pt-2 border-t border-[#F3ECE8] space-y-2">
              <button
                type="button"
                onClick={() => handleFastDemoLogin('user')}
                className="w-full py-2.5 rounded-xl border border-[#FCE8ED] bg-[#FFF5F7] hover:bg-[#FCE8ED] text-xs font-bold text-[#781D42] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click User Demo (Maya Patel)</span>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-xs font-semibold text-[#781D42] hover:underline"
                >
                  {isRegister ? 'Already have an account? Sign In' : 'New to Period Love? Create Account'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ROLE 2: DELIVERY PARTNER LOGIN & ONBOARDING */}
        {activeRoleTab === 'delivery_partner' && (
          <div className="bg-white rounded-3xl p-5 border border-[#D2E7DE] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D2E7DE]">
              <div>
                <h3 className="text-sm font-bold text-[#1F2E26]">
                  {isRegister ? 'Partner Onboarding' : 'Delivery Partner Portal'}
                </h3>
                <p className="text-[11px] text-[#7A6E73]">Safe, discreet delivery dispatch hub</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF4F0] text-[#2F614C]">
                Priya S. Portal
              </span>
            </div>

            {/* Google Partner Verification Button */}
            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(true)}
              className="w-full py-2.5 px-3 rounded-2xl border border-gray-300 hover:border-emerald-600 hover:bg-emerald-50/50 transition-all flex items-center justify-center gap-2.5 text-xs font-bold text-gray-700"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verify Partner ID with Google OAuth</span>
            </button>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {error && (
                <div className="p-3 bg-[#FFF2EE] border border-[#F5C7BC] rounded-xl text-[#C8374D] text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="font-semibold text-[#1F2E26] block mb-1">Partner Mobile Number</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Smartphone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={partnerPhone}
                      onChange={(e) => setPartnerPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F5F8F6] border border-[#D2E7DE] focus:outline-none focus:ring-1 focus:ring-[#3F755E]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPhoneModalOpen(true)}
                    className="px-3 py-2 rounded-xl bg-[#EBF4F0] text-[#2F614C] text-[11px] font-bold hover:bg-[#D2E7DE]"
                  >
                    Send OTP
                  </button>
                </div>
              </div>

              {isRegister && (
                <>
                  <div>
                    <label className="font-semibold text-[#1F2E26] block mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#F5F8F6] border border-[#D2E7DE]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-[#1F2E26] block mb-1">Vehicle Type</label>
                      <select
                        value={partnerVehicle}
                        onChange={(e) => setPartnerVehicle(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-[#F5F8F6] border border-[#D2E7DE] text-xs"
                      >
                        <option value="Electric Scooter">Electric Scooter</option>
                        <option value="Bicycle">Bicycle / E-Bike</option>
                        <option value="Motorcycle">Motorcycle</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-[#1F2E26] block mb-1">ID Verification</label>
                      <select
                        value={idType}
                        onChange={(e) => setIdType(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-[#F5F8F6] border border-[#D2E7DE] text-xs"
                      >
                        <option value="driving_license">Driving License</option>
                        <option value="aadhaar">Aadhaar Card</option>
                        <option value="voter_id">Voter ID</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-[#1F2E26] block mb-1">Assigned Wellness Hub</label>
                    <input
                      type="text"
                      value={partnerHub}
                      onChange={(e) => setPartnerHub(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F5F8F6] border border-[#D2E7DE]"
                    />
                  </div>

                  <label className="flex items-start gap-2.5 p-2.5 bg-[#EBF4F0] rounded-xl text-[11px] text-[#2F614C] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isWomanPartnerBadge}
                      onChange={(e) => setIsWomanPartnerBadge(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#3F755E] rounded"
                    />
                    <span>
                      Opt in for <strong>Verified Women Delivery Partner</strong> badge (Priority dispatch for sensitive period-care requests)
                    </span>
                  </label>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-[#3F755E] hover:bg-[#2F614C] text-white font-bold text-xs shadow-sm transition-all"
              >
                {isLoading ? 'Processing...' : isRegister ? 'Submit Partner Application' : 'Enter Partner Dispatch Portal'}
              </button>
            </form>

            <div className="pt-2 border-t border-[#D2E7DE] space-y-2">
              <button
                type="button"
                onClick={() => handleFastDemoLogin('delivery_partner')}
                className="w-full py-2.5 rounded-xl border border-[#D2E7DE] bg-[#EBF4F0] hover:bg-[#D2E7DE] text-xs font-bold text-[#2F614C] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Partner Demo (Priya Sharma)</span>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-xs font-semibold text-[#3F755E] hover:underline"
                >
                  {isRegister ? 'Already verified? Partner Login' : 'Want to deliver? Register as Partner'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ROLE 3: ADMIN OPERATIONS & VERIFICATION LOGIN */}
        {activeRoleTab === 'admin' && (
          <div className="bg-white rounded-3xl p-5 border border-[#E8DCD5] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8DCD5]">
              <div>
                <h3 className="text-sm font-bold text-[#5C3D2E]">Admin Operations Console</h3>
                <p className="text-[11px] text-[#7A6E73]">Store inventory, KYC approvals, and audit trail</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F5EEEB] text-[#8A5A44]">
                Aarohi Sen Portal
              </span>
            </div>

            {/* Google Workspace SSO Button */}
            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(true)}
              className="w-full py-2.5 px-3 rounded-2xl border border-gray-300 hover:border-[#8A5A44] hover:bg-[#F5EEEB] transition-all flex items-center justify-center gap-2.5 text-xs font-bold text-gray-700"
            >
              <Building className="w-4 h-4 text-[#8A5A44]" />
              <span>Google Workspace Enterprise Single Sign-On</span>
            </button>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {error && (
                <div className="p-3 bg-[#FFF2EE] border border-[#F5C7BC] rounded-xl text-[#C8374D] text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="font-semibold text-[#5C3D2E] block mb-1">Admin Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FAF7F5] border border-[#E8DCD5] focus:outline-none focus:ring-1 focus:ring-[#8A5A44]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#5C3D2E] block mb-1">Master Access Key</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={adminSecurityKey}
                    onChange={(e) => setAdminSecurityKey(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FAF7F5] border border-[#E8DCD5] font-mono focus:outline-none focus:ring-1 focus:ring-[#8A5A44]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#5C3D2E] block mb-1">
                  2FA Operations Security PIN (Default: 9924)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F5] border border-[#E8DCD5] font-mono font-bold tracking-widest text-center"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-[#8A5A44] hover:bg-[#5C3D2E] text-white font-bold text-xs shadow-sm transition-all"
              >
                {isLoading ? 'Authenticating...' : 'Unlock Admin Operations'}
              </button>
            </form>

            <div className="pt-2 border-t border-[#E8DCD5]">
              <button
                type="button"
                onClick={() => handleFastDemoLogin('admin')}
                className="w-full py-2.5 rounded-xl border border-[#E8DCD5] bg-[#F5EEEB] hover:bg-[#E8DCD5] text-xs font-bold text-[#5C3D2E] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Admin Demo (Aarohi Sen)</span>
              </button>
            </div>
          </div>
        )}

        {/* Prototype Notice */}
        <div className="text-center text-[11px] text-[#8E7E84] space-y-1">
          <p className="flex items-center justify-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>Prototype mode: Sessions and roles persist locally on your device.</span>
          </p>
        </div>
      </div>

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleGoogleSuccess}
        roleHint={activeRoleTab}
      />

      {/* Phone OTP Verification Modal */}
      <PhoneVerificationModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        phone={partnerPhone}
        onVerified={() => {
          sendNotification('Phone Verified!', 'Partner phone authenticated successfully.', 'partner');
        }}
      />
    </div>
  );
};
