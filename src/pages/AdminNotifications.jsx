import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import { connectSocket, disconnectSocket } from '../utils/socket';
import api from '../utils/api.js';
import './AdminNotifications.css';

const AdminNotifications = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [counts, setCounts] = useState({ total: 0, read: 0, unread: 0 });
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [showCompose, setShowCompose] = useState(false);
    const [sending, setSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);
    const [form, setForm] = useState({ title: '', message: '', type: 'system', recipientId: '' });

    const fetchNotifications = useCallback(async (isReset = false, currentPage = page) => {
        try {
            if (isReset) {
                setLoading(true);
            }
            
            const { data } = await api.get("/notifications/admin", {
                params: { status: filter, page: currentPage, limit: 10 }
            });

            if (isReset) {
                setNotifications(data.notifications);
                setSelectedIds([]); // Clear selection on reset
            } else {
                setNotifications(prev => {
                    const newNotifs = data.notifications.filter(
                        newNotif => !prev.some(oldNotif => oldNotif._id === newNotif._id)
                    );
                    return [...prev, ...newNotifs];
                });
            }

            setCounts(data.counts);
            setHasMore(data.hasMore);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [user.token, filter, page]);

    // Initial load and filter change
    useEffect(() => {
        setPage(1);
        fetchNotifications(true, 1);
    }, [filter]);

    // Page change logic
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNotifications(false, nextPage);
    };

    useEffect(() => {
        if (!user) return;

        const socket = connectSocket(user.token);

        socket.on("notification:new", (newNotif) => {
            // Prepend if filter matches or is "all"
            setNotifications(prev => {
                const alreadyExists = prev.some(n => n._id === newNotif._id);
                if (alreadyExists) return prev;

                if (filter === 'read') return prev;
                return [newNotif, ...prev];
            });
            
            setCounts(prev => ({
                ...prev,
                total: prev.total + 1,
                unread: prev.unread + 1
            }));

            // Show browser notification if permitted
            if (Notification.permission === "granted") {
                new window.Notification(newNotif.title, { body: newNotif.message });
            }
        });

        return () => {
            disconnectSocket();
        };
    }, [user, filter]);

    const markAsRead = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            await api.patch(`/notifications/${id}/read`, {});
            // Refresh counts and list
            fetchNotifications(true, 1);
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch("/notifications/read-all", {});
            // Refresh counts and list
            fetchNotifications(true, 1);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (id, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm("Delete this notification?")) return;
        try {
            await api.delete(`/notifications/${id}`);
            fetchNotifications(true, 1);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Delete ${selectedIds.length} selected notifications?`)) return;
        try {
            await api.post("/notifications/delete-multiple", { ids: selectedIds });
            fetchNotifications(true, 1);
            setSelectedIds([]);
        } catch (error) {
            console.error('Error deleting selected:', error);
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm("DANGER: Delete ALL notifications? This cannot be undone.")) return;
        try {
            await api.delete("/notifications/delete-all");
            fetchNotifications(true, 1);
            setSelectedIds([]);
        } catch (error) {
            console.error('Error deleting all:', error);
        }
    };

    const toggleSelect = (id, e) => {
        if (e) e.stopPropagation();
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === notifications.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(notifications.map(n => n._id));
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await api.post("/notifications/send", {
                title: form.title,
                message: form.message,
                type: form.type,
                recipientId: form.recipientId.trim() || null,
            });
            setSendSuccess(true);
            setForm({ title: '', message: '', type: 'system', recipientId: '' });
            
            // Refresh notifications to show the sent one if admin
            fetchNotifications(true, 1);

            setTimeout(() => { setSendSuccess(false); setShowCompose(false); }, 2000);
        } catch (error) {
            console.error('Error sending notification:', error);
            alert('Failed to send notification: ' + (error.response?.data?.message || error.message));
        } finally {
            setSending(false);
        }
    };

    const handleNotifClick = (notif) => {
        if (!notif.isRead) markAsRead(notif._id);

        if (notif.type === 'order_created' || notif.type === 'order_status_changed' || notif.type === 'payment_updated') {
            navigate(`/admin/orders/${notif.meta.orderId}`);
        } else if (notif.type === 'low_stock') {
            navigate(`/admin/products/${notif.meta.productId}`);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order_created': return <div className="notif-icon icon-order">📦</div>;
            case 'payment_updated': return <div className="notif-icon icon-payment">💵</div>;
            case 'order_status_changed': return <div className="notif-icon icon-status">⏳</div>;
            case 'low_stock': return <div className="notif-icon icon-stock">⚠️</div>;
            default: return <div className="notif-icon">🔔</div>;
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const past = new Date(date);
        const diffInMs = now - past;
        const diffInMin = Math.floor(diffInMs / 60000);

        if (diffInMin < 1) return 'Just now';
        if (diffInMin < 60) return `${diffInMin}m ago`;

        const diffInHours = Math.floor(diffInMin / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        return past.toLocaleDateString();
    };

    return (
        <AdminLayout pageTitle="Notifications" pageSubtitle="Real-time alerts and activity logs">
            <div className="notifications-container">
                <div className="notif-header">
                    <div className="notif-title-section">
                        <h1>Inbox</h1>
                        {counts.unread > 0 && <span className="unread-badge">{counts.unread} New</span>}
                    </div>
                    <div className="notif-actions">
                        <div className="notif-tabs">
                            <button className={`tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                                All ({counts.total})
                            </button>
                            <button className={`tab-btn ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
                                Unread ({counts.unread})
                            </button>
                            <button className={`tab-btn ${filter === 'read' ? 'active' : ''}`} onClick={() => setFilter('read')}>
                                Read ({counts.read})
                            </button>
                        </div>
                        <div style={{ display:'flex', gap:'0.5rem' }}>
                            <button className="btn-mark-all" onClick={markAllAsRead}>Mark all read</button>
                            {selectedIds.length > 0 && (
                                <button className="btn-delete-selected" onClick={handleDeleteSelected} style={{ background:'#fee2e2', color:'#ef4444', border:'1px solid #fecaca', padding:'0.45rem 1rem', borderRadius:'6px', cursor:'pointer' }}>
                                    🗑 Delete ({selectedIds.length})
                                </button>
                            )}
                            <button className="btn-delete-all" onClick={handleDeleteAll} style={{ background:'#fff', color:'#6b7280', border:'1px solid #d1d5db', padding:'0.45rem 1rem', borderRadius:'6px', cursor:'pointer' }}>
                                Clear All
                            </button>
                            <button
                                onClick={() => setShowCompose(v => !v)}
                                style={{ padding:'0.45rem 1rem', borderRadius:'6px', background: showCompose ? '#e0e7ff' : '#4338ca', color: showCompose ? '#4338ca' : '#fff', fontWeight:700, border:'none', cursor:'pointer', fontSize:'0.85rem' }}
                            >
                                {showCompose ? '✕ Close' : '✉️ Send Notification'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="selection-bar" style={{ padding:'0.5rem 1rem', background:'#f9fafb', borderBottom:'1px solid #e5e7eb', display:'flex', alignItems:'center', gap:'1rem', fontSize:'0.85rem' }}>
                    <input 
                        type="checkbox" 
                        checked={notifications.length > 0 && selectedIds.length === notifications.length} 
                        onChange={toggleSelectAll} 
                        style={{ cursor:'pointer' }}
                    />
                    <span style={{ color:'#4b5563' }}>Select All Visible</span>
                </div>

                {/* Compose Panel */}
                {/* ... existing compose panel code ... */}
                {showCompose && (
                    <form onSubmit={handleSend} style={{ background:'#f8faff', border:'1px solid #c7d7fe', borderRadius:'12px', padding:'1.25rem 1.5rem', marginBottom:'1.25rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                        {/* ... form content ... */}
                        <h3 style={{ margin:0, fontSize:'1rem', color:'#3730a3', fontWeight:700 }}>📣 Send Notification to Users</h3>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                            <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                                <label style={{ fontSize:'0.8rem', fontWeight:600, color:'#374151' }}>Title *</label>
                                <input
                                    required
                                    placeholder="e.g. Flash Sale Live!"
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    style={{ padding:'0.5rem 0.75rem', borderRadius:'6px', border:'1px solid #c7d7fe', fontSize:'0.9rem', outline:'none' }}
                                />
                            </div>
                            <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                                <label style={{ fontSize:'0.8rem', fontWeight:600, color:'#374151' }}>Type</label>
                                <select
                                    value={form.type}
                                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                                    style={{ padding:'0.5rem 0.75rem', borderRadius:'6px', border:'1px solid #c7d7fe', fontSize:'0.9rem', background:'#fff' }}
                                >
                                    <option value="system">🔔 System</option>
                                    <option value="order">📦 Order</option>
                                    <option value="payment">💰 Payment</option>
                                    <option value="stock">📉 Stock</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                            <label style={{ fontSize:'0.8rem', fontWeight:600, color:'#374151' }}>Message *</label>
                            <textarea
                                required
                                rows={3}
                                placeholder="Notification message..."
                                value={form.message}
                                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                style={{ padding:'0.5rem 0.75rem', borderRadius:'6px', border:'1px solid #c7d7fe', fontSize:'0.9rem', resize:'vertical', outline:'none' }}
                            />
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                            <label style={{ fontSize:'0.8rem', fontWeight:600, color:'#374151' }}>User ID <span style={{color:'#6b7280',fontWeight:400}}>(leave blank to broadcast to ALL users)</span></label>
                            <input
                                placeholder="MongoDB ObjectId of specific user (optional)"
                                value={form.recipientId}
                                onChange={e => setForm(f => ({ ...f, recipientId: e.target.value }))}
                                style={{ padding:'0.5rem 0.75rem', borderRadius:'6px', border:'1px solid #c7d7fe', fontSize:'0.9rem', outline:'none' }}
                            />
                        </div>
                        <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
                            <button
                                type="submit"
                                disabled={sending || sendSuccess}
                                style={{ padding:'0.55rem 1.5rem', borderRadius:'6px', background: sendSuccess ? '#16a34a' : '#4338ca', color:'#fff', fontWeight:700, border:'none', cursor:'pointer', fontSize:'0.9rem', transition:'all 0.2s' }}
                            >
                                {sending ? 'Sending...' : sendSuccess ? '✓ Sent!' : 'Send Now'}
                            </button>
                            {sendSuccess && <span style={{ color:'#16a34a', fontSize:'0.85rem', fontWeight:600 }}>Notification delivered to users ✓</span>}
                        </div>
                    </form>
                )}

                <div className="notif-list">
                    {loading && notifications.length === 0 ? (
                        <div className="loader-container">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                        <div className="empty-state">
                            <span style={{ fontSize: '3rem' }}>📭</span>
                            <p>No notifications found</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif._id}
                                className={`notif-item ${!notif.isRead ? 'unread' : ''} ${selectedIds.includes(notif._id) ? 'selected' : ''}`}
                                onClick={() => handleNotifClick(notif)}
                                style={{ display:'flex', alignItems:'center', gap:'1rem' }}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={selectedIds.includes(notif._id)} 
                                    onChange={(e) => toggleSelect(notif._id, e)}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ width:'18px', height:'18px', cursor:'pointer' }}
                                />
                                {!notif.isRead && <span className="unread-dot"></span>}
                                {getIcon(notif.type)}
                                <div className="notif-content" style={{ flex: 1 }}>
                                    <h3 className="notif-title">{notif.title}</h3>
                                    <p className="notif-message">{notif.message}</p>
                                    <span className="notif-time">{formatTime(notif.createdAt)}</span>
                                </div>
                                <div className="item-actions" style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                                    {!notif.isRead && (
                                        <button className="btn-read-toggle" onClick={(e) => markAsRead(notif._id, e)}>
                                            Mark read
                                        </button>
                                    )}
                                    <button 
                                        className="btn-delete-item" 
                                        onClick={(e) => handleDelete(notif._id, e)}
                                        style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1.2rem', padding:'0.5rem', borderRadius:'50%', transition:'background 0.2s' }}
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {hasMore && !loading && (
                    <button className="btn-load-more" onClick={handleLoadMore}>
                        Load More
                    </button>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminNotifications;
