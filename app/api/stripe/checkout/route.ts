import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, PRICING } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tier } = await request.json();
    
    if (!["starter", "professional", "business"].includes(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // Get business record
    const { data: business } = await supabase
      .from("businesses")
      .select("id, stripe_customer_id")
      .eq("owner_id", user.id)
      .single();

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Create or retrieve Stripe customer
    let customerId = business.stripe_customer_id;
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email,
        metadata: { business_id: business.id, user_id: user.id },
      });
      customerId = customer.id;
      await supabase
        .from("businesses")
        .update({ stripe_customer_id: customerId })
        .eq("id", business.id);
    }

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: PRICING[tier as keyof typeof PRICING].priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
      metadata: { business_id: business.id, tier },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
