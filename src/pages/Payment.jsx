import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '../components/CheckoutSteps';

const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState('PayPal');
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    localStorage.setItem('paymentMethod', JSON.stringify(paymentMethod));
    navigate('/placeorder');
  };

  return (
    <div className="payment-container">
      <CheckoutSteps step1 step2 step3 />
      <div className="payment-box">
        <h1>Payment Method</h1>
        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label className="radio-label">
              <input
                type="radio"
                name="paymentMethod"
                value="Razorpay"
                checked={paymentMethod === 'Razorpay'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Razorpay (India)</span>
            </label>
          </div>
          <div className="form-group">
            <label className="radio-label">
              <input
                type="radio"
                name="paymentMethod"
                value="PayPal"
                checked={paymentMethod === 'PayPal'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>PayPal or Credit Card</span>
            </label>
          </div>
          <div className="form-group">
            <label className="radio-label">
              <input
                type="radio"
                name="paymentMethod"
                value="Stripe"
                checked={paymentMethod === 'Stripe'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Stripe</span>
            </label>
          </div>
          <div className="form-group">
            <label className="radio-label">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Cash on Delivery</span>
            </label>
          </div>
          <button type="submit" className="continue-btn">Continue</button>
        </form>
      </div>
      <style>{`
        .payment-container { padding-top: 2rem; background: #f1f3f6; min-height: 80vh; padding-bottom: 5rem; }
        .payment-box { max-width: 500px; margin: 0 auto; background: white; padding: 2rem; border-radius: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .payment-box h1 { font-size: 1.2rem; margin-bottom: 2rem; font-weight: 500; }
        .form-group { margin-bottom: 1.5rem; }
        .radio-label { display: flex; align-items: center; gap: 0.8rem; cursor: pointer; }
        .radio-label input { width: 18px; height: 18px; cursor: pointer; }
        .radio-label span { font-size: 1rem; color: #212121; }
        .continue-btn { width: 100%; background: #fb641b; color: white; border: none; padding: 1rem; font-size: 1rem; font-weight: 700; cursor: pointer; border-radius: 2px; }
      `}</style>
    </div>
  );
};

export default Payment;
