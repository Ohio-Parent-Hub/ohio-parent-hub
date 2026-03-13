"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitClaim } from "@/app/actions/claims";
import { createClient } from "@/lib/supabase/client";
import { Shield, Mail } from "lucide-react";

const teal = "#7EA8A4";
const dark = "#4A6B67";

type ClaimListingDialogProps = {
  programNumber: string;
  daycareName: string;
};

export default function ClaimListingDialog({
  programNumber,
  daycareName,
}: ClaimListingDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const result = await submitClaim(programNumber, email, password);

    switch (result.status) {
      case "confirmation_email_sent":
        setSent(true);
        break;
      case "no_match":
      case "error":
        setError(result.message);
        break;
      case "already_claimed":
        setError("This listing has already been claimed.");
        break;
    }

    setLoading(false);
  }

  async function handleResend() {
    setResending(true);
    setResent(false);

    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
    });

    if (error) {
      setError(error.message);
    } else {
      setResent(true);
    }
    setResending(false);
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setError(null);
      setSent(false);
      setResent(false);
    }
  }

  if (sent) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <button
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-sm font-medium transition-colors hover:bg-primary/5"
            style={{ borderColor: `${teal}60`, color: dark }}
          >
            <Shield className="h-4 w-4" style={{ color: teal }} />
            Are you the owner? Claim this listing
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle
              className="text-center font-serif text-2xl"
              style={{ color: dark }}
            >
              Check Your Email
            </DialogTitle>
          </DialogHeader>
          <div className="text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: `${teal}20` }}
            >
              <Mail className="h-8 w-8" style={{ color: teal }} />
            </div>
            <p className="text-sm" style={{ color: `${dark}aa` }}>
              We sent a verification link to{" "}
              <strong>{email}</strong>. Click the link to confirm
              your account.
            </p>
            <p
              className="mt-3 text-xs"
              style={{ color: `${dark}80` }}
            >
              Don&apos;t see it? Check your spam folder.
            </p>

            {resent && (
              <p className="mt-2 text-sm font-medium" style={{ color: teal }}>
                Email resent!
              </p>
            )}

            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-xl"
              style={{ borderColor: `${teal}40`, color: dark }}
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Resending…" : "Resend Email"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-sm font-medium transition-colors hover:bg-primary/5"
          style={{ borderColor: `${teal}60`, color: dark }}
        >
          <Shield className="h-4 w-4" style={{ color: teal }} />
          Are you the owner? Claim this listing
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className="font-serif text-2xl"
            style={{ color: dark }}
          >
            Claim Your Listing
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm" style={{ color: `${dark}aa` }}>
          Verify ownership of{" "}
          <strong>{daycareName}</strong> by entering the email
          associated with your childcare license and creating a password.
        </p>
        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="claim-email" style={{ color: dark }}>
              Email
            </Label>
            <Input
              id="claim-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-11 rounded-xl"
              style={{ borderColor: `${teal}40` }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="claim-password" style={{ color: dark }}>
              Password
            </Label>
            <Input
              id="claim-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
              className="h-11 rounded-xl"
              style={{ borderColor: `${teal}40` }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="claim-confirm-password" style={{ color: dark }}>
              Confirm Password
            </Label>
            <Input
              id="claim-confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
              className="h-11 rounded-xl"
              style={{ borderColor: `${teal}40` }}
            />
          </div>

          <p className="text-xs" style={{ color: `${dark}80` }}>
            For instant verification, use the email on file with your childcare
            license. If you need help, contact{" "}
            <a
              href="mailto:ohioparenthub@gmail.com"
              className="underline"
              style={{ color: teal }}
            >
              ohioparenthub@gmail.com
            </a>
            .
          </p>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: teal }}
          >
            {loading ? "Verifying…" : "Verify & Claim"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
