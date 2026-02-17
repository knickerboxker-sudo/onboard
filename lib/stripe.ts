import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export const getStripe = () => {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }

    stripeClient = new Stripe(secretKey, {
      apiVersion: '2024-11-20.acacia' as Stripe.LatestApiVersion,
    });
  }

  return stripeClient;
};

export const PRICING = {
  starter: {
    name: 'Starter',
    price: 19,
    priceId: process.env.STRIPE_STARTER_PRICE_ID ?? 'price_starter_monthly',
  },
  professional: {
    name: 'Professional',
    price: 49,
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID ?? 'price_pro_monthly',
  },
  business: {
    name: 'Business',
    price: 99,
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID ?? 'price_business_monthly',
  },
} as const;

export type PricingTier = keyof typeof PRICING;

export const createCheckoutSession = async (
  businessId: string,
  tier: PricingTier,
) => {
  const priceId = PRICING[tier].priceId;

  return await getStripe().checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    client_reference_id: businessId,
  });
};
