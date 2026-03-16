"use client";

import Link from "next/link";
import { SutqBadge } from "@/components/SutqBadge";
import VerifiedProviderBadge from "@/components/premium/VerifiedProviderBadge";
import { Button } from "@/components/ui/button";

export interface DaycareCardProps {
  name: string;
  city: string;
  street: string;
  programType: string;
  sutqRating: string;
  isPfcc: boolean;
  isVerified: boolean;
  logoUrl?: string;
  distanceMiles?: number | null;
  detailHref: string;
  onNavigate?: () => void;
}

export function DaycareCard({
  name,
  city,
  street,
  programType,
  sutqRating,
  isPfcc,
  isVerified,
  logoUrl,
  distanceMiles,
  detailHref,
  onNavigate,
}: DaycareCardProps) {
  return (
    <div
      className={`group flex flex-col sm:flex-row sm:items-center justify-between rounded-lg sm:rounded-xl border p-3 sm:p-4 transition-colors gap-3 sm:gap-4 ${
        isVerified
          ? "border-l-[3px] hover:border-neutral-300"
          : "bg-white border-neutral-200 hover:border-neutral-400"
      }`}
      style={
        isVerified
          ? { background: "#F0F6F5", borderColor: "#B8C5B2", borderLeftColor: "#7EA8A4" }
          : {}
      }
    >
      <div className="flex items-center justify-between sm:hidden">
        <SutqBadge rating={sutqRating} className="scale-90 origin-left" />
        {isVerified && <VerifiedProviderBadge />}
      </div>
      <div className="flex gap-3">
        {logoUrl && (
          <img
            src={logoUrl}
            alt=""
            className={`rounded-lg object-cover flex-shrink-0 mt-0.5 ${
              isVerified
                ? "h-12 w-12 border-2 border-[#7EA8A4]/40"
                : "h-10 w-10 border border-neutral-200"
            }`}
          />
        )}
        <div>
          <h3 className="font-bold text-lg leading-tight mb-1">
            <Link href={detailHref} className="hover:underline" onClick={onNavigate}>
              {name}
            </Link>
            {isVerified && (
              <span className="ml-2 hidden sm:inline-block align-middle">
                <VerifiedProviderBadge />
              </span>
            )}
          </h3>
          <p className="text-sm text-neutral-500 mb-1">
            {city && <span className="font-medium text-black">{city}</span>}
            {city && street && <span className="mx-1">•</span>}
            {street}
          </p>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            {distanceMiles != null && (
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">
                {distanceMiles.toFixed(1)} mi
              </span>
            )}
            <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">
              {programType}
            </span>
            {isPfcc && (
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                PFCC
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="hidden sm:flex flex-col items-end gap-3 min-w-[120px]">
        <SutqBadge rating={sutqRating} />
        <Link href={detailHref} onClick={onNavigate}>
          <Button variant="outline" size="sm" className="w-full">
            View Details
          </Button>
        </Link>
      </div>

      <div className="sm:hidden">
        <Link href={detailHref} onClick={onNavigate}>
          <Button variant="outline" size="sm" className="w-full">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}
