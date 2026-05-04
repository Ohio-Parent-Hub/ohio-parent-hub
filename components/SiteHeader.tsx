"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BriefcaseBusiness, ChevronRight, House, MapPin, Menu, Search, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const teal = "#7EA8A4";
const pink = "#E8A0AC";
const dark = "#4A6B67";

export default function SiteHeader() {
  const [isSticky, setIsSticky] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setIsSticky(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav
      className={`z-40 backdrop-blur-xl transition-shadow ${isSticky ? "sticky top-0 shadow-sm" : "relative"}`}
      style={{ background: "rgba(255,255,255,0.93)" }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/icon.png" alt="Ohio Parent Hub" width={44} height={44} />
            <span className="font-serif text-xl font-bold" style={{ color: teal }}>Ohio Parent Hub</span>
          </Link>

          <div className="flex items-center gap-2 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" style={{ borderColor: teal, color: teal }} aria-label="Open menu">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[340px] px-0 bg-white">
                <SheetHeader className="px-6 pb-4 text-left sr-only">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex items-center gap-3 px-6 pb-4 pt-2">
                  <Image src="/icon.png" alt="Ohio Parent Hub" width={36} height={36} />
                  <span className="font-serif text-lg font-bold" style={{ color: teal }}>Ohio Parent Hub</span>
                </div>
                <div className="border-t border-border/40 px-5 pt-5">
                  <div className="space-y-3">
                    <SheetClose asChild>
                      <Button size="sm" className="h-11 w-full justify-center rounded-xl text-sm font-semibold shadow-sm" style={{ background: pink, color: "#fff" }} asChild>
                        <Link href="/daycares">
                          <Search className="mr-2 h-4 w-4" />
                          Find a Daycare
                        </Link>
                      </Button>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link
                        href="/jobs"
                        className="flex h-11 w-full items-center justify-between rounded-xl border px-4 text-sm font-medium transition-colors hover:bg-primary/10"
                        style={{ borderColor: `${teal}40`, color: dark }}
                      >
                        <span className="flex items-center gap-2">
                          <BriefcaseBusiness className="h-4 w-4" style={{ color: teal }} />
                          Jobs
                        </span>
                        <ChevronRight className="h-4 w-4" style={{ color: `${dark}88` }} />
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link
                        href="/"
                        className="flex h-11 w-full items-center justify-between rounded-xl border px-4 text-sm font-medium transition-colors hover:bg-primary/10"
                        style={{ borderColor: `${teal}40`, color: dark }}
                      >
                        <span className="flex items-center gap-2">
                          <House className="h-4 w-4" style={{ color: teal }} />
                          Home
                        </span>
                        <ChevronRight className="h-4 w-4" style={{ color: `${dark}88` }} />
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link
                        href="/cities"
                        className="flex h-11 w-full items-center justify-between rounded-xl border px-4 text-sm font-medium transition-colors hover:bg-primary/10"
                        style={{ borderColor: `${teal}40`, color: dark }}
                      >
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" style={{ color: teal }} />
                          Browse Cities
                        </span>
                        <ChevronRight className="h-4 w-4" style={{ color: `${dark}88` }} />
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link
                        href="/counties"
                        className="flex h-11 w-full items-center justify-between rounded-xl border px-4 text-sm font-medium transition-colors hover:bg-primary/10"
                        style={{ borderColor: `${teal}40`, color: dark }}
                      >
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" style={{ color: teal }} />
                          Browse Counties
                        </span>
                        <ChevronRight className="h-4 w-4" style={{ color: `${dark}88` }} />
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link
                        href="/faq"
                        className="flex h-11 w-full items-center justify-between rounded-xl border px-4 text-sm font-medium transition-colors hover:bg-primary/10"
                        style={{ borderColor: `${teal}40`, color: dark }}
                      >
                        <span className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4" style={{ color: teal }} />
                          FAQ
                        </span>
                        <ChevronRight className="h-4 w-4" style={{ color: `${dark}88` }} />
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link
                        href="/for-providers"
                        className="flex h-11 w-full items-center justify-between rounded-xl border px-4 text-sm font-medium transition-colors hover:bg-primary/10"
                        style={{ borderColor: `${teal}40`, color: dark }}
                      >
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" style={{ color: teal }} />
                          For Providers
                        </span>
                        <ChevronRight className="h-4 w-4" style={{ color: `${dark}88` }} />
                      </Link>
                    </SheetClose>

                    {user ? (
                      <SheetClose asChild>
                        <Link
                          href="/dashboard"
                          className="flex h-11 w-full items-center justify-between rounded-xl border px-4 text-sm font-medium transition-colors hover:bg-primary/10"
                          style={{ borderColor: `${teal}40`, color: dark }}
                        >
                          <span className="flex items-center gap-2">
                            <User className="h-4 w-4" style={{ color: teal }} />
                            Dashboard
                          </span>
                          <ChevronRight className="h-4 w-4" style={{ color: `${dark}88` }} />
                        </Link>
                      </SheetClose>
                    ) : (
                      <SheetClose asChild>
                        <Link
                          href="/auth/login"
                          className="flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold"
                          style={{ backgroundColor: teal, color: "#fff" }}
                        >
                          Provider Portal
                        </Link>
                      </SheetClose>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <Link href="/cities" className="text-sm font-medium" style={{ color: dark }}>Browse Cities</Link>
            <Link href="/counties" className="text-sm font-medium" style={{ color: dark }}>Browse Counties</Link>
            <Link href="/jobs" className="text-sm font-medium" style={{ color: dark }}>Jobs</Link>
            <Link href="/faq" className="text-sm font-medium" style={{ color: dark }}>FAQ</Link>
            <Link href="/for-providers" className="text-sm font-medium" style={{ color: dark }}>For Providers</Link>
            <Button size="sm" className="rounded-full px-5 font-bold" style={{ background: pink, color: "#fff" }} asChild>
              <Link href="/daycares"><Search className="mr-1.5 h-3.5 w-3.5" />Find a Daycare</Link>
            </Button>
            {user ? (
              <Button size="sm" variant="outline" className="rounded-full px-4 font-medium" style={{ borderColor: teal, color: dark }} asChild>
                <Link href="/dashboard"><User className="mr-1.5 h-3.5 w-3.5" />Dashboard</Link>
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="rounded-full px-4 font-medium" style={{ borderColor: teal, color: dark }} asChild>
                <Link href="/auth/login">Provider Portal</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
