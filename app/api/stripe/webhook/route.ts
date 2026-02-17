import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const businessId = session.metadata?.business_id;
        const tier = session.metadata?.tier;
        
        if (businessId && tier) {
          await supabase
            .from("businesses")
            .update({
              subscription_tier: tier,
              stripe_subscription_id: session.subscription as string,
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
