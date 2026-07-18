import { Link } from 'react-router-dom';
import { FiHome, FiArrowRight } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <p className="eyebrow text-mist-dark">// 404</p>
        <h1 className="mt-3 font-display text-6xl font-medium tracking-tightest sm:text-8xl">
          <span className="text-accent">404</span>
        </h1>
        <p className="mt-4 max-w-md text-pretty text-sm text-mist-dark">
          That page does not exist. It may have moved, been retired, or the link could be wrong. Try the
          home page or the shop.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="btn-primary">
            <FiHome className="h-4 w-4" /> Home
          </Link>
          <Link to="/shop" className="btn-outline">
            Shop
            <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
