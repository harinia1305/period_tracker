export interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  givenName: string;
  familyName: string;
  picture: string;
  verifiedEmail: boolean;
  accessToken: string;
}

export const PRECONFIGURED_GOOGLE_ACCOUNTS: GoogleUserProfile[] = [
  {
    id: 'goog_maya_01',
    email: 'maya.patel@gmail.com',
    name: 'Maya Patel',
    givenName: 'Maya',
    familyName: 'Patel',
    picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    verifiedEmail: true,
    accessToken: 'ya29.a0AfH6SMC_maya_period_love_verified',
  },
  {
    id: 'goog_priya_02',
    email: 'priya.sharma.delivery@gmail.com',
    name: 'Priya Sharma',
    givenName: 'Priya',
    familyName: 'Sharma',
    picture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    verifiedEmail: true,
    accessToken: 'ya29.a0AfH6SMC_priya_partner_verified',
  },
  {
    id: 'goog_aarohi_03',
    email: 'aarohi.sen.ops@gmail.com',
    name: 'Aarohi Sen',
    givenName: 'Aarohi',
    familyName: 'Sen',
    picture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    verifiedEmail: true,
    accessToken: 'ya29.a0AfH6SMC_aarohi_admin_verified',
  },
];

const GOOGLE_AUTH_SESSION_KEY = 'period_love_google_auth_user';

export const googleAuthService = {
  getStoredGoogleUser(): GoogleUserProfile | null {
    try {
      const raw = localStorage.getItem(GOOGLE_AUTH_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setStoredGoogleUser(profile: GoogleUserProfile | null): void {
    if (!profile) {
      localStorage.removeItem(GOOGLE_AUTH_SESSION_KEY);
    } else {
      localStorage.setItem(GOOGLE_AUTH_SESSION_KEY, JSON.stringify(profile));
    }
  },

  async signInWithGoogleAccount(profile: GoogleUserProfile): Promise<GoogleUserProfile> {
    // Simulate slight network delay of Google OAuth token exchange
    await new Promise(res => setTimeout(res, 350));
    this.setStoredGoogleUser(profile);
    return profile;
  },

  async signInWithCustomGoogle(email: string, name: string): Promise<GoogleUserProfile> {
    await new Promise(res => setTimeout(res, 400));
    const customUser: GoogleUserProfile = {
      id: `goog_cust_${Date.now()}`,
      email: email.trim().toLowerCase(),
      name: name.trim() || email.split('@')[0],
      givenName: (name.trim() || email).split(' ')[0],
      familyName: (name.trim() || email).split(' ')[1] || '',
      picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
      verifiedEmail: true,
      accessToken: `ya29.custom_${Date.now()}`,
    };
    this.setStoredGoogleUser(customUser);
    return customUser;
  },

  signOut(): void {
    localStorage.removeItem(GOOGLE_AUTH_SESSION_KEY);
  },
};
