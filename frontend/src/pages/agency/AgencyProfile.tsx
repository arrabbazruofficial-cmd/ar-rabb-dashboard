import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Building2, User, Phone, MapPin, Mail, Calendar } from 'lucide-react';

export default function AgencyProfile() {
  const { user } = useAuth();
  const [agency, setAgency] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/agencies/');
        const data = res.data.results || res.data;
        if (data && data.length > 0) setAgency(data[0]);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Agency Profile</h1>
      
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-sunrise relative"></div>
        <div className="px-8 pb-8 pt-0 relative">
          <div className="w-24 h-24 bg-card border-4 border-card rounded-xl shadow-md flex items-center justify-center -mt-12 mb-4">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{agency?.company_name || 'Agency Name'}</h2>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4" /> {agency?.address || 'No address provided'}
              </p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full border border-green-200 uppercase tracking-wide">
              {agency?.status || 'Active'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-border">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">Contact Person</p>
                    <p className="font-medium">{agency?.contact_person || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">Email Address</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">Phone Number</p>
                    <p className="font-medium">{agency?.phone_number || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Account Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs">Member Since</p>
                    <p className="font-medium">{agency ? new Date(agency.created_at).toLocaleDateString() : 'N/A'}</p>
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
