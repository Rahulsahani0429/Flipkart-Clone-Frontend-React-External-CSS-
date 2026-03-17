import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CheckoutSteps from '../components/CheckoutSteps';
import { API_BASE_URL, RAZORPAY_KEY_ID } from '../config';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { cartItems, removeMultipleFromCart } = useCart();

  // Only the items the user selected on the Cart page
  const selectedIds = (() => {
    try { return JSON.parse(localStorage.getItem('selectedCartItemIds')) || []; }
    catch { return []; }
  })();
  const orderItems = selectedIds.length > 0
    ? cartItems.filter(i => selectedIds.includes(i.product))
    : cartItems;
  const { user } = useAuth();

  const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress')) || {};
  const paymentMethod = JSON.parse(localStorage.getItem('paymentMethod')) || 'PayPal';

  // Calculate prices from SELECTED items only
  const itemsPrice    = orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 1000 ? 0 : 40;
  const taxPrice      = Number((0.15 * itemsPrice).toFixed(2));
  const totalPrice    = itemsPrice + shippingPrice + taxPrice;

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    } else if (!paymentMethod) {
      navigate('/payment');
    }
  }, [navigate, shippingAddress, paymentMethod]);

  const placeOrderHandler = async () => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      // 1. Create Order in our DB
      const { data: orderResponse } = await axios.post(
        `${API_BASE_URL}/api/orders`,
        {
          orderItems: orderItems,
          shippingAddress,
          paymentMethod,
          itemsPrice,
          shippingPrice,
          taxPrice,
          totalPrice,
        },
        config
      );

      const orderId = orderResponse.order._id;

      if (paymentMethod === 'Razorpay') {
        // 2. Create Razorpay Order on server
        const { data: rpOrder } = await axios.post(
          `${API_BASE_URL}/api/payments/create-order`,
          { orderId },
          config
        );

        // 3. Open Razorpay Checkout
        const options = {
          key: RAZORPAY_KEY_ID,
          amount: rpOrder.amount,
          currency: rpOrder.currency,
          name: "Premium Ecommerce",
          description: "Order Payment",
          order_id: rpOrder.id,
          handler: async (response) => {
            try {
              // 4. Verify Payment on success
              const { data: verifyData } = await axios.post(
                `${API_BASE_URL}/api/payments/verify`,
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
                config
              );

              if (verifyData.order.paymentStatus === 'SUCCESS') {
                removeMultipleFromCart(selectedIds);
                localStorage.removeItem('selectedCartItemIds');
                navigate(`/success/${orderId}`);
              } else {
                alert('Payment verification failed');
              }
            } catch (err) {
              console.error('Verification Error:', err);
              alert('Payment Verification Failed');
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: "#fb641b",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // For COD or others
        removeMultipleFromCart(selectedIds);
        localStorage.removeItem('selectedCartItemIds');
        navigate(`/success/${orderId}`);
      }
    } catch (error) {
      console.error('Order Error:', error);
      alert(error.response?.data?.message || 'Failed to place order. Please try again.');
    }
  };

  return (
    <div className="placeorder-container">
      <CheckoutSteps step1 step2 step3 step4 />
      <div className="placeorder-grid">
        <div className="placeorder-info">
          <div className="info-section">
            <h2>Shipping</h2>
            <p>
              <strong>Address: </strong>
              {shippingAddress.address}, {shippingAddress.city},{' '}
              {shippingAddress.postalCode}, {shippingAddress.country}
            </p>
          </div>

          <div className="info-section">
            <h2>Payment Method</h2>
            <p>
              <strong>Method: </strong>
              {paymentMethod}
            </p>
          </div>

          <div className="info-section">
            <h2>Order Items</h2>
            {orderItems.length === 0 ? (
              <p>No items selected. <Link to="/cart">Go back to cart</Link></p>
            ) : (
              <div className="order-items-list">
                {orderItems.map((item, index) => (
                  <div key={index} className="order-item">
                    <img src={item.image} alt={item.name} />
                    <div className="item-details">
                      <Link to={`/product/${item.product}`}>{item.name}</Link>
                      <p>{item.qty} × ₹{item.price?.toLocaleString('en-IN')} = ₹{(item.qty * item.price).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="placeorder-summary">
          <div className="summary-card">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Items</span>
              <span>₹{itemsPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>₹{shippingPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <span>₹{taxPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            <button
              type="button"
              className="place-order-btn"
              disabled={orderItems.length === 0}
              onClick={placeOrderHandler}
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .placeorder-container { padding: 2rem 1rem 5rem; background: #f1f3f6; min-height: 100vh; }
        .placeorder-grid { display: grid; grid-template-columns: 1fr 350px; gap: 1rem; max-width: 1200px; margin: 0 auto; }
        
        .info-section { background: white; padding: 1.5rem; margin-bottom: 1rem; border-radius: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .info-section h2 { font-size: 1.1rem; margin-bottom: 1rem; text-transform: uppercase; color: #878787; }
        .info-section p { font-size: 0.95rem; line-height: 1.5; color: #212121; }
        
        .order-items-list { margin-top: 1rem; }
        .order-item { display: flex; align-items: center; gap: 1rem; padding: 0.8rem 0; border-bottom: 1px solid #f0f0f0; }
        .order-item:last-child { border-bottom: none; }
        .order-item img { width: 50px; height: 50px; object-fit: contain; }
        .item-details a { text-decoration: none; color: #212121; font-size: 0.9rem; font-weight: 500; }
        .item-details p { font-size: 0.85rem; color: #666; margin-top: 0.3rem; }

        .summary-card { background: white; padding: 1.5rem; border-radius: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); position: sticky; top: 120px; }
        .summary-card h2 { font-size: 1rem; color: #878787; border-bottom: 1px solid #f0f0f0; padding-bottom: 0.8rem; margin-bottom: 1rem; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.95rem; }
        .summary-row.total { border-top: 1px dashed #e0e0e0; padding-top: 1rem; font-weight: 700; font-size: 1.1rem; color: #212121; }
        
        .place-order-btn { width: 100%; background: #fb641b; color: white; border: none; padding: 1rem; font-size: 1rem; font-weight: 700; cursor: pointer; border-radius: 2px; margin-top: 1rem; }
        .place-order-btn:disabled { background: #ffd0b8; cursor: not-allowed; }

        @media (max-width: 960px) {
          .placeorder-grid { grid-template-columns: 1fr; }
          .summary-card { position: relative; top: 0; }
        }
      `}</style>
    </div>
  );
};

export default PlaceOrder;
