'use client';

import { useRef } from 'react';

interface LogoUploaderProps {
  logoUrl: string;
  onUpload: (url: string) => void;
}

export default function LogoUploader({ logoUrl, onUpload }: LogoUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onUpload(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-3">Your logo (optional)</p>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {logoUrl ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt="Logo" className="h-12 w-auto max-w-[100px] object-contain rounded-lg border border-gray-200" />
          <div className="flex flex-col gap-1">
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs text-teal-600 font-semibold hover:underline"
            >
              Change logo
            </button>
            <button
              onClick={() => onUpload('')}
              className="text-xs text-red-500 font-semibold hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-sm text-gray-500 hover:border-teal-400 hover:text-teal-600 transition-colors"
        >
          📷 Tap to upload your logo
        </button>
      )}
    </div>
  );
}
