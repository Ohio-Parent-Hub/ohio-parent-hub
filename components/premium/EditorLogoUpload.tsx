"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadListingImage, deleteListingImage } from "@/app/actions/premium";
import { compressLogo } from "@/lib/compressImage";
import { useToast } from "@/components/ui/toast";

type Props = {
  logoUrl: string | undefined;
  onChange: (url: string | undefined) => void;
};

export default function EditorLogoUpload({ logoUrl, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  async function handleFile(raw: File) {
    if (!raw.type.startsWith("image/")) return;
    if (raw.size > 5 * 1024 * 1024) {
      toast("Logo must be under 5 MB.", "error");
      return;
    }
    setUploading(true);
    const file = await compressLogo(raw);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", "logo");
    const result = await uploadListingImage(fd);
    setUploading(false);
    if (result.error) {
      toast(result.error, "error");
      return;
    }
    // Delete old logo if replacing
    if (logoUrl && logoUrl.includes("/storage/")) {
      deleteListingImage(logoUrl);
    }
    onChange(result.url);
  }

  return (
    <div className="flex items-center gap-4">
      {uploading ? (
        <div className="flex h-20 w-20 items-center justify-center rounded-xl border" style={{ borderColor: "#B8C5B2" }}>
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#7EA8A4" }} />
        </div>
      ) : logoUrl ? (
        <div className="relative">
          <img
            src={logoUrl}
            alt="Logo preview"
            className="h-20 w-20 rounded-xl border object-cover"
            style={{ borderColor: "#B8C5B2" }}
          />
          <button
            type="button"
            onClick={() => {
              if (logoUrl.includes("/storage/")) deleteListingImage(logoUrl);
              onChange(undefined);
            }}
            className="absolute -right-2 -top-2 rounded-full bg-red-100 p-1 text-red-600 transition-colors hover:bg-red-200"
            aria-label="Remove logo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-20 w-20 flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors hover:border-solid"
          style={{ borderColor: "#B8C5B2", color: "#6B8A86" }}
        >
          <Upload className="h-5 w-5" />
          <span className="mt-1 text-[10px]">Upload</span>
        </button>
      )}
      <div className="text-sm" style={{ color: "#6B8A86" }}>
        <p>Square image recommended (e.g. 512×512).</p>
        <p className="text-xs">JPG, PNG, or WebP. Max 5 MB.</p>
        {logoUrl && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-1 text-xs underline"
            style={{ color: "#7EA8A4" }}
          >
            Replace
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
