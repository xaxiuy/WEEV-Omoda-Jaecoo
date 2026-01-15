import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  namespace?: string;
  label?: string;
  aspectRatio?: string;
  className?: string;
}

export function ImageUpload({ 
  value, 
  onChange, 
  namespace = 'general',
  label = 'Subir Imagen',
  aspectRatio = '16/9',
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe ser menor a 5MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('namespace', namespace);

      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al subir la imagen');
      }

      const data = await response.json();
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
  };

  return (
    <div className={className}>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      
      {value ? (
        <div className="relative group">
          <div 
            className="relative rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200"
            style={{ aspectRatio }}
          >
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ aspectRatio }}
          >
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="text-sm text-gray-600">Subiendo...</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-blue-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">Click para subir imagen</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF hasta 5MB</p>
                </div>
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
