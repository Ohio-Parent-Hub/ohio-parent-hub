// Replaces only the authoritative directory lookup in Node integration tests.
// Every email is delivered to the local inbox, never to a real provider.
export const claimListings = ["pkce", "otp", "unconfirmed", "mismatch", "missing", "conflict", "race", "failure", "existing", "dashboard", "signup"].map(name => ({
  "PROGRAM NUMBER": `oph-claim-${name}`,
  EMAIL: `oph-claim-${name}@example.test`,
}));
