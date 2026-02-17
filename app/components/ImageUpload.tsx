"use client";

import { useRef, useState } from "react";

interface ImageUploadProps {
  photos: string[];
  onChange: (urls: string[]) => void;
  maxPhotos?: number;
}

// TODO: Integrate with Supabase Storage for persistent file uploads.
// Currently uses object URLs for local preview and supports manual URL entry.
// WARNING: Uploaded images are temporary and stored in browser memory only.
// Images will be lost on page refresh until Supabase Storage is configured.

export default function ImageUpload({ photos, onChange, maxPhotos = 5 }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");

  const remaining = maxPhotos - photos.length;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newUrls: string[] = [];
    const limit = Math.min(files.length, remaining);
    for (let i = 0; i < limit; i++) {
      newUrls.push(URL.createObjectURL(files[i]));
    }
    if (newUrls.length > 0) {
      onChange([...photos, ...newUrls]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddUrl = () => {
    const url = urlInput.trim();
    if (!url || photos.length >= maxPhotos) return;
    onChange([...photos, url]);
    setUrlInput("");
  };

  const handleRemove = (index: number) => {
    const url = photos[index];
    if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="label">Photos</label>
        <span className="text-xs text-neutral-500">
          {photos.length} of {maxPhotos} photos
        </span>
      </div>

      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((url, i) => (
            <div key={`${url}-${i}`} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-neutral-200">
              <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {remaining > 0 && (
        <>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="block w-full text-sm text-neutral-500 file:mr-3 file:rounded-xl file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-neutral-700 hover:file:bg-neutral-200"
            />
          </div>

          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Or paste a photo URL"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddUrl();
                }
              }}
            />
            <button type="button" className="btn-muted" onClick={handleAddUrl}>
              Add
            </button>
          </div>
        </>
      )}
    </div>
  );
}
