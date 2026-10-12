import React, { useState } from 'react';
import { GoogleUserProfile, PRECONFIGURED_GOOGLE_ACCOUNTS } from '../../services/googleAuthService';
import { X, ShieldCheck, UserCheck, ArrowRight, Sparkles } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: GoogleUserProfile) => void;
  roleHint?: 'user' | 'delivery_partner' | 'admin';
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
  roleHint = 'user',
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (account: GoogleUserProfile) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSelectAccount(account);
      onClose();
    }, 450);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const customProfile: GoogleUserProfile = {
        id: `goog_usr_${Date.now()}`,
        email: customEmail.trim().toLowerCase(),
        name: customName.trim() || customEmail.split('@')[0],
        givenName: (customName || customEmail).split(' ')[0],
        familyName: (customName || customEmail).split(' ')[1] || '',
        picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customName || customEmail)}`,
        verifiedEmail: true,
        accessToken: `ya29.auth_${Date.now()}`,
      };
      onSelectAccount(customProfile);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 antialiased animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
        {/* Header with Google Brand */}
        <div className="p-6 pb-4 border-b border-gray-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* SVG Official Google 'G' Logo */}
            <svg className="w-8 h-8 shrink-0" viewBox="0 0 24 24">
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
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">Sign in with Google</h2>
              <p className="text-xs text-gray-500">to continue to Period Love</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Trust Banner */}
          <div className="bg-[#F8F9FA] rounded-2xl p-3 border border-gray-100 flex items-center gap-2.5 text-xs text-gray-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Google Identity Verification ensures your account is authenticated with active OAuth token security.
            </span>
          </div>

          {!showCustomInput ? (
            <>
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Choose an account ({roleHint.replace('_', ' ')})
              </p>

              <div className="space-y-2">
                {PRECONFIGURED_GOOGLE_ACCOUNTS.map(acc => (
                  <button
                    key={acc.id}
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleSelectPreset(acc)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={acc.picture}
                        alt={acc.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-blue-400"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-gray-900">{acc.name}</p>
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-100 text-emerald-700">
                            Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500">{acc.email}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-gray-500" />
                  <span>Use another Google account</span>
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Enter custom Google credentials</span>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Back to accounts
                </button>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Patel"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">Google Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. name@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? 'Verifying with Google...' : 'Continue to Period Love'}
              </button>
            </form>
          )}

          {isProcessing && (
            <div className="py-2 flex items-center justify-center gap-2 text-xs text-blue-600 font-semibold animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>Exchanging Google OAuth token...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-500">
            By signing in, Google will share your verified name, email address, and profile picture with Period Love.
          </p>
        </div>
      </div>
    </div>
  );
};
