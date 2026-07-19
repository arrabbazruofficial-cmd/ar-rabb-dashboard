import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { api } from '@/lib/api';
import { 
  ArrowLeft, FileText, AlertCircle, Clock, 
  Users, Building2, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { AttachmentManager } from '@/components/ui/AttachmentManager';

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequest = async () => {
    try {
      const res = await api.get(`/requests/${id}/`);
      setRequest(res.data);
    } catch (error) {
      console.error('Failed to load request details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchRequest();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-24">
        <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Request Not Found</h2>
        <p className="text-muted-foreground mt-2">The request you are looking for does not exist or you do not have permission to view it.</p>
        <button onClick={() => navigate(-1)} className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg">Go Back</button>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
    INCOMPLETE: 'bg-amber-100 text-amber-700 border-amber-200',
    SUBMITTED: 'bg-blue-100 text-blue-700 border-blue-200',
    UNDER_REVIEW: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    PROCESSING: 'bg-purple-100 text-purple-700 border-purple-200',
    APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-rose-100 text-rose-700 border-rose-200',
    COMPLETED: 'bg-teal-100 text-teal-700 border-teal-200',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to list
        </button>
      </div>

      <div className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
        <div className="p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-accent/10 to-transparent">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              {request.request_type.replace('_', ' ')}
              <span className={cn('text-xs font-semibold px-3 py-1 rounded-full border', statusColors[request.status] || 'bg-gray-100 text-gray-700')}>
                {request.status.replace('_', ' ')}
              </span>
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <span className="font-mono text-xs bg-secondary/50 px-2 py-0.5 rounded">ID: {request.id}</span>
              <span>•</span>
              <span>Created {format(new Date(request.created_at), 'PPP')}</span>
            </p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Passenger Information */}
            {request.passengers && request.passengers.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-primary" /> Passenger Details ({request.passengers.length})
                </h3>
                <div className="grid gap-3">
                  {request.passengers.map((p: any, idx: number) => (
                    <div key={idx} className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground flex items-center gap-2">
                          {p.full_name} 
                          {p.is_lead && <span className="bg-primary/10 text-primary text-[10px] uppercase px-2 py-0.5 rounded font-bold">Lead</span>}
                        </p>
                        <p className="text-sm text-muted-foreground">Passport: {p.passport_number} • {p.nationality}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">DOB: {p.date_of_birth}</p>
                        <p className="text-xs text-muted-foreground">Expiry: {p.passport_expiry}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Request Type Specific Details */}
            {request.request_type === 'GROUP_VISA' && request.group_visa && (
              <section>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-primary" /> Visa Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-secondary/20 p-5 rounded-xl border border-border">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Travel Date</p>
                    <p className="font-medium">{request.group_visa.travel_date || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Country Code</p>
                    <p className="font-medium">{request.group_visa.country_code || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Flight Code</p>
                    <p className="font-medium">{request.group_visa.flight_code || 'N/A'}</p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Itinerary</p>
                    <p className="font-medium">{request.group_visa.flight_itinerary || 'N/A'}</p>
                  </div>
                </div>

                {request.group_visa.hotels && request.group_visa.hotels.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">Hotels</h4>
                    <div className="space-y-3">
                      {request.group_visa.hotels.map((hotel: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-card border border-border shadow-sm rounded-lg">
                          <div>
                            <p className="font-semibold text-primary">{hotel.hotel_name}</p>
                            <p className="text-sm text-muted-foreground">{hotel.city} • {hotel.room_type} ({hotel.room_count} Rooms)</p>
                          </div>
                          <div className="text-right text-sm font-medium">
                            <p>{hotel.check_in}</p>
                            <p className="text-muted-foreground text-xs">to</p>
                            <p>{hotel.check_out}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Attachments via Manager */}
            <section>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" /> Attachments
              </h3>
              <AttachmentManager 
                requestId={request.id}
                existingAttachments={request.attachments}
                onAttachmentUpdated={fetchRequest}
                canEdit={true}
              />
            </section>

          </div>

          {/* Right Column: Meta & Admin */}
          <div className="space-y-6">
            <div className="bg-secondary/20 border border-border p-5 rounded-xl">
              <h4 className="font-semibold text-sm mb-4 text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" /> Workflow Info
              </h4>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Submitted By</p>
                  <p className="font-medium text-foreground">{request.agency_details?.company_name || 'Agency'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p className="font-medium text-foreground">{format(new Date(request.updated_at), 'PPp')}</p>
                </div>
              </div>
            </div>

            {request.admin_notes && (
              <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 p-5 rounded-xl">
                <h4 className="font-semibold text-sm mb-2 text-blue-800 dark:text-blue-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Admin Notes
                </h4>
                <p className="text-sm text-blue-900/80 dark:text-blue-200/80 leading-relaxed">
                  {request.admin_notes}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
