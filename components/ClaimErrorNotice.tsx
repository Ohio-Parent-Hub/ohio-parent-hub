"use client";

import { useSearchParams } from "next/navigation";

const messages: Record<string, string> = {
  unconfirmed: "Please confirm your email before claiming a listing.",
  unverified_profile: "Your listing has not been verified. Contact info@ohioparenthub.com for help.",
  no_listing: "We could not find a listing with an email on file. Contact info@ohioparenthub.com for help.",
  email_mismatch: "Your confirmed email does not match the email on the childcare license. Contact info@ohioparenthub.com for help.",
  already_claimed: "This listing is already linked to another account. Contact info@ohioparenthub.com for help.",
  persistence: "We could not save your claim. Please sign in again to retry, or contact info@ohioparenthub.com.",
};

export default function ClaimErrorNotice() {
  const params = useSearchParams();
  const claimError = params.get("claim_error");
  const message = claimError && Object.hasOwn(messages, claimError)
    ? messages[claimError]
    : params.has("error") ? "Could not verify your email. Please request a new confirmation link." : null;
  return message ? <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{message}</p> : null;
}
