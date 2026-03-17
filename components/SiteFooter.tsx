import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";

const teal = "#7EA8A4";
const cream = "#F5EDE4";
const dark = "#4A6B67";

export default function SiteFooter() {
  return (
    <footer style={{ background: "#fff" }}>
      <div
        className="border-y px-6 py-3"
        style={{
          borderColor: `${teal}33`,
          background: "linear-gradient(180deg, rgba(126,168,164,0.18) 0%, rgba(126,168,164,0.10) 100%)",
          boxShadow: "inset 0 -1px 0 rgba(126,168,164,0.15), inset 0 1px 0 rgba(255,255,255,0.6)",
        }}
      >
        <nav
          className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[13px] font-semibold uppercase tracking-wide"
          style={{ color: `${dark}cc` }}
          aria-label="Trust footer menu"
        >
          <Link href="/about" className="transition-opacity hover:opacity-75">About</Link>
          <Link href="/contact" className="transition-opacity hover:opacity-75">Contact</Link>
          <Link href="/faq" className="transition-opacity hover:opacity-75">FAQ</Link>
          <Link href="/methodology" className="transition-opacity hover:opacity-75">Methodology</Link>
          <Link href="/for-providers" className="transition-opacity hover:opacity-75">For Providers</Link>
        </nav>
      </div>

      <div className="px-6 pb-12 pt-4">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 text-center">
          <Image src="/icon.png" alt="Ohio Parent Hub" width={48} height={48} className="rounded-xl shadow-sm" />
          <p className="font-serif text-lg font-bold" style={{ color: teal }}>Ohio Parent Hub</p>

          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium" style={{ color: `${dark}88` }}>
            <Link href="/daycares">Find Daycares</Link>
            <Link href="/cities">Cities</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>

          <div className="flex items-center gap-1 text-sm" style={{ color: `${dark}50` }}>
            Made with <Heart className="mx-1 h-3.5 w-3.5" style={{ color: "#E8A0AC" }} /> for Ohio families
          </div>
        </div>
      </div>
    </footer>
  );
}
