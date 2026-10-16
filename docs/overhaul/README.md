# October 2026 overhaul entry point

OPH-25 bootstraps shared context only. This snapshot records the approved direction on **October 16, 2026**; it does not change the running product. Start each assigned ticket by reading its current Jira description, parent epic and prerequisites.

The owner-supplied `Ohio_Parent_Hub_Overhaul_Master_Plan.md` (plan date October 16) was read and reconciled with Jira. Its product direction and sequencing agree with this index. Its pending native-Space setup statement predates the hub created during OPH-25; the remaining planning pack was not supplied. The attachment is supporting context, not expanded authorization.

- [Approved decisions and open gates](decisions.md)
- [Access evidence, configuration references and handoff](access-and-handoff.md)
- [OPH-25](https://tylersworkspace-24596598.atlassian.net/browse/OPH-25) and [foundation epic OPH-18](https://tylersworkspace-24596598.atlassian.net/browse/OPH-18)
- [Live overhaul backlog](https://tylersworkspace-24596598.atlassian.net/issues/?jql=project%20%3D%20OPH%20AND%20labels%20%3D%20%22oph-overhaul-2026%22%20ORDER%20BY%20key%20ASC)

## Project map and authority

| Surface | Responsibility |
| --- | --- |
| Jira OPH | Assigned scope, acceptance criteria, dependencies and delivery status. ChatGPT owns new ticket creation; Codex works assigned tickets and reports evidence. |
| [Canonical GitHub repository](https://github.com/Ohio-Parent-Hub/ohio-parent-hub) | Implementation and reproducible, sanitized technical evidence. Use `tyhuffman7` only, verified for the exact acting tool/credential. |
| Native ChatGPT Space named **Ohio Parent Hub Overhaul** | Planning, research, decisions and handoff links. Created during OPH-25; not an automatically synchronized Codex datastore. Recheck access in each runtime. |
| Earlier Library folder `/Ohio Parent Hub/Overhaul` | Six historical planning files reported by OPH-18. A Library folder or Project is not a native Space; those files were not readable in this runtime. |

Read [AGENTS.md](../../AGENTS.md), [README.md](../../README.md), [operations](../operations.md) and [TESTING.md](../../TESTING.md). They describe the existing Next.js application, service boundaries and checks. `app/`, `components/` and `lib/` hold implementation; `data/` holds the reviewed directory inputs; `supabase/migrations/` holds schema history. Use the linked operational guides instead of duplicating their instructions here.

**Preserve completed OPH-1 through OPH-17**, confirmed Done at bootstrap: ownership/claim verification, entitlement and billing safeguards, reproducible directory data, onboarding, isolated regression/release checks and working map tiles. Do not reopen or duplicate that foundation. Older PRDs, roadmap checkboxes and the retained `ui-redesign-draft` branch are historical context, not approval to implement or delete anything.

## Next-ticket order

This is a coordination index, not permission to start every ticket. Jira descriptions contain prerequisites beyond the Blocks links.

| Order / gate | Existing tickets |
| --- | --- |
| Next after this bootstrap | **OPH-26**: actual GA4, Search Console and Google Cloud read-only access proofs in the intended runtime. |
| Evidence and contract | OPH-27 baseline depends on OPH-26 for Google evidence. OPH-28 measurement discovery can proceed after OPH-25. OPH-29 instrumentation requires OPH-26/28; OPH-30 dashboards follows OPH-29. |
| Research alongside foundation | OPH-31 Free/Pro offer; OPH-36 matching requirements then OPH-37 feasibility; OPH-40 journeys then OPH-41 approved prototypes; OPH-44 SEO audit then OPH-45 validated fixes and OPH-46 content strategy. Use available baseline evidence and label gaps. |
| Shared implementation gate | OPH-48 approves shared data, permissions, events and integration order after OPH-31/36/28 decisions. OPH-41 approves relevant responsive prototypes before broad UI work. |
| Approved implementation slices | OPH-32 free profiles → OPH-33 Pro billing → OPH-34 promotion / OPH-35 jobs. OPH-38 matching needs feasibility, architecture, Pro eligibility and prototypes; OPH-39 follows it. OPH-42 public redesign → OPH-43 provider UI; OPH-47 coordinates SEO/content with OPH-42, OPH-46 and relevant job work. |
| Release and bounded pilot | OPH-49 verifies each exact slice; OPH-50 requires explicit release approval. OPH-51 plans the market/experiment using baseline, offer and feasibility evidence. OPH-52 requires OPH-50/51; OPH-53 evaluates actual results. |

The seven epics are OPH-18 (foundation, children 25–30), OPH-19 (Free/Pro, 31–35), OPH-20 (matching, 36–39), OPH-21 (redesign, 40–43), OPH-22 (SEO/trust, 44–47), OPH-23 (contracts/release, 48–50) and OPH-24 (pilot, 51–53). Release slices can advance independently when their own gates pass: measurement/trust, free profiles/public redesign, Pro, then bounded matching.

Stop after OPH-25. The [handoff](access-and-handoff.md#next-codex-task) supplies the next task without starting it.
