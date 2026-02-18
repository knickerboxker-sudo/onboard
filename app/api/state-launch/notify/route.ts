import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Verify service role authorization
  const authHeader = request.headers.get("Authorization");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!authHeader || !serviceKey || authHeader !== `Bearer ${serviceKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sortir.app";

  // Lazy-load to avoid module-level Resend constructor error during build
  const { sendEmail } = await import("@/lib/resend");
  const { stateUnlockedEmail, stateMilestoneEmail } = await import("@/lib/email-templates");

  try {
    // Find states that launched but haven't sent notifications yet
    const { data: newlyLaunched, error: launchErr } = await supabase
      .from("state_launch_status")
      .select("*")
      .eq("launched", true)
      .eq("notifications_sent", false);

    if (launchErr) throw launchErr;

    for (const stateRow of newlyLaunched ?? []) {
      // Fetch all businesses in this state with owner emails
      const { data: businesses } = await supabase
        .from("businesses")
        .select("id, name, owner_id")
        .eq("state", stateRow.state_abbrev);

      if (!businesses?.length) {
        await supabase
          .from("state_launch_status")
          .update({ notifications_sent: true, updated_at: new Date().toISOString() })
          .eq("state_abbrev", stateRow.state_abbrev);
        continue;
      }

      const ownerIds = businesses.map((b) => b.owner_id);

      // Get user emails via auth admin API
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const emailMap = new Map<string, string>();
      for (const u of usersData?.users ?? []) {
        if (u.email) emailMap.set(u.id, u.email);
      }

      const notificationInserts = [];
      for (const biz of businesses) {
        // In-app notification
        notificationInserts.push({
          user_id: biz.owner_id,
          type: "system",
          title: `${stateRow.state_name} just unlocked on Sortir!`,
          message: `${stateRow.state_name} has reached its launch threshold. You now have full access to connect with local business partners.`,
          link: "/discover",
          read: false,
        });

        // Email notification
        const recipientEmail = emailMap.get(biz.owner_id);
        if (recipientEmail) {
          const { subject, html } = stateUnlockedEmail({
            stateName: stateRow.state_name,
            appUrl,
          });
          await sendEmail({ to: recipientEmail, subject, html }).catch((err) =>
            console.error(`Failed to send state unlock email for ${stateRow.state_name} to ${recipientEmail}:`, err)
          );
        }
      }

      if (notificationInserts.length > 0) {
        await supabase.from("notifications").insert(notificationInserts);
      }

      await supabase
        .from("state_launch_status")
        .update({ notifications_sent: true, last_milestone_notified: 100, updated_at: new Date().toISOString() })
        .eq("state_abbrev", stateRow.state_abbrev);
    }

    // Handle milestone notifications (25%, 50%, 75%) for unlaunched states
    const { data: pendingStates, error: pendingErr } = await supabase
      .from("state_launch_status")
      .select("*")
      .eq("launched", false);

    if (pendingErr) throw pendingErr;

    for (const stateRow of pendingStates ?? []) {
      const percentage = Math.floor((stateRow.current_count / stateRow.threshold) * 100);
      const milestones = [25, 50, 75];

      for (const milestone of milestones) {
        if (percentage >= milestone && stateRow.last_milestone_notified < milestone) {
          // Fetch businesses for milestone email
          const { data: businesses } = await supabase
            .from("businesses")
            .select("id, name, owner_id, referral_code")
            .eq("state", stateRow.state_abbrev);

          const { data: usersData } = await supabase.auth.admin.listUsers();
          const emailMap = new Map<string, string>();
          for (const u of usersData?.users ?? []) {
            if (u.email) emailMap.set(u.id, u.email);
          }

          for (const biz of businesses ?? []) {
            const recipientEmail = emailMap.get(biz.owner_id);
            if (recipientEmail) {
              const { subject, html } = stateMilestoneEmail({
                stateName: stateRow.state_name,
                currentCount: stateRow.current_count,
                threshold: stateRow.threshold,
                percentage: milestone,
                appUrl,
                referralCode: biz.referral_code ?? undefined,
              });
              await sendEmail({ to: recipientEmail, subject, html }).catch((err) =>
                console.error(`Failed to send ${milestone}% milestone email for ${stateRow.state_name} to ${recipientEmail}:`, err)
              );
            }
          }

          await supabase
            .from("state_launch_status")
            .update({ last_milestone_notified: milestone, updated_at: new Date().toISOString() })
            .eq("state_abbrev", stateRow.state_abbrev);

          break; // Only send one milestone email per run
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("State launch notify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
