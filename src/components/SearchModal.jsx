import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import Avatar from './Avatar';
import './SearchModal.css';

const TRENDING = ['Orders', 'Customers', 'Products', 'Payments', 'Reports'];

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], products: [], orders: [], payments: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery('');
      setResults({ users: [], products: [], orders: [], payments: [] });
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  // Escape key to close
  useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose]);

  // Debounced search
  const performSearch = useCallback(async (q) => {
    if (!q || q.length < 2) {
      setResults({ users: [], products: [], orders: [], payments: [] });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/search', { params: { q } });
      setResults(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => performSearch(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query, performSearch]);

  const go = (path) => { navigate(path); onClose(); };

  const hasResults = results.users.length > 0 || results.products.length > 0 ||
                     results.orders.length > 0 || results.payments.length > 0;

  if (!isOpen) return null;

  return (
    <div className="search-dropdown" ref={dropdownRef}>
      {/* Input row */}
      <div className="sd-input-row">
        <svg className="sd-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="sd-input"
          placeholder="Search orders, products, customers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="sd-clear-btn" onClick={() => setQuery('')}>✕</button>
        )}
      </div>

      {/* Results body */}
      <div className="sd-body">
        {loading ? (
          <div className="sd-status">
            <div className="sd-spinner" />
            <span>Searching...</span>
          </div>
        ) : query.length < 2 ? (
          <>
            <p className="sd-section-label">Trending</p>
            {TRENDING.map((t) => (
              <div key={t} className="sd-suggestion-item" onClick={() => go(`/admin/${t.toLowerCase()}`)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9a9fa5" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>{t}</span>
              </div>
            ))}
          </>
        ) : !hasResults ? (
          <div className="sd-status"><span>No results for "{query}"</span></div>
        ) : (
          <>
            {results.products.length > 0 && (
              <div className="sd-group">
                <p className="sd-section-label">Products</p>
                {results.products.map((p) => (
                  <div key={p._id} className="sd-result-item" onClick={() => go(`/admin/products/${p._id}/edit`)}>
                    <img src={p.image} alt={p.name} className="sd-result-img" />
                    <div className="sd-result-meta">
                      <span className="sd-result-title">{p.name}</span>
                      <span className="sd-result-sub">{p.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {results.users.length > 0 && (
              <div className="sd-group">
                <p className="sd-section-label">Customers</p>
                {results.users.map((u) => (
                  <div key={u._id} className="sd-result-item" onClick={() => go(`/admin/customers/${u._id}`)}>
                    <Avatar user={u} size={32} showBadge={false} />
                    <div className="sd-result-meta">
                      <div className="sd-result-top">
                        <span className="sd-result-title">{u.name}</span>
                        <span className={`sd-role-badge ${u.role === 'admin' ? 'admin' : 'client'}`}>
                          {u.role === 'admin' ? 'Admin' : 'Client'}
                        </span>
                      </div>
                      <span className="sd-result-sub">{u.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {results.orders.length > 0 && (
              <div className="sd-group">
                <p className="sd-section-label">Orders</p>
                {results.orders.map((o) => (
                  <div key={o._id} className="sd-result-item" onClick={() => go(`/admin/orders/${o._id}`)}>
                    <div className="sd-result-icon">#</div>
                    <div className="sd-result-meta">
                      <span className="sd-result-title">Order #{o._id.slice(-6).toUpperCase()}</span>
                      <span className="sd-result-sub">{o.orderStatus} · ₹{o.totalPrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {results.payments.length > 0 && (
              <div className="sd-group">
                <p className="sd-section-label">Payments</p>
                {results.payments.map((p) => (
                  <div key={p._id} className="sd-result-item" onClick={() => go(`/admin/payments?id=${p._id}`)}>
                    <div className="sd-result-icon">💸</div>
                    <div className="sd-result-meta">
                      <span className="sd-result-title">
                        {p.razorpay_payment_id || `Payment #${p._id.slice(-6).toUpperCase()}`}
                      </span>
                      <span className="sd-result-sub">₹{p.totalPrice} · {p.paymentStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
