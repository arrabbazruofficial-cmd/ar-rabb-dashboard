import { useState, useRef } from 'react';
import { FileText, UploadCloud, RefreshCcw } from 'lucide-react';
import { useToast } from './Toast';
import { api } from '@/lib/api';

interface AttachmentManagerProps {
  requestId: string;
  existingAttachments?: any[];
  onAttachmentUpdated: () => void;
  canEdit?: boolean;
}

export function AttachmentManager({ requestId, existingAttachments = [], onAttachmentUpdated, canEdit = false }: AttachmentManagerProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDocType, setUploadDocType] = useState('OTHER');
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);

  const documentTypes = [
    { value: 'PASSPORT_FRONT', label: 'Passport Front' },
    { value: 'PASSPORT_BACK', label: 'Passport Back' },
    { value: 'PHOTO', label: 'Photograph' },
    { value: 'TICKET', label: 'Flight Ticket' },
    { value: 'VISA', label: 'Visa Copy' },
    { value: 'PAYMENT_RECEIPT', label: 'Payment Receipt' },
    { value: 'OTHER', label: 'Other Document' },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast('File size must be under 10MB', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      if (replaceTargetId) {
        // Replacing an existing file (PATCH)
        formData.append('document_type', uploadDocType);
        await api.patch(`/requests/attachments/${replaceTargetId}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            setUploadProgress(percentCompleted);
          }
        });
        toast('Attachment replaced successfully', 'success');
      } else {
        // Uploading a new file (POST)
        formData.append('request', requestId);
        formData.append('document_type', uploadDocType);
        await api.post('/requests/attachments/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            setUploadProgress(percentCompleted);
          }
        });
        toast('Attachment uploaded successfully', 'success');
      }
      onAttachmentUpdated();
    } catch (error) {
      toast(replaceTargetId ? 'Failed to replace file' : 'Failed to upload file', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setReplaceTargetId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
    }
  };

  const triggerReplace = (attachmentId: string, docType: string) => {
    setReplaceTargetId(attachmentId);
    setUploadDocType(docType); // Keep the same document type by default when replacing
    replaceFileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Inputs */}
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
      <input type="file" ref={replaceFileInputRef} className="hidden" onChange={handleFileUpload} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {existingAttachments.map((file) => (
          <div key={file.id} className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between">
              <a 
                href={file.file_url || file.file} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-primary transition-colors flex-1 min-w-0"
              >
                <div className="bg-primary/10 p-2.5 rounded-lg text-primary">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold truncate text-foreground pr-2" title={file.file_name || 'Document'}>
                    {file.file_name || (file.file ? file.file.split('/').pop() : 'Document')}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <span className="uppercase font-medium text-[10px] tracking-wider px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">
                      {file.document_type ? file.document_type.replace('_', ' ') : 'DOCUMENT'}
                    </span>
                    {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : ''}
                  </p>
                </div>
              </a>

              {canEdit && (
                <button 
                  onClick={() => triggerReplace(file.id, file.document_type)}
                  disabled={isUploading}
                  className="p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-md transition-colors tooltip-trigger relative shrink-0"
                  title="Replace File"
                >
                  {isUploading && replaceTargetId === file.id ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <RefreshCcw className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {canEdit && (
        <div className="mt-6 p-5 border-2 border-dashed border-border rounded-xl bg-secondary/10 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-primary" /> Add New Document
            </h4>
            <p className="text-xs text-muted-foreground">Select document type and upload to attach to this request.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select 
              value={uploadDocType}
              onChange={(e) => setUploadDocType(e.target.value)}
              className="p-2 text-sm bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none flex-1 sm:w-48"
              disabled={isUploading}
            >
              {documentTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <button 
              onClick={() => {
                setReplaceTargetId(null);
                fileInputRef.current?.click();
              }}
              disabled={isUploading}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors shrink-0 flex items-center gap-2"
            >
              {isUploading && !replaceTargetId ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {uploadProgress}%
                </>
              ) : 'Upload'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
