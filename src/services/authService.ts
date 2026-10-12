import { User, Role } from '../models/types';
import { SEED_USERS } from '../data/seedData';
import { GoogleUserProfile } from './googleAuthService';

const CURRENT_USER_KEY = 'period_love_current_user';
const USERS_STORAGE_KEY = 'period_love_all_users';

function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_USERS;
  }
}

function saveStoredUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // Graceful storage fallback
  }
}

export const authService = {
  getStoredUsers(): User[] {
    return getStoredUsers();
  },

  getCurrentUser(): User {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    // Default to Maya (User)
    const defaultUser = SEED_USERS[0];
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },

  async login(email: string): Promise<User> {
    const users = getStoredUsers();
    const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) {
      throw new Error(`No account found for ${email}. Please use one of the demo logins or create a new account.`);
    }
    this.setCurrentUser(found);
    return found;
  },

  async loginWithGoogle(profile: GoogleUserProfile, preferredRole: Role = 'user'): Promise<User> {
    const users = getStoredUsers();
    let found = users.find(
      u => u.email.toLowerCase() === profile.email.toLowerCase() ||
           u.googleEmail?.toLowerCase() === profile.email.toLowerCase()
    );

    if (!found) {
      // Auto-register verified Google user
      found = {
        id: `usr_goog_${Date.now()}`,
        email: profile.email,
        displayName: profile.name,
        role: preferredRole,
        maskedPhone: '+91 ••••• ••' + Math.floor(100 + Math.random() * 900),
        averageCycleDays: 28,
        walletBalanceInr: 500, // ₹500 welcome credit
        googleVerified: true,
        googleEmail: profile.email,
        googleAvatarUrl: profile.picture,
        phoneVerified: false,
        reminderPreferences: {
          periodEstimate: true,
          selfCarePrompt: true,
          discreetDeliveryAlerts: true,
        },
        consentGiven: true,
        createdAt: new Date().toISOString(),
      };
      users.push(found);
      saveStoredUsers(users);
    } else {
      // Update Google profile metadata
      found.googleVerified = true;
      found.googleEmail = profile.email;
      found.googleAvatarUrl = profile.picture;
      const idx = users.findIndex(u => u.id === found!.id);
      if (idx !== -1) {
        users[idx] = found;
        saveStoredUsers(users);
      }
    }

    this.setCurrentUser(found);
    return found;
  },

  async register(data: {
    displayName: string;
    email: string;
    role: Role;
    averageCycleDays?: number;
    phone?: string;
  }): Promise<User> {
    const users = getStoredUsers();
    const existing = users.find(u => u.email.toLowerCase() === data.email.trim().toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      email: data.email.trim(),
      displayName: data.displayName.trim(),
      role: data.role,
      maskedPhone: data.phone
        ? '+91 ••••• ••' + data.phone.slice(-3)
        : '+91 ••••• ••' + Math.floor(100 + Math.random() * 900),
      averageCycleDays: data.averageCycleDays || 28,
      walletBalanceInr: 500, // Welcome ₹500 Care Wallet credit
      googleVerified: false,
      phoneVerified: Boolean(data.phone),
      reminderPreferences: {
        periodEstimate: true,
        selfCarePrompt: true,
        discreetDeliveryAlerts: true,
      },
      consentGiven: true,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveStoredUsers(users);
    this.setCurrentUser(newUser);
    return newUser;
  },

  async switchDemoRole(role: Role): Promise<User> {
    const users = getStoredUsers();
    const target = users.find(u => u.role === role) || SEED_USERS.find(u => u.role === role) || SEED_USERS[0];
    this.setCurrentUser(target);
    return target;
  },

  async updateUser(updates: Partial<User>): Promise<User> {
    const current = this.getCurrentUser();
    const updated: User = { ...current, ...updates };
    this.setCurrentUser(updated);

    const users = getStoredUsers();
    const idx = users.findIndex(u => u.id === current.id);
    if (idx !== -1) {
      users[idx] = updated;
      saveStoredUsers(users);
    }
    return updated;
  },

  async deductWalletBalance(amountInr: number): Promise<User> {
    const current = this.getCurrentUser();
    const newBalance = Math.max(0, (current.walletBalanceInr || 0) - amountInr);
    return this.updateUser({ walletBalanceInr: newBalance });
  },

  async addWalletBalance(amountInr: number): Promise<User> {
    const current = this.getCurrentUser();
    const newBalance = (current.walletBalanceInr || 0) + amountInr;
    return this.updateUser({ walletBalanceInr: newBalance });
  },

  logout(): void {
    // Return to Maya or keep signed out
    this.setCurrentUser(SEED_USERS[0]);
  },
};
