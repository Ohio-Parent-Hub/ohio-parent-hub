"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Shield } from "lucide-react";

const teal = "#7EA8A4";
const dark = "#4A6B67";
const cream = "#F5EDE4";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
          Welcome Back
        </h1>
        <p
          className="mb-8 text-center text-sm"
          style={{ color: `${dark}aa` }}
        >
          Sign in to manage your daycare listing
        </p>

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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" style={{ color: dark }}>
                Password
              </Label>
              <a
                href="/auth/forgot-password"
                className="text-xs font-medium hover:underline"
                style={{ color: teal }}
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <div
          className="mt-6 rounded-xl border p-4 text-center"
          style={{ borderColor: `${teal}40`, background: `${teal}08` }}
        >
          <Shield className="mx-auto mb-2 h-6 w-6" style={{ color: teal }} />
          <p className="text-sm font-semibold" style={{ color: dark }}>
            Own a daycare in Ohio?
          </p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: `${dark}99` }}>
            Claim your listing to add photos, hours, pricing, and earn the
            Provider Verified badge.
          </p>
          <Button
            asChild
            size="sm"
            className="mt-3 rounded-full px-6 text-xs font-semibold text-white"
            style={{ backgroundColor: teal }}
          >
            <Link href="/for-providers">Find Your Listing</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
