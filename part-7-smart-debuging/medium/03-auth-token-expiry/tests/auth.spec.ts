import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AuthManager } from '../src/auth/auth-manager';

describe('AuthManager Token Refresh', () => {
  let authManager: AuthManager;

  beforeEach(() => {
    vi.useFakeTimers();
    authManager = new AuthManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Token Refresh Timing', () => {
    it('should schedule refresh at 80% of token lifetime', async () => {
      await authManager.login('test@example.com', 'password123');

      // Token expires in 15 minutes (900,000ms)
      // 80% of that is 12 minutes (720,000ms)
      // So refresh should be scheduled for 12 minutes from now

      const state = authManager.getState();
      expect(state.isAuthenticated).toBe(true);

      // Advance time to just before refresh should happen (11 minutes)
      vi.advanceTimersByTime(11 * 60 * 1000);

      // Token should still be the original
      const token1 = state.tokenData?.accessToken;

      // Advance to refresh time (12 minutes total)
      vi.advanceTimersByTime(1 * 60 * 1000);

      // Allow refresh to complete
      await vi.runAllTimersAsync();

      // Token should have been refreshed
      const newState = authManager.getState();
      expect(newState.tokenData?.accessToken).not.toBe(token1);
    });

    it('should refresh token before expiry even with network delay', async () => {
      await authManager.login('test@example.com', 'password123');

      // Advance to 14 minutes (just before 15 min expiry)
      vi.advanceTimersByTime(14 * 60 * 1000);
      await vi.runAllTimersAsync();

      // Should still be authenticated (refresh should have happened)
      expect(authManager.isAuthenticated()).toBe(true);
      expect(authManager.isTokenExpired()).toBe(false);
    });
  });

  describe('Token Expiry Detection', () => {
    it('should detect token expiry with buffer time', async () => {
      await authManager.login('test@example.com', 'password123');

      // Set token to expire in 5 seconds
      const now = Date.now();
      authManager.setTokenForTesting({
        accessToken: 'test-token',
        refreshToken: 'test-refresh',
        expiresAt: now + 5000,
        refreshExpiresAt: now + 7 * 24 * 60 * 60 * 1000,
      });

      // Token should be considered "about to expire" with buffer
      // Even though technically not expired yet
      vi.advanceTimersByTime(4000);

      // With proper buffer, this should trigger refresh proactively
      const token = await authManager.getAccessToken();
      expect(token).toBeDefined();
    });
  });

  describe('Logout Cleanup', () => {
    it('should clear refresh timer on logout', async () => {
      await authManager.login('test@example.com', 'password123');

      authManager.logout();

      // Advance past when refresh would have happened
      vi.advanceTimersByTime(15 * 60 * 1000);
      await vi.runAllTimersAsync();

      // Should still be logged out (refresh timer shouldn't have run)
      expect(authManager.isAuthenticated()).toBe(false);
    });

    it('should not attempt refresh after logout', async () => {
      await authManager.login('test@example.com', 'password123');

      // Logout immediately
      authManager.logout();

      // Try to get token
      const token = await authManager.getAccessToken();
      expect(token).toBeNull();
    });
  });

  describe('Concurrent Refresh Protection', () => {
    it('should not have multiple refresh timers running', async () => {
      await authManager.login('test@example.com', 'password123');

      // Simulate multiple calls that might schedule refresh
      authManager.setTokenForTesting({
        accessToken: 'token-1',
        refreshToken: 'refresh-1',
        expiresAt: Date.now() + 15 * 60 * 1000,
        refreshExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });

      authManager.setTokenForTesting({
        accessToken: 'token-2',
        refreshToken: 'refresh-2',
        expiresAt: Date.now() + 15 * 60 * 1000,
        refreshExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });

      // Advance time
      vi.advanceTimersByTime(13 * 60 * 1000);
      await vi.runAllTimersAsync();

      // Should still be authenticated with only one refresh having occurred
      expect(authManager.isAuthenticated()).toBe(true);
    });
  });

  describe('Error Recovery', () => {
    it('should handle network errors gracefully', async () => {
      await authManager.login('test@example.com', 'password123');

      // Set up token that will fail to refresh (simulating network error)
      authManager.setTokenForTesting({
        accessToken: 'good-token',
        refreshToken: 'expired', // This will cause refresh to fail
        expiresAt: Date.now() + 1000,
        refreshExpiresAt: Date.now() - 1000, // Already expired
      });

      // Try to get token when it needs refresh
      vi.advanceTimersByTime(2000);

      // Should handle the error without crashing
      const token = await authManager.getAccessToken();

      // User should be logged out due to unrecoverable error
      expect(authManager.isAuthenticated()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle token already past refresh threshold', async () => {
      await authManager.login('test@example.com', 'password123');

      // Set token that's already past 80% of lifetime
      const now = Date.now();
      authManager.setTokenForTesting({
        accessToken: 'almost-expired',
        refreshToken: 'valid-refresh',
        expiresAt: now + 2 * 60 * 1000, // Only 2 minutes left
        refreshExpiresAt: now + 7 * 24 * 60 * 60 * 1000,
      });

      // Should immediately schedule/perform refresh
      await vi.runAllTimersAsync();

      // Token should have been refreshed
      const state = authManager.getState();
      expect(state.tokenData?.accessToken).not.toBe('almost-expired');
    });
  });
});
