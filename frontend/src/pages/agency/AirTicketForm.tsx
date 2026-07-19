import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileUpload } from '@/components/ui/FileUpload';
import { useToast } from '@/components/ui/Toast';
import { SoftValidationDialog } from '@/components/ui/SoftValidationDialog';
import { api } from '@/lib/api';
import { Plus, Trash2 } from 'lucide-react';
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

export default function AirTicketForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;
  const isEditing = !!editData;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIncompleteDialog, setShowIncompleteDialog] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);

  const { register, handleSubmit, formState: { errors }, control, getValues } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: editData ? {
      ...editData.air_ticket,
      number_of_passengers: editData.air_ticket?.passengers || 1,
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

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const { passengers, ...airTicketData } = data as any;
      const payload = {
        request_type: 'AIR_TICKET',
        air_ticket: airTicketData,
        passengers: passengers,
        status: 'SUBMITTED'
      };
      
      let requestId = editData?.id;

      if (isEditing) {
        await api.patch(`/requests/${requestId}/`, payload);
      } else {
        const res = await api.post('/requests/', payload);
        requestId = res.data.id;
      }

      if (attachments.length > 0) {
        for (const file of attachments) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('request', requestId);
          await api.post('/requests/attachments/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
      }

      toast('Air Ticket request submitted successfully!', 'success');
      navigate('/agency/requests');
    } catch (error) {
      toast('Failed to submit request. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = () => {
    setShowIncompleteDialog(true);
  };

  const submitIncomplete = async () => {
    setShowIncompleteDialog(false);
    setIsSubmitting(true);
    try {
      const data = getValues();
      const { passengers, ...airTicketData } = data as any;
      
      const payload = {
        request_type: 'AIR_TICKET',
        air_ticket: airTicketData,
        passengers: passengers || [],
        status: 'INCOMPLETE'
      };
      
      let requestId = editData?.id;

      if (isEditing) {
        await api.patch(`/requests/${requestId}/`, payload);
      } else {
        const res = await api.post('/requests/', payload);
        requestId = res.data.id;
      }

      if (attachments.length > 0) {
        for (const file of attachments) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('request', requestId);
          await api.post('/requests/attachments/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
      }

      toast('Air Ticket saved as incomplete.', 'success');
      navigate('/agency/requests');
    } catch (error) {
      toast('Failed to save request as incomplete. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Air Ticket Booking</h1>
        <p className="text-muted-foreground mt-2">Submit a request to book domestic or international flights.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any, onError)} className="space-y-8">
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-6">Flight Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Origin</label>
              <input type="text" placeholder="e.g. DEL, Mumbai" {...register('origin')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
              {errors.origin && <p className="text-xs text-destructive">{errors.origin.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Destination</label>
              <input type="text" placeholder="e.g. JED, Riyadh" {...register('destination')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
              {errors.destination && <p className="text-xs text-destructive">{errors.destination.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Departure Date</label>
              <input type="date" {...register('departure_date')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
              {errors.departure_date && <p className="text-xs text-destructive">{errors.departure_date.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Return Date</label>
              <input type="date" {...register('arrival_date')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
              {errors.arrival_date && <p className="text-xs text-destructive">{errors.arrival_date.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Passengers</label>
              <input type="number" {...register('number_of_passengers')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
              {errors.number_of_passengers && <p className="text-xs text-destructive">{errors.number_of_passengers.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Preferred Airline (Optional)</label>
              <input type="text" {...register('preferred_airline')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
            </div>
          </div>
        </div>

        {/* Passengers */}
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Passengers</h2>
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
              <div key={field.id} className="p-4 border border-border rounded-xl relative bg-secondary/10">
                {index > 0 && (
                  <button type="button" onClick={() => removePassenger(index)} className="absolute top-4 right-4 text-destructive hover:opacity-80">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Full Name</label>
                    <input type="text" {...register(`passengers.${index}.full_name` as any)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
                    {(errors as any).passengers?.[index]?.full_name && <p className="text-xs text-destructive">{(errors as any).passengers[index]?.full_name?.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Passport Number</label>
                    <input type="text" {...register(`passengers.${index}.passport_number` as any)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
                    {(errors as any).passengers?.[index]?.passport_number && <p className="text-xs text-destructive">{(errors as any).passengers[index]?.passport_number?.message}</p>}
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
                  <div className="space-y-2 md:col-span-3 flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...register(`passengers.${index}.is_lead` as any)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                      <span className="text-sm font-medium">Lead Passenger</span>
                    </label>
                    <div className="flex-1">
                      <input type="text" placeholder="Contact Number (Optional)" {...register(`passengers.${index}.contact_number` as any)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-6">Preferences & Extras</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Meal Preference</label>
              <select {...register('meal_preference')} className="w-full p-2.5 bg-input border border-border rounded-lg">
                <option value="NONE">No Preference</option>
                <option value="VEG">Vegetarian</option>
                <option value="NON_VEG">Non-Vegetarian</option>
                <option value="HALAL">Halal</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Luggage Weight (KG)</label>
              <input type="number" {...register('luggage_weight')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
            </div>
            <div className="flex items-center gap-3 md:col-span-2">
              <input type="checkbox" id="wheelchair" {...register('wheelchair_required')} className="w-5 h-5 rounded border-border" />
              <label htmlFor="wheelchair" className="text-sm font-medium">Wheelchair Required</label>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Additional Notes</label>
              <textarea {...register('additional_notes')} rows={3} className="w-full p-2.5 bg-input border border-border rounded-lg" />
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-6">Attachments</h2>
          <FileUpload 
            label="Upload Passports (PDF/JPG)"
            onUploadSuccess={(file) => {
              setAttachments(prev => [...prev, file]);
            }}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting Request...' : 'Submit Request'}
          </button>
        </div>
      </form>

      <SoftValidationDialog 
        isOpen={showIncompleteDialog}
        onClose={() => setShowIncompleteDialog(false)}
        onConfirm={submitIncomplete}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
