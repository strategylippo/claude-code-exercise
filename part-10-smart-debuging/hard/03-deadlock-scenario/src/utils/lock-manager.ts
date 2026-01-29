// Lock Manager - simulates database/distributed locks

interface LockInfo {
  holder: string;
  acquiredAt: Date;
  waiters: Array<{
    resolve: () => void;
    reject: (error: Error) => void;
  }>;
}

export class LockManager {
  private locks: Map<string, LockInfo> = new Map();
  private lockAcquisitions: string[] = []; // Track order for debugging

  // BUG: No timeout on lock acquisition
  async acquire(lockId: string, holderId: string): Promise<void> {
    const existingLock = this.locks.get(lockId);

    if (existingLock) {
      if (existingLock.holder === holderId) {
        // Re-entrant lock (same holder)
        return;
      }

      // BUG: Wait forever for lock - can cause deadlock
      return new Promise((resolve, reject) => {
        existingLock.waiters.push({ resolve, reject });
      });
    }

    // Acquire the lock
    this.locks.set(lockId, {
      holder: holderId,
      acquiredAt: new Date(),
      waiters: [],
    });

    this.lockAcquisitions.push(`${holderId}:${lockId}`);
  }

  release(lockId: string, holderId: string): void {
    const lock = this.locks.get(lockId);

    if (!lock || lock.holder !== holderId) {
      return; // Not holding this lock
    }

    // Check for waiters
    if (lock.waiters.length > 0) {
      const nextWaiter = lock.waiters.shift()!;
      // Transfer lock to next waiter (but keep same lock object)
      lock.holder = 'next-holder'; // BUG: Should be actual waiter ID
      lock.acquiredAt = new Date();
      nextWaiter.resolve();
    } else {
      this.locks.delete(lockId);
    }
  }

  isLocked(lockId: string): boolean {
    return this.locks.has(lockId);
  }

  getLockHolder(lockId: string): string | null {
    return this.locks.get(lockId)?.holder || null;
  }

  getAcquisitionLog(): string[] {
    return [...this.lockAcquisitions];
  }

  clearAll(): void {
    // BUG: Doesn't reject waiters!
    this.locks.clear();
    this.lockAcquisitions = [];
  }

  getActiveLocksCount(): number {
    return this.locks.size;
  }

  getWaitersCount(lockId: string): number {
    return this.locks.get(lockId)?.waiters.length || 0;
  }
}

export const lockManager = new LockManager();
