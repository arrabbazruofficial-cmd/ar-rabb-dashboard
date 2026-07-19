import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AttachmentManager } from '@/components/ui/AttachmentManager';
import { useToast } from '@/components/ui/Toast';
import { SoftValidationDialog } from '@/components/ui/SoftValidationDialog';
import { PhaseNavigation } from '@/components/ui/PhaseNavigation';
import { api } from '@/lib/api';
import { Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';

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
  origin: z.string().min(1, 'Origin required'),
  destination: z.string().min(1, 'Destination required'),
  arrival_date: z.string().min(1, 'Arrival date required'),
  departure_date: z.string().min(1, 'Departure date required'),
  number_of_passengers: z.coerce.number().min(1),
  preferred_airline: z.string().optional(),
  luggage_weight: z.coerce.number().optional(),
  wheelchair_required: z.boolean().default(false),
  meal_preference: z.enum(['NONE', 'VEG', 'NON_VEG', 'HALAL']),
  additional_notes: z.string().optional(),
  passengers: z.array(passengerSchema).min(1, 'At least one passenger required'),
});

type FormValues = z.infer<typeof formSchema>;

const PHASES = [
  { id: 1, label: 'Travel Details' },
  { id: 2, label: 'Passenger Details' },
  { id: 3, label: 'Special Requests' },
  { id: 4, label: 'Review & Submit' },
];

export default function AirTicketForm() {
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

  const { register, handleSubmit, formState: { errors }, control, getValues } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: editData ? {
      ...editData.air_ticket,
      number_of_passengers: editData.air_ticket?.number_of_passengers || 1,
      passengers: editData.passengers || [{ passport_number: '', full_name: '', nationality: '', gender: 'MALE', date_of_birth: '', passport_expiry: '', is_lead: true, contact_number: '' }]
    } : {
      number_of_passengers: 1,
      wheelchair_required: false,
      meal_preference: 'NONE',
      passengers: [{ passport_number: '', full_name: '', nationality: '', gender: 'MALE', date_of_birth: '', passport_expiry: '', is_lead: true, contact_number: '' }]
    }
  });

  const { fields: passengerFields, append: appendPassenger, remove: removePassenger } = useFieldArray({
    control: control as any,
    name: 'passengers'
  });

  const saveDraft = async (phase: number) => {
    const data = getValues();
    const { passengers, ...airTicketData } = data as any;
    const payload = {
      request_type: 'AIR_TICKET',
      air_ticket: airTicketData,
      passengers: passengers || [],
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
    const nextPhase = currentPhase + 1;
    await saveDraft(nextPhase);
    setCurrentPhase(nextPhase);
    setHighestReachedPhase(Math.max(highestReachedPhase, nextPhase));
  };

  const handleBack = () => {
    setCurrentPhase((prev: number) => Math.max(1, prev - 1));
  };

  const handlePhaseClick = (phaseId: number) => {
    if (phaseId <= highestReachedPhase) {
      setCurrentPhase(phaseId);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const { passengers, ...airTicketData } = data as any;
      const payload = {
        request_type: 'AIR_TICKET',
        air_ticket: airTicketData,
        passengers: passengers || [],
        status: 'SUBMITTED',
        current_phase: 4
      };
      
      if (requestId) {
        await api.patch(`/requests/${requestId}/`, payload);
      } else {
        await api.post('/requests/', payload);
      }

      toast('Air Ticket request submitted successfully!', 'success');
      navigate('/agency/requests');
    } catch (error) {
      toast('Failed to submit request.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = () => {
    const currentErrors = Object.keys(errors);
    setMissingFields(currentErrors);
    setShowIncompleteDialog(true);
  };

  const submitIncomplete = async () => {
    setShowIncompleteDialog(false);
    setIsSubmitting(true);
    await saveDraft(currentPhase);
    toast('Air Ticket saved as incomplete.', 'success');
    navigate('/agency/requests');
    setIsSubmitting(false);
  };

  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 1:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
              <h2 className="text-xl font-semibold mb-6">Travel Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Origin</label>
                  <input type="text" placeholder="City or Airport Code" {...register('origin')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Destination</label>
                  <input type="text" placeholder="City or Airport Code" {...register('destination')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Departure Date</label>
                  <input type="date" {...register('departure_date')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Return Date (Optional)</label>
                  <input type="date" {...register('arrival_date')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Number of Passengers</label>
                  <input type="number" {...register('number_of_passengers')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preferred Airline (Optional)</label>
                  <input type="text" {...register('preferred_airline')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Passenger Details</h2>
                <button
                  type="button"
                  onClick={() => appendPassenger({ passport_number: '', full_name: '', nationality: '', gender: 'MALE', date_of_birth: '', passport_expiry: '', is_lead: false, contact_number: '' })}
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
                >
                  <Plus className="w-4 h-4" /> Add Passenger
                </button>
              </div>
              
              <div className="space-y-6">
                {passengerFields.map((field, index) => (
                  <div key={field.id} className="p-4 border border-border rounded-xl relative bg-secondary/5">
                    {index > 0 && (
                      <button type="button" onClick={() => removePassenger(index)} className="absolute top-4 right-4 text-destructive hover:opacity-80">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Full Name</label>
                        <input type="text" {...register(`passengers.${index}.full_name` as any)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Passport Number</label>
                        <input type="text" {...register(`passengers.${index}.passport_number` as any)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Nationality</label>
                        <input type="text" {...register(`passengers.${index}.nationality` as any)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Gender</label>
                        <select {...register(`passengers.${index}.gender` as any)} className="w-full p-2 bg-input border border-border rounded-lg text-sm">
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Date of Birth</label>
                        <input type="date" {...register(`passengers.${index}.date_of_birth` as any)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Passport Expiry</label>
                        <input type="date" {...register(`passengers.${index}.passport_expiry` as any)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
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
              <h2 className="text-xl font-semibold mb-6">Special Requests</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Luggage Weight (kg)</label>
                  <input type="number" {...register('luggage_weight')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Meal Preference</label>
                  <select {...register('meal_preference')} className="w-full p-2.5 bg-input border border-border rounded-lg">
                    <option value="NONE">None</option>
                    <option value="VEG">Vegetarian</option>
                    <option value="NON_VEG">Non-Vegetarian</option>
                    <option value="HALAL">Halal</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="wheelchair" {...register('wheelchair_required')} className="w-5 h-5 rounded border-border text-primary focus:ring-primary" />
                  <label htmlFor="wheelchair" className="text-sm font-medium">Wheelchair Assistance Required</label>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Additional Notes</label>
                  <textarea {...register('additional_notes')} rows={4} className="w-full p-2.5 bg-input border border-border rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
              <h2 className="text-xl font-semibold mb-6">Attachments</h2>
              {!requestId ? (
                <div className="p-4 text-sm text-amber-800 bg-amber-50 rounded-lg border border-amber-200">
                  You must save at least one field to generate a request ID before uploading attachments. 
                  Click "Previous" then "Next" to auto-save.
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
        <h1 className="text-3xl font-bold text-foreground">Air Ticket Booking</h1>
        <p className="text-muted-foreground mt-2">Submit a request for flight tickets with specific passenger requirements.</p>
      </div>

      <PhaseNavigation 
        phases={PHASES} 
        currentPhase={currentPhase} 
        highestReachedPhase={highestReachedPhase}
        onPhaseClick={handlePhaseClick}
      />

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
        {renderPhaseContent()}

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentPhase === 1}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold border border-border bg-card text-foreground hover:bg-secondary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

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
    </div>
  );
}
