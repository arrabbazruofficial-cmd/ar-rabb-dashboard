import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Navigate } from 'react-router';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Mail, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

const otpSchema = z.object({
  code: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must contain only digits'),
});

type OtpFormData = z.infer<typeof otpSchema>;

export default function VerifyEmail() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  // If not logged in, they shouldn't be here
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If already verified, send them to their dashboard
  if (user.is_verified) {
    const dashboardRoutes: Record<string, string> = {
      SUPER_ADMIN: '/admin',
      ADMIN: '/admin',
      AGENCY: '/agency',
      CUSTOMER: '/customer'
    };
    return <Navigate to={dashboardRoutes[user.role] || '/login'} replace />;
  }

  const onSubmit = async (data: OtpFormData) => {
    try {
      await api.post('/auth/verify-otp/', { 
        email: user.email, 
        code: data.code 
      });
      
      toast('Email verified successfully!', 'success');
      
      // Update local state and trigger re-render
      updateUser({ is_verified: true });
      
      const dashboardRoutes: Record<string, string> = {
        SUPER_ADMIN: '/admin',
        ADMIN: '/admin',
        AGENCY: '/agency',
        CUSTOMER: '/customer'
      };
      navigate(dashboardRoutes[user.role] || '/login', { replace: true });
      
    } catch (error: any) {
      toast(error.response?.data?.error || 'Invalid or expired OTP', 'error');
    }
  };

  const handleResend = async () => {
    try {
      setIsResending(true);
      await api.post('/auth/send-otp/', { email: user.email });
      toast('OTP resent to your email!', 'success');
    } catch (error: any) {
      toast(error.response?.data?.error || 'Failed to resend OTP', 'error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-inter">
          Verify your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a 6-digit code to <span className="font-medium text-gray-900">{user.email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-orange-900/5 sm:rounded-2xl sm:px-10 border border-orange-100">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="mt-1">
                <input
                  id="code"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-center tracking-widest text-2xl"
                  {...register('code')}
                />
                {errors.code && (
                  <p className="mt-2 text-sm text-red-600">{errors.code.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Verify Email
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Didn't receive the code?</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isResending ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                ) : (
                  <RefreshCw className="w-5 h-5 text-gray-400 mr-2" />
                )}
                Resend OTP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
