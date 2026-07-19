import { Routes, Route } from 'react-router';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { ClipboardList, Building2 } from 'lucide-react';
import GroupVisaForm from './agency/GroupVisaForm';
import IndividualVisaForm from './agency/IndividualVisaForm';
import AirTicketForm from './agency/AirTicketForm';
import MyRequests from './agency/MyRequests';
import AgencyProfile from './agency/AgencyProfile';
import RequestDetails from './shared/RequestDetails';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

import { getDashboardStats } from '@/lib/api';
import { Clock, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { format } from 'date-fns';

function DashboardHome() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Welcome Banner */}
      <div className="bg-primary text-white p-8 rounded-xl shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-heading mb-2">Agency Operations Portal</h1>
          <p className="text-primary-foreground/80 max-w-2xl">
            Submit new travel requests, track visa applications, and monitor the status of your passengers.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Building2 className="w-48 h-48" />
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: stats?.total_requests || 0, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Pending Processing', value: stats?.pending_requests || 0, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: 'In Progress', value: stats?.processing_requests || 0, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
          { label: 'Completed', value: stats?.completed_requests || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        ].map((stat, i) => (
          <div key={i} className={`card-panel p-6 ${stat.border}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-foreground">
                  {isLoading ? <span className="animate-pulse bg-secondary/10 rounded h-8 w-16 inline-block"></span> : stat.value}
                </h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Requests Table */}
          <div className="card-panel p-0 overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between bg-accent/5">
              <h2 className="text-lg font-bold font-heading flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" /> My Recent Requests
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/5 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-semibold">ID</th>
                    <th className="px-6 py-4 font-semibold">Type</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Date Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Loading...</td>
                    </tr>
                  ) : stats?.recent_requests?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No recent requests.</td>
                    </tr>
                  ) : (
                    stats?.recent_requests?.map((req: any) => (
                      <tr key={req.id} className="border-b border-border last:border-0 hover:bg-secondary/5 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-medium text-primary">{req.id.split('-')[0]}</td>
                        <td className="px-6 py-4 font-medium text-foreground">{req.request_type.replace('_', ' ')}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                            req.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                            req.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-muted-foreground whitespace-nowrap">
                          {format(new Date(req.created_at), 'MMM dd, yyyy')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
        <Route path="requests/:id" element={<RequestDetails />} />
        <Route path="profile" element={<AgencyProfile />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Routes>
    </DashboardLayout>
  );
}
