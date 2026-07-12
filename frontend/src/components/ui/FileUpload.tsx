import { useState, useRef } from 'react';
import { UploadCloud, X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from './Toast';

interface FileUploadProps {
  onUploadSuccess: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
}

export function FileUpload({ onUploadSuccess, accept = "*", maxSizeMB = 10, label = "Upload File" }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast(`File must be smaller than ${maxSizeMB}MB`, 'error');
      return;
    }
    setUploadedFile(file);
    onUploadSuccess(file);
    toast('File ready for upload', 'success');
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-2">{label}</label>
      
      {!uploadedFile ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50"
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleUpload(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={accept}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleUpload(e.target.files[0]);
              }
            }}
          />
          <UploadCloud className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm font-medium mb-1">Click or drag file to this area to attach</p>
          <p className="text-xs text-muted-foreground">Support for a single file upload. Max size: {maxSizeMB}MB.</p>
        </div>
      ) : (
        <div className="flex items-center gap-4 p-4 border border-border rounded-xl bg-card">
          <div className="p-2 bg-green-100 text-green-700 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
            <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button 
            type="button"
            onClick={() => setUploadedFile(null)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}
