import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import settingsApi from '../api/settingsApi';
import './AdminSettings.css';

const AdminSettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('store');
    const [showToast, setShowToast] = useState(false);
    const [errors, setErrors] = useState({});

    const [settings, setSettings] = useState({
        store: { storeName: '', supportEmail: '', supportPhone: '', address: '', currency: 'INR', timezone: 'Asia/Kolkata' },
        orders: { autoCancelUnpaidHours: 24, allowCOD: true, defaultOrderStatus: 'Placed', enableReturns: true, returnWindowDays: 7 },
        payments: { enableUPI: true, enableCard: true, enableCOD: true, taxPercent: 18, shippingFee: 50 },
        notifications: { enableRealtime: true, lowStockThreshold: 10, notifyOnNewOrder: true, notifyOnPaymentUpdate: true, notifyOnOrderStatusChange: true },
        security: { requireStrongPassword: true, sessionTimeoutMinutes: 30, allowMultipleSessions: false }
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await settingsApi.getSettings(user.token);
                if (data) setSettings(data);
            } catch (err) {
                console.error("Failed to fetch settings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [user.token]);

    const handleChange = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
        // Clear error when field changes
        if (errors[`${section}.${field}`]) {
            const newErrors = { ...errors };
            delete newErrors[`${section}.${field}`];
            setErrors(newErrors);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (settings.payments.taxPercent < 0 || settings.payments.taxPercent > 100) {
            newErrors['payments.taxPercent'] = "Tax must be 0-100%";
        }
        if (settings.payments.shippingFee < 0) {
            newErrors['payments.shippingFee'] = "Shipping cannot be negative";
        }
        if (settings.orders.autoCancelUnpaidHours < 0 || settings.orders.autoCancelUnpaidHours > 168) {
            newErrors['orders.autoCancelUnpaidHours'] = "Hours must be 0-168";
        }
        if (settings.orders.returnWindowDays < 0 || settings.orders.returnWindowDays > 365) {
            newErrors['orders.returnWindowDays'] = "Days must be 0-365";
        }
        if (settings.notifications.lowStockThreshold < 0 || settings.notifications.lowStockThreshold > 10000) {
            newErrors['notifications.lowStockThreshold'] = "Limit must be 0-10000";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setSaving(true);
        try {
            await settingsApi.updateSettings(settings, user.token);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (err) {
            console.error("Failed to update settings:", err);
            alert(err.response?.data?.message || "Error updating settings");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset to default settings?")) {
            const defaultSettings = {
                store: { storeName: "ProfitPulse Store", supportEmail: "support@profitpulse.com", supportPhone: "+91-1234567890", address: "123 Business Avenue", currency: "INR", timezone: "Asia/Kolkata" },
                orders: { autoCancelUnpaidHours: 24, allowCOD: true, defaultOrderStatus: "Placed", enableReturns: true, returnWindowDays: 7 },
                payments: { enableUPI: true, enableCard: true, enableCOD: true, taxPercent: 18, shippingFee: 50 },
                notifications: { enableRealtime: true, lowStockThreshold: 10, notifyOnNewOrder: true, notifyOnPaymentUpdate: true, notifyOnOrderStatusChange: true },
                security: { requireStrongPassword: true, sessionTimeoutMinutes: 30, allowMultipleSessions: false }
            };
            setSettings(defaultSettings);
            setErrors({});
        }
    };

    const Toggle = ({ label, value, onChange }) => (
        <div className="setting-toggle-item">
            <span className="toggle-label">{label}</span>
            <button
                className={`toggle-switch ${value ? 'on' : 'off'}`}
                onClick={() => onChange(!value)}
            >
                <span className="toggle-knob"></span>
            </button>
        </div>
    );

    if (loading) return (
        <AdminLayout pageTitle="Settings" pageSubtitle="Configuring system preferences">
            <div className="settings-loading">Loading configuration...</div>
        </AdminLayout>
    );

    return (
        <AdminLayout pageTitle="Settings" pageSubtitle="Control your store's behavior and environment">
            <div className="settings-container">
                <div className="settings-tabs">
                    <button className={`tab-link ${activeTab === 'store' ? 'active' : ''}`} onClick={() => setActiveTab('store')}>Store</button>
                    <button className={`tab-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Orders</button>
                    <button className={`tab-link ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>Payments</button>
                    <button className={`tab-link ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>Alerts</button>
                    <button className={`tab-link ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>Security</button>
                </div>

                <div className="settings-content-card">
                    {activeTab === 'store' && (
                        <div className="settings-section">
                            <h3>Store Identity</h3>
                            <div className="setting-grid">
                                <div className="form-group">
                                    <label>Store Name</label>
                                    <input type="text" value={settings.store.storeName} onChange={(e) => handleChange('store', 'storeName', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Support Email</label>
                                    <input type="email" value={settings.store.supportEmail} onChange={(e) => handleChange('store', 'supportEmail', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Support Phone</label>
                                    <input type="text" value={settings.store.supportPhone} onChange={(e) => handleChange('store', 'supportPhone', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Currency</label>
                                    <select value={settings.store.currency} onChange={(e) => handleChange('store', 'currency', e.target.value)}>
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                    </select>
                                </div>
                                <div className="form-group span-2">
                                    <label>Store Address</label>
                                    <textarea value={settings.store.address} onChange={(e) => handleChange('store', 'address', e.target.value)} rows="2"></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="settings-section">
                            <h3>Order Workflow</h3>
                            <div className="setting-grid">
                                <div className="form-group">
                                    <label>Auto-cancel Unpaid Orders (Hours)</label>
                                    <input type="number" value={settings.orders.autoCancelUnpaidHours} onChange={(e) => handleChange('orders', 'autoCancelUnpaidHours', parseInt(e.target.value))} />
                                    {errors['orders.autoCancelUnpaidHours'] && <span className="error-text">{errors['orders.autoCancelUnpaidHours']}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Default Status</label>
                                    <select value={settings.orders.defaultOrderStatus} onChange={(e) => handleChange('orders', 'defaultOrderStatus', e.target.value)}>
                                        <option value="Placed">Placed</option>
                                        <option value="Processing">Processing</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Return Window (Days)</label>
                                    <input type="number" value={settings.orders.returnWindowDays} onChange={(e) => handleChange('orders', 'returnWindowDays', parseInt(e.target.value))} />
                                    {errors['orders.returnWindowDays'] && <span className="error-text">{errors['orders.returnWindowDays']}</span>}
                                </div>
                            </div>
                            <div className="toggle-list">
                                <Toggle label="Enable Returns & Exchange" value={settings.orders.enableReturns} onChange={(val) => handleChange('orders', 'enableReturns', val)} />
                                <Toggle label="Allow Cash on Delivery (COD)" value={settings.orders.allowCOD} onChange={(val) => handleChange('orders', 'allowCOD', val)} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="settings-section">
                            <h3>Financial Rules</h3>
                            <div className="setting-grid">
                                <div className="form-group">
                                    <label>Tax Percentage (%)</label>
                                    <input type="number" value={settings.payments.taxPercent} onChange={(e) => handleChange('payments', 'taxPercent', parseFloat(e.target.value))} />
                                    {errors['payments.taxPercent'] && <span className="error-text">{errors['payments.taxPercent']}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Flat Shipping Fee</label>
                                    <input type="number" value={settings.payments.shippingFee} onChange={(e) => handleChange('payments', 'shippingFee', parseFloat(e.target.value))} />
                                    {errors['payments.shippingFee'] && <span className="error-text">{errors['payments.shippingFee']}</span>}
                                </div>
                            </div>
                            <div className="toggle-list">
                                <Toggle label="Accept UPI Payments" value={settings.payments.enableUPI} onChange={(val) => handleChange('payments', 'enableUPI', val)} />
                                <Toggle label="Accept Credit/Debit Cards" value={settings.payments.enableCard} onChange={(val) => handleChange('payments', 'enableCard', val)} />
                                <Toggle label="Enable COD Globally" value={settings.payments.enableCOD} onChange={(val) => handleChange('payments', 'enableCOD', val)} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="settings-section">
                            <h3>Alerts & Push</h3>
                            <div className="setting-grid">
                                <div className="form-group">
                                    <label>Low Stock Threshold</label>
                                    <input type="number" value={settings.notifications.lowStockThreshold} onChange={(e) => handleChange('notifications', 'lowStockThreshold', parseInt(e.target.value))} />
                                    {errors['notifications.lowStockThreshold'] && <span className="error-text">{errors['notifications.lowStockThreshold']}</span>}
                                </div>
                            </div>
                            <div className="toggle-list">
                                <Toggle label="Enable Real-time WebSockets" value={settings.notifications.enableRealtime} onChange={(val) => handleChange('notifications', 'enableRealtime', val)} />
                                <Toggle label="Notify on New Order" value={settings.notifications.notifyOnNewOrder} onChange={(val) => handleChange('notifications', 'notifyOnNewOrder', val)} />
                                <Toggle label="Notify on Payment Updates" value={settings.notifications.notifyOnPaymentUpdate} onChange={(val) => handleChange('notifications', 'notifyOnPaymentUpdate', val)} />
                                <Toggle label="Notify on Order Status Change" value={settings.notifications.notifyOnOrderStatusChange} onChange={(val) => handleChange('notifications', 'notifyOnOrderStatusChange', val)} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="settings-section">
                            <h3>Security & Auth</h3>
                            <div className="setting-grid">
                                <div className="form-group">
                                    <label>Session Timeout (Minutes)</label>
                                    <input type="number" value={settings.security.sessionTimeoutMinutes} onChange={(e) => handleChange('security', 'sessionTimeoutMinutes', parseInt(e.target.value))} />
                                </div>
                            </div>
                            <div className="toggle-list">
                                <Toggle label="Require Strong Passwords" value={settings.security.requireStrongPassword} onChange={(val) => handleChange('security', 'requireStrongPassword', val)} />
                                <Toggle label="Allow Multiple Sessions" value={settings.security.allowMultipleSessions} onChange={(val) => handleChange('security', 'allowMultipleSessions', val)} />
                            </div>
                        </div>
                    )}

                    <div className="settings-actions">
                        <button className="reset-btn" onClick={handleReset} disabled={saving}>Reset to Default</button>
                        <button className="save-btn" onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>

            {showToast && (
                <div className="settings-toast success">
                    <span>✅</span> Settings updated successfully!
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminSettings;
