import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import OrderTracker from '../components/OrderTracker';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';
import './OrderTracking.css';

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const fetchOrder = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`${API_BASE_URL}/api/orders/${id}`, config);
      setOrder(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && id) {
      fetchOrder();
    }
  }, [id, user]);

  useEffect(() => {
    if (socket && id) {
      socket.on('orderUpdated', (updatedOrder) => {
        if (updatedOrder._id === id) {
          setOrder(prev => ({ ...prev, ...updatedOrder }));
          
          if (updatedOrder.isCancelled) {
             setSuccessMsg('Order has been cancelled successfully.');
             toast.error('Order cancelled');
          } else if (updatedOrder.orderStatus === 'Shipped') {
             toast.success('Great news! Your order has been shipped.');
          } else if (updatedOrder.orderStatus === 'Delivered') {
             toast.success('Your order has been delivered.');
          }
        }
      });

      return () => {
        socket.off('orderUpdated');
      };
    }
  }, [socket, id]);

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.put(`${API_BASE_URL}/api/orders/${id}/cancel`, {}, config);
      setSuccessMsg('Order has been cancelled successfully.');
      setShowModal(false);
      fetchOrder(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to cancel order. Please try again.');
      setShowModal(false);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;
  if (error) return <div className="error-container">{error}</div>;
  if (!order) return <div className="error-container">Order not found</div>;

  return (
    <div className="order-tracking-wrapper">
      <div className="order-tracking-container">
        {order.isCancelled && (
          <div className="cancelled-banner">
            ORDER CANCELLED ON {new Date(order.cancelledAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        )}
        {order.paymentResult?.status === "failed" && !order.isPaid && (
          <div className="failed-banner">
            PAYMENT FAILED. PLEASE RETRY TO COMPLETE YOUR ORDER.
          </div>
        )}

        <div className="track-card">
          <div className="track-card-header">
            <h2>Track Your Order</h2>
            <span className="order-id">ID: #{order._id.substring(order._id.length - 8).toUpperCase()}</span>
          </div>
          <div className="track-card-content">
            <OrderTracker
              status={order.orderStatus || 'Order Placed'}
              isCancelled={order.isCancelled}
            />

            <div className="info-grid">
              <div className="info-section">
                <h3>Shipping Address</h3>
                <div className="info-content">
                  <p><strong>{user.name}</strong></p>
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
              <div className="info-section">
                <h3>Order Info</h3>
                <div className="info-content">
                  <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p><strong>Payment:</strong> <span className={`badge ${order.isPaid ? 'badge-paid' : 'badge-unpaid'}`}>
                    {order.isPaid ? 'PAID' : (order.paymentMethod === 'COD' ? 'PAY ON DELIVERY' : 'NOT PAID')}
                  </span></p>
                  <p><strong>Status:</strong> <span className={`badge ${order.isCancelled ? 'badge-cancelled-red' : 'badge-paid'}`}>
                    {order.isCancelled ? 'CANCELLED' : (order.orderStatus || 'Order Placed')}
                  </span></p>
                </div>
              </div>
            </div>

            {successMsg && (
              <div className="success-alert">
                <span className="success-icon">✓</span> {successMsg}
              </div>
            )}
          </div>
        </div>

        <div className="track-card">
          <div className="track-card-header">
            <h2>Order Items</h2>
          </div>
          <div className="track-card-content">
            {order.orderItems.map((item, index) => (
              <div key={index} className="product-item">
                <img src={item.image} alt={item.name} className="product-img" />
                <div className="product-info">
                  <div className="product-name">{item.name}</div>
                  <div className="product-meta">Qty: {item.qty}</div>
                  <div className="product-price">${item.price.toFixed(2)}</div>
                </div>
              </div>
            ))}

            <div className="summary-row">
              <div className="summary-table">
                <div className="summary-item">
                  <span>Subtotal</span>
                  <span>${order.itemsPrice.toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>Shipping</span>
                  <span>${order.shippingPrice.toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>Tax</span>
                  <span>${order.taxPrice.toFixed(2)}</span>
                </div>
                <div className="summary-item summary-total">
                  <span>Total</span>
                  <span>${order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {(!order.isDelivered || order.isCancelled) && (
            <div className="order-actions">
              {order.isCancelled ? (
                <button className="cancel-btn-disabled" disabled>Order Cancelled</button>
              ) : (
                <>
                  {order.paymentResult?.status === 'failed' && !order.isPaid && (
                    <button className="retry-btn" onClick={() => navigate(`/payment`)}>Retry Payment</button>
                  )}
                  <button className="cancel-btn" onClick={() => setShowModal(true)}>Cancel Order</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Cancel Order</h3>
            <p>Are you sure you want to cancel this order? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="btn-confirm" 
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
              <button 
                className="btn-no" 
                onClick={() => setShowModal(false)}
                disabled={cancelling}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .loader-container { min-height: 80vh; display: flex; align-items: center; justify-content: center; }
        .loader { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #2874f0; border-radius: 50% !important; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .error-container { text-align: center; padding: 4rem; color: #ff523b; font-weight: 700; }
        .failed-banner { background: #fff1f0; color: #ff4d4f; padding: 1rem; margin-bottom: 1.5rem; border-radius: 4px; border: 1px solid #ffa39e; font-weight: 700; text-align: center; }
        .badge-failed { background: #ff4d4f; color: white; }
        .retry-btn { background: #fb641b; color: white; border: none; padding: 0.8rem 2rem; font-weight: 700; border-radius: 4px; cursor: pointer; transition: 0.3s; margin-right: 10px; }
        .retry-btn:hover { background: #e65a15; }
      `}</style>
    </div>
  );
};

export default OrderTracking;
