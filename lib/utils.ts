import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const PRESERVE_UPPER_TOKENS = new Set([
  "OH",
  "US",
  "NW",
  "NE",
  "SW",
  "SE",
  "N",
  "S",
  "E",
  "W",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "LLC",
  "INC",
  "YMCA",
  "YWCA",
  "PFCC",
  "SUTQ",
]);

function formatCapsToken(token: string) {
  if (!token) return token;

  const uppercase = token.toUpperCase();

  if (/^MC[A-Z]{2,}$/.test(uppercase)) {
    return `Mc${uppercase.charAt(2)}${uppercase.slice(3).toLowerCase()}`;
  }

  if (PRESERVE_UPPER_TOKENS.has(uppercase)) {
    return uppercase;
  }

  if (/^\d+[A-Z]{0,2}$/.test(uppercase)) {
    return uppercase;
  }

  const lower = token.toLowerCase();
  const firstLetterIndex = lower.search(/[a-z]/);
  if (firstLetterIndex === -1) return token;
  return (
    lower.slice(0, firstLetterIndex)
    + lower.charAt(firstLetterIndex).toUpperCase()
    + lower.slice(firstLetterIndex + 1)
  );
}

export function toTitleCaseIfAllCaps(input: string) {
  const value = (input || "").trim();
  if (!value) return "";

  const lettersOnly = value.replace(/[^A-Za-z]/g, "");
  if (!lettersOnly) return value;
  if (lettersOnly !== lettersOnly.toUpperCase()) return value;

  return value
    .split(/\s+/)
    .map((word) =>
      word
        .split(/([\-/'’])/)
        .map((segment) => {
          if (segment === "-" || segment === "/" || segment === "'" || segment === "’") {
            return segment;
          }
          return formatCapsToken(segment);
        })
        .join("")
    )
    .join(" ");
}

