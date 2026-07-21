import { useEffect } from 'react';
import axios from 'axios';

const ACTIVITY_TIMESTAMP_KEY = 'lastActivityTime';
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const CHECK_INTERVAL_MS = 60 * 1000;

const getLastActivity = (): number | null => {
  const stored = localStorage.getItem(ACTIVITY_TIMESTAMP_KEY);
  return stored ? Number(stored) : null;
};

const isIdle = (): boolean => {
  const last = getLastActivity();
  if (!last) return true;
  return Date.now() - last > IDLE_TIMEOUT_MS;
};

const logOutAndRedirect = () => {
  localStorage.clear();
  if (window.location.pathname !== '/auth') {
    window.location.href = '/auth';
  }
};

const attemptTokenRefresh = async (): Promise<boolean> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/User/refresh-token`,
      { refreshToken },
    );
    const newToken: string = data.token ?? data.accessToken;
    const expiresAt = Date.now() + (data.tokenExpiresIn ?? 3600) * 1000;

    localStorage.setItem('token', newToken);
    localStorage.setItem('refreshToken', data.refreshToken ?? refreshToken);
    localStorage.setItem('accessTokenExpiresAt', String(expiresAt));

    axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    return true;
  } catch {
    return false;
  }
};

export const useTokenRefresh = () => {
  useEffect(() => {
    const check = async () => {
      const expiresAt = Number(localStorage.getItem('accessTokenExpiresAt'));
      const refreshToken = localStorage.getItem('refreshToken');

      if (!expiresAt || !refreshToken) return;

      const isExpired = Date.now() >= expiresAt;

      if (!isExpired) return;

      if (isIdle()) {
        logOutAndRedirect();
        return;
      }

      const refreshed = await attemptTokenRefresh();
      if (!refreshed) {
        logOutAndRedirect();
      }
    };

    const handleActivity = () => {
      localStorage.setItem(ACTIVITY_TIMESTAMP_KEY, String(Date.now()));
    };

    window.addEventListener('mousedown', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });
    window.addEventListener('scroll', handleActivity, { passive: true });

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, []);
};
