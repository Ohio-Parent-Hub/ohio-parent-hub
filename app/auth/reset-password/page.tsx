"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const teal = "#7EA8A4";
const dark = "#4A6B67";
const cream = "#F5EDE4";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 2000);
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
          Set New Password
        </h1>
        <p
          className="mb-8 text-center text-sm"
          style={{ color: `${dark}aa` }}
        >
          Choose a new password for your account
        </p>

        {done ? (
          <div
            className="rounded-xl p-6 text-center"
            style={{ backgroundColor: `${teal}15` }}
          >
            <p className="mb-1 font-semibold" style={{ color: dark }}>
              Password updated!
            </p>
            <p className="text-sm" style={{ color: `${dark}aa` }}>
              Redirecting you to your dashboard…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: dark }}>
                New Password
              </Label>
              <Input
                id="password"
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
              <Label htmlFor="confirm" style={{ color: dark }}>
                Confirm Password
              </Label>
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
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
              {loading ? "Updating…" : "Update Password"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
