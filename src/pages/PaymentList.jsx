import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config';
import AdminLayout from '../components/AdminLayout';
import Avatar from '../components/Avatar';
import { useSocket } from '../context/SocketContext';
import './AdminOrders.css';

// ── Portal-based action dropdown (never clipped by table overflow) ──────────
const PAYMENT_MENU_WIDTH = 190;
const ITEM_H = 42;
const MENU_PAD = 8;

const PaymentActionDropdown = ({ payment, onView, onEdit, onDownload, onSend, onRefund, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const actions = [
    { id: 'view',     label: 'View Details',      icon: '👁️' },
    { id: 'edit',     label: 'Edit Payment',       icon: '✏️' },
    { id: 'download', label: 'Download Receipt',   icon: '📥' },
    { id: 'send',     label: 'Send Receipt',       icon: '📧', disabled: payment.receiptSent },
    { id: 'refund',   label: 'Issue Refund',       icon: '🔄', disabled: payment.paymentStatus === 'Refunded' },
    { id: 'delete',   label: 'Delete Payment',     icon: '🗑️', color: '#ff4d4f' },
  ];

  const compute = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const menuH = actions.length * ITEM_H + MENU_PAD;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const spaceBelow = vh - rect.bottom;
    const top = spaceBelow >= menuH || spaceBelow >= rect.top
      ? rect.bottom + 6
      : rect.top - menuH - 6;
    let left = rect.right - PAYMENT_MENU_WIDTH;
    if (left < 8) left = 8;
    if (left + PAYMENT_MENU_WIDTH > vw - 8) left = vw - PAYMENT_MENU_WIDTH - 8;
    setStyle({ top, left });
  }, [actions.length]);

  const toggle = (e) => {
    e.stopPropagation();
    if (!open) { compute(); setOpen(true); } else { setOpen(false); }
  };

  useEffect(() => {
    if (!open) return;
    const down = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current  && !btnRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', down);
    return () => document.removeEventListener('mousedown', down);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const upd = () => compute();
    window.addEventListener('scroll', upd, true);
    window.addEventListener('resize', upd);
    return () => { window.removeEventListener('scroll', upd, true); window.removeEventListener('resize', upd); };
  }, [open, compute]);

  const handleAction = (id) => {
    setOpen(false);
    if (id === 'view')     onView(payment);
    if (id === 'edit')     onEdit(payment);
    if (id === 'download') onDownload(payment);
    if (id === 'send')     onSend(payment);
    if (id === 'refund')   onRefund(payment);
    if (id === 'delete')   onDelete(payment);
  };

  return (
    <>
      <button ref={btnRef} className="three-dots-btn" onClick={toggle} aria-haspopup="true" aria-expanded={open}>
        •••
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: style.top,
            left: style.left,
            width: PAYMENT_MENU_WIDTH,
            zIndex: 99999,
            background: '#fff',
            borderRadius: '0.75rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #efefef',
            padding: '4px',
            animation: 'payDropIn 0.18s ease-out',
          }}
        >
          <style>{`@keyframes payDropIn { from{opacity:0;transform:translateY(-6px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }`}</style>
          {actions.map((a) => (
            <button
              key={a.id}
              onClick={() => !a.disabled && handleAction(a.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.65rem',
                padding: '0.55rem 0.9rem', border: 'none', background: 'none',
                cursor: a.disabled ? 'not-allowed' : 'pointer',
                fontSize: '0.88rem', fontWeight: 500,
                color: a.color || (a.disabled ? '#bbb' : '#1a1d1f'),
                borderRadius: '0.5rem', textAlign: 'left', whiteSpace: 'nowrap',
                opacity: a.disabled ? 0.42 : 1,
                transition: 'background 0.13s',
              }}
              onMouseEnter={e => { if (!a.disabled) e.currentTarget.style.background = '#f4f7f9'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
};
// ────────────────────────────────────────────────────────────────────────────

const PaymentList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState(null);
    
    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Filter / sort state
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterDate, setFilterDate]     = useState('30');
    const [sortAmount, setSortAmount]     = useState('none');
    
    // Form states
    const [editData, setEditData] = useState({ status: '', notes: '' });

    const { user } = useAuth();
    const navigate = useNavigate();
    const socket = useSocket();

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${API_BASE_URL}/api/orders`, config);
                setOrders(data);
                if (data.length > 0 && !selectedPayment) setSelectedPayment(data[0]);
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        };

        if (user?.isAdmin) {
            fetchPayments();
        } else if (user) {
            navigate('/');
        }

        if (socket) {
            socket.on('paymentUpdated', (updatedPayment) => {
                setOrders(prev => prev.map(p => p._id === updatedPayment._id ? updatedPayment : p));
                setSelectedPayment(prev => prev?._id === updatedPayment._id ? updatedPayment : prev);
            });

            socket.on('paymentDeleted', (deletedId) => {
                setOrders(prev => prev.filter(p => p._id !== deletedId));
                setSelectedPayment(prev => prev?._id === deletedId ? null : prev);
            });

            return () => {
                socket.off('paymentUpdated');
                socket.off('paymentDeleted');
            };
        }
    }, [user, navigate, socket]);

    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
    };

    const handleEditClick = (payment) => {
        setEditData({ status: payment.paymentStatus || 'PENDING', notes: payment.paymentNotes || '' });
        setSelectedPayment(payment);
        setShowEditModal(true);
    };

    const handleUpdatePayment = async (e) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.put(`${API_BASE_URL}/api/admin/payments/${selectedPayment._id}`, editData, config);
            toast.success('Payment updated successfully');
            setShowEditModal(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDownloadReceipt = async (payment) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
                responseType: 'blob'
            };
            const { data } = await axios.get(`${API_BASE_URL}/api/admin/payments/${payment._id}/receipt`, config);
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Receipt-${payment._id.substring(payment._id.length - 6).toUpperCase()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error('Failed to download receipt');
        }
    };

    const handleSendReceipt = async () => {
        try {
            setActionLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${API_BASE_URL}/api/admin/payments/${selectedPayment._id}/send-receipt`, {}, config);
            toast.success('Receipt sent successfully');
            setShowSendModal(false);
        } catch (err) {
            toast.error('Failed to send receipt');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRefund = async () => {
        try {
            setActionLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${API_BASE_URL}/api/admin/payments/${selectedPayment._id}/refund`, {}, config);
            toast.success('Refund processed');
            setShowRefundModal(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Refund failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeletePayment = async () => {
        try {
            setActionLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${API_BASE_URL}/api/admin/payments/${selectedPayment._id}`, config);
            toast.success('Payment deleted');
            setShowDeleteModal(false);
        } catch (err) {
            toast.error('Delete failed');
        } finally {
            setActionLoading(false);
        }
    };

    // ── Client-side filtering + sorting ────────────────────────────────────
    const filteredOrders = (() => {
        let result = [...orders];

        // Status filter
        if (filterStatus !== 'ALL') {
            result = result.filter(p => {
                const s = (p.paymentStatus || 'PENDING').toUpperCase();
                return s === filterStatus;
            });
        }

        // Date filter – last N days
        if (filterDate !== 'all') {
            const days = parseInt(filterDate, 10);
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);
            result = result.filter(p => new Date(p.createdAt) >= cutoff);
        }

        // Sort by amount
        if (sortAmount === 'asc')  result.sort((a, b) => a.totalPrice - b.totalPrice);
        if (sortAmount === 'desc') result.sort((a, b) => b.totalPrice - a.totalPrice);

        return result;
    })();

    if (loading) return <AdminLayout pageTitle="Payments"><div className="loader-container">...</div></AdminLayout>;

    return (
        <AdminLayout pageTitle="Payments">
            <div className="orders-dashboard">
                <div className="table-header-filters">
                    <div className="filter-group">
                        {/* Status filter */}
                        <select
                            className="filter-select"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="ALL">All transactions</option>
                            <option value="PENDING">Pending</option>
                            <option value="SUCCESS">Success / Paid</option>
                            <option value="FAILED">Failed</option>
                            <option value="REFUNDED">Refunded</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>

                        {/* Date range filter */}
                        <select
                            className="filter-select"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="all">All time</option>
                        </select>
                    </div>

                    {/* Sort by amount */}
                    <select
                        className="filter-select"
                        value={sortAmount}
                        onChange={(e) => setSortAmount(e.target.value)}
                    >
                        <option value="none">Sort by Amount</option>
                        <option value="desc">Amount: High → Low</option>
                        <option value="asc">Amount: Low → High</option>
                    </select>
                </div>

                <div className={`orders-master-detail ${selectedPayment ? 'has-selection' : ''}`}>
                    <div className="master-pane">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}><div className="custom-cb"></div></th>
                                    <th>ID</th>
                                    <th>Customer</th>
                                    <th>Status</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#9a9fa5' }}>
                                            No transactions match the selected filters.
                                        </td>
                                    </tr>
                                ) : filteredOrders.map((payment) => (
                                    <tr
                                        key={payment._id}
                                        className={selectedPayment?._id === payment._id ? 'selected' : ''}
                                        onClick={() => setSelectedPayment(payment)}
                                    >
                                        <td><div className="custom-cb"></div></td>
                                        <td className="order-id-cell">#TXN{payment._id.substring(payment._id.length - 6).toUpperCase()}</td>
                                        <td>
                                            <div className="customer-cell-flex">
                                                <Avatar user={payment.user} size={36} className="customer-avatar-rect" />
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: 600 }}>{payment.user?.name || 'Guest'}</span>
                                                    {payment.receiptSent && <span className="receipt-sent-label">Receipt Sent</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge-flat badge-${(payment.paymentStatus || 'PENDING').toLowerCase()}`}>
                                                {payment.paymentStatus || 'PENDING'}
                                            </span>
                                        </td>
                                        <td>${payment.totalPrice.toFixed(2)}</td>
                                        <td style={{ color: '#9a9fa5' }}>{new Date(payment.createdAt).toLocaleDateString()}</td>
                                        <td className="actions-cell">
                                            <PaymentActionDropdown
                                              payment={payment}
                                              onView={handleViewDetails}
                                              onEdit={handleEditClick}
                                              onDownload={handleDownloadReceipt}
                                              onSend={(p) => { setSelectedPayment(p); setShowSendModal(true); }}
                                              onRefund={(p) => { setSelectedPayment(p); setShowRefundModal(true); }}
                                              onDelete={(p) => { setSelectedPayment(p); setShowDeleteModal(true); }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {selectedPayment && (
                        <aside className="detail-pane">
                            <div className="detail-header-refined">
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Transaction Info</h2>
                                <button className="close-btn" onClick={() => setSelectedPayment(null)}>✕</button>
                            </div>
                            <div className="detail-body-refined">
                                <div className="profile-section-centered">
                                    <Avatar user={selectedPayment.user} size={64} className="profile-avatar-lg" />
                                    <span className="profile-name-lg">{selectedPayment.user?.name}</span>
                                    <span style={{ color: '#6f767e', fontSize: '0.85rem' }}>Method: Credit Card (Stripe)</span>
                                </div>

                                <div className="items-section">
                                    <span className="section-title-sm">Payment Details</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div className="total-summary-row" style={{ marginBottom: '0.5rem' }}>
                                            <span className="total-label-sm">Subtotal</span>
                                            <span style={{ fontWeight: 700 }}>${selectedPayment.itemsPrice.toFixed(2)}</span>
                                        </div>
                                        <div className="total-summary-row" style={{ marginBottom: '0.5rem' }}>
                                            <span className="total-label-sm">Tax</span>
                                            <span style={{ fontWeight: 700 }}>${selectedPayment.taxPrice.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="detail-footer-refined">
                                <div className="total-summary-row">
                                    <span className="total-label-sm">Total Paid</span>
                                    <span className="total-value-lg">${selectedPayment.totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="footer-actions-grid">
                                    <button className="btn-black">Download Receipt</button>
                                    <button className="btn-yellow">Issue Refund</button>
                                </div>
                            </div>
                        </aside>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Edit Payment</h2>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleUpdatePayment}>
                            <div className="form-group">
                                <label>Transaction Status</label>
                                <select 
                                    value={editData.status} 
                                    onChange={(e) => setEditData({...editData, status: e.target.value})}
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="SUCCESS">Success</option>
                                    <option value="FAILED">Failed</option>
                                    <option value="REFUNDED">Refunded</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Internal Notes</label>
                                <textarea 
                                    className="form-control"
                                    value={editData.notes}
                                    onChange={(e) => setEditData({...editData, notes: e.target.value})}
                                    placeholder="Add payment notes..."
                                    rows="4"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={actionLoading}>
                                    {actionLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Refund Modal */}
            {showRefundModal && (
                <div className="modal-overlay">
                    <div className="modal-content modal-delete">
                        <div className="modal-icon-warning">🔄</div>
                        <h2>Issue Refund?</h2>
                        <p>Are you sure you want to refund this payment of <strong>${selectedPayment?.totalPrice.toFixed(2)}</strong>?</p>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowRefundModal(false)}>Cancel</button>
                            <button className="btn-danger" onClick={handleRefund} disabled={actionLoading}>
                                {actionLoading ? 'Processing...' : 'Confirm Refund'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

             {/* Send Receipt Modal */}
             {showSendModal && (
                <div className="modal-overlay">
                    <div className="modal-content modal-delete">
                        <div className="modal-icon-warning">📧</div>
                        <h2>Send Receipt?</h2>
                        <p>Send digital receipt to <strong>{selectedPayment?.user?.email}</strong>?</p>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowSendModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSendReceipt} disabled={actionLoading}>
                                {actionLoading ? 'Sending...' : 'Send Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content modal-delete">
                        <div className="modal-icon-warning">⚠️</div>
                        <h2>Delete Payment?</h2>
                        <p>This action cannot be undone. Remove this record permanently?</p>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className="btn-danger" onClick={handleDeletePayment} disabled={actionLoading}>
                                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default PaymentList;
