"use client";

import { useState } from "react";
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
} from "lucide-react";
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
                <span
                  className="text-lg font-semibold"
                  style={{ color: dark }}
                >
                  {subscriptionDetails.priceFormatted}
                </span>
              </div>
              {subscriptionDetails.currentPeriodEnd && (
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

          {hasStripeCustomer && isActive && (
            <button
              onClick={handleManageBilling}
              disabled={billingLoading}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${gold}20` }}
              >
                <CreditCard className="h-5 w-5" style={{ color: gold }} />
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: dark }}
                >
                  {billingLoading ? "Loading…" : "Manage Billing"}
                </p>
                <p className="text-xs" style={{ color: `${dark}80` }}>
                  Update payment method
                </p>
              </div>
            </button>
          )}
        </div>

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
