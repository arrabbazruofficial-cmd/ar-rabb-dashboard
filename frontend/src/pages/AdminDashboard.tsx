import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Users, Building2, ClipboardList, CheckCircle, XCircle, Bell, Settings } from 'lucide-react';
import { api } from '@/lib/api';

import { MoreVertical, Trash2, ShieldCheck, Power, PowerOff, FileText } from 'lucide-react';

function DashboardHome() {
  const [metrics, setMetrics] = useState({ requests: '-', agencies: '-', customers: '-' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [reqRes, agRes, custRes] = await Promise.all([
          api.get('/requests/'),
          api.get('/auth/users/?role=AGENCY'),
          api.get('/auth/users/?role=CUSTOMER')
        ]);
        setMetrics({
          requests: reqRes.data.count?.toString() || '0',
          agencies: agRes.data.count?.toString() || '0',
          customers: custRes.data.count?.toString() || '0'
        });
      } catch (err) {
        console.error("Failed to fetch metrics", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-heading gradient-text tracking-tight pb-1">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Requests', value: metrics.requests, icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Active Agencies', value: metrics.agencies, icon: Building2, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Registered Customers', value: metrics.customers, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center gap-4 animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <p className="text-2xl font-bold">
                {isLoading ? <span className="animate-pulse bg-secondary/50 rounded h-6 w-12 inline-block"></span> : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm min-h-[300px]">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="text-sm text-muted-foreground">Recent actions and requests will appear here.</div>
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
                  <td colSpan={role === 'AGENCY' ? 6 : 5} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    Loading users...
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

function RequestDetailsModal({ request, onClose }: { request: any, onClose: () => void }) {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border shadow-xl rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
          <h2 className="text-xl font-bold">Request Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full">
            <XCircle className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground font-medium">Request ID</p>
              <p className="font-mono">{request.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Type</p>
              <p>{request.request_type.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Status</p>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground border border-border mt-1">
                {request.status.replace('_', ' ')}
              </span>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Submitted By (Agency)</p>
              <p>{request.agency_details ? request.agency_details.company_name : request.assigned_to_details ? request.assigned_to_details.email : 'Unknown'}</p>
            </div>
          </div>

          <div className="h-px bg-border" />

          {request.attachments && request.attachments.length > 0 && (
            <div className="space-y-3 mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                Uploaded Files
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {request.attachments.map((file: any) => (
                  <a 
                    key={file.id} 
                    href={file.file || file.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
                  >
                    <div className="bg-primary/10 p-2 rounded text-primary">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate">{file.file_name || (file.file ? file.file.split('/').pop() : 'Document')}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB • ` : ''}Click to view
                      </p>
                    </div>
                  </a>
                ))}
              </div>
              <div className="h-px bg-border my-4" />
            </div>
          )}

          {request.request_type === 'GROUP_VISA' && request.group_visa && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Group Visa Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm bg-secondary/30 p-4 rounded-lg border border-border">
                <div><span className="text-muted-foreground">Passengers:</span> {request.group_visa.number_of_passengers}</div>
                <div><span className="text-muted-foreground">Country:</span> {request.group_visa.country_code}</div>
                <div><span className="text-muted-foreground">Travel Date:</span> {request.group_visa.travel_date}</div>
                <div><span className="text-muted-foreground">Flight Code:</span> {request.group_visa.flight_code}</div>
                <div><span className="text-muted-foreground">Leader:</span> {request.group_visa.group_leader_name}</div>
                <div><span className="text-muted-foreground">Saudi Phone:</span> {request.group_visa.saudi_number}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Itinerary:</span> {request.group_visa.flight_itinerary}</div>
              </div>

              {request.group_visa.hotels && request.group_visa.hotels.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Hotels</h4>
                  <div className="space-y-2">
                    {request.group_visa.hotels.map((h: any, idx: number) => (
                      <div key={idx} className="bg-secondary/20 p-3 rounded border border-border text-xs grid grid-cols-2 gap-2">
                        <div><span className="text-muted-foreground">City:</span> {h.city}</div>
                        <div><span className="text-muted-foreground">Hotel:</span> {h.hotel_name}</div>
                        <div><span className="text-muted-foreground">Room:</span> {h.room_type} ({h.room_count} count)</div>
                        <div><span className="text-muted-foreground">Dates:</span> {h.check_in} to {h.check_out}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {request.group_visa.transports && request.group_visa.transports.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Transports</h4>
                  <div className="space-y-2">
                    {request.group_visa.transports.map((t: any, idx: number) => (
                      <div key={idx} className="bg-secondary/20 p-3 rounded border border-border text-xs grid grid-cols-2 gap-2">
                        <div><span className="text-muted-foreground">Type:</span> {t.transport_type}</div>
                        <div><span className="text-muted-foreground">Period:</span> {t.period}</div>
                        <div className="col-span-2"><span className="text-muted-foreground">Schedule:</span> {t.date} at {t.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {request.request_type === 'INDIVIDUAL_VISA' && request.individual_visa && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Individual Visa Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm bg-secondary/30 p-4 rounded-lg border border-border">
                <div><span className="text-muted-foreground">Visa Type:</span> {request.individual_visa.visa_subtype}</div>
                <div><span className="text-muted-foreground">Passengers:</span> {request.individual_visa.number_of_passengers}</div>
                <div><span className="text-muted-foreground">Stay Days:</span> {request.individual_visa.stay_days}</div>
                <div><span className="text-muted-foreground">Saudi Phone:</span> {request.individual_visa.saudi_number}</div>
                <div><span className="text-muted-foreground">Arrival:</span> {request.individual_visa.arrival_flight}</div>
                <div><span className="text-muted-foreground">Departure:</span> {request.individual_visa.departure_flight}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Address:</span> {request.individual_visa.national_address}</div>
              </div>
            </div>
          )}

          {request.request_type === 'AIR_TICKET' && request.air_ticket && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Air Ticket Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm bg-secondary/30 p-4 rounded-lg border border-border">
                <div><span className="text-muted-foreground">Origin:</span> {request.air_ticket.origin}</div>
                <div><span className="text-muted-foreground">Destination:</span> {request.air_ticket.destination}</div>
                <div><span className="text-muted-foreground">Departure:</span> {request.air_ticket.departure_date}</div>
                <div><span className="text-muted-foreground">Return:</span> {request.air_ticket.arrival_date || 'N/A'}</div>
                <div><span className="text-muted-foreground">Passengers:</span> {request.air_ticket.passengers}</div>
                <div><span className="text-muted-foreground">Airline:</span> {request.air_ticket.preferred_airline || 'Any'}</div>
                <div><span className="text-muted-foreground">Luggage:</span> {request.air_ticket.luggage_weight}</div>
                <div><span className="text-muted-foreground">Wheelchair:</span> {request.air_ticket.wheelchair_required ? 'Yes' : 'No'}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {request.air_ticket.additional_notes || 'None'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RequestsManagement({ title, type }: { title: string, type?: string }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
                        onClick={() => setSelectedRequest(r)}
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
      
      <RequestDetailsModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
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
              <input type="text" disabled value="Al-Rabb Tours Dashboard" className="w-full p-2.5 bg-secondary/50 border border-border rounded-lg" />
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
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Routes>
    </DashboardLayout>
  );
}
