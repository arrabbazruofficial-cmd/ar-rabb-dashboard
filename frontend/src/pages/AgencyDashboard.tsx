import { Routes, Route } from 'react-router';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { FileText, Plane, ClipboardList, Shield } from 'lucide-react';
import GroupVisaForm from './agency/GroupVisaForm';
import IndividualVisaForm from './agency/IndividualVisaForm';
import AirTicketForm from './agency/AirTicketForm';
import MyRequests from './agency/MyRequests';
import AgencyProfile from './agency/AgencyProfile';

function DashboardHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Agency Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Visas', value: '12', icon: FileText, color: 'text-blue-500' },
          { label: 'Pending Tickets', value: '4', icon: Plane, color: 'text-orange-500' },
          { label: 'Total Requests', value: '45', icon: ClipboardList, color: 'text-green-500' },
          { label: 'Profile Status', value: 'Verified', icon: Shield, color: 'text-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
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
        <Route path="notifications" element={<PlaceholderPage title="Notifications" />} />
      </Routes>
    </DashboardLayout>
  );
}
