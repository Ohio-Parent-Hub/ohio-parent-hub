/** Keep the product's payment-retry grace period consistent across entry points. */
export const PREMIUM_STATUSES = ["active", "past_due"] as const;
export function hasPremiumAccess(status: string | null | undefined, verified: boolean = true): boolean {
  return verified && (status === "active" || status === "past_due");
}
