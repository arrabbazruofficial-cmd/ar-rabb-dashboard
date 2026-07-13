import { Routes, Route } from 'react-router';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Plane, ClipboardList, Bell } from 'lucide-react';
import BookTicketForm from './customer/BookTicketForm';
import CustomerRequests from './customer/CustomerRequests';
import CustomerProfile from './customer/CustomerProfile';

function DashboardHome() {
  return (
    <div className="space-y-6 animate-fade-up">
      <h1 className="text-3xl font-bold font-heading gradient-text tracking-tight pb-1">Customer Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Bookings', value: '2', icon: Plane, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Total Requests', value: '5', icon: ClipboardList, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Notifications', value: '1', icon: Bell, color: 'text-orange-500', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="card-panel p-6 flex items-center gap-4 animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm mt-6">
        <h2 className="text-lg font-semibold mb-4">Welcome to Al-Rabb Tours</h2>
        <p className="text-muted-foreground">Book your air tickets and track your requests easily from this portal.</p>
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
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="notifications" element={<PlaceholderPage title="Notifications" />} />
      </Routes>
    </DashboardLayout>
  );
}
