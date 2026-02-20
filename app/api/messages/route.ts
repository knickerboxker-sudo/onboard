import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { MessageSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  // Authenticate user
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 60 messages per minute per user
  const rateLimitResult = await rateLimit(`msg:${user.id}`, 60, 60 * 1000);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: `Rate limit exceeded. Please wait ${rateLimitResult.resetInSeconds} seconds before sending another message.`,
      },
      { status: 429 },
    );
  }

  // Parse and validate body
  const body = await request.json().catch(() => null);
  const parsed = MessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { match_id, content } = parsed.data;

  // Get the sender's business
  const { data: business, error: bizError } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (bizError || !business) {
    return NextResponse.json(
      { error: "Business profile not found. Please complete onboarding." },
      { status: 404 },
    );
  }

  // Verify the business is a participant in this connection/match
  const { data: connection, error: connError } = await supabase
    .from("connection_requests")
    .select("id, sender_business_id, receiver_business_id")
    .eq("id", match_id)
    .eq("status", "accepted")
    .single();

  if (connError || !connection) {
    return NextResponse.json(
      { error: "Connection not found or not accepted." },
      { status: 404 },
    );
  }

  const isParticipant =
    connection.sender_business_id === business.id ||
    connection.receiver_business_id === business.id;

  if (!isParticipant) {
    return NextResponse.json(
      { error: "You are not a participant in this conversation." },
      { status: 403 },
    );
  }

  // Insert message
  const { data: message, error: insertError } = await supabase
    .from("messages")
    .insert({
      match_id,
      sender_business_id: business.id,
      content,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: insertError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ message });
}
