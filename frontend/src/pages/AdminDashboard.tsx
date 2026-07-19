import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { api } from '@/lib/api';
import RequestDetails from './shared/RequestDetails';

import { MoreVertical, Trash2, ShieldCheck, Power, PowerOff } from 'lucide-react';

import { getDashboardStats } from '@/lib/api';
import { PieChart, Clock, CheckCircle2, XCircle, AlertCircle, Send, FileText as FileTextIcon, Activity, MessageSquare, Users, CheckCircle, ClipboardList, Settings, Bell } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/Skeleton';

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
          <h1 className="text-3xl font-bold font-heading mb-2">Welcome to the Enterprise Operations Center</h1>
          <p className="text-primary-foreground/80 max-w-2xl">
            Monitor incoming travel requests, process visas, and manage air tickets efficiently. 
            All systems are fully operational.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Activity className="w-48 h-48" />
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending Requests', value: stats?.pending_requests || 0, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: 'Processing', value: stats?.processing_requests || 0, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Completed', value: stats?.completed_requests || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Rejected', value: stats?.rejected_requests || 0, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
        ].map((stat, i) => (
          <div key={i} className={`card-panel p-6 ${stat.border}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-foreground">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : stat.value}
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
          {/* Request Distribution */}
          <div className="card-panel p-6">
            <h2 className="text-lg font-bold font-heading mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" /> Request Distribution
            </h2>
            {isLoading ? (
               <div className="space-y-4">
                 {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
               </div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: 'Group Visas', count: stats?.distribution?.group_visa || 0, color: 'bg-blue-500' },
                  { label: 'Individual Visas', count: stats?.distribution?.individual_visa || 0, color: 'bg-indigo-500' },
                  { label: 'Air Tickets', count: stats?.distribution?.air_ticket || 0, color: 'bg-sky-500' },
                ].map((item, i) => {
                  const total = stats?.total_requests || 1;
                  const percentage = Math.round((item.count / total) * 100) || 0;
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium text-foreground">{item.label}</div>
                      <div className="flex-1 h-3 bg-secondary/5 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${percentage}%` }} />
                      </div>
                      <div className="w-12 text-right text-sm font-bold text-muted-foreground">{item.count}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent Requests Table */}
          <div className="card-panel p-0 overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between bg-accent/5">
              <h2 className="text-lg font-bold font-heading flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" /> Recent Requests
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/5 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-semibold">ID</th>
                    <th className="px-6 py-4 font-semibold">Type</th>
                    <th className="px-6 py-4 font-semibold">Agency/Customer</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading...</td>
                    </tr>
                  ) : stats?.recent_requests?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No recent requests.</td>
                    </tr>
                  ) : (
                    stats?.recent_requests?.map((req: any) => (
                      <tr key={req.id} className="border-b border-border last:border-0 hover:bg-secondary/5 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-medium text-primary">{req.id.split('-')[0]}</td>
                        <td className="px-6 py-4 font-medium text-foreground">{req.request_type.replace('_', ' ')}</td>
                        <td className="px-6 py-4 text-muted-foreground">{req.agency_details?.company_name || req.customer_details?.email || 'N/A'}</td>
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

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="card-panel p-6">
            <h2 className="text-lg font-bold font-heading mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors group">
                <div className="flex items-center gap-3">
                  <FileTextIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-medium text-foreground">Generate Report</span>
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors group">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-medium text-foreground">Broadcast Message</span>
                </div>
              </button>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="card-panel p-6">
            <h2 className="text-lg font-bold font-heading mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Recent Activity
            </h2>
            <div className="relative border-l-2 border-secondary/10 ml-3 space-y-6">
              {isLoading ? (
                <div className="space-y-6">
                  {[1,2,3].map(i => (
                    <div key={i} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/4 mb-1" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))}
                </div>
              ) : stats?.recent_requests?.length > 0 ? (
                stats.recent_requests.slice(0, 5).map((req: any) => (
                  <div key={req.id} className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                    <p className="text-sm font-bold text-foreground">New {req.request_type.replace('_', ' ')}</p>
                    <p className="text-xs font-medium text-primary mb-1">{formatDistanceToNow(new Date(req.created_at))} ago</p>
                    <p className="text-sm text-muted-foreground">{req.agency_details?.company_name || req.customer_details?.email || 'A user'} requested a {req.request_type.replace('_', ' ').toLowerCase()}. Status is {req.status}.</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground pl-4">No recent activity.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserManagement({ title, role }: { title: string, role?: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

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

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const handleAction = async (userId: string, action: 'verify' | 'toggle_active' | 'delete') => {
    setOpenDropdownId(null);
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;
      
      if (action === 'delete') {
        if (!confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) return;
        await api.delete(`/auth/users/${userId}/`);
      } else if (action === 'verify') {
        await api.patch(`/auth/users/${userId}/`, { is_verified: !user.is_verified });
      } else if (action === 'toggle_active') {
        await api.patch(`/auth/users/${userId}/`, { is_active: !user.is_active });
      }
      // Refresh list
      fetchUsers();
    } catch (err) {
      console.error(`Action ${action} failed:`, err);
      alert("An error occurred while performing the action.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-up stagger-2">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="card-panel">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">Email</th>
                {role === 'AGENCY' && <th className="px-6 py-4">Agency Name</th>}
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={role === 'AGENCY' ? 6 : 5} className="px-6 py-12">
                    <div className="space-y-4">
                      {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={role === 'AGENCY' ? 6 : 5} className="px-6 py-12 text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No users found.</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-secondary/30 transition-colors relative">
                    <td className="px-6 py-4 font-medium text-xs font-mono">{u.id.split('-')[0]}...</td>
                    <td className="px-6 py-4 font-medium">{u.email}</td>
                    {role === 'AGENCY' && <td className="px-6 py-4 text-primary font-semibold">{u.company_name || '—'}</td>}
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
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setOpenDropdownId(openDropdownId === u.id ? null : u.id)}
                        className="p-2 hover:bg-secondary rounded-full transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                      </button>
                      
                      {openDropdownId === u.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setOpenDropdownId(null)}
                          />
                          <div className="absolute right-8 top-12 w-48 bg-card border border-border shadow-lg rounded-xl z-50 overflow-hidden py-1">
                            <button 
                              onClick={() => handleAction(u.id, 'verify')}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-secondary flex items-center gap-2 text-foreground"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              {u.is_verified ? 'Unverify User' : 'Verify User'}
                            </button>
                            <button 
                              onClick={() => handleAction(u.id, 'toggle_active')}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-secondary flex items-center gap-2 text-foreground"
                            >
                              {u.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                              {u.is_active ? 'Deactivate User' : 'Activate User'}
                            </button>
                            <div className="h-px bg-border my-1" />
                            <button 
                              onClick={() => handleAction(u.id, 'delete')}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2 font-medium"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Permanently
                            </button>
                          </div>
                        </>
                      )}
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

function RequestsManagement({ title, type }: { title: string, type?: string }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      // The backend does not support __in filters natively, so we fetch all and filter in frontend
      const res = await api.get(`/requests/`);
      let data = res.data.results || res.data;
      if (type) {
        const allowedTypes = type.split(',');
        data = data.filter((r: any) => allowedTypes.includes(r.request_type));
      }
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [type]);

  const handleStatusUpdate = async (reqId: string, newStatus: string) => {
    setOpenDropdownId(null);
    try {
      await api.patch(`/requests/${reqId}/update_status/`, { status: newStatus });
      fetchRequests();
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status.");
    }
  };

  const handleRequestDelete = async (reqId: string) => {
    setOpenDropdownId(null);
    if (!confirm("Are you sure you want to permanently delete this request?")) return;
    try {
      await api.delete(`/requests/${reqId}/`);
      fetchRequests();
    } catch (err) {
      console.error("Failed to delete request", err);
      alert("Failed to delete request.");
    }
  };

  const statusOptions = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'PROCESSING', 'APPROVED', 'REJECTED', 'COMPLETED'];

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map(id => api.patch(`/requests/${id}/update_status/`, { status: newStatus })));
      setSelectedIds([]);
      fetchRequests();
    } catch (err) {
      console.error("Failed to update status for some requests", err);
      alert("Failed to update status for some requests.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete ${selectedIds.length} requests?`)) return;
    try {
      await Promise.all(selectedIds.map(id => api.delete(`/requests/${id}/`)));
      setSelectedIds([]);
      fetchRequests();
    } catch (err) {
      console.error("Failed to delete some requests", err);
      alert("Failed to delete some requests.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 bg-secondary/50 px-4 py-2 rounded-xl border border-border">
            <span className="text-sm font-medium whitespace-nowrap">{selectedIds.length} selected</span>
            <div className="h-4 w-px bg-border mx-1" />
            <select 
              className="text-sm bg-card border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
              onChange={(e) => {
                if(e.target.value) {
                  handleBulkStatusUpdate(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Update Status</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status.replace('_', ' ')}</option>
              ))}
            </select>
            <button 
              onClick={handleBulkDelete}
              className="text-sm text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>
      <div className="card-panel">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                    checked={requests.length > 0 && selectedIds.length === requests.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(requests.map(r => r.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-4">Req ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Requester</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    Loading requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No requests found.</p>
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className={`hover:bg-secondary/30 transition-colors relative ${selectedIds.includes(r.id) ? 'bg-secondary/10' : ''}`}>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                        checked={selectedIds.includes(r.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(prev => [...prev, r.id]);
                          } else {
                            setSelectedIds(prev => prev.filter(id => id !== r.id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-xs font-mono">{r.id.split('-')[0]}</td>
                    <td className="px-6 py-4 font-medium">{r.request_type.replace('_', ' ')}</td>
                    <td className="px-6 py-4">{r.agency_details ? r.agency_details.company_name : r.customer_details ? r.customer_details.email : 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground border border-border">
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => navigate(`/admin/requests/${r.id}`)}
                        className="text-primary hover:underline font-medium text-xs mr-4"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => setOpenDropdownId(openDropdownId === r.id ? null : r.id)}
                        className="p-2 hover:bg-secondary rounded-full transition-colors inline-block align-middle"
                      >
                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                      </button>

                      {openDropdownId === r.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setOpenDropdownId(null)}
                          />
                          <div className="absolute right-8 top-12 w-48 bg-card border border-border shadow-lg rounded-xl z-50 overflow-hidden py-1">
                            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/50">Update Status</div>
                            {statusOptions.map(status => (
                              <button 
                                key={status}
                                onClick={() => handleStatusUpdate(r.id, status)}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-secondary ${r.status === status ? 'font-bold text-primary' : 'text-foreground'}`}
                              >
                                {status.replace('_', ' ')}
                              </button>
                            ))}
                            <div className="h-px bg-border my-1" />
                            <button 
                              onClick={() => handleRequestDelete(r.id)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2 font-medium"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Request
                            </button>
                          </div>
                        </>
                      )}
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

function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold font-heading gradient-text tracking-tight pb-1">System Settings</h1>
      <div className="card-panel p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Settings className="w-5 h-5"/> General Configuration</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Platform Name</label>
              <input type="text" disabled value="AR-RABB Tours and Travels Dashboard" className="w-full p-2.5 bg-secondary/50 border border-border rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Support Email</label>
              <input type="text" disabled value="support@alrabbtours.com" className="w-full p-2.5 bg-secondary/50 border border-border rounded-lg" />
            </div>
          </div>
          <button disabled className="bg-primary/50 text-primary-foreground px-4 py-2 rounded-lg font-medium cursor-not-allowed">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

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
      <h1 className="text-3xl font-bold font-heading gradient-text tracking-tight pb-1">Admin Notifications</h1>
      
      {isLoading ? (
        <div className="card-panel p-12 text-center text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="card-panel p-6 text-center py-12">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No new notifications</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">System alerts and request updates will appear here.</p>
        </div>
      ) : (
        <div className="card-panel">
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

export default function AdminDashboard() {
  return (
    <DashboardLayout role="ADMIN">
      <Routes>
        <Route path="" element={<DashboardHome />} />
        <Route path="agencies" element={<UserManagement title="Agencies Management" role="AGENCY" />} />
        <Route path="customers" element={<UserManagement title="Customers Management" role="CUSTOMER" />} />
        <Route path="requests" element={<RequestsManagement key="all" title="All Requests" />} />
        <Route path="visas" element={<RequestsManagement key="visas" title="Visa Requests" type="GROUP_VISA,INDIVIDUAL_VISA" />} />
        <Route path="tickets" element={<RequestsManagement key="tickets" title="Ticket Requests" type="AIR_TICKET" />} />
        <Route path="requests/:id" element={<RequestDetails />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Routes>
    </DashboardLayout>
  );
}
