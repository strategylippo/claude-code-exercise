// Auth Manager with token refresh bugs

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // timestamp in ms
  refreshExpiresAt: number;
}

interface AuthState {
  isAuthenticated: boolean;
  tokenData: TokenData | null;
  user: { id: string; email: string } | null;
}

type AuthCallback = (state: AuthState) => void;

// Simulated auth API
async function refreshAccessToken(refreshToken: string): Promise<TokenData> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (!refreshToken || refreshToken === 'expired') {
    throw new Error('Refresh token expired');
  }

  const now = Date.now();
  return {
    accessToken: `access-${now}`,
    refreshToken: `refresh-${now}`,
    expiresAt: now + 15 * 60 * 1000, // 15 minutes
    refreshExpiresAt: now + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

export class AuthManager {
  private state: AuthState = {
    isAuthenticated: false,
    tokenData: null,
    user: null,
  };

  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners: Set<AuthCallback> = new Set();

  // BUG 1: Refresh threshold is calculated wrong
  private readonly REFRESH_THRESHOLD = 0.8; // Should refresh at 80% of expiry

  async login(email: string, password: string): Promise<boolean> {
    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (password.length < 6) {
      return false;
    }

    const now = Date.now();
    this.state = {
      isAuthenticated: true,
      tokenData: {
        accessToken: `access-${now}`,
        refreshToken: `refresh-${now}`,
        expiresAt: now + 15 * 60 * 1000,
        refreshExpiresAt: now + 7 * 24 * 60 * 60 * 1000,
      },
      user: { id: 'user-1', email },
    };

    this.scheduleRefresh();
    this.notifyListeners();

    return true;
  }

  logout(): void {
    // BUG 2: Timer is not always cleared properly
    this.state = {
      isAuthenticated: false,
      tokenData: null,
      user: null,
    };
    // Missing: clearTimeout(this.refreshTimer)
    this.notifyListeners();
  }

  private scheduleRefresh(): void {
    if (!this.state.tokenData) return;

    // BUG 3: Doesn't clear existing timer before setting new one
    // This can cause multiple refresh timers running simultaneously

    const now = Date.now();
    const expiresAt = this.state.tokenData.expiresAt;

    // BUG 4: Wrong calculation - this calculates time until expiry, not 80% of it
    const timeUntilRefresh = (expiresAt - now) * this.REFRESH_THRESHOLD;

    // BUG 5: Doesn't handle case where token is already past refresh threshold
    this.refreshTimer = setTimeout(() => {
      this.performRefresh();
    }, timeUntilRefresh);
  }

  private async performRefresh(): Promise<void> {
    if (!this.state.tokenData?.refreshToken) {
      this.logout();
      return;
    }

    // BUG 6: No protection against concurrent refresh attempts
    try {
      const newTokenData = await refreshAccessToken(
        this.state.tokenData.refreshToken
      );

      this.state = {
        ...this.state,
        tokenData: newTokenData,
      };

      // BUG 7: scheduleRefresh is called, but if it fails silently,
      // user will be logged out at original expiry time
      this.scheduleRefresh();
      this.notifyListeners();
    } catch {
      // BUG 8: Error handling logs user out without checking if
      // the error is recoverable (e.g., network error vs expired token)
      this.logout();
    }
  }

  async getAccessToken(): Promise<string | null> {
    if (!this.state.tokenData) return null;

    const now = Date.now();

    // BUG 9: This check doesn't account for clock skew or network latency
    if (now >= this.state.tokenData.expiresAt) {
      // Token expired, try to refresh
      await this.performRefresh();
    }

    return this.state.tokenData?.accessToken || null;
  }

  isTokenExpired(): boolean {
    if (!this.state.tokenData) return true;

    // BUG 10: Should include buffer time for network latency
    return Date.now() >= this.state.tokenData.expiresAt;
  }

  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  subscribe(callback: AuthCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  // For testing
  getState(): AuthState {
    return this.state;
  }

  setTokenForTesting(tokenData: TokenData): void {
    this.state.tokenData = tokenData;
    this.state.isAuthenticated = true;
  }
}
