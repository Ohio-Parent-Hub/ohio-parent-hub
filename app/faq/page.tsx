import Link from "next/link";
import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { resolveCanonicalCityName } from "@/lib/metroAreas";

function SparkleDecor({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M12 0L13.5 9L24 12L13.5 15L12 24L10.5 15L0 12L10.5 9L12 0Z" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about Ohio Parent Hub, how listings work, what SUTQ ratings mean, and how to find the right child care in Ohio.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "Frequently Asked Questions | Ohio Parent Hub",
    description: "Answers to common questions about Ohio Parent Hub, how listings work, what SUTQ ratings mean, and how to find the right child care in Ohio.",
    url: "https://ohioparenthub.com/faq",
    siteName: "Ohio Parent Hub",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Ohio Parent Hub FAQ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Frequently Asked Questions | Ohio Parent Hub",
    description: "Answers to common questions about Ohio Parent Hub, how listings work, what SUTQ ratings mean, and how to find the right child care in Ohio.",
    images: ["/og-default.png"],
  },
};

const teal = "#7EA8A4";
const pink = "#E8A0AC";
const gold = "#DCB346";
const sage = "#B8C5B2";
const cream = "#F5EDE4";
const dark = "#4A6B67";
const lightTeal = "#D5E5E3";
const lightPink = "#FADED4";
const lightGold = "#F5E9BE";

type FaqEntry = {
  question: string;
  schemaAnswer: string;
  answer: ReactNode;
};

const faqs: FaqEntry[] = [
  {
    question: "What is SUTQ and what do Gold, Silver, and Bronze ratings mean?",
    schemaAnswer:
      "SUTQ stands for Step Up To Quality, Ohio's voluntary tiered quality rating system administered by the Ohio Department of Children and Youth (DCY). It has three levels — Bronze (entry), Silver (intermediate), and Gold (highest) — covering curriculum, developmental screening, staff qualifications, and family partnerships. Not Rated means the provider has not enrolled in the voluntary program; it does not mean the provider is unlicensed or unsafe.",
    answer: (
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
        <p>
          SUTQ stands for <strong style={{ color: dark }}>Step Up To Quality</strong>, Ohio&apos;s voluntary tiered quality rating and improvement system administered by the Ohio Department of Children and Youth (DCY). It recognizes licensed child care programs that go above and beyond baseline licensing requirements to deliver higher-quality early learning experiences.
        </p>
        <p>SUTQ has three levels — each building on the one below — spanning four quality areas: curriculum and child assessment, developmental screening, staff qualifications and professional development, and family and community partnerships.</p>
        <div className="space-y-2">
          <p><strong style={{ color: dark }}>🥉 Bronze — Entry Level</strong><br />Providers must implement a research-based curriculum, administer developmental screenings, complete annual self-assessments, and meet minimum staff education and training thresholds.</p>
          <p><strong style={{ color: dark }}>🥈 Silver — Intermediate</strong><br />Everything in Bronze, plus: formal twice-yearly child assessments shared with families, an on-site administrator with an Associate&apos;s Degree or CPL Level 3 or higher, and Ohio Classroom Observation Tool (OCOT) reviews conducted by DCY staff.</p>
          <p><strong style={{ color: dark }}>🥇 Gold — Highest Level</strong><br />Everything in Silver, plus: assessment-driven lesson planning, 50% of lead teachers holding an AA or CPL Level 3, two family educational events per year, and — for Child Care Centers — 40% of classrooms meeting enhanced staff-to-child ratios stricter than licensing minimums.</p>
        </div>
        <p><strong style={{ color: dark }}>Not Rated</strong> simply means the provider hasn&apos;t enrolled in the voluntary SUTQ program — not that they&apos;re unlicensed or unsafe.</p>
        <p>
          Ohio also offers a free{" "}
          <a href="https://sutqcalculator.childrenandyouth.ohio.gov/" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" style={{ color: teal }}>SUTQ Cost Estimator</a>{" "}
          that estimates child care costs by SUTQ rating level and county — useful for comparing what higher-rated care might cost in your area.
        </p>
        <p className="text-xs" style={{ color: `${dark}66` }}>
          Source:{" "}
          <a href="https://codes.ohio.gov/assets/laws/administrative-code/authenticated/5101/2/17/5101$2-17-01_20240707.pdf" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Ohio Admin Code 5101:2-17-01 (PDF)</a>{" "}|{" "}
          <a href="https://dam.assets.ohio.gov/image/upload/v1720197348/childrenandyouth.ohio.gov/For%20Providers/SUTQ/Appendix_A_to_rule_2-17-01_20240517.pdf" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Appendix A (PDF)</a>{" "}|{" "}
          <a href="https://childrenandyouth.ohio.gov/for-providers/step-up-to-quality/step-up-to-quality" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Ohio DCY — Step Up To Quality</a>
        </p>
      </div>
    ),
  },
  {
    question: "Are all daycares listed on Ohio Parent Hub licensed by the state?",
    schemaAnswer:
      "Yes. Every provider listed on Ohio Parent Hub is sourced from Ohio's official state licensing database maintained by the Ohio Department of Children and Youth (DCY). All providers must pass initial inspections and are subject to ongoing compliance reviews. To verify current license status and inspection history, visit Ohio's Child Care Search at childcaresearch.ohio.gov.",
    answer: (
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
        <p>
          Yes. Every provider listed on Ohio Parent Hub is sourced from Ohio&apos;s official state licensing database maintained by the <strong style={{ color: dark }}>Ohio Department of Children and Youth (DCY)</strong>. Operating a child care program in Ohio without a license or registration is illegal in virtually all circumstances.
        </p>
        <p>
          Ohio law requires licensure for any facility serving seven or more children, or four or more unrelated children in a home setting. All providers must pass initial inspections covering health and safety, staffing ratios, background checks, and physical environment — and are subject to ongoing compliance reviews to maintain their license.
        </p>
        <p>
          To verify a provider&apos;s current license status, view inspection history, and check for any violations or complaints, visit{" "}
          <a href="https://childcaresearch.ohio.gov" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" style={{ color: teal }}>
            Ohio&apos;s Child Care Search
          </a>{" "}
          directly.
        </p>
        <p className="text-xs" style={{ color: `${dark}66` }}>
          Source:{" "}
          <a href="https://childcaresearch.ohio.gov" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Ohio Department of Children and Youth — Child Care Search</a>
        </p>
      </div>
    ),
  },
  {
    question: "What are the different types of child care providers in Ohio?",
    schemaAnswer:
      "Ohio licenses or certifies seven distinct child care provider types. Licensed Child Care Centers operate in non-residential buildings and serve larger groups across multiple age rooms. Licensed Type A Family Child Care Homes are fully licensed home programs serving up to 12 children with an assistant. Licensed Type B Family Child Care Homes are registered home programs serving up to six children in the provider's residence. Licensed School-Age Child Care programs serve school-age children before and after school or during breaks. Licensed School-Based Preschool programs operate within a school building and serve preschool-age children. Certified In Home Aides provide care in the child's own home rather than a facility or the provider's home. Registered Day Camps and Approved Day Camps offer structured daytime programming during summer and school breaks. Ohio Parent Hub lists all seven types — you can filter by program type on any city or county page.",
    answer: (
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
        <p>Ohio licenses, registers, or certifies seven distinct child care provider types. Here&apos;s what each one means:</p>
        <div className="space-y-4">
          <div>
            <p className="font-semibold" style={{ color: dark }}>Licensed Child Care Center</p>
            <p>A licensed facility operating in a non-residential building. Centers serve larger groups across multiple age rooms and must meet strict requirements for physical space, group sizes, staff-to-child ratios, and director qualifications. Most offer full-day, year-round programming across infant, toddler, preschool, and school-age rooms.</p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: dark }}>Licensed Type A Family Child Care Home</p>
            <p>A fully licensed home-based program that can serve up to 12 children (including the provider&apos;s own) with an assistant present. Type A homes must meet requirements similar in rigor to a Child Care Center — full DCY licensing, inspections, and staffing standards — but operate in a residential setting.</p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: dark }}>Licensed Type B Family Child Care Home</p>
            <p>A registered home program where the provider cares for up to six children in their own private residence. Type B providers register with DCY and must meet state health and safety standards, but registration is somewhat less intensive than a full license.</p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: dark }}>Licensed School-Age Child Care</p>
            <p>Programs specifically designed to serve school-age children (typically kindergarten through age 14) outside of school hours — before school, after school, and during breaks. Often located in or near a school building.</p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: dark }}>Licensed School-Based Preschool</p>
            <p>Early childhood programs that operate within a school building and serve preschool-age children (typically ages 3–5). Subject to DCY licensing in addition to any school district oversight.</p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: dark }}>Certified In Home Aide</p>
            <p>A caregiver who provides child care in the child&apos;s own home rather than in a center or the provider&apos;s residence. Certified by DCY, this arrangement is common for families using Ohio&apos;s Publicly Funded Child Care (PFCC) assistance program.</p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: dark }}>Registered Day Camp / Approved Day Camp</p>
            <p>Structured daytime programs offered during summer or school breaks. Day camps must register or seek approval from DCY and meet health and safety requirements, but differ from year-round child care in scope and operation.</p>
          </div>
        </div>
        <p>
          Ohio Parent Hub lists all seven types. Use the{" "}
          <Link href="/daycares" className="underline hover:no-underline" style={{ color: teal }}>
            program type filter
          </Link>{" "}
          on any city or county page to narrow results to the setting that fits your family.
        </p>
        <p className="text-xs" style={{ color: `${dark}66` }}>
          Source:{" "}
          <a href="https://childrenandyouth.ohio.gov/for-families/early-care-education/child-care" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Ohio Department of Children and Youth — Child Care for Families</a>
        </p>
      </div>
    ),
  },
  {
    question: "How do I find infant care specifically in my city?",
    schemaAnswer:
      "Use the city search pages on Ohio Parent Hub to browse all licensed providers in your area. Filter by program type and contact providers directly to ask about infant room openings and waitlists. Infant care is the hardest age group to place — starting your search several months early is strongly recommended. Ohio licensing requires a maximum 1:5 infant-to-caregiver ratio for licensed centers.",
    answer: (
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
        <p>
          Use the{" "}
          <Link href="/cities" className="underline hover:no-underline" style={{ color: teal }}>
            city search pages
          </Link>{" "}
          on Ohio Parent Hub to browse all licensed providers in your area. Each city page lists every licensed center and home provider, along with program type and SUTQ rating.
        </p>
        <p>When you contact a provider, ask specifically:</p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>Do you have openings in the infant room (children under 12 months)?</li>
          <li>What is your infant-to-caregiver ratio? (Ohio licensing requires a maximum of 1:5 for centers)</li>
          <li>Is there a waitlist, and how far in advance should I apply?</li>
        </ul>
        <p>Infant care is often the hardest age group to place. Starting your search early — ideally several months before you need care — is strongly recommended.</p>
        <p className="text-xs" style={{ color: `${dark}66` }}>
          Source:{" "}
          <a href="https://codes.ohio.gov/ohio-revised-code/section-5104.033" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Ohio Revised Code 5104.033</a>{" "}|{" "}
          <a href="https://codes.ohio.gov/ohio-administrative-code/rule-5180:2-12-18" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Ohio Administrative Code 5180:2-12-18</a>
        </p>
      </div>
    ),
  },
  {
    question: "Does a \"Not Rated\" SUTQ status mean a daycare is low quality?",
    schemaAnswer:
      "No. A Not Rated SUTQ status means the provider has not enrolled in Ohio's voluntary Step Up To Quality program — it does not indicate a safety concern or licensing problem. Every provider listed on Ohio Parent Hub must comply with Ohio's mandatory baseline licensing requirements regardless of SUTQ status. Many excellent providers choose not to participate due to administrative demands.",
    answer: (
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
        <p>
          <strong style={{ color: dark }}>No.</strong> A &ldquo;Not Rated&rdquo; SUTQ status means the provider has not enrolled in Ohio&apos;s voluntary Step Up To Quality program — it does not indicate a safety concern, a licensing problem, or substandard care.
        </p>
        <p>
          Every provider listed on Ohio Parent Hub must already comply with Ohio&apos;s mandatory baseline licensing requirements regardless of SUTQ status: background checks for all staff, health and safety inspections, required staff-to-child ratios, and annual continuing education obligations.
        </p>
        <p>
          SUTQ is an optional, additional layer of quality recognition. Many excellent, long-tenured providers choose not to participate due to the administrative demands of the process. When evaluating a &ldquo;Not Rated&rdquo; provider, review their inspection history on{" "}
          <a href="https://childcaresearch.ohio.gov" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" style={{ color: teal }}>
            Ohio&apos;s Child Care Search
          </a>
          , visit in person, and ask about staff qualifications and curriculum.
        </p>
        <p className="text-xs" style={{ color: `${dark}66` }}>
          Source:{" "}
          <a href="https://codes.ohio.gov/assets/laws/administrative-code/authenticated/5101/2/17/5101$2-17-01_20240707.pdf" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Ohio Administrative Code 5101:2-17-01 (PDF)</a>{" "}
          (SUTQ is explicitly a voluntary program)
        </p>
      </div>
    ),
  },
  {
    question: "How often is Ohio daycare licensing data updated?",
    schemaAnswer:
      "Ohio's Department of Children and Youth maintains its licensing database on a rolling basis, updating records as licensing actions occur. Ohio Parent Hub periodically refreshes its data from that state database. Because licensing status can change between update cycles, always verify a provider's current status directly through Ohio's Child Care Search before making any enrollment decision.",
    answer: (
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
        <p>
          Ohio&apos;s Department of Children and Youth maintains its licensing database on a rolling basis, updating records as licensing actions occur — including new licenses, renewals, inspections, violations, and closures.
        </p>
        <p>
          Ohio Parent Hub sources its data from that state licensing database and periodically refreshes its records. Because licensing status can change between our update cycles, we always recommend verifying a provider&apos;s current status directly through{" "}
          <a href="https://childcaresearch.ohio.gov" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" style={{ color: teal }}>
            Ohio&apos;s Child Care Search
          </a>{" "}
          before making any enrollment decision. That tool reflects the most current state records and includes recent inspection results.
        </p>
        <p className="text-xs" style={{ color: `${dark}66` }}>
          Source:{" "}
          <a href="https://childcaresearch.ohio.gov" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Ohio Department of Children and Youth — Child Care Search</a>
        </p>
      </div>
    ),
  },
  {
    question: "What should I ask when I visit or call a daycare in Ohio?",
    schemaAnswer:
      "Start with the basics: Do you have space for my child starting on [date]? What are your rates and fees? What are your hours? Do you accept state subsidy (PFCC) payments? Then ask about licensing, background checks, health and safety procedures, provider experience, CPR/First Aid certification, how providers interact with children, discipline approach, what a typical day looks like, and illness exclusion policies. For infants, also ask about safe sleep practices, feeding on demand vs. schedule, and caregiver interactions. For toddlers, ask about activities, how they handle challenging behavior, and potty training policies. For preschoolers, ask about kindergarten readiness. For school-agers, ask about coverage during school closures and homework help.",
    answer: (
      <div className="space-y-4 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
        <p>Choosing a child care provider is one of the most consequential decisions you&apos;ll make for your child. Here&apos;s a structured checklist — adapted from Child Care Aware of America — to guide your phone interview or in-person visit.</p>

        <div>
          <p className="font-semibold" style={{ color: dark }}>Start here (every provider)</p>
          <ul className="mt-1 list-disc list-inside space-y-1 pl-1">
            <li>Do you have space for my child starting on [date]?</li>
            <li>What are your rates? Are there additional fees (registration, supplies, meals)?</li>
            <li>What are your hours? What is your policy for closures and school holidays?</li>
            <li>Do you accept Ohio&apos;s Publicly Funded Child Care (PFCC) subsidy for families that qualify?</li>
            <li>What languages do providers speak?</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold" style={{ color: dark }}>Licensing and safety</p>
          <ul className="mt-1 list-disc list-inside space-y-1 pl-1">
            <li>Is your license current and in good standing with Ohio&apos;s Department of Children and Youth? When was your most recent inspection — were any health, safety, or supervision concerns found?</li>
            <li>Do all adults complete background checks before spending time with children?</li>
            <li>What steps do you take to prevent illness, injury, and missing children? Do you have a written emergency plan?</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold" style={{ color: dark }}>Staff qualifications</p>
          <ul className="mt-1 list-disc list-inside space-y-1 pl-1">
            <li>How much experience do your providers have caring for children my child&apos;s age?</li>
            <li>Are providers certified in infant/child CPR and First Aid?</li>
            <li>Do staff take regular trainings on child development, health and safety, and diversity and inclusion?</li>
            <li>What is your staff turnover rate? (High turnover is a significant red flag for quality)</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold" style={{ color: dark }}>Curriculum and daily life</p>
          <ul className="mt-1 list-disc list-inside space-y-1 pl-1">
            <li>What would a typical day look like for my child? Are activities geared toward children&apos;s interests and development?</li>
            <li>What kinds of interactions can I expect to see between providers and children throughout the day?</li>
            <li>How do you handle guidance and discipline at my child&apos;s age? Do you use positive guidance rather than punishment?</li>
            <li>What is your policy on screen time?</li>
            <li>What are your illness exclusion and behavioral exclusion policies?</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold" style={{ color: dark }}>Age-specific questions</p>
          <div className="mt-2 space-y-3 pl-1">
            <div>
              <p className="font-medium" style={{ color: `${dark}cc` }}>Infants (0–12 months)</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Is feeding, changing, and nap time based on each baby&apos;s individual needs, or a strict schedule? (On-demand is best practice)</li>
                <li>How do you ensure safe sleep? (Babies should be placed on their backs on a firm, flat surface — crib or pack-and-play — with no loose bedding)</li>
                <li>How do caregivers interact with babies throughout the day?</li>
              </ul>
            </div>
            <div>
              <p className="font-medium" style={{ color: `${dark}cc` }}>Toddlers (1–2 years)</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>How do providers handle challenging behavior at this age? (Big feelings are normal — discipline should teach, not punish)</li>
                <li>What steps do you take to create a safe environment for toddlers to explore?</li>
                <li>What is your potty training policy?</li>
              </ul>
            </div>
            <div>
              <p className="font-medium" style={{ color: `${dark}cc` }}>Preschoolers (3–4 years)</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>How will you help my child get ready for Kindergarten?</li>
                <li>Do children get to choose how they want to play, or do providers lead all activities? (Free play is best at this age)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium" style={{ color: `${dark}cc` }}>School-agers (5–12 years)</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Are you able to care for my child during school delays, closures, and holidays?</li>
                <li>What kinds of activities do you offer? Do you provide homework help?</li>
                <li>How do you support children when they face problems or disagreements with peers?</li>
              </ul>
            </div>
          </div>
        </div>

        <p>Trust your instincts during any in-person visit — a quality program will welcome your questions, feel organized and warm, and show genuine engagement between staff and children.</p>

        <p className="text-xs" style={{ color: `${dark}66` }}>
          Source:{" "}
          <a href="https://info.childcareaware.org/hubfs/2023-24%20Consumer%20Ed/Short%20Notice%20Checklist_English.pdf" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Child Care Aware of America — Choosing Quality Child Care on Short Notice (checklist)</a>
        </p>
      </div>
    ),
  },
  {
    question: "What is PFCC and why does it appear on some listings?",
    schemaAnswer:
      "PFCC stands for Publicly Funded Child Care, an Ohio program that helps eligible families afford licensed child care using federal and state funds administered by the Ohio Department of Children and Youth. A PFCC Agreement on a listing means that provider has a signed agreement with their county Department of Job and Family Services to accept PFCC reimbursements as payment. Eligibility is based on family income and work or school participation — contact your county Department of Job and Family Services to apply.",
    answer: (
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
        <p>
          <strong style={{ color: dark }}>PFCC stands for Publicly Funded Child Care</strong>, an Ohio program that helps eligible families afford licensed child care using federal Child Care and Development Fund (CCDF) money combined with state funds, distributed through the Ohio Department of Children and Youth.
        </p>
        <p>
          When a listing on Ohio Parent Hub shows a <strong style={{ color: dark }}>PFCC Agreement</strong>, it means that provider has a signed agreement with their county Department of Job and Family Services to accept PFCC reimbursements as payment. In practical terms: if your family qualifies for child care financial assistance, you can use that benefit at any provider who holds a PFCC Agreement.
        </p>
        <p>
          Eligibility is based on family income, work or school participation, and other factors. To apply, contact your county Department of Job and Family Services — each county administers the program locally.
        </p>
        <p className="text-xs" style={{ color: `${dark}66` }}>
          Source:{" "}
          <a href="https://childrenandyouth.ohio.gov/for-providers/resources/pfcc" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Ohio DCY — Publicly Funded Child Care</a>
        </p>
      </div>
    ),
  },
  {
    question: "How do I find daycares near me in Ohio that have openings?",
    schemaAnswer:
      "Use the location search on any Ohio Parent Hub page — enter your city or ZIP code to see all licensed providers nearby. Because Ohio Parent Hub does not collect real-time seat availability, contact providers directly to confirm openings for your child's age group. Ask about waitlists, consider expanding your search radius to nearby cities, and ask whether providers accept PFCC assistance if cost is a concern.",
    answer: (
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
        <p>
          Use the location search at the top of any page on Ohio Parent Hub — enter your city or ZIP code to see all licensed providers nearby, with ratings, program types, and contact information.
        </p>
        <p>Because Ohio Parent Hub does not collect real-time seat availability from providers, the fastest path to confirming openings is:</p>
        <ol className="list-decimal list-inside space-y-1 pl-1">
          <li>
            Use our{" "}
            <Link href="/cities" className="underline hover:no-underline" style={{ color: teal }}>
              city
            </Link>{" "}
            or{" "}
            <Link href="/counties" className="underline hover:no-underline" style={{ color: teal }}>
              county
            </Link>{" "}
            pages to identify nearby licensed providers
          </li>
          <li>Call or email providers directly and ask about current availability for your child&apos;s age group</li>
          <li>Ask about waitlists — many high-quality centers maintain them, and getting on a list early is often the best strategy, especially for infants</li>
          <li>Expand your search radius — nearby cities often have available providers you wouldn&apos;t otherwise find</li>
        </ol>
        <p>If cost is a concern, also ask whether the provider accepts PFCC (Publicly Funded Child Care), which can significantly expand your affordable options.</p>
        <p className="text-xs" style={{ color: `${dark}66` }}>
          Source:{" "}
          <a href="https://childcaresearch.ohio.gov" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Ohio Department of Children and Youth — Child Care Search</a>
        </p>
      </div>
    ),
  },
  {
    question: "What is the average cost of daycare in Ohio?",
    schemaAnswer:
      "According to the Economic Policy Institute (data updated February 2025), the average annual cost of infant care in Ohio is $17,071 (approximately $1,423/month), and care for a 4-year-old averages $13,426/year. Ohio ranks as the 16th most expensive state for infant care in the U.S. Costs vary by provider type, location, and hours. Ohio Parent Hub does not collect pricing — contact providers directly. Ohio's PFCC program may help eligible families offset expenses.",
    answer: (
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
        <p>Ohio child care costs are among the highest in the nation. According to data from the Economic Policy Institute (updated February 2025):</p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li><strong style={{ color: dark }}>Average annual cost of infant care in Ohio: $17,071</strong> — approximately $1,423/month</li>
          <li><strong style={{ color: dark }}>Average annual cost for a 4-year-old: $13,426</strong> — approximately $1,119/month</li>
          <li>Ohio ranks as the <strong style={{ color: dark }}>16th most expensive state</strong> for infant care in the U.S.</li>
          <li>Infant care in Ohio costs <strong style={{ color: dark }}>53.7% more per year</strong> than in-state college tuition</li>
        </ul>
        <p>Costs vary by provider type, location, and hours of care. Home-based Type B providers are typically less expensive than licensed Child Care Centers. Urban areas like Columbus, Cleveland, and Cincinnati tend to run higher than rural communities.</p>
        <p>Ohio Parent Hub does not collect individual pricing from providers — tuition is set independently by each program and changes regularly. Contact providers directly using the information on their listing pages for current rates.</p>
        <p>
          Ohio offers a free{" "}
          <a href="https://sutqcalculator.childrenandyouth.ohio.gov/" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" style={{ color: teal }}>SUTQ Cost Estimator</a>{" "}
          that estimates child care costs by SUTQ rating level and county — a useful starting point for understanding what to budget in your area.
        </p>
        <p>If cost is a barrier, Ohio&apos;s <strong style={{ color: dark }}>Publicly Funded Child Care (PFCC)</strong> program may help eligible families offset expenses. Contact your county Department of Job and Family Services to apply.</p>
        <p className="text-xs" style={{ color: `${dark}66` }}>
          Source:{" "}
          <a href="https://www.epi.org/child-care-costs-in-the-united-states/#/OH" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Economic Policy Institute — Child Care Costs in the United States (Ohio)</a>{" "}
          (data updated February 2025)
        </p>
      </div>
    ),
  },
];

export default function FaqPage() {
  const daycares: Record<string, string>[] = (() => {
    const p = path.join(process.cwd(), "data", "daycares.json");
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p, "utf8"));
  })();

  const totalPrograms = daycares.length;
  const totalCities = new Set(
    daycares.map((d) => resolveCanonicalCityName(d["CITY"] || "")).filter(Boolean)
  ).size;
  const goldRated = daycares.filter((d) => (d["SUTQ RATING"] || "").trim() === "3").length;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, schemaAnswer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: schemaAnswer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
        }}
      />

      <div className="min-h-screen" style={{ background: cream, color: dark }}>
        {/* Hero */}
        <section className="relative overflow-hidden px-6 pt-8 pb-12" style={{ background: lightTeal }}>
          <SparkleDecor className="absolute left-[6%] top-10 h-5 w-5 opacity-30" style={{ color: gold }} />
          <SparkleDecor className="absolute right-[10%] top-16 h-4 w-4 opacity-30" style={{ color: pink }} />
          <SparkleDecor className="absolute left-[14%] bottom-10 h-4 w-4 opacity-20" style={{ color: teal }} />

          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full" style={{ background: `${pink}20` }} />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full" style={{ background: `${gold}20` }} />

          <div className="relative z-10 mx-auto max-w-7xl">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "FAQ", href: "/faq" },
              ]}
              className="mb-6"
            />

            <div className="grid gap-8 lg:grid-cols-5 lg:items-end">
              <div className="lg:col-span-3">
                <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: dark }}>
                  Frequently Asked Questions
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{ color: `${dark}bb` }}>
                  Common questions about Ohio Parent Hub, how listings work, and how to find the right child care for your family.
                </p>
                <div className="mt-5 flex flex-wrap gap-3 text-sm font-medium" style={{ color: `${dark}dd` }}>
                  <Link href="/daycares" className="rounded-full border px-3 py-1.5" style={{ borderColor: `${teal}55` }}>
                    Find daycares
                  </Link>
                  <Link href="/methodology" className="rounded-full border px-3 py-1.5" style={{ borderColor: `${teal}55` }}>
                    View methodology
                  </Link>
                  <Link href="/contact" className="rounded-full border px-3 py-1.5" style={{ borderColor: `${teal}55` }}>
                    Ask a question
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-3 gap-3">
                {[
                  { value: totalPrograms.toLocaleString(), label: "Licensed Programs", bg: "#FFFFFF", accent: teal },
                  { value: totalCities.toLocaleString(), label: "Cities Covered", bg: lightPink, accent: pink },
                  { value: goldRated.toLocaleString(), label: "Gold SUTQ", bg: lightGold, accent: gold },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border p-4 shadow-sm"
                    style={{ background: stat.bg, borderColor: `${stat.accent}40` }}
                  >
                    <div className="font-serif text-2xl font-bold" style={{ color: stat.accent }}>
                      {stat.value}
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-widest" style={{ color: `${dark}88` }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ list */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-3xl">
            <div className="space-y-4">
              {faqs.map(({ question, answer }) => (
                <details
                  key={question}
                  className="group rounded-2xl border shadow-sm"
                  style={{ background: "#fff", borderColor: `${sage}55` }}
                >
                  <summary
                    className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 marker:hidden [&::-webkit-details-marker]:hidden"
                    style={{ color: dark }}
                  >
                    <h2 className="font-serif text-lg font-semibold leading-snug" style={{ color: dark }}>
                      {question}
                    </h2>
                    <span
                      className="flex-shrink-0 text-xl leading-none transition-transform duration-200 group-open:rotate-180"
                      style={{ color: teal }}
                      aria-hidden="true"
                    >
                      ▾
                    </span>
                  </summary>
                  <div className="border-t px-6 pb-6 pt-4" style={{ borderColor: `${sage}33` }}>
                    {answer}
                  </div>
                </details>
              ))}
            </div>

            <p className="mt-10 text-sm" style={{ color: `${dark}88` }}>
              Have a question not answered here?{" "}
              <Link href="/contact" className="underline hover:no-underline" style={{ color: teal }}>
                Contact us
              </Link>{" "}
              and we&apos;ll get back to you.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
