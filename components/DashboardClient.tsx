"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  cancelSubscriptionAndDeleteAccount,
  changePassword,
} from "@/app/actions/account";
import {
  Pencil,
  CreditCard,
  Eye,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  LogOut,
  Share2,
  Megaphone,
  Copy,
  Check,
  Globe,
  Code2,
  ExternalLink,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { createClient } from "@/lib/supabase/client";
import { Star } from "lucide-react";

const teal = "#7EA8A4";
const dark = "#4A6B67";
const cream = "#F5EDE4";
const gold = "#DCB346";
const lightGold = "#F5E9BE";

type DaycareInfo = {
  programType: string | null;
  sutqRating: string | null;
  city: string | null;
  county: string | null;
  licensedSince: string | null;
};

type DashboardClientProps = {
  daycareName: string;
  daycareSlug: string | null;
  email: string;
  subscriptionStatus: string;
  subscriptionDetails: {
    status: string;
    priceFormatted: string;
    currentPeriodEnd: string | null;
    freeForever: boolean;
    freeUntil: string | null;
  } | null;
  hasStripeCustomer: boolean;
  daycareInfo: DaycareInfo;
};

function sutqLabel(rating: string | null): string {
  if (rating === "3") return "Gold";
  if (rating === "2") return "Silver";
  if (rating === "1") return "Bronze";
  return "Not Rated";
}

function sutqColor(rating: string | null) {
  if (rating === "3") return gold;
  if (rating === "2") return "#94a3b8";
  if (rating === "1") return "#ea580c";
  return `${dark}66`;
}

export default function DashboardClient({
  daycareName,
  daycareSlug,
  email,
  subscriptionStatus,
  subscriptionDetails,
  hasStripeCustomer,
  daycareInfo,
}: DashboardClientProps) {
  const router = useRouter();
  const [billingLoading, setBillingLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);

  useEffect(() => {
    setHasNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  // Change password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Cancel & delete state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const isActive =
    subscriptionStatus === "active" || subscriptionStatus === "past_due";

  async function handleCheckout() {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (!res.ok) {
        const text = await res.text();
        console.error("Checkout error:", res.status, text);
        alert("Something went wrong starting checkout. Please try again.");
        setCheckoutLoading(false);
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout fetch error:", err);
      alert("Something went wrong. Please try again.");
      setCheckoutLoading(false);
    }
  }

  async function handleManageBilling() {
    setBillingLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (!res.ok) {
        const text = await res.text();
        console.error("Billing portal error:", res.status, text);
        alert("Something went wrong. Please try again.");
        setBillingLoading(false);
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Billing portal fetch error:", err);
      alert("Something went wrong. Please try again.");
      setBillingLoading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    const result = await changePassword(newPassword);
    if (result.error) {
      setPasswordError(result.error);
    } else {
      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordLoading(false);
  }

  async function handleCancelAccount() {
    setCancelLoading(true);
    setCancelError(null);
    const result = await cancelSubscriptionAndDeleteAccount();
    if (result?.error) {
      setCancelError(result.error);
      setCancelLoading(false);
    }
    // On success, the server action redirects to /
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: cream }}>
      {/* ── Hero header ── */}
      <section className="relative overflow-hidden px-6 pt-8 pb-10" style={{ background: "#D5E5E3" }}>
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full" style={{ background: "#E8A0AC20" }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full" style={{ background: `${gold}20` }} />

        <div className="relative z-10 mx-auto max-w-2xl">
          <div className="grid gap-6 lg:grid-cols-5 lg:items-end">
            <div className="lg:col-span-3">
              <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: dark }}>
                Dashboard
              </h1>
              <p className="mt-2 text-sm font-medium" style={{ color: `${dark}cc` }}>
                {daycareName}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: `${dark}88` }}>
                {email}
              </p>
              {daycareInfo.programType && (
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium" style={{ color: `${dark}dd` }}>
                  <span className="rounded-full border px-3 py-1" style={{ borderColor: `${teal}55` }}>
                    {daycareInfo.programType}
                  </span>
                  {daycareInfo.city && (
                    <span className="rounded-full border px-3 py-1" style={{ borderColor: `${teal}55` }}>
                      {daycareInfo.city}{daycareInfo.county ? `, ${daycareInfo.county} County` : ""}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-2 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border p-4 shadow-sm" style={{ background: "#FFFFFF", borderColor: `${teal}40` }}>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4" style={{ color: sutqColor(daycareInfo.sutqRating), fill: sutqColor(daycareInfo.sutqRating) }} />
                  <span className="font-serif text-lg font-bold" style={{ color: sutqColor(daycareInfo.sutqRating) }}>
                    {sutqLabel(daycareInfo.sutqRating)}
                  </span>
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-widest" style={{ color: `${dark}88` }}>SUTQ Rating</div>
              </div>
              <div className="rounded-2xl border p-4 shadow-sm" style={{ background: lightGold, borderColor: `${gold}40` }}>
                <span className="font-serif text-lg font-bold" style={{ color: dark }}>
                  {daycareInfo.licensedSince ?? "N/A"}
                </span>
                <div className="mt-1 text-[11px] uppercase tracking-widest" style={{ color: `${dark}88` }}>Licensed Since</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <main className="px-6 py-8">
        <div className="mx-auto max-w-2xl space-y-6">

        {/* Subscription Card */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2
              className="font-serif text-lg font-semibold"
              style={{ color: dark }}
            >
              Subscription
            </h2>
            <StatusBadge status={subscriptionStatus} />
          </div>

          {isActive && subscriptionDetails ? (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-sm" style={{ color: `${dark}aa` }}>
                  Premium Listing
                </span>
                <div className="flex flex-col items-end">
                  <span
                    className={`text-lg font-semibold${subscriptionDetails.freeForever || subscriptionDetails.freeUntil ? " line-through" : ""}`}
                    style={{ color: subscriptionDetails.freeForever || subscriptionDetails.freeUntil ? `${dark}66` : dark }}
                  >
                    {subscriptionDetails.priceFormatted}
                  </span>
                  {subscriptionDetails.freeForever && (
                    <span
                      className="mt-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: lightGold, color: "#92700C" }}
                    >
                      Free Forever
                    </span>
                  )}
                  {subscriptionDetails.freeUntil && (
                    <span
                      className="mt-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: lightGold, color: "#92700C" }}
                    >
                      Free until {subscriptionDetails.freeUntil}
                    </span>
                  )}
                </div>
              </div>
              {subscriptionDetails.currentPeriodEnd && !subscriptionDetails.freeForever && !subscriptionDetails.freeUntil && (
                <p className="text-xs" style={{ color: `${dark}80` }}>
                  Renews on {subscriptionDetails.currentPeriodEnd}
                </p>
              )}
              {subscriptionStatus === "past_due" && (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Your payment failed. Please update your payment method to keep
                  your listing active.
                </p>
              )}
              {hasStripeCustomer && (
                <button
                  onClick={handleManageBilling}
                  disabled={billingLoading}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline"
                  style={{ color: teal }}
                >
                  <CreditCard className="h-4 w-4" />
                  {billingLoading ? "Loading…" : "Manage Billing"}
                </button>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm" style={{ color: `${dark}aa` }}>
                You don&apos;t have an active subscription. Subscribe to unlock
                the listing editor and add photos, hours, pricing, and more.
              </p>
              <Button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="mt-4 h-11 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: teal }}
              >
                {checkoutLoading ? "Loading…" : "Subscribe to Premium"}
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-3 sm:grid-cols-2">
          {isActive && (
            <Link
              href="/dashboard/edit"
              className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${teal}15` }}
              >
                <Pencil className="h-5 w-5" style={{ color: teal }} />
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: dark }}
                >
                  Edit Listing
                </p>
                <p className="text-xs" style={{ color: `${dark}80` }}>
                  Photos, hours, pricing & more
                </p>
              </div>
            </Link>
          )}

          {daycareSlug && (
            <Link
              href={daycareSlug}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${teal}15` }}
              >
                <Eye className="h-5 w-5" style={{ color: teal }} />
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: dark }}
                >
                  View Public Page
                </p>
                <p className="text-xs" style={{ color: `${dark}80` }}>
                  See what parents see
                </p>
              </div>
            </Link>
          )}

        </div>

        {/* ── Promote Your Listing ── */}
        {isActive && daycareSlug && (
          <PromoteSection
            daycareName={daycareName}
            daycareSlug={daycareSlug}
            linkCopied={linkCopied}
            setLinkCopied={setLinkCopied}
            embedCopied={embedCopied}
            setEmbedCopied={setEmbedCopied}
            hasNativeShare={hasNativeShare}
          />
        )}

        {/* Change Password */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2
            className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold"
            style={{ color: dark }}
          >
            <KeyRound className="h-5 w-5" style={{ color: teal }} />
            Change Password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" style={{ color: dark }}>
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="h-11 rounded-xl"
                style={{ borderColor: `${teal}40` }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password" style={{ color: dark }}>
                Confirm New Password
              </Label>
              <Input
                id="confirm-new-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="h-11 rounded-xl"
                style={{ borderColor: `${teal}40` }}
              />
            </div>

            {passwordError && (
              <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                {passwordError}
              </p>
            )}
            {passwordSuccess && (
              <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
                Password updated successfully.
              </p>
            )}

            <Button
              type="submit"
              disabled={passwordLoading}
              variant="outline"
              className="h-10 rounded-xl text-sm"
              style={{ borderColor: `${teal}40`, color: dark }}
            >
              {passwordLoading ? "Updating…" : "Update Password"}
            </Button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 flex items-center gap-2 font-serif text-lg font-semibold text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </h2>

          {!showCancelConfirm ? (
            <div>
              <p className="mb-4 text-sm" style={{ color: `${dark}aa` }}>
                Cancel your subscription and permanently delete your account.
                Your premium content (photos, hours, pricing) will be removed.
                Your daycare&apos;s basic listing from state data will remain on
                the site.
              </p>
              <Button
                variant="outline"
                className="rounded-xl border-red-300 text-sm text-red-600 hover:bg-red-50"
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancel Subscription & Delete Account
              </Button>
            </div>
          ) : (
            <div className="rounded-xl bg-red-50 p-4">
              <p className="mb-3 text-sm font-medium text-red-800">
                Are you sure? This will:
              </p>
              <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-red-700">
                <li>Cancel your Stripe subscription</li>
                <li>Delete all your premium content (photos, hours, pricing)</li>
                <li>Permanently delete your account</li>
              </ul>
              <p className="mb-4 text-xs text-red-600">
                This cannot be undone.
              </p>

              {cancelError && (
                <p className="mb-3 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">
                  {cancelError}
                </p>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="rounded-xl text-sm"
                  style={{ borderColor: `${teal}40`, color: dark }}
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={cancelLoading}
                >
                  Keep My Account
                </Button>
                <Button
                  className="rounded-xl bg-red-600 text-sm text-white hover:bg-red-700"
                  onClick={handleCancelAccount}
                  disabled={cancelLoading}
                >
                  {cancelLoading
                    ? "Deleting…"
                    : "Yes, Delete Everything"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sign Out */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            className="rounded-xl text-sm font-medium"
            style={{ color: `${dark}99` }}
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              router.push("/");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Active
        </span>
      );
    case "past_due":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
          <Clock className="h-3.5 w-3.5" />
          Past Due
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
          <XCircle className="h-3.5 w-3.5" />
          Cancelled
        </span>
      );
    default:
      return (
        <span
          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
          style={{ backgroundColor: `${teal}15`, color: dark }}
        >
          No Subscription
        </span>
      );
  }
}

/* ─────────────────────────────────────────────
   Promote Your Listing Section
   ───────────────────────────────────────────── */

const SITE_URL = "https://ohioparenthub.com";

function PromoteSection({
  daycareName,
  daycareSlug,
  linkCopied,
  setLinkCopied,
  embedCopied,
  setEmbedCopied,
  hasNativeShare,
}: {
  daycareName: string;
  daycareSlug: string;
  linkCopied: boolean;
  setLinkCopied: (v: boolean) => void;
  embedCopied: boolean;
  setEmbedCopied: (v: boolean) => void;
  hasNativeShare: boolean;
}) {
  const listingUrl = `${SITE_URL}${daycareSlug}`;
  const badgeUrl = `${SITE_URL}/badge.png`;
  const shareText = `Check out ${daycareName} on Ohio Parent Hub — licensed, rated, and trusted by Ohio parents.`;

  const embedSnippet = `<a href="${listingUrl}" target="_blank" rel="noopener">\n  <img src="${badgeUrl}" alt="Find ${daycareName} on Ohio Parent Hub" width="220" height="48" />\n</a>`;

  async function copyLink() {
    await navigator.clipboard.writeText(listingUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  async function copyEmbed() {
    await navigator.clipboard.writeText(embedSnippet);
    setEmbedCopied(true);
    setTimeout(() => setEmbedCopied(false), 2000);
  }

  function shareFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(listingUrl)}`;
    window.open(url, "_blank", "noopener");
  }

  function shareX() {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(listingUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener");
  }

  async function shareNative() {
    try {
      await navigator.share({ title: daycareName, text: shareText, url: listingUrl });
    } catch {
      // User cancelled
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2
        className="mb-1 flex items-center gap-2 font-serif text-lg font-semibold"
        style={{ color: dark }}
      >
        <Megaphone className="h-5 w-5" style={{ color: teal }} />
        Promote Your Listing
      </h2>
      <p className="mb-5 text-sm" style={{ color: `${dark}88` }}>
        Share your listing with parents and get discovered on social media.
      </p>

      {/* ── Listing URL ── */}
      <div className="mb-5 rounded-xl border p-4" style={{ borderColor: `${teal}30` }}>
        <div className="mb-1.5 text-xs font-medium" style={{ color: `${dark}66` }}>
          Your listing URL
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex-1 truncate rounded-lg border px-3 py-2 text-sm font-mono"
            style={{ borderColor: `${teal}20`, color: teal, background: `${teal}08` }}
          >
            {listingUrl.replace("https://", "")}
          </div>
          <button
            onClick={copyLink}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors"
            style={{
              borderColor: linkCopied ? "#22c55e" : `${teal}30`,
              color: linkCopied ? "#22c55e" : teal,
              background: linkCopied ? "#f0fdf4" : "transparent",
            }}
            title="Copy link"
          >
            {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── Share Buttons ── */}
      <div className="mb-6">
        <div className="mb-2 text-xs font-medium" style={{ color: `${dark}66` }}>
          Share on social media
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={shareFacebook}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-blue-50"
            style={{ borderColor: "#1877F220", color: "#1877F2" }}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
          </button>
          <button
            onClick={shareX}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: `${dark}20`, color: dark }}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            X
          </button>
          {hasNativeShare && (
            <button
              onClick={shareNative}
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
              style={{ borderColor: `${teal}20`, color: dark }}
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          )}
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
            style={{
              borderColor: linkCopied ? "#22c55e40" : `${teal}20`,
              color: linkCopied ? "#22c55e" : dark,
              background: linkCopied ? "#f0fdf4" : "transparent",
            }}
          >
            {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {linkCopied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* ── Backlink Badge / Embed ── */}
      <div className="rounded-xl border p-4" style={{ borderColor: `${teal}30` }}>
        <div className="mb-3 flex items-center gap-2">
          <Code2 className="h-4 w-4" style={{ color: teal }} />
          <span className="text-sm font-semibold" style={{ color: dark }}>
            Add a badge to your website
          </span>
        </div>

        {/* Free month incentive */}
        <div className="mb-4 rounded-xl border-2 p-4" style={{ borderColor: gold, background: `${gold}10` }}>
          <p className="mb-3 font-serif text-base font-bold" style={{ color: dark }}>
            Earn a Free Month of Premium
          </p>
          <ol className="space-y-2">
            <li className="flex items-start gap-2.5">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: teal }}
              >
                1
              </span>
              <span className="text-sm" style={{ color: `${dark}cc` }}>
                Copy the code below and add the badge to your website
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: teal }}
              >
                2
              </span>
              <span className="text-sm" style={{ color: `${dark}cc` }}>
                <a
                  href={`mailto:hello@ohioparenthub.com?subject=Badge added — ${daycareName}&body=I added the Ohio Parent Hub badge to my website. My website URL is: `}
                  className="font-semibold underline"
                  style={{ color: teal }}
                >
                  Email us
                </a>{" "}
                with the link to your site
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: gold }}
              >
                3
              </span>
              <span className="text-sm font-medium" style={{ color: dark }}>
                Get your next month free — on us
              </span>
            </li>
          </ol>
        </div>

        {/* Badge preview */}
        <div className="mb-4">
          <div className="mb-1.5 text-xs font-medium" style={{ color: `${dark}66` }}>
            Preview
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/badge.png"
            alt="Ohio Parent Hub Badge"
            width={220}
            height={48}
            className="rounded"
          />
        </div>

        {/* Code snippet */}
        <div className="mb-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: `${dark}66` }}>
              HTML code
            </span>
            <button
              onClick={copyEmbed}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors"
              style={{
                color: embedCopied ? "#22c55e" : teal,
                background: embedCopied ? "#f0fdf4" : `${teal}10`,
              }}
            >
              {embedCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {embedCopied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre
            className="overflow-x-auto rounded-lg border p-3 text-xs leading-relaxed"
            style={{ borderColor: `${teal}20`, color: `${dark}cc`, background: `${dark}06` }}
          >
            {embedSnippet}
          </pre>
        </div>

        {/* Platform instructions */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="instructions" className="border-0">
            <AccordionTrigger
              className="py-2 text-sm font-medium hover:no-underline"
              style={{ color: dark }}
            >
              <div className="flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" style={{ color: teal }} />
                How to add this to your website
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              <div className="space-y-4 text-xs" style={{ color: `${dark}bb` }}>
                <div>
                  <p className="mb-1 font-semibold" style={{ color: dark }}>Wix</p>
                  <ol className="list-decimal space-y-0.5 pl-4">
                    <li>Open your site in the Wix Editor</li>
                    <li>Click <strong>Add Elements (+)</strong> → <strong>Embed Code</strong> → <strong>Custom HTML</strong></li>
                    <li>Paste the code above and position the block in your footer</li>
                    <li>Click <strong>Publish</strong></li>
                  </ol>
                </div>
                <div>
                  <p className="mb-1 font-semibold" style={{ color: dark }}>Squarespace</p>
                  <ol className="list-decimal space-y-0.5 pl-4">
                    <li>Go to <strong>Edit</strong> → scroll to your footer</li>
                    <li>Click <strong>Add Block</strong> → <strong>Code</strong></li>
                    <li>Paste the code above and save</li>
                  </ol>
                </div>
                <div>
                  <p className="mb-1 font-semibold" style={{ color: dark }}>WordPress</p>
                  <ol className="list-decimal space-y-0.5 pl-4">
                    <li>Go to <strong>Appearance</strong> → <strong>Widgets</strong></li>
                    <li>Add a <strong>Custom HTML</strong> widget to your Footer area</li>
                    <li>Paste the code above and click <strong>Save</strong></li>
                  </ol>
                </div>
                <div>
                  <p className="mb-1 font-semibold" style={{ color: dark }}>Other / Not sure?</p>
                  <p>
                    Copy the code above and send it to your web designer or the person who manages
                    your website. Ask them to add it to your site&apos;s footer.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
