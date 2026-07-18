import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiArrowLeft, FiCheck, FiCreditCard, FiTruck, FiHome, FiDollarSign } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi, formatNaira } from '../services/api';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'card', label: 'Debit / Credit card', icon: FiCreditCard, hint: 'Visa, Mastercard, Verve' },
  { id: 'bank_transfer', label: 'Bank transfer', icon: FiDollarSign, hint: 'We send account details' },
  { id: 'cash_on_delivery', label: 'Cash on delivery', icon: FiHome, hint: 'Pay when it arrives (Lagos only)' },
];

export default function Checkout() {
  const { items, subtotal, shippingEstimate, tax, grandTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [verifyingCoupon, setVerifyingCoupon] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      fullName: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      line1: '',
      line2: '',
      city: 'Lagos',
      state: 'Lagos',
      postalCode: '',
      country: 'Nigeria',
      notes: '',
    },
  });

  if (items.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="font-display text-3xl font-medium tracking-tightest">Your cart is empty.</h1>
        <p className="mt-2 text-mist-dark">Add something to your cart before checking out.</p>
        <Link to="/shop" className="btn-primary mt-6">
          Go to shop
        </Link>
      </div>
    );
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setVerifyingCoupon(true);
    try {
      const { data } = await orderApi.verifyCoupon({ code: couponCode, subtotal });
      setDiscount(data.discount);
      toast.success(data.message);
    } catch (err) {
      setDiscount(0);
      toast.error(err.response?.data?.message || 'Coupon could not be applied.');
    } finally {
      setVerifyingCoupon(false);
    }
  };

  const finalTotal = Math.max(0, grandTotal - discount);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        items: items.map((i) => ({
          product: i.product._id,
          quantity: i.quantity,
          color: i.color || '',
        })),
        shippingAddress: {
          fullName: data.fullName,
          phone: data.phone,
          line1: data.line1,
          line2: data.line2,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
        },
        paymentMethod,
        shippingCost: shippingEstimate,
        tax,
        couponCode: couponCode || '',
        notes: data.notes,
      };
      const { data: res } = await orderApi.create(payload);
      await clearCart();
      toast.success(res.message);
      navigate(`/order/${res.order.orderNumber}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page py-8 md:py-12">
      <div className="mb-8 border-b border-ink/10 pb-6">
        <p className="eyebrow text-mist-dark">// Checkout</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tightest sm:text-5xl">
          Almost yours.
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-10 lg:grid-cols-12">
        {/* Left: forms */}
        <div className="space-y-10 lg:col-span-7">
          {/* Contact */}
          <section>
            <h2 className="mb-4 font-mono text-2xs uppercase tracking-mono text-mist-dark">
              01 · Contact
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="field-label">Full name</label>
                <input
                  type="text"
                  className="input-base mt-1"
                  {...register('fullName', { required: 'Tell us your name.' })}
                />
                {errors.fullName && <p className="mt-1 text-xs text-accent">{errors.fullName.message}</p>}
              </div>
              <div>
                <label className="field-label">Phone</label>
                <input
                  type="tel"
                  className="input-base mt-1"
                  placeholder="+234…"
                  {...register('phone', { required: 'We need a phone number for delivery.' })}
                />
                {errors.phone && <p className="mt-1 text-xs text-accent">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="field-label">Email</label>
                <input
                  type="email"
                  className="input-base mt-1"
                  {...register('email', { required: 'Email is required.' })}
                />
              </div>
            </div>
          </section>

          {/* Shipping */}
          <section>
            <h2 className="mb-4 font-mono text-2xs uppercase tracking-mono text-mist-dark">
              02 · Shipping address
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="field-label">Street address</label>
                <input
                  type="text"
                  className="input-base mt-1"
                  placeholder="House no, street name"
                  {...register('line1', { required: 'Address is required.' })}
                />
                {errors.line1 && <p className="mt-1 text-xs text-accent">{errors.line1.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="field-label">Apartment / suite (optional)</label>
                <input type="text" className="input-base mt-1" {...register('line2')} />
              </div>
              <div>
                <label className="field-label">City</label>
                <input type="text" className="input-base mt-1" {...register('city', { required: 'City is required.' })} />
              </div>
              <div>
                <label className="field-label">State</label>
                <select className="input-base mt-1" {...register('state', { required: 'State is required.' })}>
                  {['Lagos', 'Abuja FCT', 'Rivers', 'Oyo', 'Kano', 'Kaduna', 'Enugu', 'Delta', 'Edo', 'Ogun', 'Anambra', 'Imo', 'Other'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Postal code</label>
                <input type="text" className="input-base mt-1" {...register('postalCode')} />
              </div>
              <div>
                <label className="field-label">Country</label>
                <input type="text" className="input-base mt-1" {...register('country')} />
              </div>
            </div>
          </section>

          {/* Payment */}
          <section>
            <h2 className="mb-4 font-mono text-2xs uppercase tracking-mono text-mist-dark">
              03 · Payment
            </h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-center gap-3 border p-4 transition-colors ${
                    paymentMethod === m.id
                      ? 'border-ink bg-paper-cool'
                      : 'border-ink/15 hover:border-ink/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)}
                    className="h-4 w-4 accent-accent"
                  />
                  <m.icon className="h-5 w-5 text-accent" />
                  <div className="flex-1">
                    <div className="font-display text-sm font-medium">{m.label}</div>
                    <div className="font-mono text-2xs uppercase tracking-mono text-mist-dark">
                      {m.hint}
                    </div>
                  </div>
                  {paymentMethod === m.id && <FiCheck className="h-4 w-4 text-accent" />}
                </label>
              ))}
            </div>
            <p className="mt-3 font-mono text-2xs uppercase tracking-mono text-mist-dark">
              <FiTruck className="mr-1 inline h-3 w-3" />
              Card details are collected by our payment processor. NovaTech never sees or stores them.
            </p>
          </section>

          {/* Notes */}
          <section>
            <label className="field-label">Order notes (optional)</label>
            <textarea
              rows={3}
              className="input-base mt-1"
              placeholder="Delivery instructions, gate code, landmarks…"
              {...register('notes')}
            />
          </section>
        </div>

        {/* Right: summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 border border-ink/10 bg-paper-cool p-6">
            <h2 className="font-display text-xl font-medium tracking-tighter">Your order</h2>

            <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto border-y border-ink/10 py-4">
              {items.map((i) => (
                <li key={i.product?._id || i.product} className="flex gap-3">
                  <div className="relative aspect-square w-14 shrink-0 overflow-hidden border border-ink/10">
                    <img src={i.product?.images?.[0] || ''} alt="" className="h-full w-full object-cover" />
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-[1.25rem] place-items-center bg-ink px-1 font-mono text-2xs text-paper">
                      {i.quantity}
                    </span>
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="line-clamp-1 font-medium">{i.product?.title}</p>
                    <p className="font-mono text-2xs uppercase tracking-mono text-mist-dark">
                      {i.product?.sku}
                    </p>
                  </div>
                  <div className="text-right text-sm font-medium">{formatNaira(i.lineTotal)}</div>
                </li>
              ))}
            </ul>

            {/* Coupon */}
            <div className="mt-4">
              <label className="field-label">Coupon code</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. NOVA10"
                  className="input-base font-mono"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={verifyingCoupon || !couponCode.trim()}
                  className="btn-outline px-4 py-2 whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
              {discount > 0 && (
                <p className="mt-2 inline-flex items-center gap-1 font-mono text-2xs uppercase tracking-mono text-emerald-600">
                  <FiCheck className="h-3 w-3" /> Coupon applied — you saved {formatNaira(discount)}
                </p>
              )}
            </div>

            {/* Totals */}
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-mist-dark">Subtotal</dt>
                <dd>{formatNaira(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mist-dark">Shipping</dt>
                <dd>{shippingEstimate === 0 ? <span className="text-emerald-600">Free</span> : formatNaira(shippingEstimate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mist-dark">VAT (7.5%)</dt>
                <dd>{formatNaira(tax)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <dt>Discount</dt>
                  <dd>−{formatNaira(discount)}</dd>
                </div>
              )}
              <div className="border-t border-ink/10 pt-3">
                <div className="flex items-baseline justify-between">
                  <dt className="font-mono text-2xs uppercase tracking-mono text-mist-dark">Total</dt>
                  <dd className="price-display text-2xl text-ink">{formatNaira(finalTotal)}</dd>
                </div>
              </div>
            </dl>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary mt-6 w-full"
            >
              {submitting ? 'Placing order…' : `Place order · ${formatNaira(finalTotal)}`}
            </button>

            <Link to="/cart" className="mt-3 inline-flex items-center gap-2 font-mono text-2xs uppercase tracking-mono text-mist-dark hover:text-accent">
              <FiArrowLeft className="h-3 w-3" /> Back to cart
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
