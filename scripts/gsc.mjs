#!/usr/bin/env node
/**
 * Google Search Console CLI — query performance, inspect URLs, check sitemaps.
 *
 * Usage:
 *   node scripts/gsc.mjs performance [--days N] [--query "keyword"] [--page "/path"] [--dimension page|query|device|country|date] [--limit N]
 *   node scripts/gsc.mjs inspect <url>
 *   node scripts/gsc.mjs sitemaps
 *   node scripts/gsc.mjs pages [--days N] [--limit N]          # top pages by clicks
 *   node scripts/gsc.mjs queries [--days N] [--limit N]        # top queries by clicks
 *   node scripts/gsc.mjs coverage [--days N]                   # indexed vs not-indexed page counts
 *
 * Environment:
 *   GSC_KEY_FILE  — path to service account JSON (default: ./gsc-service-account.json)
 *   GSC_SITE_URL  — your Search Console property URL (default: https://www.ohioparenthub.com)
 */

import { google } from 'googleapis';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ── Config ──────────────────────────────────────────────────────────────────

const KEY_FILE = process.env.GSC_KEY_FILE || resolve(process.cwd(), 'gsc-service-account.json');
const SITE_URL = process.env.GSC_SITE_URL || 'sc-domain:ohioparenthub.com';

// ── Auth ────────────────────────────────────────────────────────────────────

function getAuth() {
  if (!existsSync(KEY_FILE)) {
    console.error(`\n❌ Service account key not found at: ${KEY_FILE}`);
    console.error(`\nSetup instructions:`);
    console.error(`  1. Go to https://console.cloud.google.com`);
    console.error(`  2. Enable the "Google Search Console API"`);
    console.error(`  3. Create a service account and download the JSON key`);
    console.error(`  4. Save it as gsc-service-account.json in the project root`);
    console.error(`  5. Add the service account email to GSC as a user\n`);
    process.exit(1);
  }

  return new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
}

function getClient() {
  const auth = getAuth();
  return google.searchconsole({ version: 'v1', auth });
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function dateStr(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function parseArgs(args) {
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--') && i + 1 < args.length) {
      opts[args[i].slice(2)] = args[i + 1];
      i++;
    } else if (!args[i].startsWith('--')) {
      opts._positional = opts._positional || [];
      opts._positional.push(args[i]);
    }
  }
  return opts;
}

function printTable(rows, columns) {
  if (!rows || rows.length === 0) {
    console.log('  (no data)');
    return;
  }

  // Calculate column widths
  const widths = columns.map(col => Math.max(col.label.length, ...rows.map(r => String(col.format ? col.format(r) : r[col.key] ?? '').length)));

  // Header
  const header = columns.map((col, i) => col.label.padEnd(widths[i])).join('  ');
  console.log(`  ${header}`);
  console.log(`  ${columns.map((_, i) => '─'.repeat(widths[i])).join('  ')}`);

  // Rows
  for (const row of rows) {
    const line = columns.map((col, i) => {
      const val = String(col.format ? col.format(row) : row[col.key] ?? '');
      return col.align === 'right' ? val.padStart(widths[i]) : val.padEnd(widths[i]);
    }).join('  ');
    console.log(`  ${line}`);
  }
}

// ── Commands ────────────────────────────────────────────────────────────────

async function cmdPerformance(opts) {
  const client = getClient();
  const days = parseInt(opts.days || '28', 10);
  const limit = parseInt(opts.limit || '25', 10);
  const dimension = opts.dimension || 'page';

  const requestBody = {
    startDate: dateStr(days),
    endDate: dateStr(1),
    dimensions: [dimension],
    rowLimit: limit,
  };

  // Optional filters
  const filters = [];
  if (opts.query) {
    filters.push({ dimension: 'query', operator: 'contains', expression: opts.query });
  }
  if (opts.page) {
    filters.push({ dimension: 'page', operator: 'contains', expression: opts.page });
  }
  if (filters.length > 0) {
    requestBody.dimensionFilterGroups = [{ filters }];
  }

  const res = await client.searchanalytics.query({ siteUrl: SITE_URL, requestBody });

  console.log(`\n📊 Performance — last ${days} days (by ${dimension})\n`);

  const rows = (res.data.rows || []).map(r => ({
    key: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: (r.ctr * 100).toFixed(1) + '%',
    position: r.position.toFixed(1),
  }));

  printTable(rows, [
    { key: 'key', label: dimension.charAt(0).toUpperCase() + dimension.slice(1), align: 'left' },
    { key: 'clicks', label: 'Clicks', align: 'right' },
    { key: 'impressions', label: 'Impressions', align: 'right' },
    { key: 'ctr', label: 'CTR', align: 'right' },
    { key: 'position', label: 'Avg Position', align: 'right' },
  ]);

  console.log();
}

async function cmdPages(opts) {
  opts.dimension = 'page';
  await cmdPerformance(opts);
}

async function cmdQueries(opts) {
  opts.dimension = 'query';
  await cmdPerformance(opts);
}

async function cmdInspect(opts) {
  const client = getClient();
  const url = opts._positional?.[0];
  if (!url) {
    console.error('Usage: node scripts/gsc.mjs inspect <url>');
    process.exit(1);
  }

  const res = await client.urlInspection.index.inspect({
    requestBody: {
      inspectionUrl: url,
      siteUrl: SITE_URL,
    },
  });

  const result = res.data.inspectionResult;
  console.log(`\n🔍 URL Inspection: ${url}\n`);

  if (result.indexStatusResult) {
    const idx = result.indexStatusResult;
    console.log(`  Index status:      ${idx.coverageState || 'unknown'}`);
    console.log(`  Verdict:           ${idx.verdict || 'unknown'}`);
    console.log(`  Robots:            ${idx.robotsTxtState || 'unknown'}`);
    console.log(`  Indexing:          ${idx.indexingState || 'unknown'}`);
    console.log(`  Last crawl:        ${idx.lastCrawlTime || 'unknown'}`);
    console.log(`  Crawl status:      ${idx.pageFetchState || 'unknown'}`);
    console.log(`  Google canonical:  ${idx.googleCanonical || 'unknown'}`);
    console.log(`  User canonical:    ${idx.userCanonical || 'unknown'}`);
    if (idx.sitemap && idx.sitemap.length > 0) {
      console.log(`  In sitemaps:       ${idx.sitemap.join(', ')}`);
    }
    if (idx.referringUrls && idx.referringUrls.length > 0) {
      console.log(`  Referring URLs:    ${idx.referringUrls.join(', ')}`);
    }
  }

  if (result.mobileUsabilityResult) {
    console.log(`  Mobile usability:  ${result.mobileUsabilityResult.verdict || 'unknown'}`);
  }

  if (result.richResultsResult) {
    console.log(`  Rich results:      ${result.richResultsResult.verdict || 'unknown'}`);
  }

  console.log();
}

async function cmdSitemaps() {
  const client = getClient();
  const res = await client.sitemaps.list({ siteUrl: SITE_URL });

  console.log(`\n🗺️  Sitemaps for ${SITE_URL}\n`);

  const maps = res.data.sitemap || [];
  if (maps.length === 0) {
    console.log('  No sitemaps found.');
    console.log();
    return;
  }

  for (const sm of maps) {
    console.log(`  ${sm.path}`);
    console.log(`    Type:         ${sm.type || 'unknown'}`);
    console.log(`    Submitted:    ${sm.lastSubmitted || 'unknown'}`);
    console.log(`    Last downloaded: ${sm.lastDownloaded || 'unknown'}`);
    console.log(`    Pending:      ${sm.isPending ? 'yes' : 'no'}`);
    if (sm.contents) {
      for (const c of sm.contents) {
        console.log(`    ${c.type}: ${c.submitted} submitted, ${c.indexed} indexed`);
      }
    }
    console.log();
  }
}

async function cmdCoverage(opts) {
  const client = getClient();
  const days = parseInt(opts.days || '28', 10);
  const limit = 1000;

  // Get all pages with impressions (these are indexed and appearing in search)
  const res = await client.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: dateStr(days),
      endDate: dateStr(1),
      dimensions: ['page'],
      rowLimit: limit,
    },
  });

  const rows = res.data.rows || [];
  const totalClicks = rows.reduce((s, r) => s + r.clicks, 0);
  const totalImpressions = rows.reduce((s, r) => s + r.impressions, 0);

  // Categorize by URL pattern
  const categories = {
    'Homepage': r => r.keys[0].replace(SITE_URL, '').replace(/\/$/, '') === '',
    'City pages (/daycares/[city])': r => /\/daycares\/[^/]+\/?$/.test(r.keys[0]) && !/\/county\//.test(r.keys[0]),
    'County pages (/daycares/county/[county])': r => /\/daycares\/county\//.test(r.keys[0]),
    'Detail pages (/daycare/[slug])': r => /\/daycare\/[^/]+/.test(r.keys[0]),
    'Browse pages (/daycares, /cities, /counties)': r => /\/(daycares|cities|counties)\/?$/.test(r.keys[0]),
    'Content pages (/faq, /about, etc)': r => /\/(faq|about|contact|privacy|methodology)\/?$/.test(r.keys[0]),
  };

  console.log(`\n📈 Coverage summary — last ${days} days\n`);
  console.log(`  Total pages with impressions: ${rows.length}`);
  console.log(`  Total clicks:                 ${totalClicks.toLocaleString()}`);
  console.log(`  Total impressions:             ${totalImpressions.toLocaleString()}`);
  console.log();

  for (const [label, test] of Object.entries(categories)) {
    const matching = rows.filter(test);
    const clicks = matching.reduce((s, r) => s + r.clicks, 0);
    const impressions = matching.reduce((s, r) => s + r.impressions, 0);
    console.log(`  ${label}`);
    console.log(`    Pages: ${matching.length}  |  Clicks: ${clicks.toLocaleString()}  |  Impressions: ${impressions.toLocaleString()}`);
  }

  console.log();
}

// ── Main ────────────────────────────────────────────────────────────────────

const [command, ...rest] = process.argv.slice(2);
const opts = parseArgs(rest);

const commands = {
  performance: cmdPerformance,
  pages: cmdPages,
  queries: cmdQueries,
  inspect: cmdInspect,
  sitemaps: cmdSitemaps,
  coverage: cmdCoverage,
};

if (!command || !commands[command]) {
  console.log(`
Google Search Console CLI

Usage:
  node scripts/gsc.mjs <command> [options]

Commands:
  performance   Search analytics data (clicks, impressions, CTR, position)
  pages         Top pages by clicks (shortcut for performance --dimension page)
  queries       Top queries by clicks (shortcut for performance --dimension query)
  inspect       URL Inspection for a specific URL
  sitemaps      List submitted sitemaps and their status
  coverage      Page coverage summary by URL category

Options:
  --days N          Date range in days (default: 28)
  --limit N         Max rows (default: 25)
  --dimension X     Group by: page, query, device, country, date
  --query "text"    Filter to queries containing text
  --page "/path"    Filter to pages containing path

Examples:
  node scripts/gsc.mjs pages --days 7 --limit 10
  node scripts/gsc.mjs queries --days 14 --query "daycare"
  node scripts/gsc.mjs performance --dimension date --days 30
  node scripts/gsc.mjs performance --page "/daycares/columbus"
  node scripts/gsc.mjs inspect https://www.ohioparenthub.com/daycares/columbus
  node scripts/gsc.mjs sitemaps
  node scripts/gsc.mjs coverage

Environment:
  GSC_KEY_FILE    Path to service account JSON (default: ./gsc-service-account.json)
  GSC_SITE_URL    Search Console property URL (default: https://www.ohioparenthub.com)
`);
  process.exit(0);
}

try {
  await commands[command](opts);
} catch (err) {
  if (err.code === 403) {
    console.error('\n❌ Permission denied. Make sure the service account email is added as a user in Google Search Console.\n');
  } else if (err.code === 401) {
    console.error('\n❌ Authentication failed. Check that your service account JSON key is valid.\n');
  } else {
    console.error(`\n❌ Error: ${err.message}\n`);
    if (err.errors) console.error(JSON.stringify(err.errors, null, 2));
  }
  process.exit(1);
}
