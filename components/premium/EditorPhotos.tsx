"use client";

import { useRef, useCallback, useState } from "react";
import { Upload, X, GripVertical, Loader2 } from "lucide-react";
import { uploadListingImage, deleteListingImage } from "@/app/actions/premium";

type Props = {
  photos: string[];
  onChange: (photos: string[]) => void;
};

const MAX_PHOTOS = 10;

export default function EditorPhotos({ photos, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragIndexRef = useRef<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const addFiles = useCallback(
    async (files: FileList) => {
      const remaining = MAX_PHOTOS - photos.length;
      const toUpload: File[] = [];
      for (let i = 0; i < Math.min(files.length, remaining); i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 2 * 1024 * 1024) {
          alert(`${file.name} is too large (max 2 MB). Skipping.`);
          continue;
        }
        toUpload.push(file);
      }
      if (toUpload.length === 0) return;

      setUploading(true);
      const newPhotos = [...photos];
      for (const file of toUpload) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("kind", "photo");
        const result = await uploadListingImage(fd);
        if (result.error) {
          alert(`Upload failed for ${file.name}: ${result.error}`);
          continue;
        }
        if (result.url) newPhotos.push(result.url);
      }
      setUploading(false);
      onChange(newPhotos);
    },
    [photos, onChange]
  );

  const removePhoto = useCallback(
    (index: number) => {
      const url = photos[index];
      if (url?.includes("/storage/")) deleteListingImage(url);
      onChange(photos.filter((_, i) => i !== index));
    },
    [photos, onChange]
  );

  const movePhoto = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= photos.length) return;
      const next = [...photos];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onChange(next);
    },
    [photos, onChange]
  );

  return (
    <div>
      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <div
              key={`${photo}-${index}`}
              className="group relative rounded-xl border overflow-hidden"
              style={{ borderColor: "#B8C5B2" }}
              draggable
              onDragStart={() => {
                dragIndexRef.current = index;
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndexRef.current !== null && dragIndexRef.current !== index) {
                  movePhoto(dragIndexRef.current, index);
                }
                dragIndexRef.current = null;
              }}
            >
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="aspect-square w-full object-cover"
              />
              {/* Drag handle */}
              <div className="absolute left-1 top-1 rounded bg-black/40 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-grab">
                <GripVertical className="h-4 w-4" />
              </div>
              {/* Position badge */}
              {index === 0 && (
                <span className="absolute bottom-1 left-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                  Cover photo
                </span>
              )}
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute right-1 top-1 rounded-full bg-red-100 p-1 text-red-600 opacity-0 transition-opacity hover:bg-red-200 group-hover:opacity-100"
                aria-label={`Remove photo ${index + 1}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {/* Reorder arrows for accessibility */}
              <div className="absolute bottom-1 right-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => movePhoto(index, index - 1)}
                    className="rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-white hover:bg-black/60"
                    aria-label={`Move photo ${index + 1} left`}
                  >
                    ←
                  </button>
                )}
                {index < photos.length - 1 && (
                  <button
                    type="button"
                    onClick={() => movePhoto(index, index + 1)}
                    className="rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-white hover:bg-black/60"
                    aria-label={`Move photo ${index + 1} right`}
                  >
                    →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {uploading && (
        <div className="flex items-center justify-center gap-2 rounded-xl border p-6" style={{ borderColor: "#B8C5B2", color: "#6B8A86" }}>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Uploading…</span>
        </div>
      )}
      {!uploading && photos.length < MAX_PHOTOS && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors hover:border-solid"
          style={{ borderColor: "#B8C5B2", color: "#6B8A86" }}
        >
          <Upload className="h-5 w-5" />
          <span className="text-sm">
            Add photos ({photos.length}/{MAX_PHOTOS})
          </span>
        </button>
      )}

      <p className="mt-2 text-xs" style={{ color: "#6B8A86" }}>
        JPG, PNG, or WebP. Max 2 MB each. Drag to reorder — first photo is the
        cover.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) void addFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
