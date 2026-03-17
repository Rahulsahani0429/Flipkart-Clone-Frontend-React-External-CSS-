/**
 * axiosSetup.js
 * Global Axios interceptor — auto-logout on 401 from PROTECTED routes.
 * Skips /api/auth/login and /api/auth/register (wrong credentials returns 401 there normally).
 */
import axios from 'axios';

const AUTH_ENDPOINTS = ['/api/auth/login', '/api/auth/register'];

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        const isAuthEndpoint = AUTH_ENDPOINTS.some(ep => url.includes(ep));

        if (error.response?.status === 401 && !isAuthEndpoint) {
            localStorage.removeItem('userInfo');
            localStorage.removeItem('selectedCartItemIds');

            if (!window.location.pathname.startsWith('/login') &&
                !window.location.pathname.startsWith('/register')) {
                window.location.href = '/login?session=expired';
            }
        }
        return Promise.reject(error);
    }
);
