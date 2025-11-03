import { useState, useEffect, useCallback } from "react";

export function useAutoRefresh(callback: () => void, interval: number = 30000) {
  // State đếm ngược
  const [countdown, setCountdown] = useState(interval / 1000);
  const [isPaused, setIsPaused] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(() => {
    callback();
    setLastUpdated(new Date());
    setCountdown(interval / 1000);
  }, [callback, interval]);

  useEffect(() => {
    if (isPaused) return;

    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return interval / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    // Mỗi 30s chạy hàm
    const refreshTimer = setInterval(() => {
      refresh();
    }, interval);

    refresh();

    return () => {
      clearInterval(countdownTimer);
      clearInterval(refreshTimer);
    };
  }, [interval, isPaused, refresh]);

  return {
    countdown,
    isPaused,
    lastUpdated,
    pause: () => setIsPaused(true),
    resume: () => setIsPaused(false),
    refresh,
  };
}
