import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../config';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // Fetch cart from backend when user logs in
  useEffect(() => {
    const fetchCart = async () => {
      if (user && user.token) {
        try {
          const config = {
            headers: { Authorization: `Bearer ${user.token}` },
          };
          const { data } = await axios.get(`${API_BASE_URL}/api/cart`, config);
          setCartItems(data);
        } catch (error) {
          console.error('Error fetching cart:', error);
        }
      } else {
        // If logged out, load from localStorage (guest) or clear
        const cartData = localStorage.getItem('cartItems');
        if (cartData) {
          setCartItems(JSON.parse(cartData));
        } else {
          setCartItems([]);
        }
      }
    };
    fetchCart();
  }, [user]);

  const save = async (items) => {
    setCartItems(items);
    localStorage.setItem('cartItems', JSON.stringify(items));

    // Sync to backend if logged in
    if (user && user.token) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        await axios.post(`${API_BASE_URL}/api/cart`, { items }, config);
      } catch (error) {
        console.error('Error syncing cart:', error);
      }
    }
  };

  const addToCart = (product, qty) => {
    const existItem = cartItems.find((x) => x.product === product._id);
    let next;
    if (existItem) {
      next = cartItems.map((x) =>
        x.product === existItem.product ? { ...product, product: product._id, qty } : x
      );
    } else {
      next = [...cartItems, { ...product, product: product._id, qty }];
    }
    save(next);
  };

  const removeFromCart = (id) => save(cartItems.filter((x) => x.product !== id));

  const removeMultipleFromCart = (ids) => {
    const idSet = new Set(ids);
    save(cartItems.filter((x) => !idSet.has(x.product)));
  };

  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
    if (user && user.token) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        await axios.delete(`${API_BASE_URL}/api/cart`, config);
      } catch (error) {
        console.error('Error clearing backend cart:', error);
      }
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, removeMultipleFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
