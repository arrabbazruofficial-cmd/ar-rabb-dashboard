import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Users, Building2, ClipboardList, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/api';

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

function UserManagement({ title, role }: { title: string, role?: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const url = role ? `/auth/users/?role=${role}` : `/auth/users/`;
        const res = await api.get(url);
        setUsers(res.data.results || res.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [role]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No users found.</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-xs font-mono">{u.id.split('-')[0]}...</td>
                    <td className="px-6 py-4 font-medium">{u.email}</td>
                    <td className="px-6 py-4">{u.role}</td>
                    <td className="px-6 py-4">
                      {u.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {u.is_verified ? (
                        <span className="text-green-600 font-medium">Verified</span>
                      ) : (
                        <span className="text-amber-600 font-medium">Unverified</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{new Date(u.created_at).toLocaleDateString()}</td>
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

export default function AdminDashboard() {
  return (
    <DashboardLayout role="ADMIN">
      <Routes>
        <Route path="" element={<DashboardHome />} />
        <Route path="agencies" element={<UserManagement title="Agencies Management" role="AGENCY" />} />
        <Route path="customers" element={<UserManagement title="Customers Management" role="CUSTOMER" />} />
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
