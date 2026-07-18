import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowRight,
  FiTruck,
  FiShield,
  FiHeadphones,
  FiRefreshCw,
  FiStar,
  FiArrowUpRight,
} from 'react-icons/fi';
import { productApi, categoryApi, bannerApi, formatNaira } from '../services/api';
import ProductCard from '../components/ProductCard';
import { SectionHeader, ProductCardSkeleton, EmptyState } from '../components/ui';

const CATEGORY_TILES = [
  { name: 'Phone Cases', slug: 'phone-cases', image: 'https://images.unsplash.com/photo-1535157412991-2ef801c1748b' },
  { name: 'Chargers', slug: 'chargers', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600' },
  { name: 'Wireless Chargers', slug: 'wireless-chargers', image: 'https://images.unsplash.com/photo-1615526675159-e248c3021d3f' },
  { name: 'Power Banks', slug: 'power-banks', image: 'https://images.unsplash.com/photo-1594843665794-446ce915d840' },
  { name: 'Bluetooth Earbuds', slug: 'bluetooth-earbuds', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600' },
  { name: 'Smartwatches', slug: 'smartwatches', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600' },
];

const TESTIMONIALS = [
  {
    name: 'Adaeze O.',
    role: 'Verified buyer',
    text: 'Ordered the NovaCharge 65W on Monday, had it in Lekki by Wednesday. Charges my MacBook and phone at the same time — exactly what I needed for client meetings on the move.',
    rating: 5,
  },
  {
    name: 'Tunde B.',
    role: 'Verified buyer',
    text: 'The AirPulse Pro earbuds block out the BRT bus noise completely. Call quality is the part that surprised me — clients can actually hear me clearly from a moving car.',
    rating: 5,
  },
  {
    name: 'Fatima I.',
    role: 'Verified buyer',
    text: 'Bought a TitanCell power bank for a work trip. Charged my phone 4 times and still had 30% left. The built-in display is genuinely useful — no more guessing.',
    rating: 4,
  },
];

const WHY_US = [
  {
    icon: FiTruck,
    title: 'Same-day dispatch in Lagos',
    body: 'Order before 2pm and we dispatch the same day. Lekki, VI and Ikoyi get next-day delivery on most items.',
  },
  {
    icon: FiShield,
    title: 'Genuine warranty on everything',
    body: 'Every product carries the manufacturer warranty, plus our own 30-day satisfaction guarantee. No grey-market stock.',
  },
  {
    icon: FiHeadphones,
    title: 'Excellent customer service',
    body: 'Call us, message us, or walk into the Lekki showroom. We answer questions in plain English and Yoruba.',
  },
  {
    icon: FiRefreshCw,
    title: '30-day no-fuss returns',
    body: 'If it is not right, send it back within 30 days for a full refund or exchange. We even cover the return pickup in Lagos.',
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroBanner, setHeroBanner] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [feat, late, ban] = await Promise.all([
          productApi.featured(),
          productApi.latest(),
          bannerApi.list('hero'),
        ]);
        if (!active) return;
        setFeatured(feat.data.products || []);
        setLatest(late.data.products || []);
        const bs = ban.data.banners || [];
        setBanners(bs);
        setHeroBanner(bs[0] || null);
      } catch (err) {
        // fall through
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      {/* ============== HERO ============== */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="absolute inset-0 grid-stamp-dark opacity-60" />
        {heroBanner?.image && (
          <div className="absolute inset-0">
            <img
              src={heroBanner.image}
              alt={heroBanner.title}
              className="h-full w-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
          </div>
        )}
        <div className="container-page relative grid gap-12 py-16 md:grid-cols-12 md:py-24 lg:py-32">
          <div className="md:col-span-7 lg:col-span-6">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="eyebrow text-accent"
            >
              // NovaTech · Lekki Phase 1, Lagos
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="mt-5 font-display text-5xl font-medium leading-[1.02] tracking-tightest sm:text-6xl lg:text-7xl"
            >
              Quality gadgets,
              <br />
              <span className="text-accent">smarter living.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className="mt-6 max-w-md text-pretty text-sm text-paper/70 sm:text-base"
            >
              Phone cases, chargers, earbuds and smartwatches — hand-picked, warrantied, and delivered
              across Nigeria. No guesswork, no grey-market stock.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link to="/shop" className="btn-accent">
                Shop the catalog
                <FiArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/shop?onSale=true" className="btn-dark">
                See this week's deals
              </Link>
            </motion.div>

            {/* Stat strip */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.25 }}
              className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-paper/15 pt-6"
            >
              {[
                { stat: '4,200+', label: 'Orders shipped' },
                { stat: '4.8★', label: 'Average rating' },
                { stat: '24h', label: 'Lagos dispatch' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-display text-3xl font-medium tracking-tighter text-paper">
                    {s.stat}
                  </div>
                  <div className="mt-1 font-mono text-2xs uppercase tracking-mono text-paper/60">
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Featured product showcase */}
          <div className="md:col-span-5 lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative ml-auto max-w-md"
            >
              {featured[0] && (
                <Link
                  to={`/product/${featured[0].slug}`}
                  className="group block border border-paper/15 bg-ink-soft/40 p-5 backdrop-blur-sm transition-colors hover:border-accent"
                >
                  <div className="flex items-center justify-between font-mono text-2xs uppercase tracking-mono text-paper/60">
                    <span>// Featured drop</span>
                    <span>{featured[0].sku}</span>
                  </div>
                  <div className="relative mt-4 aspect-square overflow-hidden bg-ink-soft">
                    <img
                      src={featured[0].images?.[0]}
                      alt={featured[0].title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute right-3 top-3 bg-accent px-2 py-1 font-mono text-2xs uppercase tracking-mono text-paper">
                      Featured
                    </div>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div>
                      <h3 className="font-display text-lg font-medium tracking-tighter text-paper">
                        {featured[0].title}
                      </h3>
                      <p className="mt-1 font-mono text-2xs uppercase tracking-mono text-paper/60">
                        {featured[0].brand}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="price-display text-xl text-paper">
                        {formatNaira(featured[0].salePrice || featured[0].price)}
                      </div>
                      <div className="mt-1 inline-flex items-center gap-1 text-accent">
                        <span className="font-mono text-2xs uppercase tracking-mono">View</span>
                        <FiArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              )}
            </motion.div>
          </div>
        </div>

        {/* Marquee */}
        <div className="border-t border-paper/10 bg-ink-deep py-3">
          <div className="flex overflow-hidden">
            <div className="flex animate-marquee gap-8 whitespace-nowrap pr-8 font-mono text-2xs uppercase tracking-mono text-paper/40">
              {[
                'Free delivery in Lagos over ₦50,000',
                '30-day returns',
                'Genuine warranty on every product',
                'Walk into our Lekki showroom',
                'Order before 2pm for same-day dispatch',
                'Call on +234 801 234 5678',
              ]
                .concat([
                  'Free delivery in Lagos over ₦50,000',
                  '30-day returns',
                  'Genuine warranty on every product',
                  'Walk into our Lekki showroom',
                  'Order before 2pm for same-day dispatch',
                  'Call on +234 801 234 5678',
                ])
                .map((t, i) => (
                  <span key={i} className="flex items-center gap-8">
                    {t}
                    <span className="text-accent">●</span>
                  </span>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============== CATEGORIES ============== */}
      <section className="container-page py-16 md:py-24">
        <SectionHeader
          eyebrow="// Shop by category"
          title="Find what your phone is missing."
          action={
            <Link to="/shop" className="btn-outline">
              All categories
              <FiArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORY_TILES.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.24) }}
            >
              <Link
                to={`/shop?category=${c.slug}`}
                className="group block aspect-square overflow-hidden border border-ink/10 bg-paper-warm"
              >
                <div className="relative h-full w-full">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p className="font-mono text-2xs uppercase tracking-mono text-paper/60">
                      0{i + 1}
                    </p>
                    <h3 className="mt-1 font-display text-sm font-medium tracking-tight text-paper">
                      {c.name}
                    </h3>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============== FEATURED PRODUCTS ============== */}
      <section className="container-page py-8 md:py-12">
        <SectionHeader
          eyebrow="// Featured"
          title="Picked by the team, this week."
          action={
            <Link to="/shop" className="btn-outline">
              View all
              <FiArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featured.slice(0, 8).map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
        </div>
      </section>

      {/* ============== PROMO BANNER ============== */}
      {banners[1] && (
        <section className="container-page py-12">
          <div className="relative overflow-hidden border border-ink/10 bg-ink text-paper">
            <div className="absolute inset-0 grid-stamp-dark opacity-40" />
            <div className="grid gap-8 p-8 md:grid-cols-12 md:items-center md:p-12">
              <div className="md:col-span-7">
                <p className="eyebrow text-accent">// Promo</p>
                <h3 className="mt-3 font-display text-3xl font-medium tracking-tightest sm:text-4xl lg:text-5xl">
                  {banners[1].title}
                </h3>
                <p className="mt-3 max-w-md text-sm text-paper/70">
                  {banners[1].subtitle}
                </p>
                <div className="mt-6">
                  <Link to={banners[1].ctaLink || '/shop'} className="btn-accent">
                    {banners[1].ctaText || 'Shop now'}
                    <FiArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="md:col-span-5">
                <img
                  src={banners[1].image}
                  alt={banners[1].title}
                  className="aspect-[4/3] w-full border border-paper/15 object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============== LATEST ARRIVALS ============== */}
      <section className="container-page py-12 md:py-16">
        <SectionHeader
          eyebrow="// Just in"
          title="Latest arrivals on the shelf."
          action={
            <Link to="/shop?sort=newest" className="btn-outline">
              See all new
              <FiArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : latest.slice(0, 4).map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
        </div>
      </section>

      {/* ============== WHY CHOOSE US ============== */}
      <section className="container-page py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-12 md:items-start">
          <div className="md:col-span-4">
            <p className="eyebrow text-mist-dark">// Why NovaTech</p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tightest sm:text-4xl lg:text-5xl">
              The difference is in the details.
            </h2>
            <p className="mt-4 max-w-md text-sm text-mist-dark">
              We started NovaTech because we were tired of guessing whether the charger we just bought
              would actually deliver 65W, or whether the case would survive a single drop. So we built
              the store we wanted to shop at.
            </p>
            <Link to="/contact" className="mt-6 inline-flex btn-outline">
              Visit the Lekki showroom
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-px bg-ink/10 sm:grid-cols-2 md:col-span-8">
            {WHY_US.map((w) => (
              <div key={w.title} className="bg-paper-cool p-6">
                <w.icon className="h-6 w-6 text-accent" />
                <h3 className="mt-4 font-display text-lg font-medium tracking-tighter text-ink">
                  {w.title}
                </h3>
                <p className="mt-2 text-sm text-mist-dark">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== TESTIMONIALS ============== */}
      <section className="bg-ink text-paper">
        <div className="container-page py-16 md:py-24">
          <SectionHeader
            eyebrow="// From Lagos to Abuja"
            title="What people are saying."
            dark
          />
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <motion.figure
                key={t.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex flex-col justify-between border border-paper/15 bg-ink-soft/40 p-6"
              >
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <FiStar
                      key={j}
                      className={j < t.rating ? 'h-4 w-4 fill-accent text-accent' : 'h-4 w-4 text-paper/30'}
                    />
                  ))}
                </div>
                <blockquote className="mt-4 text-pretty text-sm text-paper/90">
                  "{t.text}"
                </blockquote>
                <figcaption className="mt-6 border-t border-paper/15 pt-4">
                  <div className="font-display text-base font-medium text-paper">{t.name}</div>
                  <div className="mt-1 font-mono text-2xs uppercase tracking-mono text-paper/60">
                    {t.role}
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
