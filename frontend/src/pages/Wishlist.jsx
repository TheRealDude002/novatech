import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productApi, formatNaira, discountPercent } from '../services/api';
import ProductCard from '../components/ProductCard';
import { EmptyState, ProductCardSkeleton } from '../components/ui';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const { items: ids, remove, count } = useWishlist();
  const { addItemWithProduct } = useCart();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(ids.map((id) => productApi.get(id).then((r) => r.data.product).catch(() => null)))
      .then((res) => setProducts(res.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [ids]);

  const moveToCart = (p) => {
    if (p.stock <= 0) return toast.error('That product is sold out.');
    addItemWithProduct(p, { quantity: 1 });
    remove(p._id);
    toast.success(`Moved "${p.title.slice(0, 30)}…" to cart.`);
  };

  return (
    <div className="container-page py-8 md:py-12">
      <div className="mb-8 flex items-end justify-between border-b border-ink/10 pb-6">
        <div>
          <p className="eyebrow text-mist-dark">// Wishlist</p>
          <h1 className="mt-2 font-display text-4xl font-medium tracking-tightest sm:text-5xl">
            Saved for later
          </h1>
        </div>
        <p className="font-mono text-2xs uppercase tracking-mono text-mist-dark">
          {count} item{count !== 1 ? 's' : ''}
        </p>
      </div>

      {!isAuthenticated ? (
        <EmptyState
          icon={FiHeart}
          title="Sign in to save items you love."
          message="Your wishlist syncs across devices once you sign in. Until then, anything you save lives only in this browser."
          action={
            <div className="flex gap-3">
              <Link to="/login" className="btn-primary">Sign in</Link>
              <Link to="/register" className="btn-outline">Create account</Link>
            </div>
          }
        />
      ) : loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={FiHeart}
          title="Nothing saved yet."
          message="Tap the heart on any product to keep it here for later."
          action={
            <Link to="/shop" className="btn-primary">
              Browse the catalog
              <FiArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="relative"
            >
              <ProductCard product={p} index={i} />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => moveToCart(p)}
                  disabled={p.stock <= 0}
                  className="btn-primary flex-1 px-2 py-2"
                >
                  <FiShoppingBag className="h-3.5 w-3.5" /> Move to cart
                </button>
                <button
                  onClick={() => {
                    remove(p._id);
                    toast.success('Removed from wishlist.');
                  }}
                  className="grid h-9 w-9 place-items-center border border-ink/15 text-mist-dark hover:border-accent hover:text-accent"
                  aria-label="Remove"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
