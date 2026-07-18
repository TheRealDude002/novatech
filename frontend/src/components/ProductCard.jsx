import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiStar } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatNaira, discountPercent, cn } from '../services/api';
import toast from 'react-hot-toast';

const SpecStamp = ({ sku, stock, dark = false }) => (
  <div className={cn('flex flex-wrap items-center gap-1', dark ? 'text-paper/80' : 'text-ink/80')}>
    <span className={dark ? 'spec-stamp-dark' : 'spec-stamp'}>{sku}</span>
    {stock > 0 ? (
      <span className={dark ? 'spec-stamp-dark' : 'spec-stamp'}>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        In stock
      </span>
    ) : (
      <span className={dark ? 'spec-stamp-dark' : 'spec-stamp'}>
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Sold out
      </span>
    )}
  </div>
);

export default function ProductCard({ product, index = 0 }) {
  const { toggle: toggleWishlist, has } = useWishlist();
  const { addItemWithProduct } = useCart();
  const wished = has(product._id);
  const discount = discountPercent(product.price, product.salePrice);
  const unit = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      toast.error('This product is sold out.');
      return;
    }
    addItemWithProduct(product, { quantity: 1 });
    toast.success(`${product.title.slice(0, 40)}… added to cart.`);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
    toast.success(wished ? 'Removed from wishlist.' : 'Saved to wishlist.');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Link
        to={`/product/${product.slug}`}
        className="group block card-surface hover:border-ink hover:shadow-soft"
      >
        <div className="relative aspect-square overflow-hidden bg-paper-warm">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Top-left: discount badge */}
          {discount > 0 && (
            <div className="absolute left-0 top-0 bg-accent px-2 py-1 font-mono text-2xs uppercase tracking-mono text-paper">
              −{discount}%
            </div>
          )}
          {/* Top-right: wishlist */}
          <button
            onClick={handleWishlist}
            aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
            className="absolute right-2 top-2 grid h-8 w-8 place-items-center bg-paper/90 backdrop-blur-sm transition-colors hover:bg-paper"
          >
            <FiHeart className={cn('h-4 w-4', wished && 'fill-accent text-accent')} />
          </button>
          {/* Bottom: spec stamps */}
          <div className="absolute inset-x-2 bottom-2 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <SpecStamp sku={product.sku} stock={product.stock} dark />
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between gap-2 font-mono text-2xs uppercase tracking-mono text-mist-dark">
            <span>{product.brand}</span>
            <span className="inline-flex items-center gap-1">
              <FiStar className="h-3 w-3 fill-accent text-accent" />
              {product.rating?.toFixed?.(1) || '0.0'} ({product.reviewsCount || 0})
            </span>
          </div>
          <h3 className="mt-2 font-display text-base font-medium leading-tight tracking-tighter text-ink line-clamp-2">
            {product.title}
          </h3>
          <div className="mt-3 flex items-end justify-between gap-2">
            <div>
              <div className="price-display text-lg text-ink">{formatNaira(unit)}</div>
              {discount > 0 && (
                <div className="font-mono text-2xs text-mist-dark line-through">
                  {formatNaira(product.price)}
                </div>
              )}
            </div>
            <button
              onClick={handleAdd}
              disabled={product.stock <= 0}
              className="btn-primary px-3 py-2 text-2xs"
            >
              Add
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
