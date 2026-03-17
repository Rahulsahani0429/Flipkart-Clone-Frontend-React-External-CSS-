import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api.js';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';
import AdminLayout from '../components/AdminLayout';
import Avatar from '../components/Avatar';
import ActionDropdown from '../components/ActionDropdown';
import './AdminOrders.css';

const ORDER_STATUSES = {
  ORDER_CONFIRMED: { label: 'Order Placed', class: 'badge-paid' },
  PROCESSING: { label: 'Processing', class: 'badge-paid' },
  SHIPPED: { label: 'Shipped', class: 'badge-delivered' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', class: 'badge-delivered' },
  DELIVERED: { label: 'Delivered', class: 'badge-completed' },
  CANCELLED: { label: 'Cancelled', class: 'badge-cancelled' }
};

const PAYMENT_STATUSES = {
  PENDING: { label: 'Pending', class: 'badge-delivered' },
  SUCCESS: { label: 'Paid', class: 'badge-completed' },
  FAILED: { label: 'Failed', class: 'badge-cancelled' },
  REFUNDED: { label: 'Refunded', class: 'badge-shipped' }
};

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null); // used only for edit/delete modals
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editData, setEditData] = useState({ status: '', payment: '', shipping: '', returnStatus: 'NONE' });

  const { user } = useAuth();
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('orderUpdated', (updatedOrder) => {
        setOrders(prevOrders => 
          prevOrders.map(order => order._id === updatedOrder._id ? { ...order, ...updatedOrder } : order)
        );

        if (selectedOrder && selectedOrder._id === updatedOrder._id) {
          setSelectedOrder(updatedOrder);
        }

        toast.info(`Order #${updatedOrder._id.substring(updatedOrder._id.length - 6).toUpperCase()} updated`);
      });

      socket.on('orderDeleted', (orderId) => {
        setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(null);
        }
        toast.error(`Order #${orderId.substring(orderId.length - 6).toUpperCase()} deleted`);
      });

      return () => {
        socket.off('orderUpdated');
        socket.off('orderDeleted');
      };
    }
  }, [socket, selectedOrder]);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchOrders();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

  const toggleOrderSelection = (id) => {
    if (selectedOrderIds.includes(id)) {
      setSelectedOrderIds(selectedOrderIds.filter(item => item !== id));
    } else {
      setSelectedOrderIds([...selectedOrderIds, id]);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handlePaymentChange = async (orderId, newPaymentStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}/payment`, { paymentStatus: newPaymentStatus });
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update payment status');
    }
  };

  const handleReturnStatusUpdate = async (orderId, newReturnStatus) => {
    try {
      setActionLoading(true);
      await api.put(`/orders/${orderId}/return-status`, { status: newReturnStatus });
      fetchOrders();
      toast.success(`Return status updated to ${newReturnStatus}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update return status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (actionId, order) => {
    if (actionId === 'view') {
      navigate(`/admin/orders/${order._id}`);
      return;
    }
    setSelectedOrder(order);
    if (false) {
    } else if (actionId === 'edit') {
      setEditData({
        status: order.orderStatus || 'ORDER_CONFIRMED',
        payment: order.paymentStatus || (order.isPaid ? 'SUCCESS' : 'PENDING'),
        shipping: order.shippingAddress?.address || '',
        returnStatus: order.returnStatus || 'NONE'
      });
      setShowEditModal(true);
    } else if (actionId === 'delete') {
      setShowDeleteModal(true);
    } else if (actionId === 'reminder') {
      try {
        setActionLoading(true);
        await api.post(`/orders/${order._id}/reminder`, {});
        toast.success("Payment reminder sent successfully.");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to send reminder");
      } finally {
        setActionLoading(false);
      }
    } else if (actionId === 'invoice') {
      try {
        setActionLoading(true);
        const { data } = await api.get(`/orders/${order._id}/invoice`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Invoice_${order._id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err) {
        toast.error("Failed to download invoice");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const submitEdit = async () => {
    try {
      setActionLoading(true);

      if (editData.status !== selectedOrder.orderStatus) {
        await api.patch(`/admin/orders/${selectedOrder._id}/status`, { status: editData.status });
      }

      const currentPay = selectedOrder.paymentStatus || (selectedOrder.isPaid ? 'SUCCESS' : 'PENDING');
      if (editData.payment !== currentPay) {
        await api.patch(`/admin/orders/${selectedOrder._id}/payment`, { paymentStatus: editData.payment });
      }

      if (editData.returnStatus !== selectedOrder.returnStatus) {
        await api.put(`/orders/${selectedOrder._id}/return-status`, { status: editData.returnStatus });
      }

      toast.success("Order updated successfully");
      setShowEditModal(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setActionLoading(true);
      await api.delete(`/orders/${selectedOrder._id}`);
      setShowDeleteModal(false);
      fetchOrders();
      toast.success("Order deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete order");
    } finally {
      setActionLoading(false);
    }
  };

  const getOrderStatusBadge = (order) => {
    const status = order.orderStatus || 'ORDER_CONFIRMED';
    const config = ORDER_STATUSES[status] || ORDER_STATUSES.ORDER_CONFIRMED;
    return config;
  };

  const getPaymentStatusBadge = (order) => {
    const status = order.paymentStatus || (order.isPaid ? 'SUCCESS' : 'PENDING');
    return PAYMENT_STATUSES[status] || PAYMENT_STATUSES.PENDING;
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Paid') return order.isPaid;
    if (filterStatus === 'Unpaid') return !order.isPaid;
    if (filterStatus === 'Delivered') return order.isDelivered;
    if (filterStatus === 'Cancelled') return order.isCancelled;
    return true;
  });

  if (loading) return <AdminLayout><div className="loader-container"><div className="loader"></div></div></AdminLayout>;

  return (
    <AdminLayout pageTitle="Orders">
      <div className="orders-dashboard">
        <div className="table-header-filters">
          <div className="filter-group">
            <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">Any status</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
          <select className="filter-select">
            <option>Sort by Date</option>
          </select>
        </div>

        <div className="orders-master-detail">
          <div className="master-pane" style={{ width: '100%' }}>
            <table className="orders-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}><div className="custom-cb"></div></th>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Order Status</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const oBadge = getOrderStatusBadge(order);
                  const pBadge = getPaymentStatusBadge(order);

                  return (
                    <tr
                      key={order._id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/admin/orders/${order._id}`)}
                    >
                      <td>
                        <input
                          type="checkbox"
                          className="custom-cb"
                          checked={selectedOrderIds.includes(order._id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => toggleOrderSelection(order._id)}
                        />
                      </td>
                      <td className="order-id-cell">#{order._id.substring(order._id.length - 6).toUpperCase()}</td>
                      <td>
                        <div className="customer-cell-flex">
                          <Avatar user={order.user} size={36} />
                          <span className="customer-name-table">{order.user?.name || 'Guest'}</span>
                        </div>
                      </td>
                      <td>
                        <select
                          className={`status-badge-flat ${oBadge.class}`}
                          style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                          value={order.orderStatus || "ORDER_CONFIRMED"}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        >
                          {Object.entries(ORDER_STATUSES).map(([value, { label }]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className={`status-badge-flat ${pBadge.class}`}
                          style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                          value={order.paymentStatus || (order.isPaid ? 'SUCCESS' : 'PENDING')}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handlePaymentChange(order._id, e.target.value)}
                        >
                          {Object.entries(PAYMENT_STATUSES).map(([value, { label }]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td>${order.totalPrice.toFixed(2)}</td>
                      <td style={{ color: '#9a9fa5' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <ActionDropdown order={order} onAction={handleAction} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content admin-modal">
            <h3>Edit Order</h3>
            <div className="form-group-admin">
              <label>Order Status</label>
              <select value={editData.status} onChange={(e) => setEditData({...editData, status: e.target.value})}>
                {Object.entries(ORDER_STATUSES).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="form-group-admin">
              <label>Payment Status</label>
              <select value={editData.payment} onChange={(e) => setEditData({...editData, payment: e.target.value})}>
                {Object.entries(PAYMENT_STATUSES).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="form-group-admin">
              <label>Return Status</label>
              <select value={editData.returnStatus} onChange={(e) => setEditData({...editData, returnStatus: e.target.value})}>
                <option value="NONE">None</option>
                <option value="REQUESTED">Requested</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn-confirm" onClick={submitEdit} disabled={actionLoading}>
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="btn-no" onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content admin-modal">
            <h3 style={{ color: '#ff4d4f' }}>Delete Order</h3>
            <p>Are you sure you want to delete this order?</p>
            <div className="modal-actions">
              <button className="btn-confirm" style={{ backgroundColor: '#ff4d4f' }} onClick={confirmDelete} disabled={actionLoading}>
                {actionLoading ? 'Deleting...' : 'Yes, Delete Order'}
              </button>
              <button className="btn-no" onClick={() => setShowDeleteModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-modal { max-width: 400px; padding: 2rem; border-radius: 1rem; background: white; }
        .form-group-admin { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group-admin label { font-weight: 600; font-size: 0.85rem; color: #6f767e; }
        .form-group-admin select { padding: 0.75rem; border-radius: 0.5rem; border: 1px solid #efefef; background: #f4f7f9; }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
        .modal-actions { display: flex; gap: 1rem; margin-top: 1rem; }
        .btn-confirm { flex: 1; padding: 0.75rem; border: none; border-radius: 0.5rem; background: #2874f0; color: white; cursor: pointer; }
        .btn-no { flex: 1; padding: 0.75rem; border: 1px solid #efefef; border-radius: 0.5rem; background: white; cursor: pointer; }
        .return-management-section { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; }
        .return-info-box { background: #f8fafc; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; }
        .return-info-box p { font-size: 0.85rem; margin-bottom: 0.5rem; color: #475569; }
        .return-action-btns { display: flex; gap: 0.5rem; margin-top: 1rem; }
        .btn-green-sm { background: #16a34a; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 0.3rem; font-size: 0.75rem; cursor: pointer; }
        .btn-red-sm { background: #dc2626; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 0.3rem; font-size: 0.75rem; cursor: pointer; }
        .btn-blue-sm { background: #2563eb; color: white; border: none; width: 100%; padding: 0.5rem; border-radius: 0.3rem; font-size: 0.75rem; cursor: pointer; }
      `}</style>
    </AdminLayout>
  );
};

export default OrderList;
