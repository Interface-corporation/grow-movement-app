import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, FileText, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  bucket: string;
  accept: string;
  maxSizeMB?: number;
  currentUrl?: string;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  label: string;
}

export default function FileUpload({ bucket, accept, maxSizeMB = 5, currentUrl, onUpload, onRemove, label }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be under ${maxSizeMB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`);
      return;
    }

    // Validate file type
    const allowedTypes = accept.split(',').map(t => t.trim());
    const fileExtension = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
    const isValidType = allowedTypes.some(type => {
      if (type.includes('*')) return file.type.startsWith(type.replace('*', ''));
      if (type.startsWith('.')) return fileExtension === type.toLowerCase();
      return file.type === type;
    });

    if (!isValidType) {
      setError(`Invalid file type. Accepted: ${accept}`);
      return;
    }

    setError('');
    setUploading(true);

    try {
      const ext = file.name.split('.').pop();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (uploadError) {
        // Check if bucket doesn't exist
        if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
          setError(`Storage bucket "${bucket}" not found. Please ensure it exists in your Supabase storage settings.`);
          toast.error(`Storage bucket "${bucket}" not configured. Contact admin.`);
        } else {
          setError('Upload failed: ' + uploadError.message);
          toast.error('Upload failed. Please try again.');
        }
        setUploading(false);
        return;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onUpload(data.publicUrl);
      toast.success('File uploaded successfully');
    } catch (err: any) {
      setError('Upload failed unexpectedly. Please try again.');
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const isImage = accept.includes('image');

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      {currentUrl ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/30">
          {isImage ? (
            <img src={currentUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover" onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }} />
          ) : (
            <FileText className="h-8 w-8 text-primary" />
          )}
          <span className="text-sm truncate flex-1">{isImage ? 'Photo uploaded' : 'File uploaded'}</span>
          {onRemove && (
            <button type="button" onClick={onRemove} className="text-muted-foreground hover:text-destructive">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? 'Uploading...' : `Upload ${isImage ? 'Photo' : 'File'}`}
        </button>
      )}
      <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
      {error && (
        <div className="flex items-start gap-2 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      <p className="text-xs text-muted-foreground">Max size: {maxSizeMB}MB • Accepted: {accept}</p>
    </div>
  );
}
