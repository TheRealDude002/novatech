import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { cartApi, formatNaira } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};

const LOCAL_KEY = 'novatech_cart_guest';

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  // Load guest cart from localStorage on first mount
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        const raw = localStorage.getItem(LOCAL_KEY);
        if (raw) setCart(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
  }, [isAuthenticated]);

  // Load server cart when authenticated
  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await cartApi.get();
      setCart(data.cart);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) refresh();
  }, [isAuthenticated, refresh]);

  // Persist guest cart
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  const addItem = async (productId, { quantity = 1, color = '' } = {}) => {
    if (isAuthenticated) {
      const { data } = await cartApi.add(productId, { quantity, color });
      setCart(data.cart);
      return data;
    }
    // Guest: optimistic local add — needs product info passed in
    setCart((prev) => {
      const items = [...(prev.items || [])];
      const idx = items.findIndex((i) => i.product?._id === productId || i.product === productId);
      if (idx >= 0) items[idx].quantity += quantity;
      else items.push({ product: productId, quantity, color, _local: true });
      return { ...prev, items };
    });
  };

  const addItemWithProduct = (product, { quantity = 1, color = '' } = {}) => {
    if (isAuthenticated) {
      return cartApi.add(product._id, { quantity, color }).then(({ data }) => {
        setCart(data.cart);
        return data;
      });
    }
    setCart((prev) => {
      const items = [...(prev.items || [])];
      const idx = items.findIndex((i) => i.product?._id === product._id);
      if (idx >= 0) {
        items[idx].quantity = Math.min(product.stock, items[idx].quantity + quantity);
      } else {
        items.push({ product, quantity: Math.min(product.stock, quantity), color, _local: true });
      }
      return { ...prev, items };
    });
    return Promise.resolve({ message: 'Added to cart.' });
  };

  const updateQuantity = async (productId, quantity) => {
    if (isAuthenticated) {
      const { data } = await cartApi.update(productId, quantity);
      setCart(data.cart);
      return data;
    }
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        (i.product?._id || i.product) === productId ? { ...i, quantity: Math.max(1, quantity) } : i
      ),
    }));
  };

  const removeItem = async (productId) => {
    if (isAuthenticated) {
      const { data } = await cartApi.remove(productId);
      setCart(data.cart);
      return data;
    }
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((i) => (i.product?._id || i.product) !== productId),
    }));
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      await cartApi.clear();
    }
    setCart({ items: [] });
  };

  // Compute totals (handles both server and local carts)
  const items = cart.items || [];
  const detailedItems = items.map((i) => {
    const p = i.product && typeof i.product === 'object' ? i.product : null;
    const unit = p ? (p.salePrice && p.salePrice > 0 ? p.salePrice : p.price) : 0;
    return { ...i, product: p, unit, lineTotal: unit * i.quantity };
  });
  const subtotal = detailedItems.reduce((acc, i) => acc + i.lineTotal, 0);
  const itemCount = detailedItems.reduce((acc, i) => acc + i.quantity, 0);
  const shippingEstimate = subtotal > 0 && subtotal < 50000 ? 2500 : 0;
  const tax = Math.round(subtotal * 0.075);
  const grandTotal = subtotal + shippingEstimate + tax;

  const value = {
    cart,
    items: detailedItems,
    subtotal,
    shippingEstimate,
    tax,
    grandTotal,
    itemCount,
    loading,
    addItem,
    addItemWithProduct,
    updateQuantity,
    removeItem,
    clearCart,
    refresh,
    formatted: {
      subtotal: formatNaira(subtotal),
      shipping: formatNaira(shippingEstimate),
      tax: formatNaira(tax),
      total: formatNaira(grandTotal),
    },
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
