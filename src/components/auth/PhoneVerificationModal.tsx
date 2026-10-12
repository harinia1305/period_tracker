import React, { useState, useEffect } from 'react';
import { X, Smartphone, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  onVerified: () => void;
}

export const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  isOpen,
  onClose,
  phone,
  onVerified,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleAutoFill = () => {
    setOtp(['4', '8', '2', '1', '9', '0']);
    setError(null);
  };

  const handleConfirm = () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onVerified();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 antialiased animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-[#EBF4F0] text-[#3F755E] flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-[#2D2327]">Verify Phone Number</h3>
          <p className="text-xs text-[#7A6E73] mt-1">
            We sent a 6-digit SMS verification code to <strong className="text-[#4A1525]">{phone || '+91 ••••• ••492'}</strong>
          </p>
        </div>

        {/* 6 Digit Input Boxes */}
        <div className="flex justify-between gap-1.5">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-input-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(idx, e.target.value)}
              className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-gray-300 focus:border-[#781D42] focus:ring-2 focus:ring-[#781D42]/20 focus:outline-none bg-[#FAF7F5]"
            />
          ))}
        </div>

        {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

        {/* Auto Fill Quick Button */}
        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleAutoFill}
            className="text-[11px] font-bold text-[#781D42] bg-[#FFF5F7] px-2.5 py-1 rounded-lg border border-[#FCE8ED] hover:bg-[#FCE8ED]"
          >
            ⚡ Quick Test Code (482190)
          </button>

          <span className="text-[11px] text-gray-500">
            {timer > 0 ? (
              `Resend in ${timer}s`
            ) : (
              <button
                type="button"
                onClick={() => setTimer(30)}
                className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Resend
              </button>
            )}
          </span>
        </div>

        <button
          type="button"
          disabled={isVerifying}
          onClick={handleConfirm}
          className="w-full py-3.5 rounded-2xl bg-[#781D42] hover:bg-[#4A1525] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
        >
          {isVerifying ? (
            <span>Verifying...</span>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Verify & Continue</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
