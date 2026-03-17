import React from 'react';
import { Link } from 'react-router-dom';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  return (
    <div className="checkout-steps">
      <div className={step1 ? 'active' : ''}>
        {step1 ? <Link to="/login">Login</Link> : <span>Login</span>}
      </div>
      <div className={step2 ? 'active' : ''}>
        {step2 ? <Link to="/shipping">Shipping</Link> : <span>Shipping</span>}
      </div>
      <div className={step3 ? 'active' : ''}>
        {step3 ? <Link to="/payment">Payment</Link> : <span>Payment</span>}
      </div>
      <div className={step4 ? 'active' : ''}>
        {step4 ? <Link to="/placeorder">Place Order</Link> : <span>Place Order</span>}
      </div>
      <style>{`
        .checkout-steps {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 600px;
          margin: 1rem auto 2rem;
          padding: 0 1rem;
        }
        .checkout-steps div {
          font-size: 0.9rem;
          color: #878787;
          border-bottom: 2px solid #e0e0e0;
          padding-bottom: 0.5rem;
          flex: 1;
          text-align: center;
        }
        .checkout-steps div.active {
          color: #2874f0;
          border-bottom: 2px solid #2874f0;
          font-weight: 700;
        }
        .checkout-steps a {
          text-decoration: none;
          color: inherit;
        }
      `}</style>
    </div>
  );
};

export default CheckoutSteps;
