type DaycareRow = Record<string, string>;

export function generateCityDescription(
  cityDisplay: string,
  daycares: DaycareRow[],
  metroName?: string,
): string[] {
  const total = daycares.length;
  if (total === 0) return [];

  const bullets: string[] = [];

  // Bullet 1: Program type breakdown
  const typeCounts = new Map<string, number>();
  for (const d of daycares) {
    const raw = (d["PROGRAM TYPE"] || "").trim().replace(/^licensed\s+/i, "");
    const key = raw
      ? raw.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      : "Child Care Program";
    typeCounts.set(key, (typeCounts.get(key) || 0) + 1);
  }
  const sorted = [...typeCounts.entries()].sort((a, b) => b[1] - a[1]);
  if (sorted.length === 1) {
    bullets.push(
      `${cityDisplay} has ${total.toLocaleString()} licensed ${sorted[0][0]}${total === 1 ? "" : "s"}.`,
    );
  } else {
    const parts = sorted.slice(0, 3).map(([type, count]) => `${count.toLocaleString()} ${type}${count === 1 ? "" : "s"}`);
    bullets.push(
      `${cityDisplay} has ${total.toLocaleString()} licensed child care providers, including ${parts.join(" and ")}.`,
    );
  }

  // Bullet 2: SUTQ distribution
  let gold = 0;
  let silver = 0;
  let bronze = 0;
  for (const d of daycares) {
    const r = (d["SUTQ RATING"] || "").trim();
    if (r === "3") gold++;
    else if (r === "2") silver++;
    else if (r === "1") bronze++;
  }
  const rated = gold + silver + bronze;
  if (rated > 0) {
    const tiers: string[] = [];
    if (gold > 0) tiers.push(`${gold} Gold`);
    if (silver > 0) tiers.push(`${silver} Silver`);
    if (bronze > 0) tiers.push(`${bronze} Bronze`);
    bullets.push(
      `${rated} provider${rated === 1 ? "" : "s"} (${Math.round((rated / total) * 100)}%) hold${rated === 1 ? "s" : ""} a Step Up to Quality rating — ${tiers.join(", ")}.`,
    );
  } else {
    bullets.push(
      "No providers in this area currently hold a Step Up to Quality rating, though all meet Ohio's mandatory licensing requirements.",
    );
  }

  // Bullet 3: PFCC acceptance
  let pfccCount = 0;
  for (const d of daycares) {
    if (d["PFCC"] === "Y" || d["PFCC AGREEMENT"] === "Y") pfccCount++;
  }
  if (pfccCount > 0) {
    bullets.push(
      `${pfccCount} provider${pfccCount === 1 ? "" : "s"} (${Math.round((pfccCount / total) * 100)}%) accept${pfccCount === 1 ? "s" : ""} Publicly Funded Child Care (PFCC) assistance for income-eligible families.`,
    );
  }

  // Bullet 4: Tenure
  const years: number[] = [];
  let oldestYear: number | null = null;
  const now = Date.now();
  for (const d of daycares) {
    const raw = d["LICENSE/CERTIFICATION/REGISTRATION BEGIN DATE"] || "";
    if (!raw || raw === "—") continue;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) continue;
    const y = Math.floor((now - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (y >= 0) {
      years.push(y);
      const dateYear = date.getFullYear();
      if (oldestYear === null || dateYear < oldestYear) oldestYear = dateYear;
    }
  }
  if (years.length > 0) {
    const avg = Math.round(years.reduce((a, b) => a + b, 0) / years.length);
    if (avg >= 1 && oldestYear) {
      bullets.push(
        `Providers in ${cityDisplay} have been licensed for an average of ${avg} year${avg === 1 ? "" : "s"}, with the longest-running program licensed since ${oldestYear}.`,
      );
    }
  }

  // Bullet 5: Metro context
  if (metroName) {
    bullets.push(`${cityDisplay} is part of the ${metroName} area.`);
  }

  return bullets;
}
