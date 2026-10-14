export const FIXTURE_PASSWORD = "OPH-local-fixture-only-2026!";
export const SUBSCRIPTION_STATUSES = ["none", "active", "past_due", "cancelled"];

// Synthetic accounts and program IDs only. These are not real provider claims.
// Two independently owned programs per subscription status support isolation tests.
export const providers = SUBSCRIPTION_STATUSES.flatMap((status, index) =>
  ["a", "b"].map((owner, ownerIndex) => {
    const number = index * 2 + ownerIndex + 1;
    return {
      id: `00000000-0000-4000-8000-${String(number).padStart(12, "0")}`,
      programNumber: `oph-test-${status}-${owner}`,
      email: `oph-${status}-${owner}@example.test`,
      status,
      jobId: `10000000-0000-4000-8000-${String(number).padStart(12, "0")}`,
      createdAt: "2026-01-01T00:00:00Z",
    };
  })
);
