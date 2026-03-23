import { stripe } from "@/lib/stripe";

export type PromoValidation = {
  promoCodeId: string;
  isFreeForever: boolean;
} | null;

/**
 * Validate a promo code against Stripe and determine if it grants free-forever access.
 * Returns the Stripe promotion code ID and whether it's 100% off forever, or null if invalid.
 */
export async function validatePromoCode(
  code: string
): Promise<PromoValidation> {
  if (!code || !/^[a-zA-Z0-9_-]+$/.test(code)) return null;

  try {
    const promoCodes = await stripe.promotionCodes.list({
      code,
      active: true,
      limit: 1,
    });

    const promo = promoCodes.data[0];
    if (!promo) return null;

    const coupon = promo.promotion.coupon;
    if (!coupon || typeof coupon === "string") return null;

    const isFreeForever =
      coupon.percent_off === 100 && coupon.duration === "forever";

    return { promoCodeId: promo.id, isFreeForever };
  } catch {
    return null;
  }
}
