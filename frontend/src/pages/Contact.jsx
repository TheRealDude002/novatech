import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail, FiClock, FiArrowRight } from 'react-icons/fi';

export default function Contact() {
  return (
    <div className="container-page py-12 md:py-20">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="eyebrow text-mist-dark">// Visit us</p>
          <h1 className="mt-3 font-display text-4xl font-medium tracking-tightest sm:text-5xl">
            Come say hello.
          </h1>
          <p className="mt-4 text-pretty text-sm text-mist-dark">
            We are on Admiralty Way in Lekki Phase 1. Walk in to feel a case in your hand, test a charger
            with your own phone, or ask us which earbuds fit your ears.
          </p>

          <div className="mt-8 space-y-5 border-t border-ink/10 pt-6">
            {[
              { icon: FiMapPin, label: 'Address', value: '24 Admiralty Way, Lekki Phase 1, Lagos, Nigeria' },
              { icon: FiPhone, label: 'Phone', value: '+234 801 234 5678' },
              { icon: FiMail, label: 'Email', value: 'info@novatechgadgets.com' },
              { icon: FiClock, label: 'Hours', value: 'Mon – Sat: 9:00 AM – 7:00 PM · Sun: 12:00 PM – 5:00 PM' },
            ].map((c) => (
              <div key={c.label} className="flex gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center bg-ink text-paper">
                  <c.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-mono text-2xs uppercase tracking-mono text-mist-dark">{c.label}</p>
                  <p className="mt-1 text-sm text-ink">{c.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-7">
          <div className="border border-ink/10 bg-paper-cool p-6 md:p-8">
            <h2 className="font-display text-2xl font-medium tracking-tighter">Send us a message</h2>
            <p className="mt-2 text-sm text-mist-dark">We typically reply within a few hours during business hours.</p>

            <form onSubmit={(e) => e.preventDefault()} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label">Your name</label>
                  <input className="input-base mt-1" placeholder="Adaeze Okeke" />
                </div>
                <div>
                  <label className="field-label">Phone</label>
                  <input className="input-base mt-1" placeholder="+234…" />
                </div>
              </div>
              <div>
                <label className="field-label">Email</label>
                <input type="email" className="input-base mt-1" placeholder="you@email.com" />
              </div>
              <div>
                <label className="field-label">What can we help with?</label>
                <select className="input-base mt-1">
                  <option>An order I placed</option>
                  <option>A product question</option>
                  <option>Bulk & corporate buying</option>
                  <option>Warranty or return</option>
                  <option>Something else</option>
                </select>
              </div>
              <div>
                <label className="field-label">Message</label>
                <textarea rows={5} className="input-base mt-1" placeholder="Tell us a bit more…" />
              </div>
              <button type="submit" className="btn-primary w-full sm:w-auto">
                Send message
                <FiArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="mt-4 aspect-[16/7] overflow-hidden border border-ink/10 bg-paper-warm">
            <iframe
              title="NovaTech location map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=3.4389%2C6.4474%2C3.4489%2C6.4574&layer=mapnik&marker=6.4524%2C3.4439"
              className="h-full w-full"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
