import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Design Preview | Ohio Parent Hub",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

type DaycareRow = Record<string, string>;

function loadDaycares(): DaycareRow[] {
  const p = path.join(process.cwd(), "data", "daycares.json");
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

function StatCard({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className: string;
}) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${className}`}>
      <div className="mb-1 flex items-center gap-1 text-primary/60">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="text-3xl font-serif font-bold text-primary">{value}</div>
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
    </div>
  );
}

function Variant1({ programs, cities }: { programs: number; cities: number }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-primary/10 px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-4xl text-center">
        <Badge variant="secondary" className="mb-5 border-primary/20 bg-primary/80 text-primary-foreground">
          <Sparkles className="mr-2 h-4 w-4 text-accent" />
          Variant 1 · Soft Friendly
        </Badge>
        <h1 className="font-serif text-5xl font-bold tracking-tight text-primary sm:text-6xl">
          Finding Childcare <span className="text-secondary-foreground">Should Be Simple.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Browse <strong>{programs.toLocaleString()}</strong> programs across <strong>{cities}</strong> Ohio cities.
        </p>
        <div className="mt-8 flex justify-center">
          <Button className="h-11 px-7" asChild>
            <Link href="/daycares">
              <Search className="mr-2 h-4 w-4" />
              Find a Daycare
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard value={programs.toLocaleString()} label="Programs" className="border-primary/15 bg-primary/10" />
          <StatCard value={cities.toLocaleString()} label="Cities" className="border-rose-100 bg-rose-50/80" />
          <StatCard value="100%" label="Licensed" className="border-amber-100 bg-amber-50/90" />
          <StatCard value="Always" label="Free" className="border-emerald-100 bg-emerald-50/70" />
        </div>
      </div>
    </section>
  );
}

function Variant2({ programs, cities }: { programs: number; cities: number }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-background px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-4xl text-center">
        <Badge variant="outline" className="mb-5 border-primary/30 text-primary">
          <Sparkles className="mr-2 h-4 w-4 text-primary/70" />
          Variant 2 · Editorial Clean
        </Badge>
        <h1 className="font-serif text-5xl font-bold tracking-tight text-primary sm:text-6xl">
          Trusted Ohio Childcare,
          <br className="hidden sm:block" />
          <span className="text-foreground">in one clear place.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Compare licensed providers quickly with transparent, state-sourced data.
        </p>
        <div className="mt-8 flex justify-center">
          <Button variant="outline" className="h-11 border-2 border-primary px-7 text-primary" asChild>
            <Link href="/daycares">
              <Search className="mr-2 h-4 w-4" />
              Start Search
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard value={programs.toLocaleString()} label="Programs" className="border-border bg-card" />
          <StatCard value={cities.toLocaleString()} label="Cities" className="border-border bg-card" />
          <StatCard value="100%" label="Licensed" className="border-border bg-card" />
          <StatCard value="Always" label="Free" className="border-border bg-card" />
        </div>
      </div>
    </section>
  );
}

function Variant3({ programs, cities }: { programs: number; cities: number }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-primary/15 to-secondary/10 px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-5xl text-center">
        <Badge variant="secondary" className="mb-5 bg-secondary/60 text-secondary-foreground">
          <Sparkles className="mr-2 h-4 w-4" />
          Variant 3 · Framed Feature
        </Badge>
        <h1 className="font-serif text-5xl font-bold tracking-tight text-primary sm:text-6xl">
          Ohio Parent Hub
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Confidently choose care with verified program details and local discovery tools.
        </p>
        <div className="mt-8 flex justify-center">
          <Button className="h-11 bg-primary px-7 text-primary-foreground" asChild>
            <Link href="/daycares">
              <Search className="mr-2 h-4 w-4" />
              Browse Programs
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-primary/20 bg-white/70 p-5 shadow-sm md:col-span-2">
            <div className="text-4xl font-serif font-bold text-primary">{programs.toLocaleString()}</div>
            <div className="mt-1 text-sm font-medium uppercase tracking-wide text-muted-foreground">State Licensed Programs</div>
          </div>
          <StatCard value={cities.toLocaleString()} label="Cities" className="border-primary/20 bg-white/70" />
          <StatCard value="Always Free" label="for families" className="border-primary/20 bg-white/70" />
        </div>
      </div>
    </section>
  );
}

export default async function DesignPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const params = await searchParams;
  const variant = params.v || "1";

  const daycares = loadDaycares();
  const cityCounts = new Set(daycares.map((d) => d.CITY).filter(Boolean));

  return (
    <main className="min-h-screen bg-muted/30 px-6 py-10">
      <div className="mx-auto mb-6 flex max-w-6xl items-center justify-between gap-4">
        <h2 className="font-serif text-2xl font-semibold text-primary">Design Preview (Temporary)</h2>
        <div className="flex gap-2">
          <Button size="sm" variant={variant === "1" ? "default" : "outline"} asChild>
            <Link href="/design-preview?v=1">Variant 1</Link>
          </Button>
          <Button size="sm" variant={variant === "2" ? "default" : "outline"} asChild>
            <Link href="/design-preview?v=2">Variant 2</Link>
          </Button>
          <Button size="sm" variant={variant === "3" ? "default" : "outline"} asChild>
            <Link href="/design-preview?v=3">Variant 3</Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl" id="preview-root">
        {variant === "1" && <Variant1 programs={daycares.length} cities={cityCounts.size} />}
        {variant === "2" && <Variant2 programs={daycares.length} cities={cityCounts.size} />}
        {variant === "3" && <Variant3 programs={daycares.length} cities={cityCounts.size} />}
      </div>
    </main>
  );
}