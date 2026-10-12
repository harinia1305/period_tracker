import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { privacyService } from '../../services/privacyService';
import { GoogleAuthModal } from '../../components/auth/GoogleAuthModal';
import { PhoneVerificationModal } from '../../components/auth/PhoneVerificationModal';
import { GoogleUserProfile } from '../../services/googleAuthService';
import {
  Mail,
  Phone,
  Bell,
  Download,
  Shield,
  AlertTriangle,
  LogOut,
  CheckCircle2,
  Sparkles,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProfileScreen: React.FC = () => {
  const { currentUser, updateUser, addWalletBalance, logout } = useAuth();
  const { sendNotification } = useNotifications();
  const navigate = useNavigate();

  const [reminderPeriod, setReminderPeriod] = useState(currentUser.reminderPreferences.periodEstimate);
  const [reminderCare, setReminderCare] = useState(currentUser.reminderPreferences.selfCarePrompt);
  const [reminderOrders, setReminderOrders] = useState(currentUser.reminderPreferences.discreetDeliveryAlerts);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Verification Modals
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const handleToggleReminder = async (
    type: 'periodEstimate' | 'selfCarePrompt' | 'discreetDeliveryAlerts',
    val: boolean
  ) => {
    if (type === 'periodEstimate') setReminderPeriod(val);
    if (type === 'selfCarePrompt') setReminderCare(val);
    if (type === 'discreetDeliveryAlerts') setReminderOrders(val);

    await updateUser({
      reminderPreferences: {
        ...currentUser.reminderPreferences,
        [type]: val,
      },
    });
  };

  const handleGoogleVerified = async (googleUser: GoogleUserProfile) => {
    await updateUser({
      googleVerified: true,
      googleEmail: googleUser.email,
      googleAvatarUrl: googleUser.picture,
    });
    sendNotification('Google Account Linked!', `Verified email: ${googleUser.email}`, 'payment');
  };

  const handlePhoneVerified = async () => {
    await updateUser({ phoneVerified: true });
    sendNotification('Phone Verified!', 'Your phone number is authenticated with SMS OTP.', 'health');
  };

  const handleAddWalletBonus = async () => {
    await addWalletBalance(200);
    sendNotification('Care Wallet Recharged!', 'Added ₹200 bonus credit to your Period Love Wallet.', 'payment');
  };

  const handleExportJson = () => {
    const jsonStr = privacyService.exportUserDataJson(currentUser.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `period_love_export_${currentUser.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice('Downloaded JSON cycle archive');
    setTimeout(() => setExportNotice(null), 2500);
  };

  const handleExportCsv = () => {
    const csvStr = privacyService.exportUserDataCsv(currentUser.id);
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `period_love_logs_${currentUser.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice('Downloaded CSV daily logs');
    setTimeout(() => setExportNotice(null), 2500);
  };

  const handleDeleteAccount = () => {
    privacyService.deleteAccountData(currentUser.id);
    setShowDeleteModal(false);
    logout();
    navigate('/');
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-[#4A1525]">Profile & Privacy Center</h1>
        <p className="text-xs text-[#7A6E73]">
          Manage your personal verification, Care Wallet, and privacy settings.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#F3ECE8] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentUser.googleAvatarUrl ? (
              <img
                src={currentUser.googleAvatarUrl}
                alt={currentUser.displayName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#781D42]/20"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#FFF5F7] text-[#781D42] flex items-center justify-center font-black text-base border border-[#FCE8ED]">
                {currentUser.displayName.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-[#4A1525]">{currentUser.displayName}</h2>
                {currentUser.googleVerified && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-700">
                    Google Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#7A6E73] mt-0.5">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#8E7E84]" />
                  <span>{currentUser.email}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#8E7E84]" />
                  <span>{currentUser.maskedPhone}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Identity & Verification Badges Bar */}
        <div className="pt-2 border-t border-[#F3ECE8] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {currentUser.googleVerified ? (
              <div className="flex items-center gap-1 text-emerald-700 bg-[#EBF4F0] px-2.5 py-1 rounded-xl text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Google OAuth Linked</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                className="flex items-center gap-1 bg-[#FAF7F5] border border-gray-200 hover:border-blue-400 px-2.5 py-1 rounded-xl text-[11px] font-semibold text-gray-700"
              >
                <span>Link Google Account</span>
              </button>
            )}

            {currentUser.phoneVerified ? (
              <div className="flex items-center gap-1 text-emerald-700 bg-[#EBF4F0] px-2.5 py-1 rounded-xl text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Phone OTP Verified</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowPhoneModal(true)}
                className="flex items-center gap-1 bg-[#FAF7F5] border border-gray-200 hover:border-emerald-500 px-2.5 py-1 rounded-xl text-[11px] font-semibold text-gray-700"
              >
                <span>Verify Phone OTP</span>
              </button>
            )}
          </div>

          <span className="text-[11px] text-[#7A6E73]">
            Cycle: {currentUser.averageCycleDays || 28} Days
          </span>
        </div>
      </div>

      {/* Period Love Care Wallet Card */}
      <div className="bg-gradient-to-br from-[#781D42] to-[#4A1525] rounded-3xl p-5 text-white shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F3ABB9]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#F3ABB9]">
              Period Love Care Wallet
            </span>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white">
            0% Interest Pay Later Active
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[11px] text-white/70 block">Available Credit Balance</span>
            <span className="text-3xl font-black text-white">₹{currentUser.walletBalanceInr || 500}</span>
          </div>

          <button
            type="button"
            onClick={handleAddWalletBonus}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#781D42] text-xs font-bold shadow-xs hover:bg-[#FAF7F5] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add ₹200 Credit</span>
          </button>
        </div>

        <p className="text-[11px] text-white/80 leading-snug">
          Use your Care Wallet balance during checkout for instant discounts on soothing heat patches, organic pads, and comfort teas.
        </p>
      </div>

      {/* Reminder Preferences */}
      <div className="bg-white rounded-3xl p-5 border border-[#F3ECE8] shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#781D42]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A1525]">
            Discreet Reminders & Notifications
          </h3>
        </div>

        <div className="space-y-3 divide-y divide-[#F3ECE8]">
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs font-semibold text-[#2D2327]">Upcoming Cycle Projections</p>
              <p className="text-[11px] text-[#7A6E73]">
                Receive private notices 2 days before your estimated window
              </p>
            </div>
            <input
              type="checkbox"
              checked={reminderPeriod}
              onChange={(e) => handleToggleReminder('periodEstimate', e.target.checked)}
              className="w-4 h-4 accent-[#781D42] rounded"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs font-semibold text-[#2D2327]">Self-Care Comfort Reminders</p>
              <p className="text-[11px] text-[#7A6E73]">
                Gentle prompts for hydration and warm compress remedies
              </p>
            </div>
            <input
              type="checkbox"
              checked={reminderCare}
              onChange={(e) => handleToggleReminder('selfCarePrompt', e.target.checked)}
              className="w-4 h-4 accent-[#781D42] rounded"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs font-semibold text-[#2D2327]">Masked Delivery Alerts</p>
              <p className="text-[11px] text-[#7A6E73]">
                Discreet SMS without revealing period-care product details
              </p>
            </div>
            <input
              type="checkbox"
              checked={reminderOrders}
              onChange={(e) => handleToggleReminder('discreetDeliveryAlerts', e.target.checked)}
              className="w-4 h-4 accent-[#781D42] rounded"
            />
          </div>
        </div>
      </div>

      {/* Sensitive Data Export */}
      <div className="bg-white rounded-3xl p-5 border border-[#F3ECE8] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-[#781D42]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A1525]">
              Data Ownership & Portability
            </h3>
          </div>
          {exportNotice && (
            <span className="text-[11px] font-bold text-[#3F755E] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{exportNotice}</span>
            </span>
          )}
        </div>

        <p className="text-xs text-[#7A6E73] leading-relaxed">
          You own your health data. Download all logged symptoms, painted cycle dates, and orders at any time.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportJson}
            className="p-3 rounded-2xl bg-[#FAF7F5] border border-[#F3ECE8] hover:border-[#DE738A] text-xs font-semibold text-[#4A1525] flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Download className="w-3.5 h-3.5 text-[#781D42]" />
            <span>Export (JSON)</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="p-3 rounded-2xl bg-[#FAF7F5] border border-[#F3ECE8] hover:border-[#DE738A] text-xs font-semibold text-[#4A1525] flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Download className="w-3.5 h-3.5 text-[#781D42]" />
            <span>Daily Logs (CSV)</span>
          </button>
        </div>
      </div>

      {/* Privacy Policy & Terms */}
      <div className="bg-white rounded-3xl p-5 border border-[#F3ECE8] shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#3F755E]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A1525]">
            Privacy Shield & Legal Terms
          </h3>
        </div>

        <div className="space-y-2 text-xs text-[#7A6E73] leading-relaxed">
          <div className="p-3 rounded-xl bg-[#FAF7F5] border border-[#F3ECE8]">
            <p className="font-bold text-[#4A1525]">Zero Data Brokering Guarantee</p>
            <p className="text-[11px] mt-0.5">
              Period Love stores reproductive cycle data in localized encrypted storage. We do not sell
              menstrual logs to third-party brokers, insurers, or data aggregators.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF7F5] border border-[#F3ECE8]">
            <p className="font-bold text-[#4A1525]">Medical Disclaimer</p>
            <p className="text-[11px] mt-0.5">
              This application is designed for personal logging and wellness support only. It is not an
              obstetric or gynecological diagnostic tool.
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="bg-white rounded-3xl p-5 border border-[#F5C7BC] shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#C8374D]">Account Actions</h3>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-[#4A1525]">Delete All Data & Account</p>
            <p className="text-[11px] text-[#7A6E73]">
              Permanently wipe all cycle logs, color shades, notes, and local orders.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#FFF2EE] text-[#C8374D] border border-[#F5C7BC] hover:bg-[#C8374D] hover:text-white text-xs font-bold transition-colors min-h-[44px]"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Logout button */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/auth/login');
          }}
          className="text-xs font-bold text-[#8E7E84] hover:text-[#C8374D] flex items-center justify-center gap-1.5 mx-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Current Session</span>
        </button>
      </div>

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSelectAccount={handleGoogleVerified}
        roleHint="user"
      />

      {/* Phone OTP Verification Modal */}
      <PhoneVerificationModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        phone={currentUser.maskedPhone}
        onVerified={handlePhoneVerified}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-[#F3ECE8]">
            <div className="w-12 h-12 rounded-full bg-[#FFF2EE] flex items-center justify-center text-[#C8374D]">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-[#4A1525]">Wipe All Personal Data?</h3>
              <p className="text-xs text-[#7A6E73] mt-1 leading-relaxed">
                This will permanently delete all your daily symptoms, notes, custom painted calendar dates,
                and mock orders. This action cannot be reversed.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7A6E73] hover:bg-[#FAF7F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#C8374D] text-white hover:bg-[#A92A3D]"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
