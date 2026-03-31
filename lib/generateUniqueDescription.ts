export type UniqueDescriptionInput = {
  name: string;
  programType: string;
  sutq: string;
  pfcc: boolean;
  city: string;
  county: string;
  initialLicense: string;
  nearbyCount: number;
  similarCount: number;
  administrator: string;
};

export function generateUniqueDescription(input: UniqueDescriptionInput): string[] {
  const {
    name,
    programType,
    sutq,
    pfcc,
    city,
    county,
    initialLicense,
    nearbyCount,
    similarCount,
    administrator,
  } = input;

  const bullets: string[] = [];

  // Bullet 1: Core identity — program type + location + administrator
  const normalizedType = normalizeProgramType(programType);
  let identity = `${name} is a licensed ${normalizedType} located in ${city}, ${county} County, Ohio`;
  if (administrator) {
    identity += `, run by ${administrator}`;
  }
  bullets.push(`${identity}.`);

  // Bullet 2: Quality + subsidy signals
  const sutqLabel = getSutqLabel(sutq);
  const qualityParts: string[] = [];

  if (sutqLabel) {
    qualityParts.push(
      `holds a ${sutqLabel} Step Up to Quality rating from the state of Ohio`,
    );
  } else {
    qualityParts.push(
      "has not yet received a Step Up to Quality rating but meets all state licensing requirements",
    );
  }

  if (pfcc) {
    qualityParts.push(
      "accepts Publicly Funded Child Care (PFCC) assistance for eligible families",
    );
  }

  bullets.push(`This program ${qualityParts.join(" and ")}.`);

  // Bullet 3: Tenure + nearby context
  const yearsOpen = computeYearsLicensed(initialLicense);
  const tenureParts: string[] = [];

  if (yearsOpen !== null && yearsOpen >= 1) {
    const dateLabel = formatLicenseDate(initialLicense);
    tenureParts.push(
      `Licensed since ${dateLabel}, ${name} has served the community for ${yearsOpen === 1 ? "over a year" : `over ${yearsOpen} years`}`,
    );
  }

  if (nearbyCount > 0) {
    const nearbyPhrase = `${nearbyCount} other licensed provider${nearbyCount === 1 ? "" : "s"} within 10 miles`;
    if (tenureParts.length > 0) {
      tenureParts.push(`, with ${nearbyPhrase}`);
    } else {
      tenureParts.push(
        `There ${nearbyCount === 1 ? "is" : "are"} ${nearbyPhrase} for families to compare`,
      );
    }
  }

  if (similarCount > 0 && tenureParts.length > 0) {
    tenureParts.push(
      `, including ${similarCount} with a similar program profile`,
    );
  }

  if (tenureParts.length > 0) {
    bullets.push(`${tenureParts.join("")}.`);
  }

  return bullets;
}

function normalizeProgramType(raw: string): string {
  const cleaned = raw.trim();
  if (!cleaned || cleaned.toLowerCase() === "not specified") {
    return "child care program";
  }
  // Strip leading "licensed" to avoid "a licensed licensed …"
  return cleaned.toLowerCase().replace(/^licensed\s+/, "");
}

function getSutqLabel(sutq: string): string | null {
  const value = (sutq || "").trim().toLowerCase();
  if (value === "3" || value.includes("gold")) return "Gold";
  if (value === "2" || value.includes("silver")) return "Silver";
  if (value === "1" || value.includes("bronze")) return "Bronze";
  return null;
}

function computeYearsLicensed(initialLicense: string): number | null {
  if (!initialLicense || initialLicense === "—") return null;
  const date = new Date(initialLicense);
  if (Number.isNaN(date.getTime())) return null;
  const diffMs = Date.now() - date.getTime();
  const years = Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
  return years >= 0 ? years : null;
}

function formatLicenseDate(raw: string): string {
  const date = new Date(raw.trim());
  if (Number.isNaN(date.getTime())) return raw.trim();
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}
