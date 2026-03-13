"use client";

import type { PremiumListingData } from "@/lib/premiumTypes";
import { ArrowLeft } from "lucide-react";
import PremiumPhotoGallery from "./PremiumPhotoGallery";
import PremiumHoursTable from "./PremiumHoursTable";
import PremiumPricingTable from "./PremiumPricingTable";
import PremiumAmenities from "./PremiumAmenities";
import PremiumOwnerDescription from "./PremiumOwnerDescription";
import VerifiedProviderBadge from "./VerifiedProviderBadge";

type Props = {
  data: PremiumListingData;
  onBack: () => void;
};

export default function EditorPreview({ data, onBack }: Props) {
  const hasAnyContent =
    data.photos.length > 0 ||
    data.hours ||
    data.pricing ||
    data.amenities ||
    data.description ||
    data.custom_faqs.length > 0;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm font-medium hover:underline"
        style={{ color: "#7EA8A4" }}
      >
        <ArrowLeft className="h-4 w-4" /> Back to editor
      </button>

      <div
        className="rounded-2xl border-2 border-dashed p-6"
        style={{ borderColor: "#B8C5B2", backgroundColor: "#FAFCFB" }}
      >
        <p
          className="mb-4 text-center text-xs font-medium uppercase tracking-wider"
          style={{ color: "#7EA8A4" }}
        >
          Preview — this is how premium sections will appear on your public page
        </p>

        {/* Hero preview */}
        <div className="mb-6 flex items-center gap-3">
          {data.logo_url && (
            <img
              src={data.logo_url}
              alt="Logo"
              className="h-16 w-16 rounded-xl border object-cover"
              style={{ borderColor: "#B8C5B2" }}
            />
          )}
          <div className="flex items-center gap-2">
            <h2
              className="font-serif text-xl font-bold"
              style={{ color: "#4A6B67" }}
            >
              Your Daycare Name
            </h2>
            <VerifiedProviderBadge />
          </div>
        </div>

        {/* Website */}
        {data.website_url && (
          <p className="mb-4 text-sm" style={{ color: "#6B8A86" }}>
            Website:{" "}
            <span className="underline" style={{ color: "#7EA8A4" }}>
              {data.website_url.replace(/^https?:\/\//, "")}
            </span>
          </p>
        )}

        {!hasAnyContent && (
          <p className="py-8 text-center text-sm" style={{ color: "#9CA3AF" }}>
            No premium content added yet. Go back to the editor to add photos,
            hours, pricing, and more.
          </p>
        )}

        {hasAnyContent && (
          <div className="space-y-1">
            <h3
              className="mb-4 font-serif text-lg font-semibold"
              style={{ color: "#4A6B67" }}
            >
              Direct from Provider
            </h3>

            {data.photos.length > 0 && (
              <PremiumPhotoGallery
                photos={data.photos}
                daycareName="Your Daycare"
              />
            )}

            {data.hours && <PremiumHoursTable hours={data.hours} />}

            {data.pricing && <PremiumPricingTable pricing={data.pricing} />}

            {data.amenities && <PremiumAmenities amenities={data.amenities} />}

            {data.description && (
              <PremiumOwnerDescription description={data.description} />
            )}

            {data.custom_faqs.length > 0 && (
              <div className="mt-4">
                <h4
                  className="mb-2 font-serif text-base font-semibold"
                  style={{ color: "#4A6B67" }}
                >
                  Custom FAQs
                </h4>
                <div className="space-y-2">
                  {data.custom_faqs.map((faq, i) => (
                    <details
                      key={i}
                      className="rounded-lg border p-3"
                      style={{ borderColor: "#D5E5E3" }}
                    >
                      <summary
                        className="cursor-pointer text-sm font-medium"
                        style={{ color: "#4A6B67" }}
                      >
                        {faq.question}
                      </summary>
                      <p
                        className="mt-2 text-sm"
                        style={{ color: "#6B8A86" }}
                      >
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
