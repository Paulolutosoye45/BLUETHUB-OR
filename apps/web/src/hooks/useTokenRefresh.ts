// useTokenRefresh.ts
import { useEffect } from 'react';
import axios from 'axios';

export const useTokenRefresh = () => {
    useEffect(() => {
        const check = async () => {
            const expiresAt = Number(localStorage.getItem('accessTokenExpiresAt'));
            const refreshToken = localStorage.getItem('refreshToken');

            if (!expiresAt || !refreshToken) return;

            const twoMinutes = 2 * 60 * 1000;
            const timeUntilExpiry = expiresAt - Date.now();

            if (timeUntilExpiry < twoMinutes) {
                try {
                    const { data } = await axios.post(
                        `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh-token`,
                        { refreshToken }
                    );
                    localStorage.setItem('accessToken', data.token);
                    localStorage.setItem('refreshToken', data.refreshToken);
                    localStorage.setItem(
                        'accessTokenExpiresAt',
                        String(Date.now() + data.tokenExpiresIn * 1000)
                    );
                } catch {
                    localStorage.clear();
                    window.location.href = '/auth';
                }
            }
        };

        check(); // run immediately on mount
        const interval = setInterval(check, 60_000); // then every 60 seconds
        return () => clearInterval(interval);
    }, []); // safe — reads from localStorage, no stale closure
};