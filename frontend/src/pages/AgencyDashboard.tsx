import { Routes, Route } from 'react-router';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { FileText, Plane, ClipboardList, Shield } from 'lucide-react';
import GroupVisaForm from './agency/GroupVisaForm';
import IndividualVisaForm from './agency/IndividualVisaForm';
import AirTicketForm from './agency/AirTicketForm';
import MyRequests from './agency/MyRequests';
import AgencyProfile from './agency/AgencyProfile';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

function DashboardHome() {
  const [metrics, setMetrics] = useState({
    activeVisas: '-',
    pendingTickets: '-',
    totalRequests: '-',
    profileStatus: 'Loading...'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [reqRes, profileRes] = await Promise.all([
          api.get('/requests/'),
          api.get('/auth/me/')
        ]);
        
        const requests = reqRes.data.results || reqRes.data || [];
        const activeVisas = requests.filter((r: any) => 
          (r.request_type === 'GROUP_VISA' || r.request_type === 'INDIVIDUAL_VISA') && 
          r.status !== 'COMPLETED' && r.status !== 'REJECTED'
        ).length;
        
        const pendingTickets = requests.filter((r: any) => 
          r.request_type === 'AIR_TICKET' && r.status !== 'COMPLETED'
        ).length;

        setMetrics({
          activeVisas: activeVisas.toString(),
          pendingTickets: pendingTickets.toString(),
          totalRequests: reqRes.data.count?.toString() || requests.length.toString(),
          profileStatus: profileRes.data.is_verified ? 'Verified' : 'Unverified'
        });
      } catch (err) {
        console.error("Failed to fetch agency metrics", err);
        setMetrics(prev => ({ ...prev, profileStatus: 'Error' }));
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Agency Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Visas', value: metrics.activeVisas, icon: FileText, color: 'text-blue-500' },
          { label: 'Pending Tickets', value: metrics.pendingTickets, icon: Plane, color: 'text-orange-500' },
          { label: 'Total Requests', value: metrics.totalRequests, icon: ClipboardList, color: 'text-green-500' },
          { label: 'Profile Status', value: metrics.profileStatus, icon: Shield, color: metrics.profileStatus === 'Verified' ? 'text-green-500' : 'text-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-lg bg-secondary ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.label === 'Profile Status' && stat.value === 'Unverified' ? 'text-amber-500 text-lg' : ''}`}>
                {isLoading ? <span className="animate-pulse bg-secondary/50 rounded h-6 w-12 inline-block"></span> : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Bell } from 'lucide-react';

function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data.results || res.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read/`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">Notifications</h1>
      
      {isLoading ? (
        <div className="bg-card border border-border rounded-xl shadow-sm p-12 text-center text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 text-center py-12">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No new notifications</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">System alerts and request updates will appear here.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <div key={n.id} className={`p-4 flex items-start gap-4 transition-colors hover:bg-secondary/20 ${!n.read ? 'bg-primary/5' : ''}`}>
                <div className={`p-2 rounded-full ${!n.read ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${!n.read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.read && (
                  <button onClick={() => markAsRead(n.id)} className="text-xs font-medium text-primary hover:underline whitespace-nowrap">
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AgencyDashboard() {
  return (
    <DashboardLayout role="AGENCY">
      <Routes>
        <Route path="" element={<DashboardHome />} />
        <Route path="group-visa" element={<GroupVisaForm />} />
        <Route path="individual-visa" element={<IndividualVisaForm />} />
        <Route path="air-ticket" element={<AirTicketForm />} />
        <Route path="requests" element={<MyRequests />} />
        <Route path="profile" element={<AgencyProfile />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Routes>
    </DashboardLayout>
  );
}
