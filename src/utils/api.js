/**
 * Centralized Axios instance.
 * - Reads JWT from localStorage automatically on every request.
 * - Handles 401 responses by clearing stale user data.
 */
import axios from "axios";
import { API_BASE_URL } from "../config";

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// ── Request interceptor: attach fresh JWT from localStorage ──────────────────
api.interceptors.request.use(
    (config) => {
        try {
            const raw = localStorage.getItem("userInfo");
            if (raw) {
                const { token } = JSON.parse(raw);
                if (token) config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (_) {
            // Malformed localStorage – ignore
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 gracefully ──────────────────────────────
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("[API] 401 Unauthorized – clearing stale token");
            localStorage.removeItem("userInfo");
            // Optionally force redirect to login
            // window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default api;
