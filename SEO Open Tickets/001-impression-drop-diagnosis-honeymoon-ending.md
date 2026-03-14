# [P1] Impression Drop Diagnosis: Google Honeymoon Ending + Compounding Issues

**Priority**: P1 — Ranking Killer
**Discovered**: 2026-03-12
**Status**: Open

## Summary

Impressions dropped from ~2,000-3,300/day (Feb 26–Mar 5) to ~50-180/day (Mar 6+). Average position collapsed from ~11 to ~60. Root cause is a combination of Google's "new site honeymoon" period ending plus three compounding issues deployed on March 4 that likely accelerated and deepened the drop.

## Evidence

### Traffic Cliff — GSC Daily Data (28-day)

```
Date        Impressions  Avg Position
2026-02-26     1,140       10.7    ← honeymoon peak begins
2026-03-02     3,353       11.2    ← peak day
2026-03-05     1,943       13.0    ← last good day
2026-03-06       497       22.0    ← DROP STARTS (March 4 deploy re-crawled)
2026-03-07        76       38.6
2026-03-10       181       60.0    ← avg position collapsed
```

### Timeline Correlation

- **Feb 18**: Site first appears in Google (2 impressions)
- **Feb 18–25**: Gradual discovery (0–225 imp/day)
- **Feb 26–Mar 5**: "Honeymoon" burst to 3,353/day in 2 weeks
- **Mar 4**: Major deploy: FAQ sections + FAQPage schema on ALL page types (+1,771 lines)
- **Mar 6**: Drop begins — Google re-crawls post-deploy
- **Mar 9**: `generateStaticParams` emptied + query-string fix
- **Mar 10**: 181 imp/day at avg position 60

### CTR During Honeymoon Was Very Low

At positions 10–14, Google expects ~5-10% CTR. The site was getting:
- Mar 2: 0.7% CTR @ position 11.2
- Mar 5: 1.4% CTR @ position 13.0

This signals to Google that users aren't finding the results relevant, accelerating the demotion.

### Indexing Is NOT the Issue

URL inspections confirm pages are still indexed:
- Homepage: indexed, last crawl Mar 3
- Columbus city page: indexed, last crawl Mar 5
- Detail page (Kim's Kiddie Care): indexed, last crawl Feb 26
- All pass verdict, robots allowed, canonicals match

## Diagnosis

This is a **multi-factor ranking demotion**, not a de-indexing event:

1. **Google Honeymoon Period** — New sites often get a temporary visibility boost. When engagement signals (CTR, dwell time) don't meet thresholds, Google pulls back rankings. Going from 0 to 3,000+ impressions in 2 weeks is textbook honeymoon behavior.

2. **March 4 Deploy Compounded the Drop** — The FAQ additions, FAQPage schema spam, and templated content changes likely accelerated Google's quality re-evaluation. See tickets 002-004 for specific issues.

3. **The site is still indexed** — This is a ranking position drop (from ~11 to ~60), not a crawl/index issue. Recovery requires improving quality signals.

## Recommended Fix

This is a strategic-level issue. The immediate tactical fixes are in tickets 002–005. The overarching recovery plan:

1. Fix the compounding issues (tickets 002–005) to stop negative signals
2. Improve CTR through better title tags that include geo-modifiers and action words
3. Add unique, differentiated content to detail pages (not just templated text)
4. Build external authority signals (backlinks from Ohio parenting resources)
5. Be patient — recovery from a honeymoon correction typically takes 4–8 weeks if quality signals improve

## Expected Impact

Fixing compounding issues (tickets 002-005) will remove negative signals. Natural recovery from the honeymoon correction should follow, but likely to a lower baseline than the peak (~1,000-1,500 imp/day rather than 3,300). The peak was artificially inflated by the honeymoon boost.

## Affected Files

- See tickets 002–005 for specific file-level fixes
