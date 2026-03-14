"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Camera } from "lucide-react";

type Props = {
  photos: string[];
  daycareName: string;
};

export default function PremiumPhotoGallery({ photos, daycareName }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const goNext = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i + 1) % photos.length : null)),
    [photos.length]
  );
  const goPrev = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i - 1 + photos.length) % photos.length : null)),
    [photos.length]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, closeLightbox, goNext, goPrev]);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Camera className="h-4 w-4" style={{ color: "#7EA8A4" }} />
          <h3 className="font-serif text-lg font-semibold" style={{ color: "#4A6B67" }}>
            Photos
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, index) => (
            <button
              key={index}
              type="button"
              className={`group relative overflow-hidden rounded-xl border transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 ${
                index === 0 ? "col-span-2 row-span-2" : ""
              }`}
              style={{ borderColor: "#B8C5B255" }}
              onClick={() => setLightboxIndex(index)}
              aria-label={`View photo ${index + 1} of ${photos.length}`}
            >
              <img
                src={photo}
                alt={`${daycareName} - Photo ${index + 1}`}
                className={`h-full w-full object-cover transition-transform group-hover:scale-105 ${
                  index === 0 ? "aspect-[4/3]" : "aspect-square"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/20 p-2 text-white backdrop-blur transition-colors hover:bg-white/40"
            onClick={closeLightbox}
            aria-label="Close photo viewer"
          >
            <X className="h-6 w-6" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/20 p-2 text-white backdrop-blur transition-colors hover:bg-white/40"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/20 p-2 text-white backdrop-blur transition-colors hover:bg-white/40"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div className="max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[lightboxIndex]}
              alt={`${daycareName} - Photo ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/20 px-3 py-1 text-sm text-white backdrop-blur">
            {lightboxIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}
