import axios from 'axios';
import { API_BASE_URL } from '../config';

/**
 * Settings API utility
 */
const settingsApi = {
    /**
     * Get admin settings
     * @param {string} token - JWT token
     */
    getSettings: async (token) => {
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };
        const { data } = await axios.get(`${API_BASE_URL}/api/admin/settings`, config);
        return data;
    },

    /**
     * Update admin settings
     * @param {object} settings - Settings object to update
     * @param {string} token - JWT token
     */
    updateSettings: async (settings, token) => {
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };
        const { data } = await axios.patch(`${API_BASE_URL}/api/admin/settings`, settings, config);
        return data;
    }
};

export default settingsApi;
