import { Routes, Route } from 'react-router';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import RequestDetails from './shared/RequestDetails';
import { ClipboardList } from 'lucide-react';
import BookTicketForm from './customer/BookTicketForm';
import CustomerRequests from './customer/CustomerRequests';
import CustomerProfile from './customer/CustomerProfile';

import { getDashboardStats } from '@/lib/api';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, CheckCircle2, AlertCircle, Send, Users } from 'lucide-react';

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
          <h1 className="text-3xl font-bold font-heading mb-2">Customer Portal</h1>
          <p className="text-primary-foreground/80 max-w-2xl">
            Book air tickets and track your individual visa requests with ease.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Users className="w-48 h-48" />
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: stats?.total_requests || 0, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Pending', value: stats?.pending_requests || 0, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
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
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="bg-card p-8 rounded-xl border border-border shadow-sm text-center">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground">This page is under construction.</p>
    </div>
  );
}

export default function CustomerDashboard() {
  return (
    <DashboardLayout role="CUSTOMER">
      <Routes>
        <Route path="" element={<DashboardHome />} />
        <Route path="book-ticket" element={<BookTicketForm />} />
        <Route path="requests" element={<CustomerRequests />} />
        <Route path="requests/:id" element={<RequestDetails />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="notifications" element={<PlaceholderPage title="Notifications" />} />
      </Routes>
    </DashboardLayout>
  );
}
