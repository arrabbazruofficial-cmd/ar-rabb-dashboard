import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FileText, Search, Filter, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
              <p className="text-muted-foreground font-medium">Submitted By</p>
              <p>{request.agency ? request.agency.company_name : request.customer ? request.customer.email : 'Unknown'}</p>
            </div>
          </div>

          <div className="h-px bg-border" />

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

export default function MyRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get('/requests/');
        // The API returns a paginated response, so data might be in res.data.results
        setRequests(res.data.results || res.data || []);
      } catch (error) {
        console.error('Failed to fetch requests', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PROCESSING': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'COMPLETED': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
            <input type="text" placeholder="Search requests..." className="pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg w-full sm:w-64" />
          </div>
          <button className="p-2 bg-card border border-border rounded-lg hover:bg-secondary">
            <Filter className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
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
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-xs font-mono">{req.id.split('-')[0]}...</td>
                    <td className="px-6 py-4">{req.request_type.replace('_', ' ')}</td>
                    <td className="px-6 py-4">{new Date(req.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border", getStatusColor(req.status))}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedRequest(req)} className="text-primary hover:underline font-medium text-xs">View Details</button>
                    </td>
                  </tr>
                ))
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

      <RequestDetailsModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
    </div>
  );
}
