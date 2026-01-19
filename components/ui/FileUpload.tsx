'use client';
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSize?: number;
  currentImage?: string | null;
  onUpload: (file: File) => Promise<string | null>;
  onRemove?: () => void;
  error?: string;
  helperText?: string;
  aspectRatio?: 'square' | 'video' | 'banner';
}

export function FileUpload({
  label,
  accept = 'image/*',
  maxSize = 5,
  currentImage,
  onUpload,
  onRemove,
  error,
  helperText,
  aspectRatio = 'square',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectRatios = {
    square: 'aspect-square',
    video: 'aspect-video',
    banner: 'aspect-[3/1]',
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) await handleFile(file);
    },
    [onUpload]
  );

  const handleFile = async (file: File) => {
    setUploadError(null);

    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`Dosya boyutu ${maxSize}MB'dan kucuk olmali.`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Sadece resim dosyalari yuklenebilir.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const url = await onUpload(file);
      if (url) {
        setPreview(url);
      } else {
        setUploadError('Yukleme basarisiz oldu.');
        setPreview(currentImage || null);
      }
    } catch (error) {
      setUploadError('Yukleme sirasinda bir hata olustu.');
      setPreview(currentImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setUploadError(null);
    if (inputRef.current) inputRef.current.value = '';
    onRemove?.();
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-xl cursor-pointer transition-all',
          aspectRatios[aspectRatio],
          isDragging
            ? 'border-brand-500 bg-brand-500/10'
            : 'border-dark-600 hover:border-dark-500 bg-dark-800/50',
          (error || uploadError) && 'border-red-500'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="hidden"
        />
        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
              <p className="text-sm text-gray-400 mt-2">Yukleniyor...</p>
            </motion.div>
          ) : preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain rounded-xl"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-4"
            >
              <div className="w-12 h-12 bg-dark-700 rounded-full flex items-center justify-center mb-3">
                <ImageIcon className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-sm text-gray-400 text-center">
                <span className="text-brand-400 font-medium">Tiklayin</span> veya
                surukleyip birakin
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, WEBP (max {maxSize}MB)
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {(error || uploadError) && (
        <p className="flex items-center gap-1 text-xs text-red-400 mt-1.5">
          <AlertCircle className="w-3 h-3" />
          {error || uploadError}
        </p>
      )}
      {helperText && !error && !uploadError && (
        <p className="text-xs text-gray-500 mt-1.5">{helperText}</p>
      )}
    </div>
  );
}
