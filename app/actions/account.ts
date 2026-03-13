"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";

export async function cancelSubscriptionAndDeleteAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_id, stripe_customer_id, program_number")
    .eq("id", user.id)
    .single();

  if (!profile) return { error: "Profile not found" };

  // 1. Cancel Stripe subscription at period end (keeps customer visible in Stripe)
  if (profile.subscription_id) {
    try {
      await stripe.subscriptions.update(profile.subscription_id, {
        cancel_at_period_end: true,
      });
    } catch {
      // Subscription may already be cancelled
    }
  }

  // 2. Delete premium_listings row
  const serviceClient = createServiceClient();
  await serviceClient
    .from("premium_listings")
    .delete()
    .eq("program_number", profile.program_number);

  // 3. Delete photos from Storage
  const folders = ["logo", "photos"];
  for (const folder of folders) {
    const { data: files } = await serviceClient.storage
      .from("listings")
      .list(`${profile.program_number}/${folder}`);
    if (files?.length) {
      await serviceClient.storage
        .from("listings")
        .remove(files.map((f: { name: string }) => `${profile.program_number}/${folder}/${f.name}`));
    }
  }

  // 4. Delete profile row
  await serviceClient.from("profiles").delete().eq("id", user.id);

  // 5. Delete auth user
  await serviceClient.auth.admin.deleteUser(user.id);

  redirect("/");
}

export async function changePassword(newPassword: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) return { error: error.message };

  return { success: true };
}
