import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, "data", "daycares.json");
const APPROVED_ALIASES_PATH = path.join(ROOT, "data", "city-aliases.approved.json");
const BLOCKED_PATH = path.join(ROOT, "data", "city-aliases.blocked.json");

const SHORTHAND_CANONICAL = {
  col: "columbus",
  cin: "cincinnati",
};

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function writeCsv(filePath, headers, rows) {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((key) => csvEscape(row[key] ?? "")).join(","));
  }
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function normalizeForComparison(city) {
  const expansions = {
    st: "saint",
    mt: "mount",
    ft: "fort",
    hts: "heights",
    hghts: "heights",
    ctr: "center",
    twp: "township",
    twnshp: "township",
    twsp: "township",
  };

  return String(city || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[.'’]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .map((token) => expansions[token] || token)
    .join(" ")
    .trim();
}

function toCanonicalCity(normalized) {
  return String(normalized || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => token.toUpperCase())
    .join(" ");
}

function cityQualityScore(city) {
  const raw = String(city || "").trim();
  if (!raw) return 0;

  const uppercase = raw.toUpperCase();
  const hasAbbrev = /\b(ST\.?|MT\.?|FT\.?|HTS\.?|HGHTS\.?|CTR\.?|TWP\.?|TWNSHP\.?|TWSP\.?)\b/.test(uppercase);
  const hasPunctuation = /[.'’]/.test(raw);
  const hasDoubleSpaces = /\s{2,}/.test(raw);

  let score = 0;
  if (!hasAbbrev) score += 3;
  if (!hasPunctuation) score += 1;
  if (!hasDoubleSpaces) score += 1;
  score += Math.min(raw.length, 40) / 100;
  return score;
}

function sharedPrefixLength(a, b) {
  const left = String(a || "");
  const right = String(b || "");
  const max = Math.min(left.length, right.length);
  let length = 0;
  for (let index = 0; index < max; index += 1) {
    if (left[index] !== right[index]) break;
    length += 1;
  }
  return length;
}

function levenshtein(a, b) {
  const left = a || "";
  const right = b || "";
  const matrix = Array.from({ length: left.length + 1 }, () => Array(right.length + 1).fill(0));

  for (let row = 0; row <= left.length; row += 1) matrix[row][0] = row;
  for (let col = 0; col <= right.length; col += 1) matrix[0][col] = col;

  for (let row = 1; row <= left.length; row += 1) {
    for (let col = 1; col <= right.length; col += 1) {
      const cost = left[row - 1] === right[col - 1] ? 0 : 1;
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + cost
      );
    }
  }

  return matrix[left.length][right.length];
}

function parseDateArg() {
  const arg = process.argv.find((value) => value.startsWith("--date="));
  if (!arg) return new Date().toISOString().slice(0, 10);
  return arg.split("=")[1];
}

function loadJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function keyPair(a, b) {
  return [a, b].sort((x, y) => x.localeCompare(y)).join("||");
}

function main() {
  const dateTag = parseDateArg();
  const outDir = path.join(ROOT, "reports", "city-normalization", dateTag);
  fs.mkdirSync(outDir, { recursive: true });

  const records = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const approved = loadJson(APPROVED_ALIASES_PATH, { aliases: {} });
  const blocked = loadJson(BLOCKED_PATH, { blockedPairs: [] });

  const blockedSet = new Set(
    (blocked.blockedPairs || []).map((pair) => keyPair(String(pair.a || ""), String(pair.b || "")))
  );

  const cityMap = new Map();

  for (const record of records) {
    const cityRaw = String(record.CITY || "").trim();
    if (!cityRaw) continue;

    if (!cityMap.has(cityRaw)) {
      cityMap.set(cityRaw, {
        city: cityRaw,
        cityUpper: cityRaw.toUpperCase(),
        normalized: normalizeForComparison(cityRaw),
        slug: slugify(cityRaw),
        count: 0,
        counties: new Set(),
        zips: new Set(),
        quality: cityQualityScore(cityRaw),
      });
    }

    const item = cityMap.get(cityRaw);
    item.count += 1;
    if (record.COUNTY) item.counties.add(String(record.COUNTY).trim().toUpperCase());
    if (record["ZIP CODE"]) item.zips.add(String(record["ZIP CODE"]).trim());
  }

  const cities = [...cityMap.values()].sort((a, b) => a.cityUpper.localeCompare(b.cityUpper));

  const inventoryRows = cities.map((item) => ({
    city: item.city,
    slug: item.slug,
    normalized: item.normalized,
    count: item.count,
    counties: [...item.counties].sort().join("|"),
    zip_count: item.zips.size,
  }));

  const slugBuckets = new Map();
  for (const item of cities) {
    if (!slugBuckets.has(item.slug)) slugBuckets.set(item.slug, []);
    slugBuckets.get(item.slug).push(item);
  }

  const slugCollisionRows = [];
  for (const [slug, items] of slugBuckets.entries()) {
    if (items.length < 2) continue;
    for (const item of items) {
      slugCollisionRows.push({
        slug,
        city: item.city,
        count: item.count,
        counties: [...item.counties].sort().join("|"),
      });
    }
  }

  const candidateRows = [];
  const seenPairs = new Set();

  for (let index = 0; index < cities.length; index += 1) {
    const left = cities[index];
    for (let inner = index + 1; inner < cities.length; inner += 1) {
      const right = cities[inner];
      const pair = keyPair(left.city, right.city);
      if (seenPairs.has(pair)) continue;
      seenPairs.add(pair);

      const normalizedMatch = left.normalized && left.normalized === right.normalized;
      const slugMatch = left.slug && left.slug === right.slug;
      const distance = levenshtein(left.normalized, right.normalized);
      const countyOverlap = [...left.counties].some((county) => right.counties.has(county));
      const lenDiff = Math.abs(left.normalized.length - right.normalized.length);
      const firstLetterMatch = left.normalized[0] && left.normalized[0] === right.normalized[0];

      const likelyTypo =
        distance > 0 &&
        distance <= 2 &&
        lenDiff <= 2 &&
        firstLetterMatch;

      if (!(normalizedMatch || slugMatch || likelyTypo)) continue;

      let confidence = "low";
      let reason = "Potential similarity, manual review required.";

      if (normalizedMatch && countyOverlap) {
        confidence = "high";
        reason = "Same normalized city with county overlap.";
      } else if ((normalizedMatch || slugMatch) && !countyOverlap) {
        confidence = "medium";
        reason = "Strong text match but county context differs.";
      } else if (likelyTypo && countyOverlap) {
        confidence = "medium";
        reason = "Small edit-distance typo candidate with county overlap.";
      }

      const blockedPair = blockedSet.has(pair);
      const alreadyApproved =
        approved.aliases?.[left.city] === right.city || approved.aliases?.[right.city] === left.city;

      candidateRows.push({
        confidence,
        city_a: left.city,
        city_b: right.city,
        city_a_slug: left.slug,
        city_b_slug: right.slug,
        city_a_counties: [...left.counties].sort().join("|"),
        city_b_counties: [...right.counties].sort().join("|"),
        county_overlap: countyOverlap ? "yes" : "no",
        normalized_a: left.normalized,
        normalized_b: right.normalized,
        edit_distance: distance,
        blocked_pair: blockedPair ? "yes" : "no",
        approved_alias_exists: alreadyApproved ? "yes" : "no",
        suggested_action: blockedPair ? "REJECT" : "REVIEW",
        reason,
      });
    }
  }

  candidateRows.sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 };
    return rank[a.confidence] - rank[b.confidence] || a.city_a.localeCompare(b.city_a);
  });

  const cityByName = new Map(cities.map((city) => [city.city, city]));

  const normalizedGroups = new Map();
  for (const city of cities) {
    if (!normalizedGroups.has(city.normalized)) normalizedGroups.set(city.normalized, []);
    normalizedGroups.get(city.normalized).push(city);
  }

  const aliasSuggestions = [];
  const ambiguousRows = [];
  const suggestedSources = new Set();

  for (const source of cities) {
    const canonicalNormalized = SHORTHAND_CANONICAL[source.normalized];
    if (!canonicalNormalized) continue;

    const target = cities.find((city) => city.normalized === canonicalNormalized);
    if (!target) continue;

    const countyOverlap = [...source.counties].some((county) => target.counties.has(county));
    if (!countyOverlap) continue;

    if (target.count < Math.max(5, source.count * 3)) continue;

    aliasSuggestions.push({
      city_in_question: source.city,
      suggested_canonical_city: toCanonicalCity(target.normalized),
      confidence: "medium",
      suggestion_type: "shorthand-match",
      source_count: source.count,
      target_basis_city: target.city,
      county_overlap: "yes",
      source_counties: [...source.counties].sort().join("|"),
      target_counties: [...target.counties].sort().join("|"),
      approved_alias_exists: approved.aliases?.[source.city] ? "yes" : "no",
      reason: "Known shorthand city token matched to canonical full city with county overlap.",
    });

    suggestedSources.add(source.city);
  }

  for (const [normalized, group] of normalizedGroups.entries()) {
    if (!normalized || group.length < 2) continue;

    const canonicalCity = toCanonicalCity(normalized);
    const bestRepresentative = [...group].sort((a, b) => {
      const scoreA = a.quality + a.count / 100;
      const scoreB = b.quality + b.count / 100;
      return scoreB - scoreA || b.count - a.count || a.city.localeCompare(b.city);
    })[0];

    for (const source of group) {
      if (source.city.toUpperCase() === canonicalCity.toUpperCase()) continue;
      const blockedPair = blockedSet.has(keyPair(source.city, bestRepresentative.city));
      if (blockedPair) {
        ambiguousRows.push({
          city_in_question: source.city,
          suggested_canonical_city: canonicalCity,
          confidence: "blocked",
          suggestion_type: "normalized-group",
          source_count: source.count,
          target_basis_city: bestRepresentative.city,
          reason: "Blocked pair configured; manual decision required.",
        });
        continue;
      }

      aliasSuggestions.push({
        city_in_question: source.city,
        suggested_canonical_city: canonicalCity,
        confidence: "high",
        suggestion_type: "normalized-group",
        source_count: source.count,
        target_basis_city: bestRepresentative.city,
        county_overlap: "yes",
        source_counties: [...source.counties].sort().join("|"),
        target_counties: [...bestRepresentative.counties].sort().join("|"),
        approved_alias_exists: approved.aliases?.[source.city] ? "yes" : "no",
        reason: "Same normalized city spelling; using full-word canonical format.",
      });
      suggestedSources.add(source.city);
    }
  }

  for (const source of cities) {
    if (suggestedSources.has(source.city)) continue;

    const potential = [];

    for (const target of cities) {
      if (source.city === target.city) continue;

      const distance = levenshtein(source.normalized, target.normalized);
      if (distance <= 0 || distance > 2) continue;

      const lengthDiff = Math.abs(source.normalized.length - target.normalized.length);
      if (lengthDiff > 2) continue;

      if (!source.normalized[0] || source.normalized[0] !== target.normalized[0]) continue;

      const prefixLen = sharedPrefixLength(source.normalized, target.normalized);
      const compactSource = source.normalized.replace(/\s+/g, "");
      const compactTarget = target.normalized.replace(/\s+/g, "");
      const compactPrefixLen = sharedPrefixLength(compactSource, compactTarget);

      if (prefixLen < 3 && compactPrefixLen < 4) continue;

      const countyOverlap = [...source.counties].some((county) => target.counties.has(county));
      if (!countyOverlap) continue;

      const oneCharTruncationToLonger =
        target.normalized.length === source.normalized.length + 1
        && target.normalized.startsWith(source.normalized);

      const hasStrongSupport = target.count >= 5 || target.count >= source.count * 5 || oneCharTruncationToLonger;
      if (!hasStrongSupport) continue;

      const qualityImproved = target.quality > source.quality + 0.05;
      const countImprovedWithoutQualityRegression =
        target.count > source.count && target.quality >= source.quality;
      const truncationException = oneCharTruncationToLonger && target.quality >= source.quality;
      if (!qualityImproved && !countImprovedWithoutQualityRegression && !truncationException) continue;

      const score = (target.quality + target.count / 100) - distance;

      potential.push({
        target,
        distance,
        score,
      });
    }

    if (!potential.length) continue;

    potential.sort((a, b) => b.score - a.score || a.distance - b.distance || b.target.count - a.target.count);
    const best = potential[0];
    const runnerUp = potential[1];

    if (runnerUp && Math.abs(best.score - runnerUp.score) < 0.25) {
      ambiguousRows.push({
        city_in_question: source.city,
        suggested_canonical_city: "",
        confidence: "low",
        suggestion_type: "typo-ambiguous",
        source_count: source.count,
        target_basis_city: `${best.target.city}|${runnerUp.target.city}`,
        reason: "Multiple possible targets with similar scores.",
      });
      continue;
    }

    const blockedPair = blockedSet.has(keyPair(source.city, best.target.city));
    const suggestedCanonical = toCanonicalCity(best.target.normalized);

    if (blockedPair) {
      ambiguousRows.push({
        city_in_question: source.city,
        suggested_canonical_city: suggestedCanonical,
        confidence: "blocked",
        suggestion_type: "typo-match",
        source_count: source.count,
        target_basis_city: best.target.city,
        reason: "Blocked pair configured; manual decision required.",
      });
      continue;
    }

    if (source.city.toUpperCase() === suggestedCanonical.toUpperCase()) continue;

    aliasSuggestions.push({
      city_in_question: source.city,
      suggested_canonical_city: suggestedCanonical,
      confidence: "medium",
      suggestion_type: "typo-match",
      source_count: source.count,
      target_basis_city: best.target.city,
      county_overlap: "yes",
      source_counties: [...source.counties].sort().join("|"),
      target_counties: [...best.target.counties].sort().join("|"),
      approved_alias_exists: approved.aliases?.[source.city] ? "yes" : "no",
      reason: `Small typo candidate (edit distance ${best.distance}) with county overlap.`,
    });
    suggestedSources.add(source.city);
  }

  aliasSuggestions.sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 };
    return rank[a.confidence] - rank[b.confidence]
      || a.suggested_canonical_city.localeCompare(b.suggested_canonical_city)
      || a.city_in_question.localeCompare(b.city_in_question);
  });

  ambiguousRows.sort((a, b) => a.city_in_question.localeCompare(b.city_in_question));

  const uniqueCanonicalTargets = new Set(aliasSuggestions.map((row) => row.suggested_canonical_city)).size;

  const summary = {
    date: dateTag,
    totalRecords: records.length,
    uniqueCities: cities.length,
    slugCollisionCityCount: slugCollisionRows.length,
    pairwiseCandidateCount: candidateRows.length,
    oneWaySuggestionCount: aliasSuggestions.length,
    uniqueCanonicalTargets,
    highConfidenceSuggestions: aliasSuggestions.filter((row) => row.confidence === "high").length,
    mediumConfidenceSuggestions: aliasSuggestions.filter((row) => row.confidence === "medium").length,
    lowConfidenceSuggestions: aliasSuggestions.filter((row) => row.confidence === "low").length,
    ambiguousSuggestionCount: ambiguousRows.length,
    blockedPairsConfigured: blockedSet.size,
    approvedAliasCount: Object.keys(approved.aliases || {}).length,
    note: "Report only. No aliases were applied to source data.",
  };

  writeCsv(path.join(outDir, "city-inventory.csv"), [
    "city",
    "slug",
    "normalized",
    "count",
    "counties",
    "zip_count",
  ], inventoryRows);

  writeCsv(path.join(outDir, "slug-collisions.csv"), [
    "slug",
    "city",
    "count",
    "counties",
  ], slugCollisionRows);

  writeCsv(path.join(outDir, "city-candidate-review.csv"), [
    "confidence",
    "city_a",
    "city_b",
    "city_a_slug",
    "city_b_slug",
    "city_a_counties",
    "city_b_counties",
    "county_overlap",
    "normalized_a",
    "normalized_b",
    "edit_distance",
    "blocked_pair",
    "approved_alias_exists",
    "suggested_action",
    "reason",
  ], candidateRows);

  writeCsv(path.join(outDir, "city-alias-suggestions.csv"), [
    "city_in_question",
    "suggested_canonical_city",
    "confidence",
    "suggestion_type",
    "source_count",
    "target_basis_city",
    "county_overlap",
    "source_counties",
    "target_counties",
    "approved_alias_exists",
    "reason",
  ], aliasSuggestions);

  writeCsv(path.join(outDir, "city-ambiguous-review.csv"), [
    "city_in_question",
    "suggested_canonical_city",
    "confidence",
    "suggestion_type",
    "source_count",
    "target_basis_city",
    "reason",
  ], ambiguousRows);

  fs.writeFileSync(path.join(outDir, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`City normalization report created: reports/city-normalization/${dateTag}`);
  console.log(JSON.stringify(summary, null, 2));
}

main();
