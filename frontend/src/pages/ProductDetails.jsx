import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHeart,
  FiStar,
  FiMinus,
  FiPlus,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiChevronRight,
  FiCheck,
  FiArrowLeft,
} from 'react-icons/fi';
import { productApi, reviewApi, formatNaira, discountPercent, cn } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Spinner, EmptyState } from '../components/ui';
import ProductCard from '../components/ProductCard';
import { FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItemWithProduct } = useCart();
  const { toggle: toggleWishlist, has } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState('');
  const [tab, setTab] = useState('description');

  useEffect(() => {
    setLoading(true);
    setActiveImage(0);
    setQuantity(1);
    setColor('');
    Promise.all([
      productApi.get(slug),
      productApi.related(slug),
      reviewApi.list(slug).catch(() => ({ data: { reviews: [] } })),
    ])
      .then(([p, r, rev]) => {
        setProduct(p.data.product);
        setRelated(r.data.products || []);
        setReviews(rev.data.reviews || []);
        if (p.data.product?.colors?.length) setColor(p.data.product.colors[0].name);
      })
      .catch(() => {
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading)
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spinner className="h-6 w-6 text-ink" />
      </div>
    );

  if (!product)
    return (
      <EmptyState
        icon={FiPackage}
        title="We can't find that product."
        message="It may have been retired, or the link may be wrong. Try searching the catalog instead."
        action={
          <Link to="/shop" className="btn-primary">
            Back to shop
          </Link>
        }
      />
    );

  const discount = discountPercent(product.price, product.salePrice);
  const unit = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
  const wished = has(product._id);

  const handleAdd = () => {
    if (product.stock <= 0) return toast.error('This product is sold out.');
    addItemWithProduct(product, { quantity, color });
    toast.success(`Added ${quantity} × ${product.title.slice(0, 30)}… to cart.`);
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) return toast.error('This product is sold out.');
    addItemWithProduct(product, { quantity, color });
    navigate('/cart');
  };

  const handleWishlist = () => {
    toggleWishlist(product._id);
    toast.success(wished ? 'Removed from wishlist.' : 'Saved to wishlist.');
  };

  return (
    <div className="container-page py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 font-mono text-2xs uppercase tracking-mono text-mist-dark">
        <Link to="/" className="hover:text-accent">Home</Link>
        <FiChevronRight className="h-3 w-3" />
        <Link to="/shop" className="hover:text-accent">Shop</Link>
        <FiChevronRight className="h-3 w-3" />
        <Link to={`/shop?category=${product.category?.slug}`} className="hover:text-accent">
          {product.category?.name}
        </Link>
        <FiChevronRight className="h-3 w-3" />
        <span className="text-ink">{product.sku}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-12">
        {/* Gallery */}
        <div className="md:col-span-7 lg:col-span-7">
          <div className="grid gap-3 lg:grid-cols-12">
            {/* Thumbnails */}
            <div className="order-2 flex gap-3 lg:order-1 lg:col-span-2 lg:flex-col">
              {product.images?.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'aspect-square w-20 overflow-hidden border bg-paper-warm lg:w-full',
                    i === activeImage ? 'border-ink' : 'border-ink/15 hover:border-ink/50'
                  )}
                >
                  <img src={img} alt={`${product.title} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            {/* Main image */}
            <div className="order-1 lg:col-span-10 lg:order-2">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0.5, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative aspect-square overflow-hidden border border-ink/10 bg-paper-warm"
              >
                <img
                  src={product.images?.[activeImage]}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
                {discount > 0 && (
                  <div className="absolute left-0 top-0 bg-accent px-3 py-1.5 font-mono text-2xs uppercase tracking-mono text-paper">
                    −{discount}% off
                  </div>
                )}
                <div className="absolute bottom-3 left-3">
                  <span className="spec-stamp-dark">
                    SKU · {product.sku}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="md:col-span-5 lg:col-span-5">
          <div className="flex items-center gap-3 font-mono text-2xs uppercase tracking-mono text-mist-dark">
            <span>{product.brand}</span>
            <span className="h-3 w-px bg-ink/15" />
            <span>{product.category?.name}</span>
          </div>

          <h1 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tightest sm:text-4xl">
            {product.title}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <FiStar
                  key={i}
                  className={cn(
                    'h-4 w-4',
                    i < Math.floor(product.rating)
                      ? 'fill-accent text-accent'
                      : 'text-ink/20'
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-mist-dark">
              {product.rating?.toFixed?.(1) || '0.0'} · {product.reviewsCount || 0} review{(product.reviewsCount || 0) !== 1 ? 's' : ''}
            </span>
          </div>

          <p className="mt-5 text-pretty text-sm text-ink/80">{product.shortDescription || product.description.slice(0, 180)}</p>

          {/* Price */}
          <div className="mt-6 border-y border-ink/10 py-5">
            <div className="flex items-end gap-3">
              <div className="price-display text-4xl text-ink">{formatNaira(unit)}</div>
              {discount > 0 && (
                <>
                  <div className="mb-1 font-mono text-xs text-mist-dark line-through">
                    {formatNaira(product.price)}
                  </div>
                  <div className="mb-1 inline-flex items-center bg-accent-soft px-2 py-1 font-mono text-2xs uppercase tracking-mono text-accent-deep">
                    Save {formatNaira(product.price - unit)}
                  </div>
                </>
              )}
            </div>
            <p className="mt-2 font-mono text-2xs uppercase tracking-mono text-mist-dark">
              Tax included · {product.warranty && product.warranty !== '—' ? `${product.warranty} warranty` : 'No warranty'}
            </p>
          </div>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="mt-5">
              <p className="field-label">Color: <span className="text-ink">{color}</span></p>
              <div className="mt-2 flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    title={c.name}
                    className={cn(
                      'grid h-9 w-9 place-items-center border-2 transition-colors',
                      color === c.name ? 'border-ink' : 'border-ink/15 hover:border-ink/50'
                    )}
                  >
                    <span className="h-5 w-5" style={{ backgroundColor: c.hex }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center border border-ink/15">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="grid h-12 w-12 place-items-center hover:bg-paper-warm"
                aria-label="Decrease quantity"
              >
                <FiMinus className="h-4 w-4" />
              </button>
              <input
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value) || 1)))}
                className="h-12 w-14 border-x border-ink/15 bg-transparent text-center font-mono text-sm outline-none"
              />
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="grid h-12 w-12 place-items-center hover:bg-paper-warm"
                aria-label="Increase quantity"
              >
                <FiPlus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={product.stock <= 0}
              className="btn-primary flex-1 px-6 py-3"
            >
              {product.stock > 0 ? 'Add to cart' : 'Sold out'}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="btn-accent px-6 py-3"
            >
              Buy now
            </button>

            <button
              onClick={handleWishlist}
              className="grid h-12 w-12 place-items-center border border-ink/15 hover:border-ink hover:bg-ink hover:text-paper"
              aria-label="Toggle wishlist"
            >
              <FiHeart className={cn('h-5 w-5', wished && 'fill-accent text-accent')} />
            </button>
          </div>

          {/* Stock status */}
          <div className="mt-4 flex items-center gap-2 font-mono text-2xs uppercase tracking-mono">
            {product.stock > 0 ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-ink">{product.stock} in stock</span>
                {product.stock <= 5 && (
                  <span className="text-accent">· only {product.stock} left</span>
                )}
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-accent">Out of stock</span>
              </>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-ink/10 pt-6">
            {[
              { icon: FiTruck, label: 'Same-day Lagos dispatch' },
              { icon: FiShield, label: 'Genuine warranty' },
              { icon: FiRefreshCw, label: '30-day returns' },
            ].map((b) => (
              <div key={b.label} className="text-center">
                <b.icon className="mx-auto h-5 w-5 text-accent" />
                <p className="mt-2 font-mono text-2xs uppercase tracking-mono text-mist-dark">
                  {b.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16 border-t border-ink/10">
        <div className="flex gap-6 border-b border-ink/10">
          {[
            { key: 'description', label: 'Description' },
            { key: 'specs', label: 'Specifications' },
            { key: 'reviews', label: `Reviews (${product.reviewsCount || 0})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'border-b-2 py-4 font-mono text-2xs uppercase tracking-mono transition-colors',
                tab === t.key
                  ? 'border-accent text-ink'
                  : 'border-transparent text-mist-dark hover:text-ink'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="py-8">
          {tab === 'description' && (
            <div className="max-w-3xl">
              <p className="text-pretty text-sm leading-7 text-ink/85">{product.description}</p>
            </div>
          )}

          {tab === 'specs' && (
            <div className="max-w-3xl">
              {product.specifications?.length > 0 ? (
                <dl className="divide-y divide-ink/10 border border-ink/10">
                  {product.specifications.map((s, i) => (
                    <div key={i} className="grid grid-cols-3 gap-4 px-4 py-3 odd:bg-paper-cool">
                      <dt className="font-mono text-2xs uppercase tracking-mono text-mist-dark">
                        {s.label}
                      </dt>
                      <dd className="col-span-2 text-sm text-ink">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm text-mist-dark">No specifications listed for this product.</p>
              )}
            </div>
          )}

          {tab === 'reviews' && (
            <div className="grid gap-10 md:grid-cols-12">
              <div className="md:col-span-7">
                {reviews.length === 0 ? (
                  <p className="text-sm text-mist-dark">
                    No reviews yet. Be the first to share your experience.
                  </p>
                ) : (
                  <ul className="space-y-6">
                    {reviews.map((r) => (
                      <li key={r._id} className="border border-ink/10 bg-paper-cool p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-display text-base font-medium">{r.name}</div>
                            {r.isVerifiedPurchase && (
                              <span className="mt-1 inline-flex items-center gap-1 font-mono text-2xs uppercase tracking-mono text-emerald-600">
                                <FiCheck className="h-3 w-3" /> Verified purchase
                              </span>
                            )}
                          </div>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <FiStar
                                key={i}
                                className={i < r.rating ? 'h-3.5 w-3.5 fill-accent text-accent' : 'h-3.5 w-3.5 text-ink/15'}
                              />
                            ))}
                          </div>
                        </div>
                        {r.title && (
                          <h4 className="mt-3 font-display text-sm font-medium">{r.title}</h4>
                        )}
                        <p className="mt-2 text-pretty text-sm text-ink/85">{r.comment}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="md:col-span-5">
                <div className="border border-ink/10 bg-paper-cool p-6">
                  <h3 className="font-display text-lg font-medium tracking-tighter">
                    Share your experience
                  </h3>
                  <p className="mt-2 text-sm text-mist-dark">
                    {isAuthenticated
                      ? 'Bought this product? Help other shoppers decide.'
                      : 'Sign in to leave a review on products you have purchased.'}
                  </p>
                  {isAuthenticated ? (
                    <ReviewForm productId={product._id} onPosted={() => {
                      reviewApi.list(product._id).then(({ data }) => setReviews(data.reviews || []));
                    }} />
                  ) : (
                    <Link to="/login" className="btn-primary mt-4 w-full">
                      Sign in to review
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20">
          <div className="mb-6 flex items-end justify-between border-b border-ink/10 pb-4">
            <div>
              <p className="eyebrow text-mist-dark">// You might also like</p>
              <h2 className="mt-2 font-display text-2xl font-medium tracking-tightest sm:text-3xl">
                Pairs well with
              </h2>
            </div>
            <Link to={`/shop?category=${product.category?.slug}`} className="btn-outline">
              See more
              <FiChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {related.slice(0, 4).map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-12">
        <Link to="/shop" className="inline-flex items-center gap-2 font-mono text-2xs uppercase tracking-mono text-mist-dark hover:text-accent">
          <FiArrowLeft className="h-4 w-4" /> Back to shop
        </Link>
      </div>
    </div>
  );
}

function ReviewForm({ productId, onPosted }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (comment.trim().length < 10) {
      toast.error('Please write at least 10 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await reviewApi.create(productId, { rating, title, comment });
      toast.success('Review posted. Thanks for sharing.');
      setTitle('');
      setComment('');
      setRating(5);
      onPosted?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not post review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <div>
        <p className="field-label">Your rating</p>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className="p-1"
              aria-label={`Rate ${n} stars`}
            >
              <FiStar className={n <= rating ? 'h-5 w-5 fill-accent text-accent' : 'h-5 w-5 text-ink/20'} />
            </button>
          ))}
        </div>
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="input-base"
      />
      <textarea
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What did you like? What didn't you? Help others decide."
        className="input-base"
      />
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Posting…' : 'Post review'}
      </button>
    </form>
  );
}
