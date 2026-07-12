import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileUpload } from '@/components/ui/FileUpload';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router';

const formSchema = z.object({
  origin: z.string().min(1, 'Origin required'),
  destination: z.string().min(1, 'Destination required'),
  arrival_date: z.string().min(1, 'Arrival date required'),
  departure_date: z.string().min(1, 'Departure date required'),
  passengers: z.coerce.number().min(1),
  preferred_airline: z.string().optional(),
  luggage_weight: z.coerce.number().optional(),
  wheelchair_required: z.boolean().default(false),
  meal_preference: z.enum(['NONE', 'VEG', 'NON_VEG', 'HALAL']),
  additional_notes: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function AirTicketForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      passengers: 1,
      wheelchair_required: false,
      meal_preference: 'NONE'
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        request_type: 'AIR_TICKET',
        air_ticket: data,
        attachments: attachments
      };
      await api.post('/requests/', payload);
      toast('Air Ticket request submitted successfully!', 'success');
      navigate('/agency/requests');
    } catch (error) {
      toast('Failed to submit request. Please try again.', 'error');
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

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
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
              <label className="text-sm font-medium">Passengers</label>
              <input type="number" {...register('passengers')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
              {errors.passengers && <p className="text-xs text-destructive">{errors.passengers.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Preferred Airline (Optional)</label>
              <input type="text" {...register('preferred_airline')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
            </div>
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
            onUploadSuccess={(url, name, type, size) => {
              setAttachments(prev => [...prev, { file_url: url, file_name: name, file_type: type, file_size: size }]);
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
    </div>
  );
}
