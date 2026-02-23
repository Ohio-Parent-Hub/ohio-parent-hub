"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, House, MapPin, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const teal = "#7EA8A4";
const pink = "#E8A0AC";
const cream = "#F5EDE4";
const dark = "#4A6B67";

export default function SiteHeader() {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsSticky(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`z-40 backdrop-blur-xl transition-shadow ${isSticky ? "sticky top-0 shadow-sm" : "relative"}`}
      style={{ background: `${cream}ee` }}
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
              <SheetContent side="right" className="w-[300px] sm:w-[340px] px-0">
                <SheetHeader className="px-6 pb-4 text-left">
                  <SheetTitle style={{ color: dark }}>Menu</SheetTitle>
                  <p className="text-sm" style={{ color: `${dark}aa` }}>
                    Quick navigation
                  </p>
                </SheetHeader>
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
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <Link href="/cities" className="text-sm font-medium" style={{ color: dark }}>Browse Cities</Link>
            <Button size="sm" className="rounded-full px-5 font-bold" style={{ background: pink, color: "#fff" }} asChild>
              <Link href="/daycares"><Search className="mr-1.5 h-3.5 w-3.5" />Find a Daycare</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}