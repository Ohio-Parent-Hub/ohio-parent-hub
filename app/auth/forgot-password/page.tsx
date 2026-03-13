"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const teal = "#7EA8A4";
const dark = "#4A6B67";
const cream = "#F5EDE4";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <main
      className="flex min-h-[80vh] items-center justify-center px-4"
      style={{ backgroundColor: cream }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1
          className="mb-2 text-center font-serif text-3xl font-bold"
          style={{ color: dark }}
        >
          Reset Password
        </h1>
        <p
          className="mb-8 text-center text-sm"
          style={{ color: `${dark}aa` }}
        >
          Enter your email and we&apos;ll send you a reset link
        </p>

        {sent ? (
          <div
            className="rounded-xl p-6 text-center"
            style={{ backgroundColor: `${teal}15` }}
          >
            <p className="mb-1 font-semibold" style={{ color: dark }}>
              Check your email
            </p>
            <p className="text-sm" style={{ color: `${dark}aa` }}>
              We sent a password reset link to{" "}
              <strong>{email}</strong>. Click the link in the email to set a
              new password.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: dark }}>
                Email
              </Label>
              <Input
                id="email"
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
              {loading ? "Sending…" : "Send Reset Link"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm">
          <a
            href="/auth/login"
            className="font-medium hover:underline"
            style={{ color: teal }}
          >
            Back to sign in
          </a>
        </p>
      </div>
    </main>
  );
}
