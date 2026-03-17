import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '../components/CheckoutSteps';

const Shipping = () => {
  const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress')) || {};
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
  const [country, setCountry] = useState(shippingAddress.country || '');

  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    localStorage.setItem('shippingAddress', JSON.stringify({ address, city, postalCode, country }));
    navigate('/payment');
  };

  return (
    <div className="shipping-container">
      <CheckoutSteps step1 step2 />
      <div className="shipping-box">
        <h1>Shipping Address</h1>
        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              placeholder="Enter address"
              value={address}
              required
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              placeholder="Enter city"
              value={city}
              required
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Postal Code</label>
            <input
              type="text"
              placeholder="Enter postal code"
              value={postalCode}
              required
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Country</label>
            <input
              type="text"
              placeholder="Enter country"
              value={country}
              required
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
          <button type="submit" className="continue-btn">Continue</button>
        </form>
      </div>
      <style>{`
        .shipping-container { padding-top: 2rem; background: #f1f3f6; min-height: 80vh; padding-bottom: 5rem; }
        .shipping-box { max-width: 500px; margin: 0 auto; background: white; padding: 2rem; border-radius: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .shipping-box h1 { font-size: 1.2rem; margin-bottom: 2rem; font-weight: 500; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: #666; }
        .form-group input { width: 100%; padding: 0.8rem; border: 1px solid #e0e0e0; border-radius: 2px; outline: none; }
        .form-group input:focus { border-color: #2874f0; }
        .continue-btn { width: 100%; background: #fb641b; color: white; border: none; padding: 1rem; font-size: 1rem; font-weight: 700; cursor: pointer; border-radius: 2px; }
      `}</style>
    </div>
  );
};

export default Shipping;
