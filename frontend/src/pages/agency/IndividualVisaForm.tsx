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
import { cn } from '@/lib/utils';

const baseSchema = z.object({
  number_of_passengers: z.coerce.number().min(1, 'Must have at least 1 passenger'),
  stay_days: z.coerce.number().min(1),
  arrival_flight: z.string().optional(),
  departure_flight: z.string().optional(),
  saudi_number: z.string().optional(),
  india_number: z.string().optional(),
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

const normalVisaSchema = baseSchema.extend({
  visa_subtype: z.literal('NORMAL'),
  passengers: z.array(passengerSchema).min(1, 'At least one passenger required'),
});

const iqamaVisaSchema = baseSchema.extend({
  visa_subtype: z.literal('IQAMA'),
  iqama_holder_name: z.string().min(1, 'Iqama holder name is required'),
  iqama_id: z.string().min(1, 'Iqama ID is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  national_address: z.string().min(1, 'National address is required'),
  passengers: z.array(passengerSchema).min(1, 'At least one passenger required'),
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
  const [showIncompleteDialog, setShowIncompleteDialog] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'NORMAL' | 'IQAMA'>(editData?.individual_visa?.visa_subtype || 'NORMAL');

  const { register, handleSubmit, formState: { errors }, setValue, control, getValues } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: editData ? {
      ...editData.individual_visa,
      passengers: editData.passengers || [{ passport_number: '', full_name: '', nationality: '', gender: 'MALE', date_of_birth: '', passport_expiry: '', is_lead: true, contact_number: '' }]
    } : {
      visa_subtype: 'NORMAL',
      number_of_passengers: 1,
      stay_days: 1,
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
      const { passengers, ...individualVisaData } = data as any;
      const payload = {
        request_type: 'INDIVIDUAL_VISA',
        individual_visa: individualVisaData,
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

      toast('Individual Visa request submitted successfully!', 'success');
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
      const { passengers, ...individualVisaData } = data as any;
      
      const payload = {
        request_type: 'INDIVIDUAL_VISA',
        individual_visa: individualVisaData,
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

      toast('Individual Visa saved as incomplete.', 'success');
      navigate('/agency/requests');
    } catch (error) {
      toast('Failed to save request as incomplete. Please try again.', 'error');
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

      <form onSubmit={handleSubmit(onSubmit as any, onError)} className="space-y-8">
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

      <SoftValidationDialog 
        isOpen={showIncompleteDialog}
        onClose={() => setShowIncompleteDialog(false)}
        onConfirm={submitIncomplete}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
