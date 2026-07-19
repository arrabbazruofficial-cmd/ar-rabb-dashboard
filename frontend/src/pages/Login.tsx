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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background font-sans">
      {/* Left Pane - Hero Image */}
      <div className="hidden lg:block relative overflow-hidden bg-primary/10">
        <img 
          src="/login-bg.jpg" 
          alt="Corporate Travel" 
          className="absolute inset-0 w-full h-full object-cover animate-fade-up" 
          style={{ animationDuration: '1.2s' }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/20 to-transparent mix-blend-multiply" />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-16 left-16 right-16 text-white animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-4xl lg:text-5xl font-heading font-bold mb-6 leading-tight drop-shadow-lg">
            Elevate Your Travel Management
          </h2>
          <p className="text-lg text-white/90 max-w-lg drop-shadow-md">
            Streamline group visas, corporate air ticketing, and request approvals through our secure enterprise portal.
          </p>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex items-center justify-center p-8 lg:p-16 relative overflow-hidden">
        {/* Decorative background element for mobile */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent z-0 lg:hidden" />
        
        <div className="w-full max-w-md relative z-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col mb-10">
            <img src="/logo.png" alt="AR-RABB Tours and Travels" className="w-16 h-16 object-contain mb-6 drop-shadow-sm" />
            <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">Welcome Back</h1>
            <p className="text-sm font-semibold text-primary mt-2 tracking-widest uppercase">Enterprise Portal</p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm font-medium p-4 rounded-xl mb-6 border border-destructive/20 text-center animate-fade-up">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-primary transition-colors">Email Address</label>
              <input
                type="email"
                {...register('email')}
                className="w-full"
                placeholder="admin@alrabb.com"
              />
              {errors.email && <p className="text-destructive text-xs font-medium">{errors.email.message}</p>}
            </div>

            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-primary transition-colors">Password</label>
              <input
                type="password"
                {...register('password')}
                className="w-full"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-destructive text-xs font-medium">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary mt-8 py-3 text-lg"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm font-medium text-muted-foreground mt-8">
            Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
