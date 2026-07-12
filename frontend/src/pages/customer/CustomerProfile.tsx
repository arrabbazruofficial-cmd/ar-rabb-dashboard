import { useAuth } from '@/lib/auth';
import { User, Mail, ShieldCheck } from 'lucide-react';

export default function CustomerProfile() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>
      
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-sunrise relative"></div>
        <div className="px-8 pb-8 pt-0 relative">
          <div className="w-24 h-24 bg-card border-4 border-card rounded-xl shadow-md flex items-center justify-center -mt-12 mb-4">
            <User className="w-10 h-10 text-primary" />
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Customer Account</h2>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                Personal user profile
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full border border-blue-200 uppercase tracking-wide">
              Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-border">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">Email Address</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Account Security</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-muted-foreground text-xs">Authentication</p>
                    <p className="font-medium text-green-700">Account is secure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
