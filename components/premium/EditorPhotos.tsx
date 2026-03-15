"use client";

import { useRef, useCallback, useState } from "react";
import { Upload, X, GripVertical, Loader2 } from "lucide-react";
import { uploadListingImage } from "@/app/actions/premium";
import { compressImage } from "@/lib/compressImage";
import { useToast } from "@/components/ui/toast";

type Props = {
  photos: string[];
  onChange: (photos: string[]) => void;
};

const MAX_PHOTOS = 9;

export default function EditorPhotos({ photos, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragIndexRef = useRef<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const addFiles = useCallback(
    async (files: FileList) => {
      const remaining = MAX_PHOTOS - photos.length;
      const toUpload: File[] = [];
      for (let i = 0; i < Math.min(files.length, remaining); i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 10 * 1024 * 1024) {
          toast(`${file.name} is too large (max 10 MB). Skipping.`, "error");
          continue;
        }
        toUpload.push(file);
      }
      if (toUpload.length === 0) return;

      setUploading(true);
      const newPhotos = [...photos];
      for (const raw of toUpload) {
        const file = await compressImage(raw);
        const fd = new FormData();
        fd.append("file", file);
        fd.append("kind", "photo");
        const result = await uploadListingImage(fd);
        if (result.error) {
          toast(`Upload failed for ${file.name}: ${result.error}`, "error");
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
          {photos.map((photo, index) => {
            const showLeftIndicator =
              dragOverIndex === index &&
              draggingIndex !== null &&
              draggingIndex !== index &&
              draggingIndex !== index - 1;

            const showRightIndicator =
              dragOverIndex === index + 1 &&
              draggingIndex !== null &&
              draggingIndex !== index &&
              draggingIndex !== index + 1;

            return (
            <div key={`${photo}-${index}`} className="relative flex">
              {/* Vertical drop indicator — left */}
              {showLeftIndicator && (
                <div className="absolute -left-1.5 top-0 bottom-0 w-0.5 rounded-full" style={{ backgroundColor: "#7EA8A4" }} />
              )}
              {/* Vertical drop indicator — right */}
              {showRightIndicator && (
                <div className="absolute -right-1.5 top-0 bottom-0 w-0.5 rounded-full" style={{ backgroundColor: "#7EA8A4" }} />
              )}
              <div
              className={`group relative flex-1 rounded-xl border overflow-hidden transition-opacity ${
                draggingIndex === index ? "opacity-40" : ""
              }`}
              style={{ borderColor: "#B8C5B2" }}
              draggable
              onDragStart={() => {
                dragIndexRef.current = index;
                setDraggingIndex(index);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                const rect = e.currentTarget.getBoundingClientRect();
                const midX = rect.left + rect.width / 2;
                setDragOverIndex(e.clientX < midX ? index : index + 1);
              }}
              onDragLeave={() => {
                if (dragOverIndex === index || dragOverIndex === index + 1) setDragOverIndex(null);
              }}
              onDrop={() => {
                if (dragIndexRef.current !== null && dragOverIndex !== null) {
                  const target = dragOverIndex > dragIndexRef.current ? dragOverIndex - 1 : dragOverIndex;
                  if (target !== dragIndexRef.current) {
                    movePhoto(dragIndexRef.current, target);
                  }
                }
                dragIndexRef.current = null;
                setDraggingIndex(null);
                setDragOverIndex(null);
              }}
              onDragEnd={() => {
                setDraggingIndex(null);
                setDragOverIndex(null);
              }}
            >
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="aspect-square w-full object-cover"
              />
              {/* Drag handle */}
              <div className="absolute left-1 top-1 rounded bg-black/40 p-0.5 text-white opacity-100 sm:opacity-0 transition-opacity sm:group-hover:opacity-100 cursor-grab">
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
                className="absolute right-1 top-1 rounded-full bg-red-100 p-1 text-red-600 opacity-100 sm:opacity-0 transition-opacity hover:bg-red-200 sm:group-hover:opacity-100"
                aria-label={`Remove photo ${index + 1}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {/* Reorder arrows for accessibility */}
              <div className="absolute bottom-1 right-1 flex gap-0.5 opacity-100 sm:opacity-0 transition-opacity sm:group-hover:opacity-100">
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
            </div>
            );
          })}
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
        JPG, PNG, or WebP. Max 10 MB each (auto-compressed). Drag to reorder — first photo is the
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
