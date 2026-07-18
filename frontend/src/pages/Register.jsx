import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiArrowRight, FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', email: '', phone: '', password: '' },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await registerUser(data);
      toast.success(res.message);
      navigate('/account', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-narrow py-12 md:py-20">
      <div className="text-center">
        <Logo className="justify-center" />
        <p className="mt-6 eyebrow text-mist-dark">// Create account</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tightest sm:text-5xl">
          Join NovaTech.
        </h1>
        <p className="mt-3 text-sm text-mist-dark">
          Free account, no card required. Track orders, save addresses, sync your wishlist across devices.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5">
        <div>
          <label className="field-label">Full name</label>
          <div className="mt-1 flex items-center gap-2 border border-ink/15 bg-paper-cool px-3 focus-within:border-ink">
            <FiUser className="h-4 w-4 text-mist-dark" />
            <input
              type="text"
              autoComplete="name"
              className="flex-1 bg-transparent py-3 text-sm outline-none"
              {...register('name', {
                required: 'Tell us your name.',
                minLength: { value: 2, message: 'At least 2 characters.' },
              })}
            />
          </div>
          {errors.name && <p className="mt-1 text-xs text-accent">{errors.name.message}</p>}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
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
            <label className="field-label">Phone (optional)</label>
            <div className="mt-1 flex items-center gap-2 border border-ink/15 bg-paper-cool px-3 focus-within:border-ink">
              <FiPhone className="h-4 w-4 text-mist-dark" />
              <input
                type="tel"
                autoComplete="tel"
                placeholder="+234…"
                className="flex-1 bg-transparent py-3 text-sm outline-none"
                {...register('phone')}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="field-label">Password</label>
          <div className="mt-1 flex items-center gap-2 border border-ink/15 bg-paper-cool px-3 focus-within:border-ink">
            <FiLock className="h-4 w-4 text-mist-dark" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="flex-1 bg-transparent py-3 text-sm outline-none"
              {...register('password', {
                required: 'Password is required.',
                minLength: { value: 6, message: 'Use at least 6 characters.' },
              })}
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
          {password && (
            <div className="mt-2 flex gap-1">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`h-1 flex-1 ${
                    password.length >= n * 2
                      ? n === 1
                        ? 'bg-accent'
                        : n === 2
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                      : 'bg-ink/10'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Creating account…' : 'Create account'}
          {!submitting && <FiArrowRight className="h-4 w-4" />}
        </button>

        <p className="text-center text-sm text-mist-dark">
          Already have an account?{' '}
          <Link to="/login" className="text-accent link-underline">
            Sign in
          </Link>
        </p>

        <p className="text-center font-mono text-2xs uppercase tracking-mono text-mist-dark">
          By creating an account you agree to our terms and privacy policy.
        </p>
      </form>
    </div>
  );
}
