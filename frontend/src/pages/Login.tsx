import { useState, useEffect } from 'react';
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
  
  // OTP States
  const [showOtp, setShowOtp] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60); // 1 minute
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  useEffect(() => {
    let timer: any;
    if (showOtp && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [showOtp, countdown]);

  const handleLoginSuccess = (access: string, refresh: string) => {
    login(access, refresh);
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
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login/', data);
      
      if (response.data.require_otp) {
        setUserEmail(response.data.email);
        setShowOtp(true);
        setCountdown(60);
        setCanResend(false);
      } else {
        const { access, refresh } = response.data;
        handleLoginSuccess(access, refresh);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const onVerifyOtp = async () => {
    const code = otpCode.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/verify-login-otp/', { email: userEmail, code });
      const { access, refresh } = response.data;
      handleLoginSuccess(access, refresh);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid or expired OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const onResendOtp = async () => {
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/send-otp/', { email: userEmail });
      setCountdown(60);
      setCanResend(false);
      setOtpCode(['', '', '', '', '', '']);
    } catch (err: any) {
      setError('Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background font-sans">
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

      <div className="flex items-center justify-center p-8 lg:p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent z-0 lg:hidden" />
        
        <div className="w-full max-w-md relative z-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col mb-10">
            <img src="/logo.png" alt="AR-RABB Tours and Travels" className="w-16 h-16 object-contain mb-6 drop-shadow-sm" />
            <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">
              {showOtp ? 'Security Verification' : 'Welcome Back'}
            </h1>
            <p className="text-sm font-semibold text-primary mt-2 tracking-widest uppercase">
              {showOtp ? 'Two-Factor Auth' : 'Enterprise Portal'}
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm font-medium p-4 rounded-xl mb-6 border border-destructive/20 text-center animate-fade-up">
              {error}
            </div>
          )}

          {!showOtp ? (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2 group">
                  <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-primary transition-colors">Email Address</label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full p-3 rounded-lg border border-border bg-input"
                    placeholder="admin@alrabb.com"
                  />
                  {errors.email && <p className="text-destructive text-xs font-medium">{errors.email.message}</p>}
                </div>

                <div className="space-y-2 group">
                  <label className="text-sm font-semibold text-foreground/80 group-focus-within:text-primary transition-colors">Password</label>
                  <input
                    type="password"
                    {...register('password')}
                    className="w-full p-3 rounded-lg border border-border bg-input"
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="text-destructive text-xs font-medium">{errors.password.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground font-semibold rounded-lg mt-8 py-3 text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-sm font-medium text-muted-foreground mt-8">
                Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Sign up</Link>
              </p>
            </>
          ) : (
            <div className="space-y-6 animate-fade-up">
              <p className="text-sm text-muted-foreground text-center">
                We've sent a 6-digit verification code to <span className="font-bold text-foreground">{userEmail}</span>.
              </p>
              
              <div className="flex justify-center gap-3 my-8">
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-bold bg-input border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                ))}
              </div>

              <button
                onClick={onVerifyOtp}
                disabled={isLoading || otpCode.join('').length !== 6}
                className="w-full bg-primary text-primary-foreground font-semibold rounded-lg py-3 text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify & Sign In'}
              </button>

              <div className="text-center mt-6">
                {canResend ? (
                  <button onClick={onResendOtp} disabled={isLoading} className="text-primary text-sm font-bold hover:underline">
                    Resend Code
                  </button>
                ) : (
                  <p className="text-muted-foreground text-sm font-medium">
                    Resend code in <span className="font-bold text-foreground">{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
                  </p>
                )}
              </div>
              
              <button 
                onClick={() => setShowOtp(false)} 
                className="w-full text-center text-sm font-semibold text-muted-foreground hover:text-foreground mt-4"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
