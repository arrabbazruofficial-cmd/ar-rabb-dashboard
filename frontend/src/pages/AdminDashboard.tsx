import { Routes, Route } from 'react-router';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Users, Building2, ClipboardList, TrendingUp } from 'lucide-react';

function DashboardHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Requests', value: '1,234', icon: ClipboardList, color: 'text-blue-500' },
          { label: 'Active Agencies', value: '56', icon: Building2, color: 'text-green-500' },
          { label: 'Registered Customers', value: '892', icon: Users, color: 'text-purple-500' },
          { label: 'Revenue (M)', value: '$1.2M', icon: TrendingUp, color: 'text-orange-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-secondary ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm min-h-[300px]">
          <h2 className="text-lg font-semibold mb-4">Recent Requests</h2>
          <div className="text-sm text-muted-foreground">Requests list will go here...</div>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm min-h-[300px]">
          <h2 className="text-lg font-semibold mb-4">System Activity</h2>
          <div className="text-sm text-muted-foreground">Audit logs will go here...</div>
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

export default function AdminDashboard() {
  return (
    <DashboardLayout role="ADMIN">
      <Routes>
        <Route path="" element={<DashboardHome />} />
        <Route path="agencies" element={<PlaceholderPage title="Agencies Management" />} />
        <Route path="customers" element={<PlaceholderPage title="Customers Management" />} />
        <Route path="requests" element={<PlaceholderPage title="All Requests" />} />
        <Route path="visas" element={<PlaceholderPage title="Visa Requests" />} />
        <Route path="tickets" element={<PlaceholderPage title="Ticket Requests" />} />
        <Route path="notifications" element={<PlaceholderPage title="Admin Notifications" />} />
        <Route path="analytics" element={<PlaceholderPage title="Analytics & Reports" />} />
        <Route path="audit" element={<PlaceholderPage title="Audit Logs" />} />
        <Route path="settings" element={<PlaceholderPage title="System Settings" />} />
      </Routes>
    </DashboardLayout>
  );
}
