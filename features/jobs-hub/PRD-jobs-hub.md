# PRD: Jobs Hub for Premium Daycare Providers

**Status:** Ready for build planning  
**Feature:** Jobs Hub  
**Product:** Ohio Parent Hub  
**Scope:** Premium provider job posting + public job discovery  
**Confidence:** 96–97%  

---

## 1. Goal

Build a **Jobs Hub** feature that lets premium daycare providers post open roles from their logged-in dashboard, and lets job seekers discover those roles through:

1. a main `/jobs` page,
2. individual public job detail pages,
3. a "Now Hiring" signal on daycare profile pages,
4. a lower-page "Open Jobs" section on daycare profile pages,
5. a "Now Hiring" filter chip on existing daycare search pages.

This should feel complete at launch without creating a large number of new SEO pages.

---

## 2. Product Decisions Locked

### Provider access

Jobs Hub is **premium-only**.

Only providers with an active or past-due premium subscription may access `/dashboard/jobs` or save job postings.

Use the existing subscription check pattern already used by `/dashboard/edit`:

```ts
const isActive =
  profile?.subscription_status === "active" ||
  profile?.subscription_status === "past_due";
```

If not active, redirect to `/dashboard`.

### Draft behavior

No drafts for MVP.

A job is saved only when the provider clicks **Publish Job**. If they abandon the form before publishing, nothing is saved.

### Public discovery

Launch with:

- one main `/jobs` page,
- individual job detail pages,
- no city/county job pages yet.

City/county filtering should happen inside `/jobs`, not through separate routes.

### Application flow

Applicants click **Apply Now**, which opens their default email client.

Email subject format:

```text
[daycare name] | [position title] Application
```

The application email must also be visible somewhere on the public job detail page.

---

## 3. User Stories

### Provider

As a premium daycare provider, I want to post open roles from my dashboard so I can collect resumes from people looking for child care jobs.

As a provider, I want to choose whether applications go to my account email or a different hiring email.

As a provider, I want to include a link to my full job description if it already exists on my website or another job board.

### Job seeker

As a job seeker, I want to browse daycare jobs across Ohio in one place.

As a job seeker, I want to click into a job to read the full description.

As a job seeker, I want to quickly apply by email without creating an account.

### Parent/search user

As a daycare-search user, I want to see whether a daycare is hiring without jobs taking over the main daycare profile experience.

---

## 4. MVP Routes

### Provider route

```text
/dashboard/jobs
```

Premium-only management page for creating, listing, and deleting jobs.

### Public jobs page

```text
/jobs
```

One main jobs discovery page with filters.

### Public job detail page

```text
/daycare/[daycare-slug]/jobs/[job-slug]
```

SEO-friendly job detail page.

### Existing daycare profile page

```text
/daycare/[slug]
```

Changes:

- small "Now Hiring · X Open Roles" pill near hero/contact area,
- lower-page "Open Jobs at [Daycare Name]" section below Program Details and before FAQ.

### Existing daycare search pages

Add a "Now Hiring" filter chip to existing search/list pages.

Likely affected search pages:

- `/daycares`
- `/daycares/[city]`
- `/daycares/county/[county]`

---

## 5. Data Model

Create a new migration:

```text
supabase/migrations/002_jobs_hub.sql
```

### Table: daycare_jobs

```sql
CREATE TABLE daycare_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_number TEXT NOT NULL REFERENCES profiles(program_number) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  job_url TEXT,
  application_email_mode TEXT NOT NULL DEFAULT 'default'
    CHECK (application_email_mode IN ('default', 'custom')),
  application_email_custom TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Constraints / validation

App-level validation:

- `title` required, trimmed, max 120 chars.
- `description` required, trimmed, max 5000 chars.
- `job_url` optional, but if present must be valid `http://` or `https://` URL.
- `application_email_mode` must be `default` or `custom`.
- `application_email_custom` required only when mode is `custom`.
- `application_email_custom` must be a valid email when provided.

Optional SQL check for custom email can be skipped for MVP if app-level validation is solid.

### RLS

Mirror the `premium_listings` ownership pattern.

```sql
ALTER TABLE daycare_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published jobs"
  ON daycare_jobs FOR SELECT
  USING (published = true);

CREATE POLICY "Owners can read own jobs"
  ON daycare_jobs FOR SELECT
  USING (
    program_number IN (
      SELECT program_number FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert own jobs"
  ON daycare_jobs FOR INSERT
  WITH CHECK (
    program_number IN (
      SELECT program_number FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners can update own jobs"
  ON daycare_jobs FOR UPDATE
  USING (
    program_number IN (
      SELECT program_number FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    program_number IN (
      SELECT program_number FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete own jobs"
  ON daycare_jobs FOR DELETE
  USING (
    program_number IN (
      SELECT program_number FROM profiles WHERE id = auth.uid()
    )
  );
```

### Trigger

Use the existing `update_updated_at()` function from the initial migration.

```sql
CREATE TRIGGER daycare_jobs_updated_at
  BEFORE UPDATE ON daycare_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Indexes

```sql
CREATE INDEX idx_daycare_jobs_program_number ON daycare_jobs(program_number);
CREATE INDEX idx_daycare_jobs_published ON daycare_jobs(published) WHERE published = true;
CREATE INDEX idx_daycare_jobs_created_at ON daycare_jobs(created_at DESC);
```

---

## 6. Types

Create:

```text
lib/jobTypes.ts
```

```ts
export type ApplicationEmailMode = "default" | "custom";

export type DaycareJob = {
  id: string;
  program_number: string;
  title: string;
  description: string;
  job_url: string | null;
  application_email_mode: ApplicationEmailMode;
  application_email_custom: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type PublicDaycareJob = {
  id: string;
  program_number: string;
  title: string;
  description: string;
  job_url: string | null;
  application_email: string;
  daycare_name: string;
  daycare_slug: string;
  city: string | null;
  county: string | null;
  created_at: string;
};

export type JobSummaryByProgramNumber = Record<
  string,
  {
    count: number;
    latestJobTitle: string | null;
  }
>;
```

---

## 7. Server Actions / Data Access

Create:

```text
app/actions/jobs.ts
```

### Functions

#### `loadOwnerJobs()`

Used by `/dashboard/jobs`.

- Requires authenticated user.
- Loads profile.
- Verifies premium subscription status.
- Returns jobs for the owner’s `program_number`.

#### `createJob(input)`

Creates and publishes a job immediately.

Rules:

- Requires authenticated user.
- Requires active or past-due subscription.
- Uses user profile `program_number`; do not trust client-supplied ownership.
- Validates title, description, URL, email mode, custom email.
- Inserts `published = true`.

#### `updateJob(jobId, input)`

Optional for launch but strongly recommended.

Rules:

- Requires authenticated user.
- Requires active or past-due subscription.
- Verifies job belongs to provider’s `program_number`.
- Updates title, description, job_url, application email fields.
- Remains published.

#### `deleteJob(jobId)`

Deletes a provider-owned job.

Rules:

- Requires authenticated user.
- Requires active or past-due subscription.
- Verifies ownership before delete.

#### `loadPublishedJobsForProgram(programNumber)`

Used by public daycare detail page.

- Service-role read is acceptable for server-side SSR.
- Return only published jobs.
- Include resolved application email:
  - default = `profiles.email`
  - custom = `daycare_jobs.application_email_custom`

#### `loadAllPublishedJobs()`

Used by `/jobs`.

- Return all published jobs.
- Include daycare name, city, county, daycare slug, resolved application email.
- Use static `data/daycares.json` to enrich job rows with daycare name/city/county/slug.
- Sort newest first for MVP.

#### `loadHiringSummaries()`

Used by daycare search pages and daycare cards.

Returns a map:

```ts
Record<string, { count: number; latestJobTitle: string | null }>
```

Only include published jobs.

---

## 8. Provider Dashboard UX

### Update existing dashboard

File:

```text
components/DashboardClient.tsx
```

Add a Quick Action card for active premium providers:

- title: `Jobs Hub`
- subtitle: `Post open roles and collect resumes`
- href: `/dashboard/jobs`
- icon: use `BriefcaseBusiness`, `ClipboardList`, or similar from `lucide-react`

Non-premium providers should not be able to use Jobs Hub.

Option A: hide card if not active.  
Option B: show locked card that routes to upgrade/checkout.  

Recommendation: for MVP, show it only to premium providers to keep behavior simple.

### New page

File:

```text
app/dashboard/jobs/page.tsx
```

Pattern should match `/dashboard/edit/page.tsx`:

- create Supabase server client,
- require auth,
- load profile,
- require `active` or `past_due`,
- load owner jobs,
- render client component.

### New component

File:

```text
components/jobs/JobsHubClient.tsx
```

UI sections:

1. Header
   - `Jobs Hub`
   - daycare name
   - explanation: `Post open child care roles for families and job seekers browsing Ohio Parent Hub.`

2. Create/edit form
   - Position title
   - Job description
   - Optional job description URL
   - Application email choice:
     - radio/card: `Use account email: [profile.email]`
     - radio/card: `Use a different hiring email`
   - Custom email input shown when custom is selected
   - Publish Job button

3. Open jobs list
   - title
   - created date
   - application email destination
   - public link if available
   - edit
   - delete

No draft state.

If the provider starts creating a job and leaves the page, nothing is saved.

---

## 9. Public `/jobs` Page

### Route

```text
app/jobs/page.tsx
```

### Goal

Main job seeker landing page.

### Page metadata

Title:

```text
Ohio Daycare Jobs | Ohio Parent Hub
```

Description:

```text
Find open roles at licensed child care providers across Ohio. Browse daycare jobs and apply directly by email.
```

### UI

Hero:

- `Ohio Daycare Jobs`
- `Find open roles at licensed child care providers across Ohio.`

Filters:

- search input for title/daycare name/city/county
- city dropdown or simple input
- county dropdown or simple input
- clear filters

Job cards:

- job title
- daycare name
- city/county
- short description preview
- optional external job link indicator
- `View Job` button

### Component

Recommended component:

```text
components/jobs/JobsPageClient.tsx
```

Do filtering client-side for MVP because the number of jobs should be small at launch.

If jobs grow large later, move filtering to search params/server queries.

---

## 10. Public Job Detail Page

### Route

```text
app/daycare/[slug]/jobs/[jobSlug]/page.tsx
```

### URL slug

Use job title slug plus job id suffix to avoid collisions:

```text
lead-toddler-teacher-[short-id]
```

or:

```text
[job-id]-lead-toddler-teacher
```

Recommendation:

```text
/daycare/[daycare-slug]/jobs/[job-id]-[job-title-slug]
```

Simpler lookup: parse the UUID prefix or use exact job id segment.

### Page content

- Breadcrumbs back to daycare page and jobs page
- Job title
- Daycare name
- City/county
- Full description
- Optional external job description link
- Visible application email
- Apply Now button

### Apply button

```ts
const subject = `${daycareName} | ${job.title} Application`;
const mailto = `mailto:${job.application_email}?subject=${encodeURIComponent(subject)}`;
```

### Structured data

Add `JobPosting` schema where possible.

Minimum schema fields:

- `@context`
- `@type`: `JobPosting`
- `title`
- `description`
- `datePosted`
- `hiringOrganization.name`
- `jobLocation.address.addressLocality`
- `jobLocation.address.addressRegion = OH`
- `url`

Do **not** invent salary, employment type, or expiration date if not captured.

---

## 11. Daycare Detail Page Changes

Files:

```text
app/daycare/[slug]/page.tsx
components/DaycareDetailPageShell.tsx
components/jobs/PublicJobsSection.tsx
```

### Data

In `app/daycare/[slug]/page.tsx`:

- load published jobs for `programNumber`,
- pass jobs into `DaycareDetailPageShell`.

### Now Hiring pill

Show only if published jobs count > 0.

Copy:

```text
Now Hiring · 2 Open Roles
```

Placement:

- near the hero badge row beside or near `Verified Provider`, but visually smaller.
- It should link-scroll to `#open-jobs`.

### Open Jobs section

Placement:

- below Program Details,
- before FAQ.

Section id:

```html
<section id="open-jobs">
```

Heading:

```text
Open Jobs at [Daycare Name]
```

Cards:

- title
- short description preview
- `View Job` link/button

Do not put this near the top of the daycare page. Parents are the primary audience of the daycare profile, so jobs should be visible but not dominant.

---

## 12. Existing Daycare Search: Now Hiring Filter

Add a `Now Hiring` chip to existing daycare search/list pages.

Likely files:

```text
components/FilterChipBar.tsx
components/GlobalDashboard.tsx
components/CityDashboard.tsx
components/DraftDaycaresPageClient.tsx
components/DraftCityDaycaresPageClient.tsx
components/CountyDaycaresPageClient.tsx
app/daycares/page.tsx
app/daycares/[city]/page.tsx
app/daycares/county/[county]/page.tsx
```

### Data flow

1. Server pages call `loadHiringSummaries()`.
2. Pass `hiringSummaries` through client wrappers into dashboard components.
3. Dashboard components track:

```ts
const [nowHiringEnabled, setNowHiringEnabled] = useState(false);
```

4. If `nowHiringEnabled` is true, only show providers whose `program_number` exists in `hiringSummaries`.
5. Cards for hiring providers show:

```text
Now Hiring · X roles
```

### Filter chip

Add to `FilterChipBar` near the existing `Owner Verified` chip.

Suggested order:

```text
Search | Now Hiring | Owner Verified | Rating | PFCC | Type | More
```

Active visual:

- warm/gold or teal tinted chip.

### Important behavior

The daycare search still remains a daycare search.

The filter should help users discover hiring providers, but jobs should not dominate the cards or map experience.

---

## 13. Navigation

Update site header/navigation to include a link:

```text
Jobs
```

Recommended nav order:

```text
Find Daycare | Jobs | For Providers | FAQ
```

Potential files:

```text
components/SiteHeader.tsx
```

---

## 14. Slug Helpers

Reuse existing `slugify` and daycare slug logic where possible.

Existing daycare slug pattern uses:

```ts
`${programNumber}-${slugify(name)}-${citySlug}`
```

Centralize if needed to avoid duplicating logic across job actions/pages.

Recommended helper additions:

```text
lib/jobUtils.ts
```

Functions:

- `buildJobSlug(jobId: string, title: string): string`
- `parseJobIdFromSlug(jobSlug: string): string | null`
- `buildJobApplyMailto(applicationEmail, daycareName, jobTitle): string`
- `resolveApplicationEmail(job, profileEmail): string`

---

## 15. Design Direction

Match existing Ohio Parent Hub visual style:

- cream background `#F5EDE4`
- light teal hero sections `#D5E5E3`
- dark teal text `#4A6B67`
- teal actions `#7EA8A4`
- gold accents `#DCB346`
- rounded white cards
- soft shadows and border cards
- serif headings where existing pages use them

---

## 16. Testing / Verification

Follow Superpowers-style TDD where practical.

### Unit-level tests if test setup exists

Test helpers:

- `buildJobSlug`
- `parseJobIdFromSlug`
- `buildJobApplyMailto`
- `resolveApplicationEmail`
- job validation helpers

### Manual verification

Provider dashboard:

- non-auth user redirects to `/auth/login`
- non-premium user redirects to `/dashboard`
- premium user can create a job
- custom email validation works
- invalid URL validation works
- job appears in owner job list
- provider can edit job
- provider can delete job

Public daycare page:

- daycare with no jobs shows no pill and no jobs section
- daycare with jobs shows Now Hiring pill
- pill scrolls to Open Jobs section
- Open Jobs section appears below Program Details and before FAQ
- job cards link to job detail pages

Job detail page:

- valid job loads
- invalid job 404s
- application email visible
- Apply Now mailto uses expected subject
- optional external job URL displays when present
- no external job URL section displays when absent

Jobs page:

- `/jobs` loads all published jobs
- search filters title/daycare/city/county
- city/county filters work
- clear filters resets list
- each card links to detail page

Daycare search:

- Now Hiring chip appears
- active filter only shows providers with jobs
- result cards show Now Hiring badge/count
- clearing filter restores results

Build:

```bash
npm run lint
npm run build
```

---

## 17. Acceptance Criteria

- [ ] Premium providers can access `/dashboard/jobs`.
- [ ] Non-premium providers cannot access `/dashboard/jobs`.
- [ ] Providers can create published jobs with title and description.
- [ ] Providers can choose default account email or custom application email.
- [ ] Providers can add an optional external job URL.
- [ ] Providers can edit and delete their own jobs.
- [ ] Providers cannot edit/delete jobs from another program number.
- [ ] Main `/jobs` page lists all published jobs.
- [ ] `/jobs` supports search, city filter, county filter, and clear filters.
- [ ] Each public job has a dedicated SEO-friendly detail page.
- [ ] Job detail page shows visible application email.
- [ ] Apply Now opens mailto with subject `[daycare name] | [position title] Application`.
- [ ] Daycare profile page shows Now Hiring pill only when jobs exist.
- [ ] Daycare profile page shows Open Jobs section below Program Details and before FAQ.
- [ ] Existing daycare search pages include Now Hiring filter chip.
- [ ] Now Hiring filter only shows daycares with published jobs.
- [ ] Hiring daycare result cards show Now Hiring badge/count.
- [ ] Jobs are not shown for non-premium providers if their subscription is inactive.
- [ ] Build and lint pass.

---

## 18. Out of Scope for Launch

- Resume uploads
- Applicant tracking
- Employer messaging dashboard
- Job drafts
- Job expiration dates
- Salary fields
- Employment type fields
- City/county job landing pages
- Featured/sponsored jobs
- Saved jobs
- Email notifications

---

## 19. Future Enhancements

Potential later additions:

- `/jobs?city=Columbus` shareable filters
- city/county job landing pages once job volume supports them
- expiration date / auto-archive jobs
- employment type field
- salary range
- provider-side application count tracking
- featured jobs upsell
- weekly job digest email
- job alerts for seekers

---

## 20. Recommended Build Order

1. Migration + types + utility helpers.
2. Server actions for owner/public jobs.
3. `/dashboard/jobs` provider management page.
4. Public job detail pages.
5. Main `/jobs` page.
6. Daycare detail page: Now Hiring pill + Open Jobs section.
7. Existing daycare search: Now Hiring summaries + filter chip + badges.
8. Header nav link.
9. SEO metadata + JobPosting schema.
10. Manual QA and build verification.
