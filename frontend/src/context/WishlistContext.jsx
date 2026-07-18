import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { wishlistApi } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
};

const LOCAL_KEY = 'novatech_wishlist_guest';

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]); // array of product ids (strings)
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      try {
        const raw = localStorage.getItem(LOCAL_KEY);
        if (raw) setItems(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
  }, [isAuthenticated]);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await wishlistApi.get();
      const ids = (data.wishlist?.items || [])
        .map((i) => (i.product && typeof i.product === 'object' ? i.product._id : i.product))
        .filter(Boolean);
      setItems(ids);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) refresh();
  }, [isAuthenticated, refresh]);

  useEffect(() => {
    if (!isAuthenticated) localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  }, [items, isAuthenticated]);

  const toggle = async (productId) => {
    const id = String(productId);
    if (isAuthenticated) {
      if (items.includes(id)) {
        await wishlistApi.remove(id);
        setItems((prev) => prev.filter((i) => i !== id));
      } else {
        await wishlistApi.add(id);
        setItems((prev) => [...prev, id]);
      }
      return;
    }
    setItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const has = (productId) => items.includes(String(productId));

  const remove = async (productId) => {
    const id = String(productId);
    if (isAuthenticated) await wishlistApi.remove(id);
    setItems((prev) => prev.filter((i) => i !== id));
  };

  const value = {
    items,
    count: items.length,
    toggle,
    has,
    remove,
    refresh,
    loading,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
