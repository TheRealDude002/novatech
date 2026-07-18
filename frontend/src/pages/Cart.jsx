import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMinus,
  FiPlus,
  FiTrash2,
  FiShoppingBag,
  FiArrowRight,
  FiArrowLeft,
  FiShield,
  FiTruck,
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatNaira } from '../services/api';
import { EmptyState } from '../components/ui';
import toast from 'react-hot-toast';

export default function Cart() {
  const { items, subtotal, shippingEstimate, tax, grandTotal, itemCount, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClear = async () => {
    if (!window.confirm('Empty your cart?')) return;
    await clearCart();
    toast.success('Cart cleared.');
  };

  if (items.length === 0) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={FiShoppingBag}
          title="Your cart is empty."
          message="Browse the catalog and add what catches your eye — we'll hold it here while you decide."
          action={
            <Link to="/shop" className="btn-primary">
              Start shopping
              <FiArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8 md:py-12">
      <div className="mb-8 flex items-end justify-between border-b border-ink/10 pb-6">
        <div>
          <p className="eyebrow text-mist-dark">// Cart</p>
          <h1 className="mt-2 font-display text-4xl font-medium tracking-tightest sm:text-5xl">
            Your cart
          </h1>
        </div>
        <p className="font-mono text-2xs uppercase tracking-mono text-mist-dark">
          {itemCount} item{itemCount !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        {/* Items */}
        <div className="lg:col-span-8">
          <ul className="divide-y divide-ink/10 border-y border-ink/10">
            <AnimatePresence>
              {items.map((item) => (
                <motion.li
                  key={item.product?._id || item.product}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0, padding: 0 }}
                  className="flex gap-4 py-5"
                >
                  <Link
                    to={`/product/${item.product?.slug}`}
                    className="aspect-square w-24 shrink-0 overflow-hidden border border-ink/10 bg-paper-warm sm:w-32"
                  >
                    <img
                      src={item.product?.images?.[0] || item.product?.image || ''}
                      alt={item.product?.title || 'Product'}
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-2xs uppercase tracking-mono text-mist-dark">
                          {item.product?.brand} · {item.product?.sku}
                        </p>
                        <Link
                          to={`/product/${item.product?.slug}`}
                          className="mt-1 block font-display text-base font-medium tracking-tight text-ink hover:text-accent"
                        >
                          {item.product?.title}
                        </Link>
                        {item.color && (
                          <p className="mt-1 font-mono text-2xs uppercase tracking-mono text-mist-dark">
                            Color: {item.color}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.product?._id || item.product)}
                        className="grid h-8 w-8 place-items-center text-mist-dark hover:bg-accent-soft hover:text-accent"
                        aria-label="Remove item"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                      <div className="flex items-center border border-ink/15">
                        <button
                          onClick={() => updateQuantity(item.product?._id || item.product, item.quantity - 1)}
                          className="grid h-9 w-9 place-items-center hover:bg-paper-warm"
                          aria-label="Decrease"
                        >
                          <FiMinus className="h-3 w-3" />
                        </button>
                        <span className="grid h-9 w-10 place-items-center border-x border-ink/15 font-mono text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product?._id || item.product, Math.min(item.product?.stock || 99, item.quantity + 1))}
                          className="grid h-9 w-9 place-items-center hover:bg-paper-warm"
                          aria-label="Increase"
                        >
                          <FiPlus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="price-display text-lg text-ink">
                          {formatNaira(item.lineTotal)}
                        </div>
                        <div className="font-mono text-2xs text-mist-dark">
                          {formatNaira(item.unit)} each
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="mt-6 flex justify-between">
            <Link to="/shop" className="btn-ghost">
              <FiArrowLeft className="h-4 w-4" />
              Continue shopping
            </Link>
            <button onClick={handleClear} className="btn-ghost text-accent">
              Empty cart
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 border border-ink/10 bg-paper-cool p-6">
            <h2 className="font-display text-xl font-medium tracking-tighter">Order summary</h2>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-mist-dark">Subtotal</dt>
                <dd className="font-medium">{formatNaira(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mist-dark">Shipping estimate</dt>
                <dd className="font-medium">
                  {shippingEstimate === 0 ? (
                    <span className="text-emerald-600">Free</span>
                  ) : (
                    formatNaira(shippingEstimate)
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mist-dark">VAT (7.5%)</dt>
                <dd className="font-medium">{formatNaira(tax)}</dd>
              </div>
              {shippingEstimate > 0 && (
                <p className="font-mono text-2xs uppercase tracking-mono text-mist-dark">
                  Add {formatNaira(50000 - subtotal)} more for free shipping.
                </p>
              )}
              <div className="border-t border-ink/10 pt-3">
                <div className="flex items-baseline justify-between">
                  <dt className="font-mono text-2xs uppercase tracking-mono text-mist-dark">Total</dt>
                  <dd className="price-display text-2xl text-ink">{formatNaira(grandTotal)}</dd>
                </div>
              </div>
            </dl>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary mt-6 w-full"
            >
              {isAuthenticated ? 'Proceed to checkout' : 'Sign in to checkout'}
              <FiArrowRight className="h-4 w-4" />
            </button>

            <ul className="mt-6 space-y-2 border-t border-ink/10 pt-4 text-mist-dark">
              <li className="flex items-center gap-2 font-mono text-2xs uppercase tracking-mono">
                <FiTruck className="h-4 w-4 text-accent" /> Same-day Lagos dispatch
              </li>
              <li className="flex items-center gap-2 font-mono text-2xs uppercase tracking-mono">
                <FiShield className="h-4 w-4 text-accent" /> Secure checkout
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
