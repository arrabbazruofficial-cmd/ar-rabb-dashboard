import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { api } from '@/lib/api';
import { 
  ArrowLeft, FileText, AlertCircle, Clock, 
  Users, Building2, MessageSquare, ChevronDown, ChevronUp, UploadCloud, FileArchive, Plus, X
} from 'lucide-react';
import { format } from 'date-fns';
import { AttachmentManager } from '@/components/ui/AttachmentManager';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/lib/auth';

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role;
  const [request, setRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPassenger, setExpandedPassenger] = useState<string | null>(null);
  
  // File upload state for passengers
  const [uploadingPassengerId, setUploadingPassengerId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPassengerId, setSelectedPassengerId] = useState<string | null>(null);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);

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

  const handleDownloadAllPassports = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/requests/${id}/download_all_documents/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Documents_${id.split('-')[0]}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download documents', err);
      alert('Failed to download documents or no documents available.');
    }
  };

  const handlePassportUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedPassengerId) return;

    setUploadingPassengerId(selectedPassengerId);
    
    const formData = new FormData();
    formData.append('passport_document', file);

    try {
      await api.patch(`/passengers/${selectedPassengerId}/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      await fetchRequest();
    } catch (err) {
      console.error('Failed to upload passport:', err);
      alert('Failed to upload passport.');
    } finally {
      setUploadingPassengerId(null);
      setSelectedPassengerId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerUpload = (passengerId: string) => {
    setSelectedPassengerId(passengerId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Hidden file input for passport upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handlePassportUpload} 
        className="hidden" 
        accept=".pdf,.jpg,.jpeg,.png" 
      />

      {/* Header Area */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to list
        </button>
        {(role === 'SUPER_ADMIN' || role === 'ADMIN') && (
          <button 
            onClick={handleDownloadAllPassports}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium hover:bg-secondary/80 transition-colors shadow-sm text-sm"
          >
            <FileArchive className="w-4 h-4" /> Download All Documents
          </button>
        )}
      </div>

      <div className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
        <div className="p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-accent/5 to-transparent">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-4 mb-2">
              {request.request_type.replace('_', ' ')}
              <StatusBadge status={request.status} />
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-3">
              <span className="font-mono text-sm bg-primary/10 text-primary px-2.5 py-0.5 rounded font-bold">ID: {request.id.split('-')[0]}</span>
              <span>•</span>
              <span className="text-sm font-medium">Created {format(new Date(request.created_at), 'PPP')}</span>
            </p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 bg-slate-50/50">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Passenger Management CRM Card */}
            {request.passengers && request.passengers.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm border border-border p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-border pb-4 gap-4">
                  <h3 className="text-xl font-bold font-heading flex items-center gap-2 text-slate-800">
                    <Users className="w-5 h-5 text-primary" /> Passengers ({request.passengers.length})
                  </h3>
                  <button 
                    onClick={() => setShowAttachmentModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Upload Attachments
                  </button>
                </div>
                
                <div className="space-y-4">
                  {request.passengers.map((p: any) => {
                    const isExpanded = expandedPassenger === p.id;
                    return (
                      <div key={p.id} className="border border-border rounded-xl overflow-hidden bg-white shadow-sm transition-all">
                        {/* Passenger Card Header */}
                        <div 
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                          onClick={() => setExpandedPassenger(isExpanded ? null : p.id)}
                        >
                          <div className="flex items-center gap-4 mb-2 sm:mb-0">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                              {p.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                {p.full_name} 
                                {p.is_lead && <span className="bg-amber-100 text-amber-700 text-[10px] uppercase px-2 py-0.5 rounded font-extrabold tracking-wider">Lead</span>}
                              </p>
                              <p className="text-sm text-slate-500 font-medium">Passport: {p.passport_number}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {p.passport_document ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                                Document Attached
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200">
                                Missing Document
                              </span>
                            )}
                            <button className="text-slate-400 hover:text-slate-700 p-1">
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        {/* Passenger Card Body */}
                        {isExpanded && (
                          <div className="p-4 bg-slate-50 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nationality</p>
                                <p className="font-medium text-slate-800">{p.nationality}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Birth</p>
                                <p className="font-medium text-slate-800">{p.date_of_birth}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Passport Expiry</p>
                                <p className="font-medium text-slate-800">{p.passport_expiry}</p>
                              </div>
                            </div>

                            {/* Passport Document Management */}
                            <div className="bg-white p-4 rounded-xl border border-border flex flex-col items-center justify-center text-center space-y-4">
                              <h4 className="text-sm font-bold text-slate-700">Passport Document</h4>
                              {p.passport_document ? (
                                <div className="space-y-3 w-full">
                                  <a 
                                    href={p.passport_document} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-2 bg-secondary text-secondary-foreground rounded-lg font-medium text-sm hover:bg-secondary/80 transition-colors"
                                  >
                                    <FileText className="w-4 h-4" /> View Passport
                                  </a>
                                  {(role === 'AGENCY' || role === 'SUPER_ADMIN' || role === 'ADMIN') && (
                                    <button 
                                      onClick={() => triggerUpload(p.id)}
                                      disabled={uploadingPassengerId === p.id}
                                      className="flex items-center justify-center gap-2 w-full py-2 border border-border text-slate-600 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors"
                                    >
                                      {uploadingPassengerId === p.id ? 'Uploading...' : 'Replace Document'}
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-3 w-full">
                                  <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm border border-rose-100 flex items-center justify-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> No passport uploaded
                                  </div>
                                  {(role === 'AGENCY' || role === 'CUSTOMER') && (
                                    <button 
                                      onClick={() => triggerUpload(p.id)}
                                      disabled={uploadingPassengerId === p.id}
                                      className="flex items-center justify-center gap-2 w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm"
                                    >
                                      <UploadCloud className="w-4 h-4" /> {uploadingPassengerId === p.id ? 'Uploading...' : 'Upload Passport'}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Request Type Specific Details CRM Card */}
            {request.request_type === 'GROUP_VISA' && request.group_visa && (
              <section className="bg-white rounded-xl shadow-sm border border-border p-6">
                <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary"><Building2 className="w-5 h-5" /></div>
                  <h3 className="text-xl font-bold font-heading text-slate-800">Visa Requirements</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Travel Date</p>
                    <p className="font-medium text-slate-800">{request.group_visa.travel_date || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Country Code</p>
                    <p className="font-medium text-slate-800">{request.group_visa.country_code || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Flight Code</p>
                    <p className="font-medium text-slate-800">{request.group_visa.flight_code || 'N/A'}</p>
                  </div>
                  <div className="col-span-2 md:col-span-4">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Itinerary</p>
                    <p className="font-medium text-slate-800">{request.group_visa.flight_itinerary || 'N/A'}</p>
                  </div>
                </div>

                {request.group_visa.hotels && request.group_visa.hotels.length > 0 && (
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 border-b border-border pb-2">Hotels Included</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      {request.group_visa.hotels.map((hotel: any, idx: number) => (
                        <div key={idx} className="flex flex-col p-4 bg-slate-50 border border-slate-200 rounded-xl">
                          <p className="font-bold text-primary text-lg mb-1">{hotel.hotel_name}</p>
                          <p className="text-sm font-medium text-slate-600 mb-4">{hotel.city} • {hotel.room_type} ({hotel.room_count} Rooms)</p>
                          
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200">
                            <div>
                              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Check In</p>
                              <p className="font-medium text-slate-800 text-sm">{hotel.check_in}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Check Out</p>
                              <p className="font-medium text-slate-800 text-sm">{hotel.check_out}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Attachments via Manager */}
            <section className="bg-white rounded-xl shadow-sm border border-border p-6">
              <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><FileText className="w-5 h-5" /></div>
                <h3 className="text-xl font-bold font-heading text-slate-800">Additional Attachments</h3>
              </div>
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
            <div className="bg-white shadow-sm border border-border p-6 rounded-xl">
              <h4 className="font-bold font-heading text-lg mb-6 text-slate-800 flex items-center gap-2 border-b border-border pb-3">
                <Clock className="w-5 h-5 text-primary" /> Request Metadata
              </h4>
              <div className="space-y-6 text-sm">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Submitted By</p>
                  <p className="font-bold text-slate-800 text-base">{request.agency_details?.company_name || 'Agency'}</p>
                  {request.agency_details?.contact_person && (
                    <p className="text-slate-500 mt-1">{request.agency_details.contact_person}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer Email</p>
                  <p className="font-medium text-slate-800">{request.customer_details?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Last Updated</p>
                  <p className="font-medium text-slate-800">{format(new Date(request.updated_at), 'PPp')}</p>
                </div>
              </div>
            </div>

            {request.admin_notes && (
              <div className="bg-sky-50 shadow-sm border border-sky-100 p-6 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <MessageSquare className="w-24 h-24 text-sky-600" />
                </div>
                <h4 className="font-bold font-heading text-lg mb-4 text-sky-900 flex items-center gap-2 relative z-10">
                  <MessageSquare className="w-5 h-5" /> Admin Notes
                </h4>
                <p className="text-sm font-medium text-sky-900/80 leading-relaxed relative z-10">
                  {request.admin_notes}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {showAttachmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">Request Attachments</h3>
              <button 
                onClick={() => setShowAttachmentModal(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <AttachmentManager 
                requestId={request.id} 
                existingAttachments={request.attachments} 
                onAttachmentUpdated={fetchRequest}
                canEdit={role === 'AGENCY' || role === 'SUPER_ADMIN' || role === 'ADMIN'}
              />
            </div>
            <div className="p-5 border-t border-slate-100 flex justify-end bg-slate-50">
              <button 
                onClick={() => setShowAttachmentModal(false)}
                className="px-6 py-2.5 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
