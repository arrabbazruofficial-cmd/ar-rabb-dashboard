import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileUpload } from '@/components/ui/FileUpload';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';

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
  date: z.string().min(1, 'Date required'),
  time: z.string().min(1, 'Time required'),
  period: z.enum(['FN', 'AN']),
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
});

type FormValues = z.infer<typeof formSchema>;

export default function GroupVisaForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);

  const { register, control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      hotels: [{ city: 'MAKKAH', hotel_name: '', room_type: 'QUAD', room_count: 1, check_in: '', check_out: '' }],
      transports: [{ transport_type: 'AIRPORT_PICKUP', date: '', time: '', period: 'FN' }]
    }
  });

  const { fields: hotelFields, append: appendHotel, remove: removeHotel } = useFieldArray({
    control,
    name: 'hotels'
  });

  const { fields: transportFields, append: appendTransport, remove: removeTransport } = useFieldArray({
    control,
    name: 'transports'
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        request_type: 'GROUP_VISA',
        group_visa: data,
        attachments: attachments
      };
      await api.post('/requests/', payload);
      toast('Group Visa request submitted successfully!', 'success');
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
        <h1 className="text-3xl font-bold text-foreground">Group Visa Application</h1>
        <p className="text-muted-foreground mt-2">Submit a new group visa request with hotel and transport details.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
        {/* Basic Details */}
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-6">Group Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Group Leader Name</label>
              <input type="text" {...register('group_leader_name')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
              {errors.group_leader_name && <p className="text-xs text-destructive">{errors.group_leader_name.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Passengers</label>
              <input type="number" {...register('number_of_passengers')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
              {errors.number_of_passengers && <p className="text-xs text-destructive">{errors.number_of_passengers.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">India Contact Number</label>
              <input type="text" {...register('india_number')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
              {errors.india_number && <p className="text-xs text-destructive">{errors.india_number.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Saudi Contact Number</label>
              <input type="text" {...register('saudi_number')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
              {errors.saudi_number && <p className="text-xs text-destructive">{errors.saudi_number.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Country Code</label>
              <input type="text" {...register('country_code')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
              {errors.country_code && <p className="text-xs text-destructive">{errors.country_code.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Travel Date</label>
              <input type="date" {...register('travel_date')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
              {errors.travel_date && <p className="text-xs text-destructive">{errors.travel_date.message}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Flight Code</label>
              <input type="text" {...register('flight_code')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
              {errors.flight_code && <p className="text-xs text-destructive">{errors.flight_code.message}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Flight Itinerary (Paste complete text)</label>
              <textarea {...register('flight_itinerary')} rows={4} className="w-full p-2.5 bg-input border border-border rounded-lg" />
              {errors.flight_itinerary && <p className="text-xs text-destructive">{errors.flight_itinerary.message}</p>}
            </div>
          </div>
        </div>

        {/* Hotels */}
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Hotel Requirements</h2>
            <button
              type="button"
              onClick={() => appendHotel({ city: 'MAKKAH', hotel_name: '', room_type: 'QUAD', room_count: 1, check_in: '', check_out: '' })}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
            >
              <Plus className="w-4 h-4" /> Add Hotel
            </button>
          </div>
          
          <div className="space-y-6">
            {hotelFields.map((field, index) => (
              <div key={field.id} className="p-4 border border-border rounded-xl relative bg-secondary/20">
                {index > 0 && (
                  <button type="button" onClick={() => removeHotel(index)} className="absolute top-4 right-4 text-destructive hover:opacity-80">
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
                    <label className="text-xs font-medium">Number of Rooms</label>
                    <input type="number" {...register(`hotels.${index}.room_count` as const)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Check-In</label>
                    <input type="date" {...register(`hotels.${index}.check_in` as const)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Check-Out</label>
                    <input type="date" {...register(`hotels.${index}.check_out` as const)} className="w-full p-2 bg-input border border-border rounded-lg text-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transport */}
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Transport Requirements</h2>
            <button
              type="button"
              onClick={() => appendTransport({ transport_type: 'AIRPORT_PICKUP', date: '', time: '', period: 'FN' })}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
            >
              <Plus className="w-4 h-4" /> Add Transport
            </button>
          </div>
          
          <div className="space-y-6">
            {transportFields.map((field, index) => (
              <div key={field.id} className="p-4 border border-border rounded-xl relative bg-secondary/20">
                {index > 0 && (
                  <button type="button" onClick={() => removeTransport(index)} className="absolute top-4 right-4 text-destructive hover:opacity-80">
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

        {/* Attachments */}
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-6">Attachments</h2>
          <FileUpload 
            label="Upload Passports / Documents (PDF, JPG, PNG)"
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
