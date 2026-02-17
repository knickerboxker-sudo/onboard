import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

const ALLOWED_TIERS = new Set(["starter", "professional", "business"]);

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook misconfigured" }, { status: 500 });
  }

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const businessId = session.metadata?.business_id;
        const tier = session.metadata?.tier;
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;
        const isPaid = session.payment_status === "paid";
        
        if (businessId && tier && subscriptionId && ALLOWED_TIERS.has(tier) && isPaid) {
          await supabase
            .from("businesses")
            .update({
              subscription_tier: tier,
              stripe_subscription_id: subscriptionId,
            })
            .eq("id", businessId);
        }
        break;
      }
      
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await supabase
          .from("businesses")
          .update({ subscription_tier: "free", stripe_subscription_id: null })
          .eq("stripe_subscription_id", sub.id);
        break;
      }
      
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        // Handle plan changes if needed
        // For now, we just log it
        console.log("Subscription updated:", sub.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
