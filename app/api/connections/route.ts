import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, getClientIp, sanitizeString } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // Rate limit: 20 connection requests per hour per IP
    const clientIp = getClientIp(request);
    const rateLimitResult = await rateLimit(clientIp, 20, 60 * 60 * 1000); // 1 hour window
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: `Rate limit exceeded. Please try again in ${rateLimitResult.resetInSeconds} seconds.` 
        },
        { status: 429 }
      );
    }

    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { receiver_business_id, message } = body;

    if (!receiver_business_id) {
      return NextResponse.json(
        { error: "receiver_business_id is required" },
        { status: 400 }
      );
    }

    // Get sender's business
    const { data: senderBusiness, error: senderError } = await supabase
      .from("businesses")
      .select("id, name")
      .eq("owner_id", user.id)
      .single();

    if (senderError || !senderBusiness) {
      return NextResponse.json(
        { error: "Business profile not found. Please complete onboarding." },
        { status: 404 }
      );
    }

    // Validate not requesting connection to self
    if (senderBusiness.id === receiver_business_id) {
      return NextResponse.json(
        { error: "Cannot send connection request to yourself" },
        { status: 400 }
      );
    }

    // Check if receiver business exists
    const { data: receiverBusiness, error: receiverError } = await supabase
      .from("businesses")
      .select("id")
      .eq("id", receiver_business_id)
      .single();

    if (receiverError || !receiverBusiness) {
      return NextResponse.json(
        { error: "Receiver business not found" },
        { status: 404 }
      );
    }

    // Check if connection request already exists
    const { data: existingRequest, error: checkError } = await supabase
      .from("connection_requests")
      .select("id, status")
      .eq("sender_business_id", senderBusiness.id)
      .eq("receiver_business_id", receiver_business_id)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "no rows returned", which is fine
      throw checkError;
    }

    if (existingRequest) {
      return NextResponse.json(
        { 
          error: `Connection request already ${existingRequest.status}`,
          connection_id: existingRequest.id,
          status: existingRequest.status
        },
        { status: 409 }
      );
    }

    // Check if they're already connected (reverse direction)
    const { data: reverseRequest } = await supabase
      .from("connection_requests")
      .select("id, status")
      .eq("sender_business_id", receiver_business_id)
      .eq("receiver_business_id", senderBusiness.id)
      .eq("status", "accepted")
      .maybeSingle();

    if (reverseRequest) {
      return NextResponse.json(
        { error: "Already connected with this business" },
        { status: 409 }
      );
    }

    // Sanitize message if provided
    const sanitizedMessage = message ? sanitizeString(message, 500) : null;

    // Create connection request
    const { data: newRequest, error: insertError } = await supabase
      .from("connection_requests")
      .insert({
        sender_business_id: senderBusiness.id,
        receiver_business_id,
        message: sanitizedMessage,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      throw insertError;
    }

    // Send email notification to the receiver (non-blocking)
    try {
      const { data: receiverOwner } = await supabase
        .from("businesses")
        .select("name, owner_id")
        .eq("id", receiver_business_id)
        .single();

      if (receiverOwner) {
        const adminClient = createAdminClient();
        const adminResult = await adminClient.auth.admin.getUserById(receiverOwner.owner_id);
        const receiverUser = adminResult.data?.user;
        if (receiverUser?.email) {
          const { sendEmail } = await import("@/lib/resend");
          const { newConnectionRequestEmail } = await import("@/lib/email-templates");
          const template = newConnectionRequestEmail({
            recipientBusinessName: receiverOwner.name,
            senderBusinessName: senderBusiness.name,
            message: sanitizedMessage,
            appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
          });
          await sendEmail({ to: receiverUser.email, ...template });
        }
      }
    } catch (emailError) {
      console.error("Failed to send connection notification email:", emailError);
    }

    return NextResponse.json({
      success: true,
      connection_id: newRequest.id,
    });
  } catch (error) {
    console.error("Connection request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
