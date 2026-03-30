#!/usr/bin/env node
/**
 * SEO Audit Script — crawls ohioparenthub.com and runs algorithmic technical SEO checks.
 *
 * Usage:
 *   node scripts/seoAudit.mjs                  # full run → saves JSON to reports/seo-audit/
 *   node scripts/seoAudit.mjs --dry-run        # JSON to stdout, no file saved
 *   node scripts/seoAudit.mjs --sample N       # override sample size per page type (default: 5)
 *   node scripts/seoAudit.mjs --concurrency N  # max parallel fetches (default: 5)
 */

import * as cheerio from 'cheerio';
import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { createHash } from 'crypto';

// ── Config ──────────────────────────────────────────────────────────────────

const BASE_URL = 'https://ohioparenthub.com';
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;
const ROBOTS_URL = `${BASE_URL}/robots.txt`;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SAMPLE_SIZE = parseInt(argVal('--sample') || '5', 10);
const CONCURRENCY = parseInt(argVal('--concurrency') || '5', 10);

function argVal(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : null;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function md5(str) {
  return createHash('md5').update(str).digest('hex');
}

function dateStr() {
  return new Date().toISOString().split('T')[0];
}

async function fetchWithTiming(url, timeout = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const start = performance.now();
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'OPH-SEO-Audit/1.0' },
      redirect: 'manual',
    });
    const ttfb = performance.now() - start;

    // Follow redirects manually to detect chains
    const redirectChain = [];
    let finalRes = res;
    let currentUrl = url;

    if (res.status >= 300 && res.status < 400) {
      redirectChain.push({ from: currentUrl, status: res.status, to: res.headers.get('location') });
      // Follow up to 5 redirects
      let hops = 0;
      let nextUrl = res.headers.get('location');
      while (nextUrl && hops < 5) {
        if (nextUrl.startsWith('/')) nextUrl = new URL(nextUrl, currentUrl).href;
        const r2start = performance.now();
        const r2 = await fetch(nextUrl, {
          signal: controller.signal,
          headers: { 'User-Agent': 'OPH-SEO-Audit/1.0' },
          redirect: 'manual',
        });
        if (r2.status >= 300 && r2.status < 400) {
          redirectChain.push({ from: nextUrl, status: r2.status, to: r2.headers.get('location') });
          currentUrl = nextUrl;
          nextUrl = r2.headers.get('location');
          hops++;
        } else {
          finalRes = r2;
          break;
        }
      }
    }

    const body = await finalRes.text();
    clearTimeout(timer);
    return { url, status: finalRes.status, ttfb, body, redirectChain, error: null };
  } catch (err) {
    clearTimeout(timer);
    return { url, status: 0, ttfb: performance.now() - start, body: '', redirectChain: [], error: err.message };
  }
}

async function pooledFetch(urls, concurrency) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < urls.length) {
      const idx = i++;
      const res = await fetchWithTiming(urls[idx]);
      results[idx] = res;
      process.stderr.write(`\r  Fetched ${results.filter(Boolean).length}/${urls.length}`);
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, urls.length) }, () => worker());
  await Promise.all(workers);
  process.stderr.write('\n');
  return results;
}

// ── Page type classification ────────────────────────────────────────────────

function classifyUrl(url) {
  const path = url.replace(BASE_URL, '').replace(/\/$/, '') || '/';
  if (path === '/') return 'homepage';
  if (/^\/daycare\/[^/]+$/.test(path)) return 'detail';
  if (/^\/daycares\/county\/[^/]+$/.test(path)) return 'county';
  if (/^\/daycares\/[^/]+$/.test(path)) return 'city';
  if (/^\/(daycares|cities|counties)\/?$/.test(path)) return 'browse';
  if (/^\/(faq|about|contact|privacy|terms|methodology|for-providers)\/?$/.test(path)) return 'static';
  return 'other';
}

// ── Sitemap parsing ─────────────────────────────────────────────────────────

async function parseSitemap() {
  console.error('📡 Fetching sitemap...');
  const res = await fetchWithTiming(SITEMAP_URL);
  if (res.error || res.status !== 200) {
    return { urls: [], error: res.error || `HTTP ${res.status}` };
  }
  const $ = cheerio.load(res.body, { xmlMode: true });
  const urls = [];
  $('url').each((_, el) => {
    urls.push({
      loc: $(el).find('loc').text().trim(),
      lastmod: $(el).find('lastmod').text().trim() || null,
      priority: $(el).find('priority').text().trim() || null,
    });
  });
  return { urls, error: null };
}

// ── Sample URL selection ────────────────────────────────────────────────────

function selectSampleUrls(sitemapUrls) {
  const byType = {};
  for (const entry of sitemapUrls) {
    const type = classifyUrl(entry.loc);
    if (!byType[type]) byType[type] = [];
    byType[type].push(entry.loc);
  }

  const samples = [];
  for (const [type, urls] of Object.entries(byType)) {
    const count = type === 'homepage' ? 1 : Math.min(SAMPLE_SIZE, urls.length);
    // Deterministic sampling: pick evenly spaced
    const step = Math.max(1, Math.floor(urls.length / count));
    for (let i = 0; i < count; i++) {
      samples.push(urls[Math.min(i * step, urls.length - 1)]);
    }
  }
  return { samples, byType };
}

// ── Analysis checks ─────────────────────────────────────────────────────────

function analyzePage(fetchResult) {
  const findings = [];
  const { url, status, ttfb, body, redirectChain, error } = fetchResult;
  const pageType = classifyUrl(url);

  if (error) {
    findings.push({ id: 'fetch-error', category: 'Crawlability', severity: 'P0',
      description: `Fetch failed: ${error}`, affectedPages: [url], effort: 'Medium' });
    return { url, pageType, status, ttfb, findings, meta: {} };
  }

  if (status !== 200) {
    findings.push({ id: 'non-200-status', category: 'Crawlability', severity: 'P0',
      description: `HTTP ${status} response`, affectedPages: [url], effort: 'Medium' });
  }

  if (redirectChain.length > 1) {
    findings.push({ id: 'redirect-chain', category: 'Crawlability', severity: 'P1',
      description: `Redirect chain (${redirectChain.length} hops): ${redirectChain.map(r => `${r.from} → ${r.status}`).join(' → ')}`,
      affectedPages: [url], effort: 'Low' });
  } else if (redirectChain.length === 1) {
    findings.push({ id: 'redirect', category: 'Crawlability', severity: 'P2',
      description: `Single redirect from ${redirectChain[0].from} (${redirectChain[0].status})`,
      affectedPages: [url], effort: 'Low' });
  }

  if (ttfb > 3000) {
    findings.push({ id: 'slow-ttfb', category: 'Performance', severity: 'P1',
      description: `Slow TTFB: ${Math.round(ttfb)}ms (threshold: 3000ms)`,
      affectedPages: [url], effort: 'High' });
  } else if (ttfb > 1500) {
    findings.push({ id: 'moderate-ttfb', category: 'Performance', severity: 'P2',
      description: `Moderate TTFB: ${Math.round(ttfb)}ms (threshold: 1500ms)`,
      affectedPages: [url], effort: 'High' });
  }

  if (!body) return { url, pageType, status, ttfb, findings, meta: {} };

  const $ = cheerio.load(body);
  const meta = {};

  // ── Title ──
  const title = $('title').text().trim();
  meta.title = title;
  if (!title) {
    findings.push({ id: 'missing-title', category: 'Technical', severity: 'P0',
      description: 'Missing title tag', affectedPages: [url], effort: 'Low' });
  } else if (title.length > 60) {
    findings.push({ id: 'long-title', category: 'Technical', severity: 'P2',
      description: `Title too long (${title.length} chars, max 60): "${title.slice(0, 70)}…"`,
      affectedPages: [url], effort: 'Low' });
  } else if (title.length < 15) {
    findings.push({ id: 'short-title', category: 'Technical', severity: 'P2',
      description: `Title too short (${title.length} chars): "${title}"`,
      affectedPages: [url], effort: 'Low' });
  }

  // ── Meta description ──
  const metaDesc = $('meta[name="description"]').attr('content')?.trim() || '';
  meta.metaDescription = metaDesc;
  if (!metaDesc) {
    findings.push({ id: 'missing-meta-description', category: 'Technical', severity: 'P1',
      description: 'Missing meta description', affectedPages: [url], effort: 'Low' });
  } else if (metaDesc.length > 155) {
    findings.push({ id: 'long-meta-description', category: 'Technical', severity: 'P2',
      description: `Meta description too long (${metaDesc.length} chars, max 155): "${metaDesc.slice(0, 80)}…"`,
      affectedPages: [url], effort: 'Low' });
  } else if (metaDesc.length < 70) {
    findings.push({ id: 'short-meta-description', category: 'Technical', severity: 'P2',
      description: `Meta description too short (${metaDesc.length} chars, min 70): "${metaDesc}"`,
      affectedPages: [url], effort: 'Low' });
  }

  // ── Canonical ──
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  meta.canonical = canonical;
  if (!canonical) {
    findings.push({ id: 'missing-canonical', category: 'Technical', severity: 'P1',
      description: 'Missing canonical link', affectedPages: [url], effort: 'Low' });
  }

  // ── OG Tags ──
  const ogTags = {
    'og:title': $('meta[property="og:title"]').attr('content') || '',
    'og:description': $('meta[property="og:description"]').attr('content') || '',
    'og:url': $('meta[property="og:url"]').attr('content') || '',
    'og:image': $('meta[property="og:image"]').attr('content') || '',
    'og:type': $('meta[property="og:type"]').attr('content') || '',
    'og:site_name': $('meta[property="og:site_name"]').attr('content') || '',
  };
  meta.ogTags = ogTags;
  const missingOg = Object.entries(ogTags).filter(([, v]) => !v).map(([k]) => k);
  if (missingOg.length > 0) {
    findings.push({ id: 'incomplete-og-tags', category: 'Technical', severity: missingOg.length > 2 ? 'P1' : 'P2',
      description: `Missing OG tags: ${missingOg.join(', ')}`,
      affectedPages: [url], effort: 'Low' });
  }

  // ── Canonical vs OG URL consistency ──
  if (canonical && ogTags['og:url'] && canonical !== ogTags['og:url']) {
    findings.push({ id: 'canonical-og-mismatch', category: 'Technical', severity: 'P1',
      description: `Canonical (${canonical}) !== og:url (${ogTags['og:url']})`,
      affectedPages: [url], effort: 'Low' });
  }

  // ── H1 ──
  const h1s = [];
  $('h1').each((_, el) => h1s.push($(el).text().trim()));
  meta.h1s = h1s;
  if (h1s.length === 0) {
    findings.push({ id: 'missing-h1', category: 'Technical', severity: 'P1',
      description: 'No H1 tag found', affectedPages: [url], effort: 'Low' });
  } else if (h1s.length > 1) {
    findings.push({ id: 'multiple-h1', category: 'Technical', severity: 'P2',
      description: `Multiple H1 tags (${h1s.length}): "${h1s.slice(0, 3).join('", "')}"`,
      affectedPages: [url], effort: 'Low' });
  }
  if (h1s.length === 1 && title && h1s[0] === title) {
    findings.push({ id: 'h1-equals-title', category: 'Content', severity: 'P3',
      description: `H1 is identical to title tag: "${h1s[0]}"`,
      affectedPages: [url], effort: 'Low' });
  }

  // ── JSON-LD ──
  const jsonLdBlocks = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html()?.replace(/\\u003c/g, '<') || '{}');
      if (Array.isArray(data)) jsonLdBlocks.push(...data);
      else jsonLdBlocks.push(data);
    } catch { /* skip malformed */ }
  });
  meta.jsonLdTypes = jsonLdBlocks.map(b => b['@type']).filter(Boolean);

  const expectedSchemas = {
    homepage: ['Organization', 'WebSite'],
    detail: ['ChildCare'],
    city: ['ItemList'],
    county: [],
    browse: [],
    static: [],
  };
  const expected = expectedSchemas[pageType] || [];
  const missing = expected.filter(t => !meta.jsonLdTypes.includes(t));
  if (missing.length > 0) {
    findings.push({ id: 'missing-jsonld', category: 'Technical', severity: 'P2',
      description: `Missing expected JSON-LD schema: ${missing.join(', ')} (found: ${meta.jsonLdTypes.join(', ') || 'none'})`,
      affectedPages: [url], effort: 'Medium' });
  }

  // ── noindex check ──
  const robotsMeta = $('meta[name="robots"]').attr('content') || '';
  if (robotsMeta.includes('noindex')) {
    findings.push({ id: 'accidental-noindex', category: 'Crawlability', severity: 'P0',
      description: `Page has noindex directive: "${robotsMeta}"`,
      affectedPages: [url], effort: 'Low' });
  }

  // ── Viewport meta ──
  const viewport = $('meta[name="viewport"]').attr('content') || '';
  if (!viewport) {
    findings.push({ id: 'missing-viewport', category: 'Technical', severity: 'P1',
      description: 'Missing viewport meta tag', affectedPages: [url], effort: 'Low' });
  }

  // ── html lang ──
  const htmlLang = $('html').attr('lang') || '';
  if (!htmlLang) {
    findings.push({ id: 'missing-html-lang', category: 'Technical', severity: 'P2',
      description: 'Missing lang attribute on <html> tag', affectedPages: [url], effort: 'Low' });
  }

  // ── Image alt text ──
  const images = [];
  $('img').each((_, el) => {
    const src = $(el).attr('src') || '';
    const alt = $(el).attr('alt');
    images.push({ src, hasAlt: alt !== undefined && alt !== null });
  });
  const imagesWithoutAlt = images.filter(i => !i.hasAlt);
  if (imagesWithoutAlt.length > 0) {
    findings.push({ id: 'missing-alt-text', category: 'Content', severity: 'P2',
      description: `${imagesWithoutAlt.length}/${images.length} images missing alt text`,
      affectedPages: [url], effort: 'Medium' });
  }

  // ── Internal links ──
  const internalLinks = new Set();
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.startsWith('/') || href.startsWith(BASE_URL)) {
      const normalized = href.startsWith('/') ? `${BASE_URL}${href}` : href;
      internalLinks.add(normalized.split('?')[0].split('#')[0].replace(/\/$/, ''));
    }
  });
  meta.internalLinkCount = internalLinks.size;

  // ── Payload size ──
  const payloadKB = Math.round(body.length / 1024);
  meta.payloadKB = payloadKB;
  if (payloadKB > 500) {
    findings.push({ id: 'large-payload', category: 'Performance', severity: 'P2',
      description: `Large HTML payload: ${payloadKB}KB (threshold: 500KB)`,
      affectedPages: [url], effort: 'High' });
  }

  return { url, pageType, status, ttfb: Math.round(ttfb), findings, meta };
}

// ── Cross-page checks ───────────────────────────────────────────────────────

function crossPageChecks(pageResults) {
  const findings = [];

  // Duplicate titles
  const titleMap = new Map();
  for (const p of pageResults) {
    if (p.meta.title) {
      const hash = md5(p.meta.title);
      if (!titleMap.has(hash)) titleMap.set(hash, []);
      titleMap.get(hash).push(p.url);
    }
  }
  for (const [, urls] of titleMap) {
    if (urls.length > 1) {
      findings.push({ id: 'duplicate-title', category: 'Content', severity: 'P1',
        description: `Duplicate title tag across ${urls.length} pages`,
        affectedPages: urls, effort: 'Medium' });
    }
  }

  // Duplicate meta descriptions
  const descMap = new Map();
  for (const p of pageResults) {
    if (p.meta.metaDescription) {
      const hash = md5(p.meta.metaDescription);
      if (!descMap.has(hash)) descMap.set(hash, []);
      descMap.get(hash).push(p.url);
    }
  }
  for (const [, urls] of descMap) {
    if (urls.length > 1) {
      findings.push({ id: 'duplicate-meta-description', category: 'Content', severity: 'P1',
        description: `Duplicate meta description across ${urls.length} pages`,
        affectedPages: urls, effort: 'Medium' });
    }
  }

  // Orphan pages (0 inlinks from sampled pages — rough heuristic)
  const linkedUrls = new Set();
  for (const p of pageResults) {
    // We already collected internal links per page in meta
    // This is approximate since we only sample ~50 pages
  }

  return findings;
}

// ── Sitemap cross-checks ────────────────────────────────────────────────────

function sitemapChecks(sitemapUrls, pageResults, byType) {
  const findings = [];

  // Load local daycares.json to compare counts
  const daycaresPath = resolve(process.cwd(), 'data', 'daycares.json');
  if (existsSync(daycaresPath)) {
    try {
      const daycares = JSON.parse(readFileSync(daycaresPath, 'utf8'));
      // Filter out test daycares (same logic as sitemap.ts)
      const real = daycares.filter(d => {
        const name = (d['PROGRAM NAME'] || '').toLowerCase();
        const city = (d['CITY'] || '').toLowerCase();
        return !name.includes('test') || city !== 'testville';
      });
      const sitemapDetailCount = (byType.detail || []).length;
      const expectedDetailCount = real.filter(d => d['PROGRAM NUMBER']).length;
      const delta = expectedDetailCount - sitemapDetailCount;
      if (Math.abs(delta) > 10) {
        findings.push({ id: 'sitemap-count-mismatch', category: 'Crawlability',
          severity: delta > 0 ? 'P1' : 'P2',
          description: `Sitemap has ${sitemapDetailCount} detail pages but daycares.json has ${expectedDetailCount} entries (delta: ${delta > 0 ? '+' : ''}${delta})`,
          affectedPages: [], effort: 'Medium' });
      }
    } catch { /* skip if unparseable */ }
  }

  // Check sampled pages' canonical vs sitemap
  for (const p of pageResults) {
    if (p.meta.canonical) {
      const canonicalNorm = p.meta.canonical.replace(/\/$/, '');
      const inSitemap = sitemapUrls.some(s => s.loc.replace(/\/$/, '') === canonicalNorm);
      if (!inSitemap && p.pageType !== 'other') {
        findings.push({ id: 'canonical-not-in-sitemap', category: 'Crawlability', severity: 'P2',
          description: `Canonical URL not found in sitemap: ${p.meta.canonical}`,
          affectedPages: [p.url], effort: 'Low' });
      }
    }
  }

  return findings;
}

// ── Robots.txt check ────────────────────────────────────────────────────────

async function robotsChecks() {
  const findings = [];
  console.error('📡 Fetching robots.txt...');
  const res = await fetchWithTiming(ROBOTS_URL);

  if (res.error || res.status !== 200) {
    findings.push({ id: 'robots-fetch-error', category: 'Crawlability', severity: 'P1',
      description: `Failed to fetch robots.txt: ${res.error || `HTTP ${res.status}`}`,
      affectedPages: [ROBOTS_URL], effort: 'Low' });
    return findings;
  }

  const body = res.body;
  if (!body.includes('Sitemap:')) {
    findings.push({ id: 'robots-no-sitemap', category: 'Crawlability', severity: 'P2',
      description: 'robots.txt does not reference a sitemap',
      affectedPages: [ROBOTS_URL], effort: 'Low' });
  }

  // Check for accidental Disallow: /
  const lines = body.split('\n').map(l => l.trim());
  for (const line of lines) {
    if (/^Disallow:\s*\/\s*$/i.test(line)) {
      findings.push({ id: 'robots-disallow-all', category: 'Crawlability', severity: 'P0',
        description: 'robots.txt contains Disallow: / — blocking all crawlers!',
        affectedPages: [ROBOTS_URL], effort: 'Low' });
    }
  }

  return findings;
}

// ── WWW / HTTPS redirect checks ─────────────────────────────────────────────

async function redirectChecks() {
  const findings = [];
  console.error('📡 Checking redirects (www, http)...');

  // WWW → non-www
  const wwwRes = await fetchWithTiming(`https://www.ohioparenthub.com/`, 10000);
  if (wwwRes.redirectChain.length === 0 && wwwRes.status === 200) {
    findings.push({ id: 'www-no-redirect', category: 'Crawlability', severity: 'P2',
      description: 'www.ohioparenthub.com does not redirect to non-www (may cause duplicate content)',
      affectedPages: ['https://www.ohioparenthub.com/'], effort: 'Low' });
  }

  // HTTP → HTTPS
  const httpRes = await fetchWithTiming(`http://ohioparenthub.com/`, 10000);
  if (httpRes.redirectChain.length === 0 && httpRes.status === 200) {
    findings.push({ id: 'http-no-redirect', category: 'Crawlability', severity: 'P1',
      description: 'http://ohioparenthub.com does not redirect to HTTPS',
      affectedPages: ['http://ohioparenthub.com/'], effort: 'Low' });
  }

  return findings;
}

// ── Scoring engine ──────────────────────────────────────────────────────────

const SEVERITY_WEIGHT = { P0: 1.0, P1: 0.7, P2: 0.3, P3: 0.1 };
const SEVERITY_IMPACT_MULTIPLIER = { P0: 50, P1: 20, P2: 5, P3: 1 };

function scoreFinding(finding, sitemapByType) {
  const pagesAffected = finding.affectedPages.length || 1;
  // Estimate total affected pages based on page type of first URL
  let estimatedTotalAffected = pagesAffected;
  if (pagesAffected === 1 && finding.affectedPages[0]) {
    const type = classifyUrl(finding.affectedPages[0]);
    const typeCount = (sitemapByType[type] || []).length || 1;
    // If this is a per-page issue found in a sample, extrapolate
    estimatedTotalAffected = typeCount;
  }

  const impactMultiplier = SEVERITY_IMPACT_MULTIPLIER[finding.severity] || 1;
  finding.estimatedImpact = estimatedTotalAffected * impactMultiplier;
  finding.estimatedTotalAffected = estimatedTotalAffected;
  return finding;
}

function computeHealthScore(allFindings) {
  if (allFindings.length === 0) return 100;
  const maxPenalty = 100;
  let penalty = 0;
  for (const f of allFindings) {
    const weight = SEVERITY_WEIGHT[f.severity] || 0.1;
    penalty += weight * Math.min(f.estimatedTotalAffected || 1, 100) * 0.01;
  }
  return Math.max(0, Math.round(maxPenalty - Math.min(penalty, maxPenalty)));
}

// ── Deduplication ───────────────────────────────────────────────────────────

function deduplicateFindings(rawFindings) {
  const grouped = new Map();
  for (const f of rawFindings) {
    const key = f.id;
    if (!grouped.has(key)) {
      grouped.set(key, { ...f, affectedPages: [...f.affectedPages] });
    } else {
      const existing = grouped.get(key);
      for (const p of f.affectedPages) {
        if (!existing.affectedPages.includes(p)) existing.affectedPages.push(p);
      }
      // Keep highest severity
      if ((SEVERITY_WEIGHT[f.severity] || 0) > (SEVERITY_WEIGHT[existing.severity] || 0)) {
        existing.severity = f.severity;
        existing.description = f.description;
      }
    }
  }
  return Array.from(grouped.values());
}

// ── Report output ───────────────────────────────────────────────────────────

function printConsoleReport(report) {
  const { healthScore, findings, sitemapStats, pageResults, scanDate } = report;

  console.log('\n' + '═'.repeat(70));
  console.log(`  🔍 SEO AUDIT — ${scanDate}`);
  console.log('═'.repeat(70));
  console.log(`\n  Health Score: ${healthScore}/100`);
  console.log(`  Pages in sitemap: ${sitemapStats.totalUrls}`);
  console.log(`  Pages sampled: ${pageResults.length}`);
  console.log(`  Total findings: ${findings.length}`);

  const bySeverity = { P0: [], P1: [], P2: [], P3: [] };
  for (const f of findings) (bySeverity[f.severity] || []).push(f);

  console.log(`\n  By severity: P0=${bySeverity.P0.length}  P1=${bySeverity.P1.length}  P2=${bySeverity.P2.length}  P3=${bySeverity.P3.length}`);

  console.log('\n' + '─'.repeat(70));
  console.log('  TOP ISSUES (by estimated impact)');
  console.log('─'.repeat(70));

  const sorted = [...findings].sort((a, b) => (b.estimatedImpact || 0) - (a.estimatedImpact || 0));
  const top10 = sorted.slice(0, 10);

  for (const f of top10) {
    console.log(`\n  [${f.severity}] ${f.id}`);
    console.log(`      ${f.description}`);
    console.log(`      Category: ${f.category}  |  Effort: ${f.effort}  |  Impact: ${f.estimatedImpact}  |  Pages: ${f.affectedPages.length}`);
    if (f.affectedPages.length > 0 && f.affectedPages.length <= 5) {
      for (const p of f.affectedPages) console.log(`        → ${p}`);
    } else if (f.affectedPages.length > 5) {
      for (const p of f.affectedPages.slice(0, 3)) console.log(`        → ${p}`);
      console.log(`        … and ${f.affectedPages.length - 3} more`);
    }
  }

  if (sorted.length > 10) {
    console.log(`\n  … plus ${sorted.length - 10} more findings`);
  }

  // Sitemap breakdown
  console.log('\n' + '─'.repeat(70));
  console.log('  SITEMAP BREAKDOWN');
  console.log('─'.repeat(70));
  for (const [type, count] of Object.entries(sitemapStats.byType)) {
    console.log(`    ${type.padEnd(12)} ${count}`);
  }

  // Page type performance
  console.log('\n' + '─'.repeat(70));
  console.log('  SAMPLE PERFORMANCE (TTFB)');
  console.log('─'.repeat(70));
  const byType = {};
  for (const p of pageResults) {
    if (!byType[p.pageType]) byType[p.pageType] = [];
    byType[p.pageType].push(p.ttfb);
  }
  for (const [type, ttfbs] of Object.entries(byType)) {
    const avg = Math.round(ttfbs.reduce((a, b) => a + b, 0) / ttfbs.length);
    const max = Math.round(Math.max(...ttfbs));
    console.log(`    ${type.padEnd(12)} avg=${avg}ms  max=${max}ms`);
  }

  console.log('\n' + '═'.repeat(70));
}

// ── Trend comparison ────────────────────────────────────────────────────────

function compareToPrevious(currentReport) {
  const reportsDir = resolve(process.cwd(), 'reports', 'seo-audit');
  if (!existsSync(reportsDir)) return null;

  const files = readdirSync(reportsDir)
    .filter(f => f.endsWith('.json') && f !== `${currentReport.scanDate}.json`)
    .sort()
    .reverse();

  if (files.length === 0) return null;

  try {
    const prev = JSON.parse(readFileSync(join(reportsDir, files[0]), 'utf8'));
    return {
      previousDate: prev.scanDate,
      healthScoreDelta: currentReport.healthScore - prev.healthScore,
      findingsDelta: currentReport.findings.length - prev.findings.length,
      previousHealthScore: prev.healthScore,
      previousFindings: prev.findings.length,
    };
  } catch {
    return null;
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const scanDate = dateStr();
  console.error(`\n🔍 SEO Audit — ${scanDate}\n`);

  // 1. Parse sitemap
  const sitemap = await parseSitemap();
  if (sitemap.error) {
    console.error(`❌ Sitemap error: ${sitemap.error}`);
  }
  console.error(`  Found ${sitemap.urls.length} URLs in sitemap`);

  // 2. Select samples
  const { samples, byType } = selectSampleUrls(sitemap.urls);
  console.error(`  Selected ${samples.length} samples for crawling\n`);

  const sitemapStats = {
    totalUrls: sitemap.urls.length,
    byType: Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, v.length])),
  };

  // 3. Robots checks
  const robotsFindings = await robotsChecks();

  // 4. Redirect checks
  const redirectFindings = await redirectChecks();

  // 5. Crawl sampled pages
  console.error(`\n📡 Crawling ${samples.length} pages (concurrency: ${CONCURRENCY})...`);
  const fetchResults = await pooledFetch(samples, CONCURRENCY);

  // 6. Analyze each page
  console.error('\n🔬 Analyzing pages...');
  const pageResults = fetchResults.map(r => analyzePage(r));

  // 7. Cross-page checks
  const crossFindings = crossPageChecks(pageResults);

  // 8. Sitemap cross-checks
  const sitemapFindings = sitemapChecks(sitemap.urls, pageResults, byType);

  // 9. Collect all findings
  const allRawFindings = [
    ...robotsFindings,
    ...redirectFindings,
    ...pageResults.flatMap(p => p.findings),
    ...crossFindings,
    ...sitemapFindings,
  ];

  // 10. Deduplicate
  const deduped = deduplicateFindings(allRawFindings);

  // 11. Score each finding
  const scored = deduped.map(f => scoreFinding(f, byType));
  scored.sort((a, b) => (b.estimatedImpact || 0) - (a.estimatedImpact || 0));

  // 12. Health score
  const healthScore = computeHealthScore(scored);

  const report = {
    scanDate,
    healthScore,
    sitemapStats,
    findings: scored,
    pageResults: pageResults.map(p => ({
      url: p.url,
      pageType: p.pageType,
      status: p.status,
      ttfb: p.ttfb,
      meta: {
        title: p.meta.title,
        metaDescription: p.meta.metaDescription?.slice(0, 100),
        canonical: p.meta.canonical,
        h1s: p.meta.h1s,
        jsonLdTypes: p.meta.jsonLdTypes,
        ogTags: p.meta.ogTags,
        internalLinkCount: p.meta.internalLinkCount,
        payloadKB: p.meta.payloadKB,
      },
      findingCount: p.findings.length,
    })),
  };

  // 13. Trend comparison
  const trend = compareToPrevious(report);
  if (trend) {
    report.trend = trend;
  }

  // 14. Output
  if (DRY_RUN) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printConsoleReport(report);

    if (trend) {
      console.log('\n' + '─'.repeat(70));
      console.log('  TREND (vs previous audit)');
      console.log('─'.repeat(70));
      console.log(`    Previous: ${trend.previousDate} (score: ${trend.previousHealthScore}, findings: ${trend.previousFindings})`);
      console.log(`    Delta:    health ${trend.healthScoreDelta >= 0 ? '+' : ''}${trend.healthScoreDelta}  |  findings ${trend.findingsDelta >= 0 ? '+' : ''}${trend.findingsDelta}`);
      console.log('─'.repeat(70));
    }

    // Save JSON
    const reportsDir = resolve(process.cwd(), 'reports', 'seo-audit');
    mkdirSync(reportsDir, { recursive: true });
    const outPath = join(reportsDir, `${scanDate}.json`);
    writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.log(`\n  📄 Report saved to: ${outPath}\n`);
  }
}

main().catch(err => {
  console.error(`\n❌ Fatal error: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
