import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import Logo from './Logo';

const FOOTER_COLS = [
  {
    title: 'Shop',
    links: [
      { label: 'Phone Cases', to: '/shop?category=phone-cases' },
      { label: 'Chargers', to: '/shop?category=chargers' },
      { label: 'Earbuds', to: '/shop?category=bluetooth-earbuds' },
      { label: 'Smartwatches', to: '/shop?category=smartwatches' },
      { label: 'Deals', to: '/shop?onSale=true' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Track order', to: '/account/orders' },
      { label: 'Shipping', to: '/shop' },
      { label: 'Returns', to: '/shop' },
      { label: 'Warranty', to: '/shop' },
      { label: 'Contact us', to: '/contact' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About NovaTech', to: '/' },
      { label: 'Lekki showroom', to: '/contact' },
      { label: 'Bulk & corporate', to: '/contact' },
      { label: 'Careers', to: '/contact' },
      { label: 'Privacy', to: '/' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 bg-ink text-paper">
      {/* Newsletter strip */}
      <div className="border-b border-paper/10">
        <div className="container-page grid gap-6 py-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="eyebrow text-accent">// Newsletter</p>
            <h3 className="mt-3 font-display text-3xl font-medium tracking-tightest sm:text-4xl">
              Get drops, deals and dispatch notes.
            </h3>
            <p className="mt-2 max-w-md text-sm text-paper/70">
              One email a week. No spam — only what is new, what is on sale, and when your order leaves the warehouse.
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-md gap-2 md:justify-self-end"
          >
            <input
              type="email"
              required
              placeholder="you@email.com"
              className="flex-1 border border-paper/20 bg-transparent px-4 py-3 text-sm text-paper placeholder:text-paper/50 focus:border-accent focus:outline-none"
            />
            <button type="submit" className="btn-accent">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main grid */}
      <div className="container-page grid gap-10 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo dark />
          <p className="mt-4 max-w-xs text-sm text-paper/70">
            Quality gadgets, smarter living. Hand-picked phone accessories for the Lagos commute and beyond.
          </p>
          <div className="mt-6 space-y-2 font-mono text-2xs uppercase tracking-mono text-paper/60">
            <div className="flex items-center gap-2">
              <FiMapPin className="h-4 w-4" /> 24 Admiralty Way, Lekki Phase 1, Lagos
            </div>
            <div className="flex items-center gap-2">
              <FiPhone className="h-4 w-4" /> +234 801 234 5678
            </div>
            <div className="flex items-center gap-2">
              <FiMail className="h-4 w-4" /> info@novatechgadgets.com
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            {[FiInstagram, FiTwitter, FiFacebook, FiYoutube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="grid h-9 w-9 place-items-center border border-paper/20 text-paper/70 transition-colors hover:border-accent hover:text-accent"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {FOOTER_COLS.map((col) => (
          <div key={col.title} className="md:col-span-2">
            <p className="eyebrow text-paper/50">{col.title}</p>
            <ul className="mt-4 space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-paper/80 transition-colors hover:text-accent link-underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="md:col-span-2">
          <p className="eyebrow text-paper/50">Hours</p>
          <ul className="mt-4 space-y-1 text-sm text-paper/80">
            <li>Mon – Sat</li>
            <li className="font-mono text-2xs text-paper/60">9:00 AM – 7:00 PM</li>
            <li className="mt-2">Sunday</li>
            <li className="font-mono text-2xs text-paper/60">12:00 PM – 5:00 PM</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-5 font-mono text-2xs uppercase tracking-mono text-paper/50 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} NovaTech Gadgets & Accessories</span>
          <span className="flex items-center gap-3">
            <span>Lagos · Nigeria</span>
            <span className="h-3 w-px bg-paper/20" />
            <span>Built with care</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
