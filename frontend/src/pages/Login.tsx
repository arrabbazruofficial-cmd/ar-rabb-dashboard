import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login/', data);
      const { access, refresh } = response.data;
      login(access, refresh);

      // Decode role from token to determine redirect
      const payload = JSON.parse(atob(access.split('.')[1]));

      if (payload.role === 'SUPER_ADMIN' || payload.role === 'ADMIN') {
        navigate('/admin');
      } else if (payload.role === 'AGENCY') {
        navigate('/agency');
      } else if (payload.role === 'CUSTOMER') {
        navigate('/customer');
      } else {
        setError('Unauthorized role.');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-sans relative overflow-hidden">
      {/* Decorative Brand Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#855300]/5 to-[#0051d5]/5 z-0"></div>
      
      <div className="relative z-10 w-full max-w-md card-panel p-10">
        <div className="flex flex-col items-center mb-10">
          <img src="/logo.png" alt="Al-Rabb Tours" className="w-16 h-16 object-contain mb-4 drop-shadow-sm" />
          <h1 className="text-3xl font-bold font-heading text-primary">Welcome Back</h1>
          <p className="text-sm font-medium text-muted-foreground mt-2 tracking-wide">ENTERPRISE PORTAL</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm font-medium p-3 rounded-lg mb-6 border border-destructive/20 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <input
              type="email"
              {...register('email')}
              className="w-full p-2.5 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all"
              placeholder="admin@alrabb.com"
            />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              {...register('password')}
              className="w-full p-2.5 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 mt-4 shadow-md"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
