import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, FileText, Loader2 } from 'lucide-react';

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

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be under ${maxSizeMB}MB`);
      return;
    }

    setError('');
    setUploading(true);

    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file);

    if (uploadError) {
      setError('Upload failed. Please try again.');
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    onUpload(data.publicUrl);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const isImage = accept.includes('image');

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      {currentUrl ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/30">
          {isImage ? (
            <img src={currentUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
          ) : (
            <FileText className="h-8 w-8 text-primary" />
          )}
          <span className="text-sm truncate flex-1">{isImage ? 'Profile photo' : 'Pitch deck uploaded'}</span>
          {onRemove && (
            <button onClick={onRemove} className="text-muted-foreground hover:text-destructive">
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
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
