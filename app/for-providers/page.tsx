"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import {
  Search, ShieldCheck, Camera, Clock, DollarSign, ListChecks,
  Heart, Globe, MessageCircle, Star, Sparkles, ArrowRight, Phone, MapPin,
  Image as ImageIcon, FileText, Filter, Megaphone, Lightbulb, CheckCircle2, Rocket, Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VerifiedProviderBadge from "@/components/premium/VerifiedProviderBadge";
import PremiumOwnerDescription from "@/components/premium/PremiumOwnerDescription";
import PremiumPhotoGallery from "@/components/premium/PremiumPhotoGallery";
import PremiumHoursTable from "@/components/premium/PremiumHoursTable";
import PremiumPricingTable from "@/components/premium/PremiumPricingTable";
import PremiumAmenities from "@/components/premium/PremiumAmenities";
import { MOCK_PREMIUM_LISTING } from "@/data/mockPremiumListing";

/* ─── Colors ─── */
const teal = "#7EA8A4";
const pink = "#E8A0AC";
const gold = "#DCB346";
const sage = "#B8C5B2";
const cream = "#F5EDE4";
const dark = "#4A6B67";
const lightTeal = "#D5E5E3";

/* ─── Hardcoded showcase photos from the dev test daycare ─── */
const SHOWCASE_LOGO = "https://aziibxfjoduwwkmcczrm.supabase.co/storage/v1/object/public/listings/9999999999/logo/1773512643439-w9rnk6.png";
const SHOWCASE_PHOTOS = [
  "https://aziibxfjoduwwkmcczrm.supabase.co/storage/v1/object/public/listings/9999999999/photos/1773451531214-tzkuu6.jpg",
  "https://aziibxfjoduwwkmcczrm.supabase.co/storage/v1/object/public/listings/9999999999/photos/1773451527733-fiqj6h.jpg",
  "https://aziibxfjoduwwkmcczrm.supabase.co/storage/v1/object/public/listings/9999999999/photos/1773451529510-wly53x.jpg",
  "https://aziibxfjoduwwkmcczrm.supabase.co/storage/v1/object/public/listings/9999999999/photos/1773693463137-ca1kz2.jpg",
  "https://aziibxfjoduwwkmcczrm.supabase.co/storage/v1/object/public/listings/9999999999/photos/1773693465232-32djcg.jpg",
];

/* ─── Decorative Components ─── */

function WaveDivider({ fill, flip = false }: { fill: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 80"
      fill="none"
      preserveAspectRatio="none"
      className={`block w-full ${flip ? "rotate-180" : ""}`}
      style={{ height: "50px", marginBottom: flip ? 0 : "-1px", marginTop: flip ? "-1px" : 0 }}
    >
      <path d="M0 40C180 80 360 0 540 40C720 80 900 0 1080 40C1260 80 1440 0 1440 40V80H0V40Z" fill={fill} />
    </svg>
  );
}

function SparkleDecor({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M12 0L13.5 9L24 12L13.5 15L12 24L10.5 15L0 12L10.5 9L12 0Z" />
    </svg>
  );
}

/* ─── Provider Search Component ─── */

type SearchResult = { name: string; city: string; street: string; programType: string; href: string };

function ProviderSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/daycares/search?q=${encodeURIComponent(q)}`);
      const data: SearchResult[] = await res.json();
      setResults(data);
      setIsOpen(data.length > 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(value), 250);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: teal }} />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search for your daycare by name..."
          className="w-full rounded-full border-2 bg-white py-3.5 pl-12 pr-4 text-base shadow-sm transition-shadow focus:outline-none focus:ring-2 focus:shadow-md"
          style={{ borderColor: teal, color: dark }}
          aria-label="Search for your daycare"
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: `${teal} transparent ${teal} ${teal}` }} />
          </div>
        )}
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white text-left shadow-lg" style={{ borderColor: `${sage}55` }}>
          <div className="max-h-72 overflow-y-auto">
            {results.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-[#F0F6F5]"
                onClick={() => setIsOpen(false)}
              >
                <div>
                  <div className="font-semibold" style={{ color: dark }}>{r.name}</div>
                  <div className="text-xs" style={{ color: `${dark}99` }}>
                    {r.street}, {r.city} · {r.programType}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0" style={{ color: teal }} />
              </Link>
            ))}
          </div>
          <div className="border-t px-4 py-2 text-center text-xs" style={{ borderColor: `${sage}33`, color: `${dark}88` }}>
            Click a result to view your listing and claim it
          </div>
        </div>
      )}
      {isOpen && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white px-4 py-4 text-center text-sm shadow-lg" style={{ borderColor: `${sage}55`, color: `${dark}99` }}>
          No daycares found matching &ldquo;{query}&rdquo;. Try a different name.
        </div>
      )}
    </div>
  );
}

/* ─── Mock Card Mockups ─── */

function StandardCardMockup() {
  return (
    <div className="rounded-xl border bg-white p-4 transition-colors border-neutral-200">
      <div className="flex items-center justify-between mb-2">
        <span className="rounded px-2 py-0.5 text-[11px] font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
          ★ Gold Rated
        </span>
      </div>
      <div>
        <h4 className="font-bold text-base leading-tight mb-1" style={{ color: dark }}>Sunshine Kids Academy</h4>
        <p className="text-sm text-neutral-500 mb-1">
          <span className="font-medium text-black">Columbus</span>
          <span className="mx-1">·</span>
          123 Main Street
        </p>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">2.3 mi</span>
          <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">Child Care Center</span>
        </div>
      </div>
      <div className="mt-3">
        <div className="w-full rounded-md border border-neutral-200 px-3 py-1.5 text-center text-sm text-neutral-500">
          View Details
        </div>
      </div>
    </div>
  );
}

function PremiumCardMockup() {
  return (
    <div
      className="rounded-xl border border-l-[3px] p-4 transition-colors"
      style={{ background: "#F0F6F5", borderColor: sage, borderLeftColor: teal }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="rounded px-2 py-0.5 text-[11px] font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
          ★ Gold Rated
        </span>
        <VerifiedProviderBadge />
      </div>
      <div className="flex gap-3">
        <img
          src={SHOWCASE_LOGO}
          alt="Logo"
          className="h-12 w-12 flex-shrink-0 rounded-lg border-2 object-cover"
          style={{ borderColor: `${teal}40` }}
        />
        <div>
          <h4 className="font-bold text-base leading-tight mb-1" style={{ color: dark }}>
            Sunshine Kids Academy
          </h4>
          <p className="text-sm text-neutral-500 mb-1">
            <span className="font-medium text-black">Columbus</span>
            <span className="mx-1">·</span>
            123 Main Street
          </p>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">2.3 mi</span>
            <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">Child Care Center</span>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <div className="w-full rounded-md border px-3 py-1.5 text-center text-sm font-medium" style={{ borderColor: teal, color: dark }}>
          View Details
        </div>
      </div>
    </div>
  );
}

/* ─── Benefits Grid Data ─── */

const benefits = [
  { icon: <ImageIcon className="h-5 w-5" />, title: "Logo Upload", desc: "Put your brand front and center with a custom logo on your listing card." },
  { icon: <Camera className="h-5 w-5" />, title: "Photo Gallery", desc: "Show off your facility with up to 9 photos that parents can browse in a lightbox." },
  { icon: <Clock className="h-5 w-5" />, title: "Hours of Operation", desc: "Display your weekly schedule so parents know exactly when you're open." },
  { icon: <DollarSign className="h-5 w-5" />, title: "Pricing & Tuition", desc: "Share detailed pricing by age group — the info parents want most." },
  { icon: <ListChecks className="h-5 w-5" />, title: "Amenities & Services", desc: "Highlight everything you offer — from outdoor playgrounds to structured curriculum." },
  { icon: <MessageCircle className="h-5 w-5" />, title: "Custom FAQs", desc: "Add up to 5 FAQs with your own questions and answers — parents get details straight from you." },
  { icon: <Heart className="h-5 w-5" />, title: "\"From the Owner\" Section", desc: "Share your story and philosophy in your own words. The personal touch parents love." },
  { icon: <Globe className="h-5 w-5" />, title: "Website Link", desc: "Link to your website directly from your listing — or use your listing URL as your website." },
  { icon: <ShieldCheck className="h-5 w-5" />, title: "Verified Provider Badge", desc: "The trust signal that tells parents you stand behind your listing with real details." },
  { icon: <Filter className="h-5 w-5" />, title: "Premium Filter Visibility", desc: "Show up when parents filter by price, age group, amenities, or schedule — standard listings don't." },
  { icon: <FileText className="h-5 w-5" />, title: "Your Own Web Presence", desc: "Use your listing URL on social media, email signatures, and Google Business Profile." },
  { icon: <Lightbulb className="h-5 w-5" />, title: "Shape the Future", desc: "Get a voice in upcoming features and updates as we build more tools for providers." },
];

/* ─── Main Page ─── */

export default function ForProvidersPage() {
  return (
    <main className="min-h-screen" style={{ color: dark }}>

      {/* ══════════ SECTION 1: HERO ══════════ */}
      <section className="relative px-4 pt-16 pb-20 sm:pt-20 sm:pb-24" style={{ background: lightTeal }}>
        <SparkleDecor className="absolute top-10 right-[12%] h-5 w-5 animate-pulse" style={{ color: gold, opacity: 0.3 }} />
        <SparkleDecor className="absolute top-20 left-[8%] h-4 w-4 animate-pulse" style={{ color: pink, opacity: 0.25 }} />
        <SparkleDecor className="absolute bottom-16 right-[20%] h-6 w-6 animate-pulse" style={{ color: teal, opacity: 0.2 }} />
        <SparkleDecor className="absolute bottom-24 left-[15%] h-4 w-4 animate-pulse" style={{ color: gold, opacity: 0.35 }} />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" style={{ color: dark }}>
            Own a daycare?{" "}
            <span style={{ color: pink }}>Make your listing work for you.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl" style={{ color: `${dark}cc` }}>
            Parents searching for childcare want details — hours, photos, pricing, amenities. Most listings only show a name and address.{" "}
            <strong style={{ color: dark }}>Stand out from 8,000+ Ohio daycares.</strong>
          </p>

          <div className="relative mt-10 pb-60 -mb-60">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: teal }}>
              Find your daycare to get started
            </p>
            <ProviderSearch />
          </div>
        </div>
      </section>

      <div style={{ background: lightTeal, marginTop: "-1px" }}>
        <WaveDivider fill={cream} />
      </div>

      {/* ══════════ SECTION 2: PAIN POINT / TRUST ══════════ */}
      <section className="px-4 py-16 sm:py-20" style={{ background: cream }}>
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="font-serif text-3xl font-bold sm:text-4xl" style={{ color: dark }}>
            Parents choose providers they can <span style={{ color: teal }}>trust</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed" style={{ color: `${dark}bb` }}>
            When a parent is comparing daycares, they check 3–5 listings before making a single call. The ones with photos, pricing, and real details? Those get the call first.
          </p>
          <div className="mx-auto mt-10 grid max-w-lg grid-cols-2 gap-6 sm:max-w-2xl sm:grid-cols-3">
            <div className="rounded-2xl p-5" style={{ background: "#fff" }}>
              <div className="font-serif text-3xl font-bold" style={{ color: teal }}>8,000+</div>
              <div className="mt-1 text-sm" style={{ color: `${dark}99` }}>Licensed daycares in Ohio</div>
            </div>
            <div className="rounded-2xl p-5" style={{ background: "#fff" }}>
              <div className="font-serif text-3xl font-bold" style={{ color: pink }}>3–5</div>
              <div className="mt-1 text-sm" style={{ color: `${dark}99` }}>Listings parents compare before calling</div>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-2xl p-5" style={{ background: "#fff" }}>
              <div className="font-serif text-3xl font-bold" style={{ color: gold }}>1st</div>
              <div className="mt-1 text-sm" style={{ color: `${dark}99` }}>Detailed listings get the first call</div>
            </div>
          </div>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full px-5 py-2.5" style={{ background: `${teal}15` }}>
            <VerifiedProviderBadge />
            <span className="text-sm font-medium" style={{ color: dark }}>= instant trust signal for parents</span>
          </div>
        </div>
      </section>

      <div style={{ background: cream, marginTop: "-1px" }}>
        <WaveDivider fill="#fff" />
      </div>

      {/* ══════════ SECTION 3: BEFORE/AFTER SEARCH CARD ══════════ */}
      <section className="px-4 py-16 sm:py-20" style={{ background: "#fff" }}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold sm:text-4xl" style={{ color: dark }}>
              How parents see your listing in <span style={{ color: pink }}>search results</span>
            </h2>
            <p className="mt-3 text-lg" style={{ color: `${dark}99` }}>
              Your listing card is the first impression. Make it count.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <div className="mb-3 text-center text-sm font-bold uppercase tracking-wider" style={{ color: `${dark}66` }}>Standard</div>
              <StandardCardMockup />
              <p className="mt-3 text-center text-sm" style={{ color: `${dark}88` }}>
                Plain text. No logo. No badge. Easy to skip.
              </p>
            </div>
            <div>
              <div className="mb-3 text-center text-sm font-bold uppercase tracking-wider" style={{ color: teal }}>Premium ✦</div>
              <PremiumCardMockup />
              <p className="mt-3 text-center text-sm" style={{ color: `${dark}88` }}>
                Logo, verified badge, premium styling. <strong>This gets clicked.</strong>
              </p>
            </div>
          </div>

          {/* Filter Visibility — search benefit */}
          <div className="mt-14 rounded-2xl border bg-white p-6 sm:p-8" style={{ borderColor: `${sage}55` }}>
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-5 w-5" style={{ color: teal }} />
              <h3 className="font-serif text-lg font-bold" style={{ color: dark }}>Premium listings show up in more searches</h3>
            </div>
            <p className="text-sm mb-6" style={{ color: `${dark}99` }}>
              When parents use filters — price range, age group, schedule, amenities — only listings with that data appear. Standard listings are missing this data entirely, so they&apos;re hidden from filtered results. Premium providers stay visible.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {["✓ Owner Verified", "Age Group ▾", "Price Range ▾", "Schedule ▾", "Amenities ▾", "Photos"].map((f) => (
                <span key={f} className="inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium" style={{ borderColor: teal, color: f === "✓ Owner Verified" ? "#fff" : dark, background: f === "✓ Owner Verified" ? teal : "#fff" }}>
                  {f}
                </span>
              ))}
            </div>

            {/* Owner Verified highlight */}
            <div className="rounded-xl border bg-white p-5" style={{ borderColor: `${sage}55` }}>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-5 w-5" style={{ color: teal }} />
                <span className="font-serif text-base font-bold" style={{ color: dark }}>The &ldquo;Owner Verified&rdquo; filter</span>
              </div>
              <p className="text-sm" style={{ color: `${dark}99` }}>
                This is the filter parents will use the most. One click and they see only listings where a real owner has added photos, hours, pricing, and a description — not just state-imported data. When you claim and upgrade your listing, you appear in this filtered view. Everyone else disappears.
              </p>
            </div>

            <p className="mt-4 text-xs font-medium" style={{ color: teal }}>
              ↑ Standard listings can&apos;t appear in filtered results — they don&apos;t have the data
            </p>
          </div>
        </div>
      </section>

      <div style={{ background: "#fff", marginTop: "-1px" }}>
        <WaveDivider fill={cream} />
      </div>

      {/* ══════════ SECTION 4: PREMIUM FEATURE SHOWCASE ══════════ */}
      <section className="px-4 py-16 sm:py-20" style={{ background: cream }}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold sm:text-4xl" style={{ color: dark }}>
              What parents see on a <span style={{ color: teal }}>premium listing</span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg" style={{ color: `${dark}99` }}>
              Standard listings only show a name, address, and phone number. Here&apos;s what you unlock.
            </p>
          </div>

          <div className="space-y-8">
            {/* Row 1: Standard vs Premium Hero — side by side */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: `${sage}55` }}>
              <div className="mb-4 flex items-center gap-2">
                <VerifiedProviderBadge />
                <h3 className="font-serif text-lg font-bold" style={{ color: dark }}>Instant trust with parents</h3>
              </div>
              <p className="mb-6 text-sm" style={{ color: `${dark}99` }}>
                Your logo and verified badge appear front and center. Parents know your listing has real, owner-provided details.
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Standard hero */}
                <div>
                  <div className="mb-3 text-center text-sm font-bold uppercase tracking-wider" style={{ color: `${dark}66` }}>Standard</div>
                  <div className="rounded-xl p-5" style={{ background: lightTeal }}>
                    <div className="rounded-xl border bg-white p-5" style={{ borderColor: `${sage}55` }}>
                      <div className="mb-2">
                        <span className="rounded-full border px-2.5 py-1 text-[11px] font-medium" style={{ borderColor: `${teal}40`, color: teal }}>
                          Claim This Listing
                        </span>
                      </div>
                      <h4 className="font-serif text-xl font-bold" style={{ color: dark }}>Your Daycare Name</h4>
                      <p className="mt-1 text-sm text-muted-foreground">Licensed Child Care Center · Columbus, Ohio</p>
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 border-yellow-200">
                          <Star className="h-3 w-3 fill-yellow-600 text-yellow-600" />
                          Gold Rated
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-center text-sm" style={{ color: `${dark}88` }}>
                    Just a name and type. No logo, no badge, no personality.
                  </p>
                </div>
                {/* Premium hero */}
                <div>
                  <div className="mb-3 text-center text-sm font-bold uppercase tracking-wider" style={{ color: teal }}>Premium ✦</div>
                  <div className="rounded-xl p-5" style={{ background: lightTeal }}>
                    <div className="rounded-xl border bg-white p-5" style={{ borderColor: `${sage}55` }}>
                      <div className="mb-2"><VerifiedProviderBadge /></div>
                      <div className="flex items-start gap-4">
                        <img
                          src={SHOWCASE_LOGO}
                          alt="Logo"
                          className="h-14 w-14 rounded-lg object-cover border"
                          style={{ borderColor: `${sage}55` }}
                        />
                        <div>
                          <h4 className="font-serif text-xl font-bold" style={{ color: dark }}>Your Daycare Name</h4>
                          <p className="mt-1 text-sm text-muted-foreground">Licensed Child Care Center · Columbus, Ohio</p>
                          <div className="mt-2">
                            <span className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 border-yellow-200">
                              <Star className="h-3 w-3 fill-yellow-600 text-yellow-600" />
                              Gold Rated
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-center text-sm" style={{ color: `${dark}88` }}>
                    Logo, verified badge, and your brand. <strong>Instantly credible.</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Row 2: Owner Description — full width */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: `${sage}55` }}>
              <div className="mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5" style={{ color: pink }} />
                <h3 className="font-serif text-lg font-bold" style={{ color: dark }}>Your story, in your words</h3>
              </div>
              <p className="mb-4 text-sm" style={{ color: `${dark}99` }}>
                The &ldquo;From the Owner&rdquo; section lets parents connect with you before they ever call.
              </p>
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: `${sage}33` }}>
                <PremiumOwnerDescription description={MOCK_PREMIUM_LISTING.description!} />
              </div>
            </div>

            {/* Row 3: Contact — Standard vs Premium side by side */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: `${sage}55` }}>
              <div className="mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" style={{ color: teal }} />
                <h3 className="font-serif text-lg font-bold" style={{ color: dark }}>Hours &amp; contact parents can count on</h3>
              </div>
              <p className="mb-6 text-sm" style={{ color: `${dark}99` }}>
                Premium adds your website link and full weekly schedule right inside your contact card — everything a parent needs in one place.
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Standard contact */}
                <div>
                  <div className="mb-3 text-center text-sm font-bold uppercase tracking-wider" style={{ color: `${dark}66` }}>Standard</div>
                  <div className="rounded-xl border bg-white p-5" style={{ borderColor: `${sage}55` }}>
                    <div className="mb-4 flex items-center gap-2">
                      <Phone className="h-4 w-4" style={{ color: teal }} />
                      <h4 className="font-serif text-base font-bold" style={{ color: dark }}>Contact</h4>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="text-xs font-bold" style={{ color: dark }}>Administrator</div>
                        <div style={{ color: `${dark}cc` }}>Jane Smith</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold" style={{ color: dark }}>Email</div>
                        <div className="text-primary">janesmith@email.com</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold" style={{ color: dark }}>Phone</div>
                        <div className="text-primary">(555) 555-5555</div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-center text-sm" style={{ color: `${dark}88` }}>
                    Basic contact info from state records.
                  </p>
                </div>
                {/* Premium contact */}
                <div>
                  <div className="mb-3 text-center text-sm font-bold uppercase tracking-wider" style={{ color: teal }}>Premium ✦</div>
                  <div className="rounded-xl border bg-white p-5" style={{ borderColor: `${sage}55` }}>
                    <div className="mb-4 flex items-center gap-2">
                      <Phone className="h-4 w-4" style={{ color: teal }} />
                      <h4 className="font-serif text-base font-bold" style={{ color: dark }}>Contact</h4>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="text-xs font-bold" style={{ color: dark }}>Administrator</div>
                        <div style={{ color: `${dark}cc` }}>Jane Smith</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold" style={{ color: dark }}>Email</div>
                        <div className="text-primary">janesmith@email.com</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold" style={{ color: dark }}>Phone</div>
                        <div className="text-primary">(555) 555-5555</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold" style={{ color: dark }}>Website</div>
                        <div className="inline-flex items-center gap-1 text-primary">
                          <Globe className="h-3.5 w-3.5" />
                          example-daycare.com
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 border-t pt-5" style={{ borderColor: `${sage}33` }}>
                      <PremiumHoursTable hours={MOCK_PREMIUM_LISTING.hours!} />
                    </div>
                  </div>
                  <p className="mt-3 text-center text-sm" style={{ color: `${dark}88` }}>
                    Plus your website and full weekly schedule. <strong>Everything in one place.</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Row 4: Photo Gallery — full width */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: `${sage}55` }}>
              <div className="mb-4 flex items-center gap-2">
                <Camera className="h-5 w-5" style={{ color: gold }} />
                <h3 className="font-serif text-lg font-bold" style={{ color: dark }}>Show off your facility</h3>
              </div>
              <p className="mb-4 text-sm" style={{ color: `${dark}99` }}>
                Up to 9 photos in a full-screen lightbox. Parents can see your classrooms, playground, and more before they visit.
              </p>
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: `${sage}33` }}>
                <PremiumPhotoGallery photos={SHOWCASE_PHOTOS} daycareName="Your Daycare" />
              </div>
            </div>

            {/* Row 5: Pricing — full width */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: `${sage}55` }}>
              <div className="mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" style={{ color: teal }} />
                <h3 className="font-serif text-lg font-bold" style={{ color: dark }}>Transparent pricing builds trust</h3>
              </div>
              <p className="mb-4 text-sm" style={{ color: `${dark}99` }}>
                The info parents want most — pricing by age group, displayed in a clean, professional table.
              </p>
              <div className="rounded-xl overflow-hidden">
                <PremiumPricingTable pricing={MOCK_PREMIUM_LISTING.pricing!} />
              </div>
            </div>

            {/* Row 6: Amenities — full width */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: `${sage}55` }}>
              <div className="mb-4 flex items-center gap-2">
                <ListChecks className="h-5 w-5" style={{ color: teal }} />
                <h3 className="font-serif text-lg font-bold" style={{ color: dark }}>Everything you offer, organized</h3>
              </div>
              <p className="mb-4 text-sm" style={{ color: `${dark}99` }}>
                Facilities, meals, programs, safety, scheduling — parents see exactly what sets you apart from 8,000+ other daycares.
              </p>
              <div className="rounded-xl border overflow-hidden p-4" style={{ borderColor: `${sage}33` }}>
                <PremiumAmenities amenities={MOCK_PREMIUM_LISTING.amenities!} />
              </div>
            </div>

            {/* Row 7: Custom FAQs — full width */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: `${sage}55` }}>
              <div className="mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" style={{ color: pink }} />
                <h3 className="font-serif text-lg font-bold" style={{ color: dark }}>Answer questions before parents ask</h3>
              </div>
              <p className="mb-4 text-sm" style={{ color: `${dark}99` }}>
                Add up to 5 custom FAQs with your own questions and your own answers. Parents get the details they care about most — straight from you.
              </p>
              <div className="space-y-3">
                {MOCK_PREMIUM_LISTING.custom_faqs.map((faq) => (
                  <div key={faq.question} className="rounded-xl border p-4" style={{ borderColor: `${sage}33` }}>
                    <div className="text-sm font-bold" style={{ color: dark }}>Q: {faq.question}</div>
                    <p className="mt-1 text-sm" style={{ color: `${dark}99` }}>{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ background: cream, marginTop: "-1px" }}>
        <WaveDivider fill="#fff" />
      </div>

      {/* ══════════ SECTION 5: YOUR WEB PRESENCE ══════════ */}
      <section className="px-4 py-16 sm:py-20" style={{ background: "#fff" }}>
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold sm:text-4xl" style={{ color: dark }}>
              Don&apos;t have a website? <span style={{ color: teal }}>You do now.</span>
            </h2>
            <p className="mt-3 text-lg" style={{ color: `${dark}99` }}>
              Your premium listing doubles as a professional web presence — no domain, no hosting, no tech skills needed.
            </p>
          </div>

          {/* URL showcase */}
          <div className="rounded-2xl border bg-white p-6 sm:p-8 shadow-sm" style={{ borderColor: `${sage}55` }}>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5" style={{ color: teal }} />
              <h3 className="font-serif text-lg font-bold" style={{ color: dark }}>Your listing URL</h3>
            </div>
            <div className="rounded-xl border px-5 py-4 mb-6" style={{ borderColor: `${sage}33`, background: lightTeal }}>
              <div className="text-xs font-medium mb-1" style={{ color: `${dark}66` }}>Share this link anywhere:</div>
              <div className="text-sm sm:text-lg font-mono font-semibold break-all" style={{ color: teal }}>
                ohioparenthub.com/daycare/your-daycare-name
              </div>
            </div>

            <p className="text-sm mb-6" style={{ color: `${dark}99` }}>
              Your listing page has everything a parent needs — photos, hours, pricing, amenities, FAQs, your story, and contact info. Use the URL as your website anywhere you&apos;d normally share one.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { emoji: "📱", label: "Social media bios" },
                { emoji: "✉️", label: "Email signatures" },
                { emoji: "📍", label: "Google Business Profile" },
                { emoji: "📄", label: "Flyers & brochures" },
                { emoji: "💬", label: "Parent texts & DMs" },
                { emoji: "📋", label: "Enrollment packets" },
                { emoji: "🏷️", label: "Business cards" },
                { emoji: "🔗", label: "Anywhere you need a link" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: `${sage}33` }}>
                  <span>{item.emoji}</span>
                  <span style={{ color: dark }}>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl p-4" style={{ background: `${teal}08` }}>
              <p className="text-sm font-medium" style={{ color: dark }}>
                Already have a website? We&apos;ll link to it directly from your listing so parents can visit with one click.
              </p>
            </div>
          </div>

          {/* Badge backlink promo */}
          <div className="mt-6 flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: `${gold}40` }}>
            <div className="hidden sm:block flex-shrink-0 rounded-lg p-2" style={{ background: `${gold}12` }}>
              <Code className="h-5 w-5" style={{ color: gold }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: dark }}>
                Already have a website? Add our badge and get a free month.
              </p>
              <p className="mt-0.5 text-xs" style={{ color: `${dark}88` }}>
                Premium members can grab an embeddable badge from their dashboard. Add it to your site, let us know, and your next month is on us.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div style={{ background: "#fff", marginTop: "-1px" }}>
        <WaveDivider fill={cream} />
      </div>

      {/* ══════════ SECTION 6: FULL BENEFITS GRID ══════════ */}
      <section className="px-4 py-16 sm:py-20" style={{ background: cream }}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold sm:text-4xl" style={{ color: dark }}>
              Everything you get with a <span style={{ color: gold }}>premium listing</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: `${sage}55` }}>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${teal}15`, color: teal }}>
                  {b.icon}
                </div>
                <h3 className="font-serif text-base font-bold mb-1" style={{ color: dark }}>{b.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: `${dark}bb` }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ background: cream, marginTop: "-1px" }}>
        <WaveDivider fill="#fff" />
      </div>

      {/* ══════════ SECTION 7: HOW IT WORKS ══════════ */}
      <section className="px-4 py-16 sm:py-20" style={{ background: "#fff" }}>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-serif text-3xl font-bold sm:text-4xl" style={{ color: dark }}>
            How to claim your listing
          </h2>
          <p className="mt-3 text-lg" style={{ color: `${dark}99` }}>Three simple steps. Takes less than 5 minutes.</p>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                icon: <Search className="h-6 w-6" />,
                title: "Find",
                desc: "Search for your daycare on Ohio Parent Hub using the search above.",
              },
              {
                step: "2",
                icon: <ShieldCheck className="h-6 w-6" />,
                title: "Claim",
                desc: "Click \"Claim This Listing\" and verify ownership with your email on file with the state.",
              },
              {
                step: "3",
                icon: <Sparkles className="h-6 w-6" />,
                title: "Customize",
                desc: "Add your logo, photos, hours, pricing, amenities, and more from your provider dashboard.",
              },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl font-serif font-bold text-white" style={{ background: teal }}>
                  {s.step}
                </div>
                <div className="mb-1 flex items-center justify-center" style={{ color: teal }}>{s.icon}</div>
                <h3 className="font-serif text-xl font-bold" style={{ color: dark }}>{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ background: "#fff", marginTop: "-1px" }}>
        <WaveDivider fill={lightTeal} />
      </div>

      {/* ══════════ SECTION 8: COMING SOON / COMMUNITY ══════════ */}
      <section className="relative overflow-hidden px-4 py-16 sm:py-20" style={{ background: lightTeal }}>
        <SparkleDecor className="absolute top-8 right-[10%] h-5 w-5 animate-pulse" style={{ color: gold, opacity: 0.3 }} />
        <SparkleDecor className="absolute bottom-12 left-[12%] h-4 w-4 animate-pulse" style={{ color: pink, opacity: 0.25 }} />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold" style={{ background: `${gold}20`, color: dark }}>
            <Rocket className="h-4 w-4" style={{ color: gold }} />
            More coming soon
          </div>
          <h2 className="font-serif text-3xl font-bold sm:text-4xl" style={{ color: dark }}>
            Shape the future of <span style={{ color: teal }}>Ohio Parent Hub</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed" style={{ color: `${dark}bb` }}>
            As a premium member, you&apos;re not just getting a better listing — you&apos;re joining a community of Ohio providers who help shape what we build next.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 text-left">
            {[
              { icon: <Lightbulb className="h-5 w-5" style={{ color: gold }} />, title: "Feature Input", desc: "Tell us what tools would help your business. Your feedback directly influences our roadmap." },
              { icon: <Sparkles className="h-5 w-5" style={{ color: teal }} />, title: "Feature Updates", desc: "Get access to new features as we build them — more customization options, enhanced listing tools, and more." },
              { icon: <Megaphone className="h-5 w-5" style={{ color: pink }} />, title: "Hiring Portal", desc: "Mark your program as hiring and post open positions so qualified candidates can find you." },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 rounded-xl bg-white p-4 shadow-sm" style={{ borderColor: `${sage}55` }}>
                <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-serif text-base font-bold" style={{ color: dark }}>{item.title}</h3>
                  <p className="mt-1 text-sm" style={{ color: `${dark}bb` }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-10 text-sm font-medium" style={{ color: `${dark}99` }}>
            Low monthly fee · Cancel anytime · Free to claim your listing
          </p>
        </div>
      </section>

      <div style={{ background: lightTeal, marginTop: "-1px" }}>
        <WaveDivider fill={dark} />
      </div>

      {/* ══════════ SECTION 9: FINAL CTA ══════════ */}
      <section className="relative overflow-hidden px-4 py-16 sm:py-20" style={{ background: dark }}>
        <SparkleDecor className="absolute top-8 right-[15%] h-6 w-6 animate-pulse" style={{ color: gold, opacity: 0.2 }} />
        <SparkleDecor className="absolute bottom-10 left-[10%] h-5 w-5 animate-pulse" style={{ color: pink, opacity: 0.15 }} />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
            Ready to make your listing <span style={{ color: gold }}>stand out</span>?
          </h2>
          <p className="mt-4 text-lg" style={{ color: "rgba(255,255,255,0.75)" }}>
            Join Ohio providers who are already connecting with more parents through verified, detailed listings.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="rounded-full px-8 py-6 text-base font-bold shadow-lg" style={{ background: pink, color: "#fff" }} asChild>
              <Link href="/daycares">
                <Search className="mr-2 h-4 w-4" />
                Find Your Listing
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-base font-bold" style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff", background: "transparent" }} asChild>
              <Link href="/auth/login">
                Provider Portal
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            Free to claim · Low monthly fee · Cancel anytime
          </p>
        </div>
      </section>

      <div style={{ background: dark, marginTop: "-1px" }}>
        <WaveDivider fill={cream} />
      </div>
    </main>
  );
}
