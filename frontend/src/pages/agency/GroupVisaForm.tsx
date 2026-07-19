import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AttachmentManager } from '@/components/ui/AttachmentManager';
import { useToast } from '@/components/ui/Toast';
import { SoftValidationDialog } from '@/components/ui/SoftValidationDialog';
import { PhaseNavigation } from '@/components/ui/PhaseNavigation';
import { api } from '@/lib/api';
import { Plus, Trash2, ArrowRight, ArrowLeft, UploadCloud, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';

const hotelSchema = z.object({
  city: z.enum(['MAKKAH', 'MADINAH']),
  hotel_name: z.string().min(1, 'Hotel name required'),
  room_type: z.enum(['QUAD', 'PENTAGONAL', 'HEXAGONAL']),
  room_count: z.coerce.number().min(1),
  check_in: z.string().min(1, 'Check in required'),
  check_out: z.string().min(1, 'Check out required'),
});

const transportSchema = z.object({
  transport_type: z.enum(['AIRPORT_PICKUP', 'MAKKAH_ZIYARAH', 'MAKKAH_TO_MADINAH', 'MADINAH_ZIYARAH']),
  from_location: z.string().optional(),
  to_location: z.string().optional(),
  date: z.string().min(1, 'Date required'),
  time: z.string().min(1, 'Time required'),
  period: z.enum(['FN', 'AN']),
});

const passengerSchema = z.object({
  passport_number: z.string().min(1, 'Passport number required'),
  full_name: z.string().min(1, 'Full name required'),
  nationality: z.string().min(1, 'Nationality required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  date_of_birth: z.string().min(1, 'DOB required'),
  passport_expiry: z.string().min(1, 'Passport expiry required'),
  is_lead: z.boolean().default(false),
  contact_number: z.string().optional(),
});

const formSchema = z.object({
  number_of_passengers: z.coerce.number().min(1, 'Must have at least 1 passenger'),
  flight_itinerary: z.string().min(1, 'Flight itinerary required'),
  flight_code: z.string().min(1, 'Flight code required'),
  travel_date: z.string().min(1, 'Travel date required'),
  country_code: z.string().min(1, 'Country code required'),
  group_leader_name: z.string().min(1, 'Group leader name required'),
  india_number: z.string().min(1, 'India number required'),
  saudi_number: z.string().min(1, 'Saudi number required'),
  hotels: z.array(hotelSchema).min(1, 'At least one hotel required'),
  transports: z.array(transportSchema).min(1, 'At least one transport required'),
  passengers: z.array(passengerSchema).min(1, 'At least one passenger required'),
});

type FormValues = z.infer<typeof formSchema>;

const PHASES = [
  { id: 1, label: 'Group Details' },
  { id: 2, label: 'Travel & Hotel' },
  { id: 3, label: 'Transport' },
  { id: 4, label: 'Passengers' },
  { id: 5, label: 'Review' },
];

export default function GroupVisaForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;
  
  const [requestId, setRequestId] = useState<string | null>(editData?.id || null);
  const [currentPhase, setCurrentPhase] = useState(editData?.current_phase || 1);
  const [highestReachedPhase, setHighestReachedPhase] = useState(editData?.current_phase || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIncompleteDialog, setShowIncompleteDialog] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<any[]>(editData?.attachments || []);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  
  const { register, control, handleSubmit, formState: { errors }, getValues } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: editData?.group_visa || {
      hotels: [{ city: 'MAKKAH', hotel_name: '', room_type: 'QUAD', room_count: 1, check_in: '', check_out: '' }],
      transports: [{ transport_type: 'AIRPORT_PICKUP', from_location: '', to_location: '', date: '', time: '', period: 'FN' }],
      passengers: [{ passport_number: '', full_name: '', nationality: '', gender: 'MALE', date_of_birth: '', passport_expiry: '', is_lead: true, contact_number: '' }]
    }
  });

  const { fields: hotelFields, append: appendHotel, remove: removeHotel } = useFieldArray({ control, name: 'hotels' });
  const { fields: transportFields, append: appendTransport, remove: removeTransport } = useFieldArray({ control, name: 'transports' });
  const { fields: passengerFields, append: appendPassenger, remove: removePassenger } = useFieldArray({ control, name: 'passengers' });

  // Auto-save logic
  const saveDraft = async (phase: number) => {
    const data = getValues();
    const { passengers, ...groupVisaData } = data;
    const payload = {
      request_type: 'GROUP_VISA',
      group_visa: groupVisaData,
      passengers: passengers,
      status: 'INCOMPLETE',
      current_phase: phase
    };

    try {
      if (requestId) {
        await api.patch(`/requests/${requestId}/`, payload);
      } else {
        const res = await api.post('/requests/', payload);
        setRequestId(res.data.id);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleNext = async () => {
    // Save draft and go to next phase
    const nextPhase = currentPhase + 1;
    await saveDraft(nextPhase);
    setCurrentPhase(nextPhase);
    setHighestReachedPhase(Math.max(highestReachedPhase, nextPhase));
  };

  const handleBack = () => {
    setCurrentPhase((prev: number) => Math.max(1, prev - 1));
  };

  const handleOpenAttachments = async () => {
    if (!requestId) {
      setIsSubmitting(true);
      await saveDraft(currentPhase);
      setIsSubmitting(false);
    }
    setShowAttachmentModal(true);
  };

  const handlePhaseClick = (phaseId: number) => {
    if (phaseId <= highestReachedPhase) {
      setCurrentPhase(phaseId);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const { passengers, ...groupVisaData } = data;
      const payload = {
        request_type: 'GROUP_VISA',
        group_visa: groupVisaData,
        passengers: passengers,
        status: 'SUBMITTED',
        current_phase: 5
      };
      
      if (requestId) {
        await api.patch(`/requests/${requestId}/`, payload);
      } else {
        await api.post('/requests/', payload);
      }

      toast('Group Visa request submitted successfully!', 'success');
      navigate('/agency/requests');
    } catch (error) {
      toast('Failed to submit request. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = () => {
    // If we're on phase 5 and submitting, collect missing fields
    const currentErrors = Object.keys(errors);
    setMissingFields(currentErrors);
    setShowIncompleteDialog(true);
  };

  const submitIncomplete = async () => {
    setShowIncompleteDialog(false);
    setIsSubmitting(true);
    await saveDraft(currentPhase);
    toast('Group Visa saved as incomplete.', 'success');
    navigate('/agency/requests');
    setIsSubmitting(false);
  };

  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 1:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <h2 className="text-xl font-semibold mb-6">Group Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Group Leader Name</label>
                <input type="text" {...register('group_leader_name')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Passengers</label>
                <input type="number" {...register('number_of_passengers')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">India Contact Number</label>
                <input type="text" {...register('india_number')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Saudi Contact Number</label>
                <input type="text" {...register('saudi_number')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Country Code</label>
                <input type="text" {...register('country_code')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
              <h2 className="text-xl font-semibold mb-6">Flight Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Travel Date</label>
                  <input type="date" {...register('travel_date')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Flight Code</label>
                  <input type="text" {...register('flight_code')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Flight Itinerary (Paste complete text)</label>
                  <textarea {...register('flight_itinerary')} rows={4} className="w-full p-2.5 bg-input border border-border rounded-lg" />
                </div>
              </div>
            </div>
            
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Hotel Requirements</h2>
                <button type="button" onClick={() => appendHotel({ city: 'MAKKAH', hotel_name: '', room_type: 'QUAD', room_count: 1, check_in: '', check_out: '' })} className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
                  <Plus className="w-4 h-4" /> Add Hotel
                </button>
              </div>
              <div className="space-y-6">
                {hotelFields.map((field, index) => (
                  <div key={field.id} className="relative p-4 rounded-xl border border-border bg-secondary/5">
                    {index > 0 && (
                      <button type="button" onClick={() => removeHotel(index)} className="absolute -top-3 -right-3 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 shadow-sm">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">City</label>
                        <select {...register(`hotels.${index}.city` as const)} className="w-full p-2 bg-input border border-border rounded-lg text-sm">
                          <option value="MAKKAH">Makkah</option>
                          <option value="MADINAH">Madinah</option>
                        </select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-medium">Hotel Name</label>
                        <input type="text" {...register(`hotels.${index}.hotel_name` as const)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Room Type</label>
                        <select {...register(`hotels.${index}.room_type` as const)} className="w-full p-2 bg-input border border-border rounded-lg text-sm">
                          <option value="QUAD">Quad</option>
                          <option value="PENTAGONAL">Pentagonal</option>
                          <option value="HEXAGONAL">Hexagonal</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Check In</label>
                        <input type="date" {...register(`hotels.${index}.check_in` as const)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Check Out</label>
                        <input type="date" {...register(`hotels.${index}.check_out` as const)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Transport Details</h2>
                <button type="button" onClick={() => appendTransport({ transport_type: 'AIRPORT_PICKUP', from_location: '', to_location: '', date: '', time: '', period: 'FN' })} className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
                  <Plus className="w-4 h-4" /> Add Transport
                </button>
              </div>
              <div className="space-y-6">
                {transportFields.map((field, index) => (
                  <div key={field.id} className="relative p-4 rounded-xl border border-border bg-secondary/5">
                    {index > 0 && (
                      <button type="button" onClick={() => removeTransport(index)} className="absolute -top-3 -right-3 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 shadow-sm">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Route / Type</label>
                        <select {...register(`transports.${index}.transport_type` as const)} className="w-full p-2 bg-input border border-border rounded-lg text-sm">
                          <option value="AIRPORT_PICKUP">Airport Pickup</option>
                          <option value="MAKKAH_ZIYARAH">Makkah Ziyarah</option>
                          <option value="MAKKAH_TO_MADINAH">Makkah to Madinah</option>
                          <option value="MADINAH_ZIYARAH">Madinah Ziyarah / Rawdah</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">From Location</label>
                        <input type="text" {...register(`transports.${index}.from_location` as const)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">To Location</label>
                        <input type="text" {...register(`transports.${index}.to_location` as const)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Date</label>
                        <input type="date" {...register(`transports.${index}.date` as const)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Time</label>
                        <input type="time" {...register(`transports.${index}.time` as const)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Period</label>
                        <select {...register(`transports.${index}.period` as const)} className="w-full p-2 bg-input border border-border rounded-lg text-sm">
                          <option value="FN">Forenoon (FN)</option>
                          <option value="AN">Afternoon (AN)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-border pb-4">
                <h2 className="text-xl font-semibold">Passengers</h2>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={handleOpenAttachments} className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors">
                    <UploadCloud className="w-4 h-4" /> Upload Attachments
                  </button>
                  <button type="button" onClick={() => appendPassenger({ passport_number: '', full_name: '', nationality: '', gender: 'MALE', date_of_birth: '', passport_expiry: '', is_lead: false, contact_number: '' })} className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
                    <Plus className="w-4 h-4" /> Add Passenger
                  </button>
                </div>
              </div>
              <div className="space-y-6">
                {passengerFields.map((field, index) => (
                  <div key={field.id} className="relative p-4 rounded-xl border border-border bg-secondary/5">
                    {index > 0 && (
                      <button type="button" onClick={() => removePassenger(index)} className="absolute -top-3 -right-3 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 shadow-sm">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2 md:col-span-1">
                        <label className="text-xs font-medium">Passport Number</label>
                        <input type="text" {...register(`passengers.${index}.passport_number` as const)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-medium">Full Name</label>
                        <input type="text" {...register(`passengers.${index}.full_name` as const)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Nationality</label>
                        <input type="text" {...register(`passengers.${index}.nationality` as const)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Gender</label>
                        <select {...register(`passengers.${index}.gender` as const)} className="w-full p-2 bg-input border border-border rounded-lg text-sm">
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">DOB</label>
                        <input type="date" {...register(`passengers.${index}.date_of_birth` as const)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Passport Expiry</label>
                        <input type="date" {...register(`passengers.${index}.passport_expiry` as const)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
                      </div>
                      <div className="space-y-2 md:col-span-2 flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" {...register(`passengers.${index}.is_lead` as const)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                          <span className="text-sm font-medium">Lead Passenger</span>
                        </label>
                        <div className="flex-1">
                          <input type="text" placeholder="Contact Number (Optional)" {...register(`passengers.${index}.contact_number` as const)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
              <h2 className="text-xl font-semibold mb-6">Attachments & Review</h2>
              {!requestId ? (
                <div className="p-4 text-sm text-amber-800 bg-amber-50 rounded-lg border border-amber-200">
                  You must save at least one field to generate a request ID before uploading attachments. 
                  Click "Submit" to validate or "Previous" then "Next" to auto-save.
                </div>
              ) : (
                <AttachmentManager 
                  requestId={requestId} 
                  existingAttachments={attachments} 
                  canEdit={true} 
                  onAttachmentUpdated={async () => {
                    const res = await api.get(`/requests/${requestId}/`);
                    setAttachments(res.data.attachments);
                  }}
                />
              )}
            </div>
            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
              <h3 className="text-lg font-semibold text-primary mb-2">Ready to Submit?</h3>
              <p className="text-sm text-muted-foreground mb-4">Please ensure all required fields are filled and documents are attached. If anything is missing, you can still save this request as a draft.</p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 w-full sm:w-auto bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting Request...' : 'Submit Request'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Group Visa Application</h1>
        <p className="text-muted-foreground mt-2">Submit a new group visa request with hotel and transport details.</p>
      </div>

      <PhaseNavigation 
        phases={PHASES} 
        currentPhase={currentPhase} 
        highestReachedPhase={highestReachedPhase}
        onPhaseClick={handlePhaseClick}
      />

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
        {renderPhaseContent()}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 mt-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentPhase === 1}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold border border-border bg-card text-foreground hover:bg-secondary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-lg font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
          </div>

          {currentPhase < PHASES.length && (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold bg-accent text-accent-foreground hover:opacity-90 transition-opacity shadow-sm"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      <SoftValidationDialog 
        isOpen={showIncompleteDialog}
        onClose={() => setShowIncompleteDialog(false)}
        onConfirm={submitIncomplete}
        isSubmitting={isSubmitting}
        missingFields={missingFields}
      />

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
              {requestId ? (
                <AttachmentManager 
                  requestId={requestId} 
                  existingAttachments={attachments} 
                  onAttachmentUpdated={async () => {
                    const res = await api.get(`/requests/${requestId}/`);
                    setAttachments(res.data.attachments);
                  }}
                  canEdit={true}
                />
              ) : (
                <div className="p-4 text-sm text-amber-800 bg-amber-50 rounded-lg border border-amber-200">
                  Please save the form to generate a request ID before uploading attachments.
                </div>
              )}
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
