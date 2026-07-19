import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FileText, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function MyRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests/');
      setRequests(res.data.results || res.data || []);
    } catch (error) {
      console.error('Failed to fetch requests', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);


  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage all your submitted requests.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search requests..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg w-full sm:w-64" 
            />
          </div>
          <button className="p-2 bg-card border border-border rounded-lg hover:bg-secondary">
            <Filter className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-primary/10 text-[#0F172A] font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Submitted On</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    Loading requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No requests found.</p>
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  let editPath = '';
                  if (req.request_type === 'GROUP_VISA') editPath = '/agency/group-visa';
                  else if (req.request_type === 'INDIVIDUAL_VISA') editPath = '/agency/individual-visa';
                  else if (req.request_type === 'AIR_TICKET') editPath = '/agency/air-ticket';

                  return (
                    <tr key={req.id} className="even:bg-secondary/5 hover:bg-primary/5 transition-colors border-b border-border/50 last:border-0 relative">
                      <td className="px-6 py-5 font-medium text-xs font-mono">{req.id.split('-')[0]}...</td>
                      <td className="px-6 py-5 font-medium">{req.request_type.replace('_', ' ')}</td>
                      <td className="px-6 py-5">{new Date(req.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-5">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-6 py-5 text-right flex items-center justify-end gap-3">
                        <button 
                          onClick={() => navigate(`/agency/requests/${req.id}`)} 
                          className="text-primary hover:underline font-medium text-xs"
                        >
                          View Details
                        </button>
                        
                        {req.status !== 'COMPLETED' && req.status !== 'REJECTED' && (
                          <button 
                            onClick={() => navigate(editPath, { state: { editData: req } })}
                            className="text-amber-600 hover:underline font-medium text-xs"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {requests.length} results</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-border rounded hover:bg-secondary disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-border rounded hover:bg-secondary disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
