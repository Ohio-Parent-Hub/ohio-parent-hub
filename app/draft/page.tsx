import Link from "next/link";
import Image from "next/image";

/* =========================================================
   DRAFT INDEX — Navigate all 10 homepage design options
   ========================================================= */

const options = [
  {
    id: 1,
    name: "Midnight Modern",
    category: "Custom Theme",
    desc: "Dark navy with electric blue + amber. Full-width dark hero, glowing stat cards, floating particle decoration. Sleek and modern.",
    colors: ["#0F172A", "#3B82F6", "#F59E0B", "#1E293B"],
  },
  {
    id: 2,
    name: "Sunrise Warm",
    category: "Custom Theme",
    desc: "Earthy editorial magazine layout. Centered masthead nav, terracotta hero band, numbered feature text blocks on olive, 2-column city list on sand.",
    colors: ["#C2714F", "#6B7C5E", "#4A3728", "#E8D9C5"],
  },
  {
    id: 3,
    name: "Ocean Breeze",
    category: "Custom Theme",
    desc: "Coastal split hero (text left, circle stats right), wavy SVG dividers between sections, masonry city grid on deep blue. Fresh and unique.",
    colors: ["#1B4965", "#7FBFB5", "#E8756D", "#F5E6D3"],
  },
  {
    id: 4,
    name: "Garden Party",
    category: "Custom Theme",
    desc: "Sticky sidebar nav on left, single scrolling content column. Botanical greens + floral pinks, alternating-row city list. App-like feel.",
    colors: ["#2D5016", "#D4577A", "#D4A843", "#4A7C28"],
  },
  {
    id: 5,
    name: "Candy Pop",
    category: "Custom Theme",
    desc: "Entire page is a colorful bento grid on dark background. Memphis-style geometric tiles, stat blocks, city tiles. Playful and bold.",
    colors: ["#FF1493", "#0EA5E9", "#FACC15", "#84CC16"],
  },
  {
    id: 6,
    name: "WS: Minimalist Zen",
    category: "Wonder Skies Variation",
    desc: "Same palette, ultra-minimal. Massive whitespace, thin lines, text-only links, sparse decoration.",
    colors: ["#7EA8A4", "#E8A0AC", "#DCB346", "#B8C5B2"],
  },
  {
    id: 7,
    name: "WS: Retro Groovy",
    category: "Wonder Skies Variation",
    desc: "Same palette, 70s-inspired. Oversized rounded shapes, chunky borders, bold color blocking.",
    colors: ["#7EA8A4", "#E8A0AC", "#DCB346", "#B8C5B2"],
  },
  {
    id: 8,
    name: "WS: Editorial Magazine",
    category: "Wonder Skies Variation",
    desc: "Same palette, editorial. Full-width color sections, oversized typography, asymmetric grids.",
    colors: ["#7EA8A4", "#E8A0AC", "#DCB346", "#4A6B67"],
  },
  {
    id: 9,
    name: "WS: Storybook Illustrated",
    category: "Wonder Skies Variation",
    desc: "Same palette, children's book feel. Wavy section dividers, layered pastels, sparkle decorations.",
    colors: ["#7EA8A4", "#E8A0AC", "#DCB346", "#F8D7DA"],
  },
  {
    id: 10,
    name: "Screenshot-Inspired",
    category: "Reference Design",
    desc: "Based on the attached screenshot. Rounded pastel stat cards, pill city buttons, illustrated icon cards, sparkles.",
    colors: ["#7EA8A4", "#E8A0AC", "#DCB346", "#B8C5B2"],
  },
  {
    id: 11,
    name: "Best-Of Hybrid",
    category: "Hybrid",
    desc: "Combines: Zen whitespace + Storybook wavy dividers/sparkles + Screenshot stat cards, pill cities, and resource section. The best of 6 + 9 + 10.",
    colors: ["#7EA8A4", "#E8A0AC", "#DCB346", "#B8C5B2"],
  },
];

export default function DraftIndex() {
  return (
    <div className="min-h-screen" style={{ background: "#F5EDE4", color: "#4A6B67" }}>
      {/* Header */}
      <header className="px-6 py-16 text-center" style={{ background: "#7EA8A4" }}>
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex justify-center">
            <Image src="/icon.png" alt="Ohio Parent Hub" width={80} height={80} className="rounded-xl shadow-lg" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl">Homepage Design Options</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/80 leading-relaxed">
            10 unique directions for the Ohio Parent Hub homepage. Click any option to see the full-page preview. None of these touch your actual homepage.
          </p>
          <Link href="/" className="mt-6 inline-block rounded-full border-2 border-white/40 px-6 py-2 text-sm font-bold text-white/90 transition-colors hover:bg-white/10">
            &larr; Back to Current Homepage
          </Link>
        </div>
      </header>

      {/* Grid of options */}
      <main className="mx-auto max-w-6xl px-6 py-16">
        {/* Section: Custom Themes */}
        <div className="mb-4">
          <span className="inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest" style={{ background: "#DCB346", color: "#fff" }}>
            5 Custom Themes (My Choice)
          </span>
        </div>
        <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {options.filter((o) => o.category === "Custom Theme").map((opt) => (
            <Link key={opt.id} href={`/draft/option-${opt.id}`} className="group block">
              <div className="flex h-full flex-col rounded-2xl border-2 bg-white p-6 shadow-sm transition-all group-hover:-translate-y-1 group-hover:shadow-lg" style={{ borderColor: "#B8C5B230" }}>
                {/* Color swatches */}
                <div className="mb-4 flex gap-2">
                  {opt.colors.map((c) => (
                    <div key={c} className="h-8 w-8 rounded-full shadow-sm" style={{ background: c }} />
                  ))}
                </div>
                <div className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color: "#E8A0AC" }}>Option {opt.id}</div>
                <h2 className="mb-2 font-serif text-xl font-bold" style={{ color: "#4A6B67" }}>{opt.name}</h2>
                <p className="text-sm leading-relaxed" style={{ color: "#4A6B6799" }}>{opt.desc}</p>
                <div className="mt-auto pt-4 text-xs font-bold" style={{ color: "#7EA8A4" }}>
                  {"View full page \u2192"}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Section: Wonder Skies Variations */}
        <div className="mb-4">
          <span className="inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest" style={{ background: "#7EA8A4", color: "#fff" }}>
            4 Wonder Skies Variations
          </span>
        </div>
        <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {options.filter((o) => o.category === "Wonder Skies Variation").map((opt) => (
            <Link key={opt.id} href={`/draft/option-${opt.id}`} className="group block">
              <div className="flex h-full flex-col rounded-2xl border-2 bg-white p-6 shadow-sm transition-all group-hover:-translate-y-1 group-hover:shadow-lg" style={{ borderColor: "#7EA8A430" }}>
                <div className="mb-4 flex gap-2">
                  {opt.colors.map((c, i) => (
                    <div key={`${c}-${i}`} className="h-8 w-8 rounded-full shadow-sm" style={{ background: c }} />
                  ))}
                </div>
                <div className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color: "#DCB346" }}>Option {opt.id}</div>
                <h2 className="mb-2 font-serif text-lg font-bold" style={{ color: "#4A6B67" }}>{opt.name}</h2>
                <p className="text-sm leading-relaxed" style={{ color: "#4A6B6799" }}>{opt.desc}</p>
                <div className="mt-auto pt-4 text-xs font-bold" style={{ color: "#7EA8A4" }}>
                  {"View full page \u2192"}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Section: Screenshot-Inspired */}
        <div className="mb-4">
          <span className="inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest" style={{ background: "#E8A0AC", color: "#fff" }}>
            1 Screenshot-Inspired Design
          </span>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {options.filter((o) => o.category === "Reference Design").map((opt) => (
            <Link key={opt.id} href={`/draft/option-${opt.id}`} className="group block">
              <div className="flex h-full flex-col rounded-2xl border-2 bg-white p-6 shadow-sm transition-all group-hover:-translate-y-1 group-hover:shadow-lg" style={{ borderColor: "#E8A0AC30" }}>
                <div className="mb-4 flex gap-2">
                  {opt.colors.map((c, i) => (
                    <div key={`${c}-${i}`} className="h-8 w-8 rounded-full shadow-sm" style={{ background: c }} />
                  ))}
                </div>
                <div className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color: "#E8A0AC" }}>Option {opt.id}</div>
                <h2 className="mb-2 font-serif text-xl font-bold" style={{ color: "#4A6B67" }}>{opt.name}</h2>
                <p className="text-sm leading-relaxed" style={{ color: "#4A6B6799" }}>{opt.desc}</p>
                <div className="mt-auto pt-4 text-xs font-bold" style={{ color: "#7EA8A4" }}>
                  {"View full page \u2192"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-sm" style={{ color: "#4A6B6760" }}>
        Draft previews only. Your real homepage at <Link href="/" className="underline">/</Link> is untouched.
      </footer>
    </div>
  );
}
