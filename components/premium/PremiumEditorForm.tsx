"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type {
  PremiumListingData,
  PremiumHours,
  PremiumPricing,
  PremiumPricingTier,
  PremiumAmenitiesData,
  PremiumFaq,
} from "@/lib/premiumTypes";
import { savePremiumListing, deleteListingImage } from "@/app/actions/premium";
import EditorLogoUpload from "./EditorLogoUpload";
import EditorPhotos from "./EditorPhotos";
import EditorHours from "./EditorHours";
import EditorPricing from "./EditorPricing";
import EditorAmenities from "./EditorAmenities";
import EditorFaqs from "./EditorFaqs";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import { Camera, Clock, DollarSign, ListChecks, MessageSquare, FileText, Globe } from "lucide-react";

const DEFAULT_HOURS: PremiumHours = {
  mon: { open: false, ranges: [] },
  tue: { open: false, ranges: [] },
  wed: { open: false, ranges: [] },
  thu: { open: false, ranges: [] },
  fri: { open: false, ranges: [] },
  sat: { open: false, ranges: [] },
  sun: { open: false, ranges: [] },
};

const DEFAULT_PRICING: PremiumPricing = {
  tiers: [],
  additional_rates: {},
  notes: "",
};

const DEFAULT_AMENITIES: PremiumAmenitiesData = {
  checked: [],
  text_fields: {},
  custom: [],
};

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

type Props = {
  programNumber?: string;
  initialData?: PremiumListingData | null;
};

export default function PremiumEditorForm({ programNumber, initialData }: Props) {
  const [logoUrl, setLogoUrl] = useState<string | undefined>(initialData?.logo_url);
  const [photos, setPhotos] = useState<string[]>(initialData?.photos ?? []);
  const [hours, setHours] = useState<PremiumHours>(initialData?.hours ?? DEFAULT_HOURS);
  const [pricing, setPricing] = useState<PremiumPricing>(initialData?.pricing ?? DEFAULT_PRICING);
  const [amenities, setAmenities] = useState<PremiumAmenitiesData>(initialData?.amenities ?? DEFAULT_AMENITIES);
  const [faqs, setFaqs] = useState<PremiumFaq[]>(initialData?.custom_faqs ?? []);
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(initialData?.website_url ?? "");
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const initialPhotos = initialData?.photos;

  const validate = useCallback((): string[] => {
    const errs: string[] = [];

    // Hours: if a day is toggled ON, times must be set
    for (const [day, val] of Object.entries(hours)) {
      if (val.open) {
        if (val.ranges.length === 0) {
          errs.push(`${day.charAt(0).toUpperCase() + day.slice(1)}: set hours or mark as closed`);
        }
        for (const [open, close] of val.ranges) {
          if (!open || !close) {
            errs.push(`${day.charAt(0).toUpperCase() + day.slice(1)}: select both open and close times`);
          } else if (open >= close) {
            errs.push(`${day.charAt(0).toUpperCase() + day.slice(1)}: close time must be after open time`);
          }
        }
      }
    }

    // Pricing: label required, at least one rate
    for (const tier of pricing.tiers) {
      if (!tier.label.trim()) errs.push("Each pricing tier needs a label");
      if (tier.part_time === null && tier.full_time === null) {
        errs.push(`"${tier.label || "Untitled"}": set at least one rate (PT or FT)`);
      }
      if (tier.age_end <= tier.age_start) {
        errs.push(`"${tier.label || "Untitled"}": end age must be greater than start age`);
      }
    }

    // FAQs: both question and answer required
    for (const faq of faqs) {
      if (faq.question.trim() && !faq.answer.trim()) errs.push("Each FAQ needs an answer");
      if (!faq.question.trim() && faq.answer.trim()) errs.push("Each FAQ needs a question");
    }

    return errs;
  }, [hours, pricing, faqs]);

  const handleSave = useCallback(async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;

    const data: PremiumListingData = {
      logo_url: logoUrl,
      photos,
      hours: Object.values(hours).some((d) => d.open) ? hours : undefined,
      pricing: pricing.tiers.length > 0 ? pricing : undefined,
      amenities: amenities.checked.length > 0 || amenities.custom.length > 0 ? amenities : undefined,
      custom_faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
      description: description.trim() || undefined,
      website_url: normalizeUrl(websiteUrl) || undefined,
    };

    if (!programNumber) {
      console.log("Premium listing data (no program number):", JSON.stringify(data, null, 2));
      toast("Preview only — no program number linked yet.");
      return;
    }

    setSaving(true);
    const result = await savePremiumListing(programNumber, data);
    setSaving(false);

    if (result.success) {
      // Clean up removed photos from storage
      const removedPhotos = (initialPhotos ?? []).filter((url) => !photos.includes(url));
      for (const url of removedPhotos) {
        deleteListingImage(url).catch(() => {});
      }
      toast("Listing saved!");
      router.push("/dashboard");
    } else {
      setErrors([result.error ?? "Failed to save. Please try again."]);
    }
  }, [logoUrl, photos, hours, pricing, amenities, faqs, description, websiteUrl, validate, programNumber, initialPhotos, router, toast]);

  return (
    <div className="min-h-screen" style={{ background: "#F5EDE4" }}>
      {/* ── Header ── */}
      <section className="relative overflow-hidden px-6 pt-8 pb-10" style={{ background: "#D5E5E3" }}>
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full" style={{ background: "#E8A0AC20" }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full" style={{ background: "#DCB34620" }} />

        <div className="relative z-10 mx-auto max-w-3xl">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: "#4A6B67" }}
          >
            ← Return to Dashboard
          </Link>
          <h1
            className="font-serif text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: "#4A6B67" }}
          >
            Edit Your Listing
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: "#4A6B67bb" }}>
            All fields are optional. Fill in what you&apos;d like parents to see on
            your public page.
          </p>
        </div>
      </section>

      {/* ── Form body ── */}
      <div className="px-6 py-8">
        <div
          className="mx-auto max-w-3xl space-y-6 rounded-3xl border bg-white p-6 shadow-sm sm:p-8"
          style={{ borderColor: "#B8C5B255" }}
        >
          {/* Logo */}
          <Section icon={<Camera className="h-5 w-5" />} title="Logo">
            <EditorLogoUpload logoUrl={logoUrl} onChange={setLogoUrl} />
          </Section>

          {/* Description */}
          <Section icon={<FileText className="h-5 w-5" />} title="From the Owner">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={5}
              className="w-full rounded-lg border p-3 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "#B8C5B2", color: "#4A6B67" }}
              placeholder="Tell parents what makes your daycare special. What's your philosophy? What should families know about your program?"
            />
            <p className="mt-1 text-right text-xs" style={{ color: "#6B8A86" }}>
              {description.length} / 2,000
            </p>
          </Section>

          {/* Website URL */}
          <Section icon={<Globe className="h-5 w-5" />} title="Website">
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full rounded-lg border p-3 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "#B8C5B2", color: "#4A6B67" }}
              placeholder="https://your-daycare-website.com"
            />
          </Section>

          {/* Hours */}
          <Section icon={<Clock className="h-5 w-5" />} title="Hours of Operation">
            <EditorHours hours={hours} onChange={setHours} />
          </Section>

          {/* Photos */}
          <Section icon={<Camera className="h-5 w-5" />} title="Photos">
            <EditorPhotos photos={photos} onChange={setPhotos} />
          </Section>

          {/* Pricing */}
          <Section icon={<DollarSign className="h-5 w-5" />} title="Pricing">
            <EditorPricing pricing={pricing} onChange={setPricing} />
          </Section>

          {/* Amenities */}
          <Section icon={<ListChecks className="h-5 w-5" />} title="Amenities">
            <EditorAmenities amenities={amenities} onChange={setAmenities} />
          </Section>

          {/* FAQs */}
          <Section icon={<MessageSquare className="h-5 w-5" />} title="Custom FAQs">
            <EditorFaqs faqs={faqs} onChange={setFaqs} />
          </Section>

          {/* Validation errors */}
          {errors.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="mb-2 font-semibold text-red-800">Please fix the following:</p>
              <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
                {errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions — sticky bottom bar */}
          <div className="sticky bottom-0 -mx-6 -mb-8 rounded-b-3xl border-t bg-white/95 px-6 py-4 backdrop-blur-sm sm:-mx-8 sm:-mb-8 sm:px-8" style={{ borderColor: "#D5E5E3" }}>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl px-6 py-3 font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#7EA8A4" }}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-2xl border p-5"
      style={{ borderColor: "#7EA8A430", background: "#7EA8A40a" }}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: "#D5E5E3" }}
        >
          <span style={{ color: "#4A6B67" }}>{icon}</span>
        </div>
        <h2 className="font-serif text-xl font-semibold" style={{ color: "#4A6B67" }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
