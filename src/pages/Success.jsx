import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const Success = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id || id === 'undefined') return;
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get(`${API_BASE_URL}/api/orders/${id}`, config);
        setOrder(data);
        setLoading(false);
      } catch (error) {
        console.error('Fetch Order Error:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchOrder();
    }
  }, [id, user]);

  if (loading) return (
    <div className="loader-container">
      <div className="loader"></div>
      <style>{`
        .loader-container { min-height: 80vh; display: flex; align-items: center; justify-content: center; }
        .loader { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #2874f0; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  return (
    <div className="success-page-wrapper">
      <div className="success-page-container">
        {/* Left Side: Thank You and Billing Information */}
        <div className="success-left-content">
          <div className="thank-you-header">
            <h1>Thank you for your purchase!</h1>
            <p className="status-msg">
              Your order has been placed successfully. <strong>Please check your email (${user?.email}) for the order confirmation.</strong>
            </p>
          </div>

          <div className="billing-address-section">
            <h2>Billing address</h2>
            <div className="billing-info-grid">
              <div className="info-label">Name</div>
              <div className="info-value">{user?.name}</div>
              
              <div className="info-label">Address</div>
              <div className="info-value">
                {order?.shippingAddress.address}, {order?.shippingAddress.city},<br />
                {order?.shippingAddress.postalCode}, {order?.shippingAddress.country}
              </div>
              
              <div className="info-label">Phone</div>
              <div className="info-value">+1 (415) 555-1234</div> {/* Placeholder as phone isn't in model */}
              
              <div className="info-label">Email</div>
              <div className="info-value">{user?.email}</div>
            </div>
          </div>

          <Link to={`/orders/${id}`} className="track-order-btn-link">
             <button className="track-order-btn">Track Your Order</button>
          </Link>
        </div>

        {/* Right Side: Order Summary Ticket */}
        <div className="success-right-content">
          <div className="order-summary-ticket">
            <div className="ticket-header">
              <h2>Order Summary</h2>
            </div>
            
            <div className="ticket-meta-info">
              <div className="meta-item">
                <span className="label">Date</span>
                <span className="value">{order ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</span>
              </div>
              <div className="meta-item border-left">
                <span className="label">Order Number</span>
                <span className="value">#{id.substring(id.length - 8).toUpperCase()}</span>
              </div>
              <div className="meta-item border-left">
                <span className="label">Payment Method</span>
                <span className="value">{order?.paymentMethod}</span>
              </div>
            </div>

            <div className="ticket-items-list">
              {order?.orderItems.map((item, index) => (
                <div key={index} className="ticket-item">
                  <div className="item-img-container">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="item-text-info">
                    <p className="item-name">{item.name}</p>
                    <p className="item-qty">Qty: {item.qty}</p>
                  </div>
                  <div className="item-price-col">
                    ${item.price.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="ticket-totals">
              <div className="total-row">
                <span>Sub Total</span>
                <span>${order?.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Shipping</span>
                <span>${order?.shippingPrice.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Tax</span>
                <span>${order?.taxPrice.toFixed(2)}</span>
              </div>
              <div className="final-total-row">
                <span>Order Total</span>
                <span className="final-amount">${order?.totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="ticket-footer-jagged"></div>
          </div>
        </div>
      </div>

      <style>{`
        .success-page-wrapper {
          background-color: #f7ede2;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .success-page-container {
          background: white;
          width: 100%;
          max-width: 1000px;
          border-radius: 20px;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.05);
        }

        .success-left-content {
          padding: 4rem;
        }

        .thank-you-header h1 {
          font-size: 2.8rem;
          font-weight: 800;
          color: #1a1a1a;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .status-msg {
          color: #666;
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 3rem;
          max-width: 400px;
        }

        .billing-address-section h2 {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 2rem;
        }

        .billing-info-grid {
          display: grid;
          grid-template-columns: 100px 1fr;
          row-gap: 1.2rem;
          margin-bottom: 3rem;
        }

        .info-label {
          font-weight: 700;
          color: #1a1a1a;
          font-size: 0.95rem;
        }

        .info-value {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .track-order-btn {
          background: #ff7e67;
          color: white;
          border: none;
          padding: 1.2rem 2.5rem;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
        }

        .track-order-btn:hover {
          background: #ff6b52;
          transform: translateY(-2px);
        }

        /* Ticket Design */
        .success-right-content {
          background: #f1f1f1;
          padding: 3rem 2rem;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }

        .order-summary-ticket {
          background: white;
          width: 100%;
          border-radius: 12px;
          position: relative;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }

        /* Top serrated edge effect */
        .order-summary-ticket::before {
          content: '';
          position: absolute;
          top: -10px;
          left: 0;
          right: 0;
          height: 10px;
          background: radial-gradient(circle, #f1f1f1 4px, transparent 5px);
          background-size: 14px 20px;
          background-position: -7px 0;
        }

        .ticket-header {
          padding: 2rem 2rem 1rem;
        }

        .ticket-header h2 {
          font-size: 1.5rem;
          color: #1a1a1a;
          font-weight: 800;
        }

        .ticket-meta-info {
          display: flex;
          padding: 1.5rem 2rem;
          border-top: 1px solid #f0f0f0;
          border-bottom: 1px dashed #e0e0e0;
          background: #fafafa;
        }

        .meta-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          padding: 0 0.5rem;
        }

        .meta-item.border-left {
          border-left: 1px solid #e0e0e0;
          padding-left: 1rem;
        }

        .meta-item .label {
          font-size: 0.75rem;
          color: #999;
          font-weight: 600;
        }

        .meta-item .value {
          font-size: 0.85rem;
          color: #1a1a1a;
          font-weight: 700;
        }

        .ticket-items-list {
          padding: 1.5rem 2rem;
          max-height: 400px;
          overflow-y: auto;
        }

        .ticket-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .item-img-container {
          width: 60px;
          height: 60px;
          background: #f9f9f9;
          border-radius: 8px;
          overflow: hidden;
          padding: 0.5rem;
        }

        .item-img-container img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .item-text-info {
          flex: 1;
        }

        .item-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 0.3rem 0;
        }

        .item-qty {
          font-size: 0.8rem;
          color: #888;
          margin: 0;
        }

        .item-price-col {
          font-weight: 700;
          color: #1a1a1a;
          font-size: 1rem;
        }

        .ticket-totals {
          padding: 1.5rem 2rem 2.5rem;
          border-top: 1px solid #f0f0f0;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.8rem;
          font-size: 0.95rem;
          color: #666;
        }

        .final-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #f0f0f0;
        }

        .final-total-row span:first-child {
          font-size: 1.2rem;
          font-weight: 800;
          color: #1a1a1a;
        }

        .final-amount {
          font-size: 1.5rem;
          font-weight: 900;
          color: #1a1a1a;
        }

        /* Jagged bottom effect */
        .ticket-footer-jagged {
          position: absolute;
          bottom: -15px;
          left: 0;
          right: 0;
          height: 15px;
          background: linear-gradient(135deg, white 25%, transparent 25%),
                      linear-gradient(225deg, white 25%, transparent 25%);
          background-size: 20px 20px;
          background-position: 0 0;
        }

        @media (max-width: 900px) {
          .success-page-container {
            grid-template-columns: 1fr;
          }
          .success-left-content {
            padding: 3rem 2rem;
          }
          .success-right-content {
            padding: 2rem 1.5rem;
          }
        }

        @media (max-width: 600px) {
          .thank-you-header h1 { font-size: 2rem; }
          .billing-info-grid { grid-template-columns: 1fr; row-gap: 0.5rem; }
          .info-label { margin-top: 0.5rem; }
          .ticket-meta-info { flex-direction: column; gap: 1rem; }
          .meta-item.border-left { border-left: none; padding-left: 0; }
        }
      `}</style>
    </div>
  );
};

export default Success;
