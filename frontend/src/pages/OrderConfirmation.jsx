import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiPackage, FiTruck, FiArrowRight, FiCopy } from 'react-icons/fi';
import { orderApi, formatNaira, formatDate } from '../services/api';
import { Spinner, EmptyState } from '../components/ui';

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi
      .get(orderNumber)
      .then(({ data }) => setOrder(data.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading)
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spinner className="h-6 w-6" />
      </div>
    );

  if (!order)
    return (
      <EmptyState
        icon={FiPackage}
        title="We couldn't find that order."
        message="Check the order number we emailed you, or visit your account to see all your orders."
        action={<Link to="/account/orders" className="btn-primary">My orders</Link>}
      />
    );

  const steps = [
    { key: 'pending', label: 'Order placed', icon: FiCheck },
    { key: 'confirmed', label: 'Confirmed', icon: FiPackage },
    { key: 'shipped', label: 'Shipped', icon: FiTruck },
    { key: 'delivered', label: 'Delivered', icon: FiCheck },
  ];
  const stepOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStep = stepOrder.indexOf(order.status);

  return (
    <div className="container-page py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mx-auto grid h-16 w-16 place-items-center bg-ink text-paper">
            <FiCheck className="h-7 w-7 text-accent" />
          </div>
          <p className="mt-6 eyebrow text-mist-dark">// Order confirmed</p>
          <h1 className="mt-2 font-display text-4xl font-medium tracking-tightest sm:text-5xl">
            Thank you for your order.
          </h1>
          <p className="mt-3 text-sm text-mist-dark">
            We have received your order and will reach out within 24 hours to confirm delivery details.
          </p>
        </motion.div>

        {/* Order number */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="border border-ink/15 bg-paper-cool px-4 py-2">
            <p className="font-mono text-2xs uppercase tracking-mono text-mist-dark">Order number</p>
            <p className="font-mono text-sm font-medium">{order.orderNumber}</p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(order.orderNumber);
            }}
            className="btn-ghost"
          >
            <FiCopy className="h-4 w-4" /> Copy
          </button>
        </div>

        {/* Progress */}
        {order.status !== 'cancelled' && (
          <div className="mt-12 border border-ink/10 bg-paper-cool p-6">
            <ol className="grid grid-cols-4 gap-2">
              {steps.map((s, i) => {
                const done = i <= currentStep;
                return (
                  <li key={s.key} className="flex flex-col items-center text-center">
                    <div
                      className={`grid h-10 w-10 place-items-center border-2 ${
                        done ? 'border-accent bg-accent text-paper' : 'border-ink/15 text-mist-dark'
                      }`}
                    >
                      <s.icon className="h-4 w-4" />
                    </div>
                    <p className={`mt-2 font-mono text-2xs uppercase tracking-mono ${done ? 'text-ink' : 'text-mist-dark'}`}>
                      {s.label}
                    </p>
                  </li>
                );
              })}
            </ol>
            {order.timeline?.length > 0 && (
              <ul className="mt-6 space-y-2 border-t border-ink/10 pt-4">
                {order.timeline.slice().reverse().slice(0, 3).map((t, i) => (
                  <li key={i} className="flex justify-between font-mono text-2xs uppercase tracking-mono text-mist-dark">
                    <span>{t.note || t.status}</span>
                    <span>{formatDate(t.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Items */}
        <div className="mt-8 border border-ink/10">
          <div className="border-b border-ink/10 bg-ink p-4">
            <p className="font-mono text-2xs uppercase tracking-mono text-paper/70">// Items</p>
          </div>
          <ul className="divide-y divide-ink/10">
            {order.items.map((i, idx) => (
              <li key={idx} className="flex gap-4 p-4">
                <div className="aspect-square w-16 shrink-0 overflow-hidden border border-ink/10 bg-paper-warm">
                  <img src={i.image} alt={i.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-display text-sm font-medium">{i.title}</p>
                  <p className="font-mono text-2xs uppercase tracking-mono text-mist-dark">
                    {i.sku} · Qty {i.quantity} {i.color && `· ${i.color}`}
                  </p>
                </div>
                <div className="text-sm font-medium">
                  {formatNaira((i.salePrice || i.price) * i.quantity)}
                </div>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 border-t border-ink/10 bg-paper-cool p-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-mist-dark">Subtotal</dt>
              <dd>{formatNaira(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mist-dark">Shipping</dt>
              <dd>{order.shippingCost === 0 ? 'Free' : formatNaira(order.shippingCost)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <dt>Discount</dt>
                <dd>−{formatNaira(order.discount)}</dd>
              </div>
            )}
            <div className="border-t border-ink/10 pt-2">
              <div className="flex items-baseline justify-between">
                <dt className="font-mono text-2xs uppercase tracking-mono text-mist-dark">Total</dt>
                <dd className="price-display text-xl text-ink">{formatNaira(order.total)}</dd>
              </div>
            </div>
          </dl>
        </div>

        {/* Delivery */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="border border-ink/10 bg-paper-cool p-5">
            <p className="eyebrow text-mist-dark">// Shipping to</p>
            <p className="mt-2 font-medium">{order.shippingAddress.fullName}</p>
            <p className="text-sm text-mist-dark">{order.shippingAddress.phone}</p>
            <p className="mt-2 text-sm text-mist-dark">
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}
              <br />
              {order.shippingAddress.country}
            </p>
          </div>
          <div className="border border-ink/10 bg-paper-cool p-5">
            <p className="eyebrow text-mist-dark">// Payment</p>
            <p className="mt-2 font-medium capitalize">
              {order.payment.method.replace(/_/g, ' ')}
            </p>
            <p className="text-sm text-mist-dark">
              Status: <span className="capitalize">{order.payment.status}</span>
            </p>
            <p className="mt-2 font-mono text-2xs uppercase tracking-mono text-mist-dark">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/shop" className="btn-primary">
            Continue shopping
            <FiArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/account/orders" className="btn-outline">
            View all orders
          </Link>
        </div>
      </div>
    </div>
  );
}
