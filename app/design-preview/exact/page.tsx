import Link from "next/link";
import fs from "node:fs";
import path from "node:path";

import { Search, ClipboardList, SearchCheck, BookOpenText } from "lucide-react";

import s from "./preview.module.css";

type DaycareRow = Record<string, string>;

function loadDaycares(): DaycareRow[] {
  const p = path.join(process.cwd(), "data", "daycares.json");
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

/* 4-point sparkle star */
function Star({ className }: { className?: string }) {
  return <span className={`${s.star} ${className ?? ""}`} aria-hidden="true" />;
}

export default function ExactDesignPreviewPage() {
  const daycares = loadDaycares();
  const cityCount = new Set(daycares.map((d) => d.CITY).filter(Boolean)).size;

  return (
    <main className={s.page}>
      {/* ─── HERO ─── */}
      <section className={s.hero}>
        {/* organic background blobs */}
        <div className={s.blobTR} aria-hidden="true" />
        <div className={s.blobBL} aria-hidden="true" />

        {/* scattered sparkle stars */}
        <Star className={s.ds1} />
        <Star className={s.ds2} />
        <Star className={s.ds3} />
        <Star className={s.ds4} />
        <Star className={s.ds5} />
        <Star className={s.ds6} />
        <Star className={s.ds7} />
        <Star className={s.ds8} />
        <Star className={s.ds9} />

        {/* pill badge */}
        <div className={s.pill}>
          <span className={s.pillEmoji}>✨</span> Ohio&apos;s Trusted Parent Resource
        </div>

        {/* main title */}
        <h1 className={s.heading}>
          <Star className={s.titleStarL} />
          Finding Childcare
          <Star className={s.titleStarR} />
          <br />
          <Star className={s.titleStarL2} />
          Should <em className={s.headingAccent}>Feel Easy.</em>
        </h1>

        {/* subtitle */}
        <p className={s.sub}>
          Browse <strong>{daycares.length.toLocaleString()} licensed</strong> programs across{" "}
          <strong>{cityCount}</strong> Ohio cities — all in one place.
        </p>

        {/* buttons */}
        <div className={s.ctas}>
          <Link href="/daycares" className={`${s.btn} ${s.btnFill}`}>
            <Search className={s.btnIco} /> Find Childcare
          </Link>
          <Link href="/cities" className={`${s.btn} ${s.btnRing}`}>
            Browse by City
          </Link>
        </div>

        {/* stat cards row */}
        <div className={s.stats}>
          <div className={`${s.stat} ${s.statMint}`}>
            <Star className={s.cStar} />
            <div className={s.statNum}>{daycares.length.toLocaleString()}</div>
            <div className={s.statLbl}>Programs</div>
          </div>

          <Star className={s.betweenStar1} />

          <div className={`${s.stat} ${s.statBlush}`}>
            <Star className={s.cStar} />
            <div className={s.statNum}>{cityCount}</div>
            <div className={s.statLbl}>Cities</div>
          </div>

          <Star className={s.betweenStar2} />

          <div className={`${s.stat} ${s.statGold}`}>
            <Star className={s.cStar} />
            <div className={s.statNum}>100%</div>
            <div className={s.statLbl}>Licensed</div>
          </div>

          <Star className={s.betweenStar3} />

          <div className={`${s.stat} ${s.statSage}`}>
            <Star className={s.cStar} />
            <div className={s.statNum}>Always</div>
            <div className={s.statLbl}>Free</div>
          </div>
        </div>
      </section>

      {/* ─── WHY PARENTS LOVE US ─── */}
      <section className={s.loveSection}>
        <div className={s.loveHeadRow}>
          <Star className={s.hStarL} />
          <h2 className={s.loveH2}>Why Ohio Parents Love Us</h2>
          <Star className={s.hStarR} />
        </div>

        <div className={s.features}>
          <article className={`${s.feat} ${s.featMint}`}>
            <div className={s.featBubble}><ClipboardList className={s.featIco} /></div>
            <h3 className={s.featTitle}>Official State Data</h3>
            <p className={s.featDesc}>We use real licensing records—not crowdsourced listings.</p>
          </article>

          <article className={`${s.feat} ${s.featBlush}`}>
            <div className={s.featBubble}><SearchCheck className={s.featIco} /></div>
            <h3 className={`${s.featTitle} ${s.featTitleBlush}`}>Simple, Clean Search</h3>
            <p className={s.featDesc}>Find programs in seconds.</p>
          </article>

          <article className={`${s.feat} ${s.featGold}`}>
            <div className={s.featBubble}><BookOpenText className={s.featIco} /></div>
            <h3 className={`${s.featTitle} ${s.featTitleGold}`}>Growing Parent Resource Hub</h3>
            <p className={s.featDesc}>Soon: gear guides, books checklists &amp; more.</p>
          </article>
        </div>
      </section>
    </main>
  );
}