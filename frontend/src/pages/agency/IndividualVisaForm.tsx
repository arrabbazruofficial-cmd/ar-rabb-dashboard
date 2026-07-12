import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileUpload } from '@/components/ui/FileUpload';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { useNavigate, useLocation } from 'react-router';
import { cn } from '@/lib/utils';

const baseSchema = z.object({
  number_of_passengers: z.coerce.number().min(1, 'Must have at least 1 passenger'),
  stay_days: z.coerce.number().min(1),
  arrival_flight: z.string().optional(),
  departure_flight: z.string().optional(),
  saudi_number: z.string().optional(),
  india_number: z.string().optional(),
});

const normalVisaSchema = baseSchema.extend({
  visa_subtype: z.literal('NORMAL'),
});

const iqamaVisaSchema = baseSchema.extend({
  visa_subtype: z.literal('IQAMA'),
  iqama_holder_name: z.string().min(1, 'Iqama holder name is required'),
  iqama_id: z.string().min(1, 'Iqama ID is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  national_address: z.string().min(1, 'National address is required'),
});

const formSchema = z.discriminatedUnion('visa_subtype', [normalVisaSchema, iqamaVisaSchema]);

type FormValues = z.infer<typeof formSchema>;

export default function IndividualVisaForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;
  const isEditing = !!editData;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'NORMAL' | 'IQAMA'>(editData?.individual_visa?.visa_subtype || 'NORMAL');

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: editData?.individual_visa || {
      visa_subtype: 'NORMAL',
      number_of_passengers: 1,
      stay_days: 1
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        request_type: 'INDIVIDUAL_VISA',
        individual_visa: data
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

      toast('Individual Visa request submitted successfully!', 'success');
      navigate('/agency/requests');
    } catch (error) {
      toast('Failed to submit request. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = (tab: 'NORMAL' | 'IQAMA') => {
    setActiveTab(tab);
    setValue('visa_subtype', tab);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Individual Visa Application</h1>
        <p className="text-muted-foreground mt-2">Submit a request for a standard visit visa or an Iqama holder family visa.</p>
      </div>

      <div className="flex bg-secondary p-1 rounded-lg w-full max-w-md mx-auto">
        <button
          onClick={() => handleTabChange('NORMAL')}
          className={cn('flex-1 py-2 text-sm font-medium rounded-md transition-colors', activeTab === 'NORMAL' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground')}
        >
          Normal Visa
        </button>
        <button
          onClick={() => handleTabChange('IQAMA')}
          className={cn('flex-1 py-2 text-sm font-medium rounded-md transition-colors', activeTab === 'IQAMA' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground')}
        >
          Iqama Visa
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-6">Travel Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Passengers</label>
              <input type="number" {...register('number_of_passengers')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
              {errors.number_of_passengers && <p className="text-xs text-destructive">{errors.number_of_passengers.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Stay Duration (Days)</label>
              <input type="number" {...register('stay_days')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
              {errors.stay_days && <p className="text-xs text-destructive">{errors.stay_days.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Arrival Flight (Optional)</label>
              <input type="text" {...register('arrival_flight')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Departure Flight (Optional)</label>
              <input type="text" {...register('departure_flight')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">India Contact Number (Optional)</label>
              <input type="text" {...register('india_number')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Saudi Contact Number (Optional)</label>
              <input type="text" {...register('saudi_number')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
            </div>
          </div>
        </div>

        {activeTab === 'IQAMA' && (
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
            <h2 className="text-xl font-semibold mb-6">Iqama Holder Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Iqama Holder Name</label>
                <input type="text" {...register('iqama_holder_name')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
                {(errors as any).iqama_holder_name && <p className="text-xs text-destructive">{(errors as any).iqama_holder_name.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Iqama ID Number</label>
                <input type="text" {...register('iqama_id')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
                {(errors as any).iqama_id && <p className="text-xs text-destructive">{(errors as any).iqama_id.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <input type="date" {...register('date_of_birth')} className="w-full p-2.5 bg-input border border-border rounded-lg" />
                {(errors as any).date_of_birth && <p className="text-xs text-destructive">{(errors as any).date_of_birth.message}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">National Address</label>
                <textarea {...register('national_address')} rows={3} className="w-full p-2.5 bg-input border border-border rounded-lg" />
                {(errors as any).national_address && <p className="text-xs text-destructive">{(errors as any).national_address.message}</p>}
              </div>
            </div>
          </div>
        )}

        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-6">Attachments</h2>
          <FileUpload 
            label={activeTab === 'IQAMA' ? 'Upload Passports & Iqama Copy (PDF/JPG)' : 'Upload Passports (PDF/JPG)'}
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
    </div>
  );
}
