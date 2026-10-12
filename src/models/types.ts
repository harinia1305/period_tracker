export type Role = 'user' | 'delivery_partner' | 'admin';

export type FlowStatus = 'period' | 'spotting' | 'no_period' | 'missed_or_late' | 'unknown';

export interface DailyLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  colorHex?: string;
  flowStatus: FlowStatus;
  cramps?: number; // 0 to 10
  backPain?: number; // 0 (none), 1 (mild), 2 (strong)
  headache?: number; // 0 to 3
  bloating?: number; // 0 to 3
  nausea?: number; // 0 to 3
  fatigue?: number; // 0 to 3
  mood?: number; // 1 (low) to 5 (great)
  cravings?: number; // 0 to 3
  sleepQuality?: number; // 1 to 5
  selfCareActions: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cycle {
  id: string;
  userId: string;
  startDate?: string;
  endDate?: string;
  predictedStart?: string;
  predictedEnd?: string;
  confidenceLabel?: string;
}

export interface CycleEstimate {
  predictedStart: string; // YYYY-MM-DD
  predictedEnd: string;   // YYYY-MM-DD
  windowStart: string;    // YYYY-MM-DD (confidence interval)
  windowEnd: string;      // YYYY-MM-DD
  averageCycleLength: number; // e.g. 28 days
  averageFlowLength: number;  // e.g. 5 days
  confidenceLabel: 'high' | 'moderate' | 'tentative' | 'insufficient_data';
  logsUsedCount: number;
  cyclesDetectedCount: number;
  patternInsights: string[];
  explanation: string;
  isEstimateDisclaimer: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'pads' | 'liners' | 'cups' | 'heat_relief' | 'hydration' | 'snacks' | 'otc_comfort';
  description: string;
  priceInr: number;
  stock: number;
  imageUrl?: string;
  requiresPharmacistGuidance?: boolean;
  pharmacistNoticeText?: string;
  badge?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPriceInr: number;
  productName?: string;
}

export type OrderStatus = 'requested' | 'accepted' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'cancelled';

export type PaymentMethod =
  | 'gpay'
  | 'phonepe'
  | 'paytm'
  | 'bhim'
  | 'upi_id'
  | 'upi_qr'
  | 'card'
  | 'netbanking'
  | 'wallet'
  | 'care_wallet'
  | 'pay_later'
  | 'cod';

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'cod_pending';

export interface PaymentDetails {
  method: PaymentMethod;
  methodLabel: string;
  provider: string; // e.g. 'Google Pay', 'Visa Card', 'HDFC Bank', etc.
  transactionId: string;
  status: PaymentStatus;
  amountInr: number;
  paidAt: string;
  invoiceNumber: string;
  maskedCardNumber?: string;
  upiId?: string;
  bankName?: string;
  walletProvider?: string;
  usedWalletCreditInr?: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalInr: number;
  deliveryFeeInr: number;
  status: OrderStatus;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  discreetPackaging: boolean;
  verifiedPartnerPreference: boolean;
  addressLabel: string;
  maskedPhone: string;
  customerRating?: number;
  ratingFeedback?: string;
  payment?: PaymentDetails;
  deliveryOtp?: string; // 4-digit handover verification
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryPartner {
  id: string;
  displayName: string;
  city: string;
  serviceZone: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  isAvailable: boolean;
  rating: number;
  completedOrders: number;
  phoneMasked: string;
  vehicleType: string;
  avatarSeed: string;
  totalEarningsInr: number;
  weeklyEarningsInr: number;
  googleVerified?: boolean;
  googleEmail?: string;
  idVerificationType?: 'aadhaar' | 'driving_license' | 'voter_id';
  idVerified?: boolean;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  maskedPhone: string;
  averageCycleDays: number;
  lastPeriodDate?: string;
  reminderPreferences: {
    periodEstimate: boolean;
    selfCarePrompt: boolean;
    discreetDeliveryAlerts: boolean;
  };
  consentGiven: boolean;
  walletBalanceInr: number; // e.g. ₹500 starting bonus
  googleVerified?: boolean;
  googleEmail?: string;
  googleAvatarUrl?: string;
  phoneVerified?: boolean;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorEmail: string;
  role: Role;
  action: string;
  entityType: 'order' | 'delivery_partner' | 'user' | 'product' | 'system';
  entityId: string;
  details: string;
}

