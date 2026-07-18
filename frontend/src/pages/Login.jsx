import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiArrowRight, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const from = new URLSearchParams(location.search).get('from') || '/account';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await login(data);
      toast.success(res.message);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-narrow py-12 md:py-20">
      <div className="text-center">
        <Logo className="justify-center" />
        <p className="mt-6 eyebrow text-mist-dark">// Sign in</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tightest sm:text-5xl">
          Welcome back.
        </h1>
        <p className="mt-3 text-sm text-mist-dark">
          Sign in to track orders, save addresses and sync your wishlist.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5">
        <div>
          <label className="field-label">Email</label>
          <div className="mt-1 flex items-center gap-2 border border-ink/15 bg-paper-cool px-3 focus-within:border-ink">
            <FiMail className="h-4 w-4 text-mist-dark" />
            <input
              type="email"
              autoComplete="email"
              className="flex-1 bg-transparent py-3 text-sm outline-none"
              {...register('email', { required: 'Email is required.' })}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-accent">{errors.email.message}</p>}
        </div>

        <div>
          <label className="field-label">Password</label>
          <div className="mt-1 flex items-center gap-2 border border-ink/15 bg-paper-cool px-3 focus-within:border-ink">
            <FiLock className="h-4 w-4 text-mist-dark" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="flex-1 bg-transparent py-3 text-sm outline-none"
              {...register('password', { required: 'Password is required.' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label="Toggle password visibility"
              className="text-mist-dark hover:text-ink"
            >
              {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-accent">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Signing in…' : 'Sign in'}
          {!submitting && <FiArrowRight className="h-4 w-4" />}
        </button>

        <p className="text-center text-sm text-mist-dark">
          New to NovaTech?{' '}
          <Link to="/register" className="text-accent link-underline">
            Create an account
          </Link>
        </p>
      </form>

      <div className="mt-8 border border-ink/10 bg-paper-cool p-4 text-center">
        <p className="font-mono text-2xs uppercase tracking-mono text-mist-dark">Demo admin</p>
        <p className="mt-1 text-sm">admin@novatech.com / admin12345</p>
      </div>
    </div>
  );
}
