import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

function SparkleDecor({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M12 0L13.5 9L24 12L13.5 15L12 24L10.5 15L0 12L10.5 9L12 0Z" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Review the Terms of Service for Ohio Parent Hub, including account creation, premium listing subscriptions, provider responsibilities, and acceptable use.",
  alternates: {
    canonical: "/terms",
  },
};

const teal = "#7EA8A4";
const pink = "#E8A0AC";
const gold = "#DCB346";
const sage = "#B8C5B2";
const cream = "#F5EDE4";
const dark = "#4A6B67";
const lightTeal = "#D5E5E3";
const updatedAt = "March 16, 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: cream, color: dark }}>
      <section className="relative overflow-hidden px-6 pb-12 pt-8" style={{ background: lightTeal }}>
        <SparkleDecor className="absolute left-[6%] top-10 h-5 w-5 opacity-30" style={{ color: gold }} />
        <SparkleDecor className="absolute right-[10%] top-16 h-4 w-4 opacity-30" style={{ color: pink }} />
        <SparkleDecor className="absolute left-[14%] bottom-10 h-4 w-4 opacity-20" style={{ color: teal }} />

        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full" style={{ background: `${pink}20` }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full" style={{ background: `${gold}20` }} />

        <div className="relative z-10 mx-auto max-w-7xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Terms of Service", href: "/terms" },
            ]}
            className="mb-6"
          />

          <div className="lg:max-w-3xl">
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: dark }}>
              Terms of Service
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{ color: `${dark}bb` }}>
              These terms govern your use of Ohio Parent Hub, including our free public directory and premium listing services.
            </p>
            <p className="mt-3 text-sm" style={{ color: `${dark}aa` }}>
              Last updated: {updatedAt}
            </p>
          </div>
        </div>
      </section>

      <main className="px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-6 rounded-3xl border bg-white p-6 shadow-sm sm:p-8" style={{ borderColor: `${sage}55` }}>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              1. Acceptance of Terms
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              By accessing or using Ohio Parent Hub (&ldquo;the Site&rdquo;), you agree to be bound by these Terms of Service
              (&ldquo;Terms&rdquo;) and our{" "}
              <Link href="/privacy" className="underline hover:no-underline" style={{ color: teal }}>Privacy Policy</Link>.
              If you do not agree to these Terms, you should not use the Site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              2. Description of Service
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              Ohio Parent Hub is a free public directory of licensed childcare programs in Ohio. Listing data is sourced
              from official state records published by the Ohio Department of Job and Family Services.
            </p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              We also offer a paid premium listing service (&ldquo;Premium&rdquo;) that allows verified childcare providers
              to enhance their listings with photos, hours, pricing, amenities, descriptions, and other details.
            </p>
          </section>

          <section className="rounded-2xl border p-5" style={{ borderColor: `${teal}44`, background: `${teal}0d` }}>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              3. User Accounts
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              To claim and manage a premium listing, you must create an account. You agree to:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              <li>&#8226; Provide accurate and complete registration information.</li>
              <li>&#8226; Keep your login credentials secure and confidential.</li>
              <li>&#8226; Use the email address associated with your childcare license for verification.</li>
              <li>&#8226; Notify us immediately of any unauthorized use of your account.</li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              You are responsible for all activity that occurs under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              4. Subscriptions and Payment
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              Premium listings require a monthly subscription. Payments are processed securely through Stripe.
              By subscribing, you agree to the following:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              <li>&#8226; Your subscription renews automatically each month until cancelled.</li>
              <li>&#8226; You may cancel at any time through the Manage Billing portal in your dashboard.</li>
              <li>&#8226; Upon cancellation, your premium features remain active until the end of your current billing period.</li>
              <li>&#8226; No refunds are provided for partial billing periods.</li>
              <li>&#8226; We reserve the right to change subscription pricing with 30 days&apos; notice.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              5. Provider Content
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              When you upload content to your listing (photos, descriptions, hours, pricing, FAQs, logos),
              you represent and warrant that:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              <li>&#8226; You own or have the right to use all content you upload.</li>
              <li>&#8226; The information you provide is accurate and not misleading.</li>
              <li>&#8226; Your content does not violate any applicable laws or third-party rights.</li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              By uploading content, you grant Ohio Parent Hub a non-exclusive, royalty-free license to display
              that content on the Site for the purpose of operating your listing. You retain ownership of your content
              and may remove it at any time through your dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              6. Acceptable Use
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              You agree not to:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              <li>&#8226; Provide false or misleading information in listings or account registration.</li>
              <li>&#8226; Claim a listing for a program you do not own or operate.</li>
              <li>&#8226; Scrape, crawl, or systematically access the Site in a manner that degrades performance.</li>
              <li>&#8226; Use the Site to transmit harmful, abusive, or unlawful content.</li>
              <li>&#8226; Interfere with the operation or security of the Site.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              7. Data Accuracy Disclaimer
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              Licensing status, license type, license dates, SUTQ ratings, and other state-reported fields are sourced
              directly from official records and displayed as-is. Ohio Parent Hub does not independently verify or
              guarantee the accuracy of this data. If you believe information is incorrect, corrections must be made
              through the state licensing system.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              8. Limitation of Liability
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              Ohio Parent Hub is a directory and information service. We are not involved in the relationship
              between parents and childcare providers. We do not:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              <li>&#8226; Endorse, recommend, or guarantee any childcare provider listed on the Site.</li>
              <li>&#8226; Make representations about the quality, safety, or suitability of any program.</li>
              <li>&#8226; Bear responsibility for enrollment decisions or outcomes.</li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              To the fullest extent permitted by law, Ohio Parent Hub and its operators shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising from your use of the Site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              9. Disclaimer of Warranties
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              The Site is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind,
              whether express or implied, including but not limited to implied warranties of merchantability,
              fitness for a particular purpose, and non-infringement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              10. Intellectual Property
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              The Site&apos;s design, branding, code, and original content are the property of Ohio Parent Hub.
              State-sourced listing data is public information. Provider-uploaded content remains the property
              of the respective provider.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              11. Termination
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              We may suspend or terminate your account at any time if you violate these Terms or engage in
              conduct that we determine is harmful to the Site, other users, or third parties. Upon termination,
              your premium listing features will be deactivated and your uploaded content may be removed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              12. Governing Law
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              These Terms are governed by and construed in accordance with the laws of the State of Ohio,
              without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              13. Changes to These Terms
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              We may update these Terms from time to time. Material changes will be reflected by updating the
              date at the top of this page. Your continued use of the Site after changes are posted constitutes
              acceptance of the revised Terms.
            </p>
          </section>

          <section className="border-t pt-6" style={{ borderColor: `${sage}66` }}>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              14. Contact
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              Questions about these Terms can be sent through our{" "}
              <Link href="/contact" className="underline hover:no-underline" style={{ color: teal }}>
                Contact page
              </Link>{" "}
              or by emailing{" "}
              <a href="mailto:info@ohioparenthub.com" className="underline hover:no-underline" style={{ color: teal }}>
                info@ohioparenthub.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
