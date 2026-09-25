import { useState, useEffect, useCallback } from 'react';
import { wakeLockManager } from '../utils/wakeLock';

export function useScreenWakeLock() {
  const [isWakeLockActive, setIsWakeLockActive] = useState<boolean>(() => wakeLockManager.isActive());

  useEffect(() => {
    const unsubscribe = wakeLockManager.subscribe((active) => {
      setIsWakeLockActive(active);
    });

    return () => {
      unsubscribe();
      // Ensure wake lock is released when unmounting
      wakeLockManager.release();
    };
  }, []);

  const requestWakeLock = useCallback(async () => {
    return await wakeLockManager.request();
  }, []);

  const releaseWakeLock = useCallback(async () => {
    await wakeLockManager.release();
  }, []);

  return {
    isWakeLockActive,
    requestWakeLock,
    releaseWakeLock,
  };
}
