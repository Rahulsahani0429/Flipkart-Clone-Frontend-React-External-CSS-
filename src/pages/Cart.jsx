import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cartItems, removeFromCart, addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Selection state — default: all selected
  const [selectedIds, setSelectedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('selectedCartItemIds');
      return saved ? JSON.parse(saved) : null; // null means "not yet set"
    } catch { return null; }
  });

  // On cartItems change: initialise selection if null, or clean up stale ids
  useEffect(() => {
    if (cartItems.length === 0) return;
    if (selectedIds === null) {
      // First visit — select all
      const all = cartItems.map(i => i.product);
      setSelectedIds(all);
      localStorage.setItem('selectedCartItemIds', JSON.stringify(all));
    } else {
      // Clean up ids that no longer exist in cart
      const validIds = cartItems.map(i => i.product);
      const cleaned = selectedIds.filter(id => validIds.includes(id));
      if (cleaned.length !== selectedIds.length) {
        setSelectedIds(cleaned);
        localStorage.setItem('selectedCartItemIds', JSON.stringify(cleaned));
      }
    }
  }, [cartItems]);

  const persistSelected = (ids) => {
    setSelectedIds(ids);
    localStorage.setItem('selectedCartItemIds', JSON.stringify(ids));
  };

  const toggleItem = (productId) => {
    const next = selectedIds.includes(productId)
      ? selectedIds.filter(id => id !== productId)
      : [...selectedIds, productId];
    persistSelected(next);
  };

  const allSelected = cartItems.length > 0 && selectedIds?.length === cartItems.length;

  const toggleAll = () => {
    if (allSelected) {
      persistSelected([]);
    } else {
      persistSelected(cartItems.map(i => i.product));
    }
  };

  const selectedItems = cartItems.filter(i => selectedIds?.includes(i.product));
  const selCount  = selectedItems.length;
  const subTotal  = selectedItems.reduce((acc, i) => acc + i.qty * i.price, 0);
  const discount  = Math.round(subTotal * 0.1); // 10% simulated discount
  const delivery  = subTotal > 1000 ? 0 : 40;
  const total     = subTotal - discount + delivery;

  const checkoutHandler = () => {
    if (selCount === 0) return;
    if (user) {
      navigate('/shipping');
    } else {
      navigate('/login?redirect=/shipping');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart-container">
        <div className="empty-cart-card">
          <div className="empty-cart-img">🛒</div>
          <h2>Your Cart is Empty!</h2>
          <p>Add items to it now.</p>
          <Link to="/shop" className="shop-now-btn">Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      <div className="container cart-container">
        {/* ── Left: Cart Items ── */}
        <div className="cart-main">
          <div className="cart-header">
            <label className="select-all-label">
              <input
                type="checkbox"
                className="cart-check"
                checked={allSelected}
                onChange={toggleAll}
              />
              <span>My Cart ({cartItems.length})</span>
            </label>
          </div>

          <div className="cart-items">
            {cartItems.map((item) => {
              const isSelected = selectedIds?.includes(item.product);
              return (
                <div key={item.product} className={`flipkart-cart-item${isSelected ? ' selected-item' : ''}`}>
                  {/* Checkbox */}
                  <div className="item-check-col">
                    <input
                      type="checkbox"
                      className="cart-check"
                      checked={isSelected}
                      onChange={() => toggleItem(item.product)}
                    />
                  </div>

                  <div className="cart-item-img">
                    <img src={item.image} alt={item.name} />
                  </div>

                  <div className="cart-item-info">
                    <Link to={`/product/${item.product}`}><h3>{item.name}</h3></Link>
                    <p className="item-seller">Seller: {item.brand}</p>
                    <div className="item-price-row">
                      <span className="curr-price">₹{item.price?.toLocaleString('en-IN')}</span>
                      <span className="orig-price">₹{Math.round(item.price * 1.1).toLocaleString('en-IN')}</span>
                      <span className="price-off">10% Off</span>
                    </div>
                    <div className="item-actions">
                      <div className="qty-ctrl">
                        <button onClick={() => addToCart(item, item.qty - 1)} disabled={item.qty <= 1}>−</button>
                        <input type="text" value={item.qty} readOnly />
                        <button onClick={() => addToCart(item, item.qty + 1)} disabled={item.qty >= item.countInStock}>+</button>
                      </div>
                      <button className="remove-btn" onClick={() => removeFromCart(item.product)}>REMOVE</button>
                      <button className="save-btn" onClick={() => removeFromCart(item.product)}>SAVE FOR LATER</button>
                    </div>
                  </div>

                  <div className="delivery-info">
                    Delivery by <span>Tomorrow</span> |&nbsp;<span className="free-text">Free</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="place-order-row">
            <button
              className="place-order-btn"
              onClick={checkoutHandler}
              disabled={selCount === 0}
            >
              PLACE ORDER{selCount > 0 ? ` (${selCount})` : ''}
            </button>
          </div>
        </div>

        {/* ── Right: Price Summary ── */}
        <div className="cart-summary-sidebar">
          <div className="price-details-card">
            <h3>PRICE DETAILS</h3>
            <div className="price-row">
              <span>Price ({selCount} item{selCount !== 1 ? 's' : ''})</span>
              <span>₹{subTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="price-row">
              <span>Discount</span>
              <span className="discount-text">− ₹{discount.toLocaleString('en-IN')}</span>
            </div>
            <div className="price-row">
              <span>Delivery Charges</span>
              <span className="discount-text">{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
            </div>
            <div className="total-amount-row">
              <span>Total Amount</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <p className="savings-msg">
              {discount > 0 ? `You will save ₹${discount.toLocaleString('en-IN')} on this order` : 'Select items to see savings'}
            </p>
          </div>

          {selCount === 0 && (
            <div className="no-selection-notice">
              ⚠️ Select at least one item to proceed.
            </div>
          )}
        </div>
      </div>

      <style>{`
        .cart-page-wrapper { background:#f1f3f6; min-height:100vh; padding:.5rem 0 5rem; }
        .cart-container { display:grid; grid-template-columns:1fr 380px; gap:.5rem; align-items:start; }

        /* Header */
        .cart-main { background:#fff; border-radius:2px; box-shadow:0 1px 3px rgba(0,0,0,.1); }
        .cart-header { padding:.8rem 1rem; border-bottom:1px solid #f0f0f0; }
        .select-all-label { display:flex; align-items:center; gap:.65rem; cursor:pointer; font-size:1rem; font-weight:700; }

        /* Checkbox style */
        .cart-check { width:17px; height:17px; accent-color:#2874f0; cursor:pointer; flex-shrink:0; }

        /* Item row */
        .flipkart-cart-item { display:grid; grid-template-columns:24px 100px 1fr; gap:1rem; padding:1rem; border-bottom:1px solid #f0f0f0; position:relative; transition:background .15s; }
        .flipkart-cart-item.selected-item { background:#f5f9ff; }
        .item-check-col { display:flex; align-items:flex-start; padding-top:2px; }

        .cart-item-img { height:100px; text-align:center; }
        .cart-item-img img { max-width:100%; max-height:100%; object-fit:contain; }

        .cart-item-info h3 { font-size:.9rem; font-weight:400; margin-bottom:.3rem; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
        .cart-item-info a { text-decoration:none; color:#212121; }
        .item-seller { font-size:.75rem; color:#878787; margin-bottom:.75rem; }

        .item-price-row { display:flex; align-items:baseline; gap:.5rem; margin-bottom:1rem; }
        .curr-price { font-size:1.1rem; font-weight:700; color:#212121; }
        .orig-price { text-decoration:line-through; color:#878787; font-size:.8rem; }
        .price-off { color:#388e3c; font-size:.8rem; font-weight:700; }

        .item-actions { display:flex; align-items:center; gap:1.2rem; flex-wrap:wrap; }
        .qty-ctrl { display:flex; align-items:center; gap:.4rem; }
        .qty-ctrl button { width:26px; height:26px; border-radius:50%; border:1px solid #e0e0e0; background:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:1rem; }
        .qty-ctrl button:disabled { opacity:.35; cursor:not-allowed; }
        .qty-ctrl input { width:40px; height:26px; text-align:center; border:1px solid #e0e0e0; font-size:.85rem; border-radius:2px; }
        .remove-btn { background:none; border:none; font-size:.85rem; font-weight:700; color:#212121; cursor:pointer; }
        .save-btn { background:none; border:none; font-size:.85rem; font-weight:700; color:#212121; cursor:pointer; }

        .delivery-info { font-size:.78rem; color:#212121; position:absolute; top:1rem; right:1rem; }

        /* Place order bar */
        .place-order-row { padding:1rem; position:fixed; bottom:0; left:0; right:0; background:#fff; display:flex; justify-content:flex-end; box-shadow:0 -2px 10px rgba(0,0,0,.1); z-index:100; }
        .place-order-btn { background:#fb641b; color:#fff; border:none; padding:.8rem 3rem; font-size:1rem; font-weight:700; border-radius:2px; cursor:pointer; min-width:220px; transition:background .2s; }
        .place-order-btn:hover:not(:disabled) { background:#e55a15; }
        .place-order-btn:disabled { background:#ffd0b8; cursor:not-allowed; }

        /* Summary */
        .price-details-card { background:#fff; padding:1rem; box-shadow:0 1px 3px rgba(0,0,0,.1); border-radius:2px; position:sticky; top:120px; }
        .price-details-card h3 { font-size:.9rem; color:#878787; border-bottom:1px solid #f0f0f0; padding-bottom:.8rem; margin-bottom:1rem; letter-spacing:.5px; }
        .price-row { display:flex; justify-content:space-between; margin-bottom:1rem; font-size:.95rem; color:#212121; }
        .total-amount-row { display:flex; justify-content:space-between; margin:1rem 0; padding:1rem 0; border-top:1px dashed #e0e0e0; border-bottom:1px dashed #e0e0e0; font-size:1.1rem; font-weight:700; }
        .discount-text { color:#388e3c; }
        .savings-msg { color:#388e3c; font-weight:700; font-size:.85rem; margin-top:.5rem; }

        .no-selection-notice { margin-top:.5rem; background:#fff8e1; border:1px solid #ffe082; border-radius:4px; padding:.65rem .9rem; font-size:.82rem; color:#795548; text-align:center; }

        /* Empty */
        .empty-cart-container { background:#f1f3f6; min-height:80vh; display:flex; align-items:center; justify-content:center; }
        .empty-cart-card { background:#fff; padding:2rem; text-align:center; border-radius:2px; box-shadow:0 1px 3px rgba(0,0,0,.1); width:100%; max-width:500px; }
        .empty-cart-img { font-size:4rem; margin-bottom:1rem; }
        .shop-now-btn { display:inline-block; margin-top:1rem; background:#2874f0; color:#fff; padding:.65rem 2rem; border-radius:2px; text-decoration:none; font-weight:700; }

        @media (max-width:1024px) {
          .cart-container { grid-template-columns:1fr; }
          .price-details-card { position:relative; top:0; }
          .place-order-btn { width:100%; max-width:none; }
          .delivery-info { display:none; }
        }
      `}</style>
    </div>
  );
};

export default Cart;
