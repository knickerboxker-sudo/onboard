// Email template utilities for pre-launch communications
// These return HTML strings for use with email services like Resend

interface WelcomeEmailProps {
  businessName: string;
  city: string;
  currentCount: number;
  threshold: number;
  referralCode: string;
}

export function WelcomeEmail({
  businessName,
  city,
  currentCount,
  threshold,
  referralCode,
}: WelcomeEmailProps): { subject: string; html: string } {
  const percentage = Math.round((currentCount / threshold) * 100);
  const referralLink = `https://sortir.app/r/${referralCode}`;

  return {
    subject: `You're on the list! ${city} launch progress`,
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #18181b; margin: 0 0 16px;">
          Welcome to Sortir, ${businessName}!
        </h1>
        <p style="font-size: 14px; color: #71717a; line-height: 1.6; margin: 0 0 24px;">
          You're now on the waitlist for Sortir in ${city}. We're building density city-by-city, and we'll go live as soon as we hit ${threshold} businesses.
        </p>
        <div style="background: #f4f4f5; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
          <p style="font-size: 14px; font-weight: 600; color: #18181b; margin: 0 0 8px;">
            ${city} Progress: ${percentage}%
          </p>
          <div style="background: #e4e4e7; border-radius: 99px; height: 8px; overflow: hidden;">
            <div style="background: #0ea5e9; height: 100%; width: ${percentage}%; border-radius: 99px;"></div>
          </div>
          <p style="font-size: 12px; color: #71717a; margin: 8px 0 0;">
            ${currentCount} of ${threshold} businesses signed up
          </p>
        </div>
        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
          <p style="font-size: 14px; font-weight: 600; color: #0369a1; margin: 0 0 8px;">
            Share your referral link
          </p>
          <p style="font-size: 13px; color: #0369a1; margin: 0 0 12px;">
            Earn rewards by inviting other businesses to join:
          </p>
          <a href="${referralLink}" style="display: inline-block; background: #0ea5e9; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
            ${referralLink}
          </a>
        </div>
        <p style="font-size: 12px; color: #a1a1aa; margin: 24px 0 0;">
          — The Sortir Team
        </p>
      </div>
    `,
  };
}

interface ProgressUpdateEmailProps {
  city: string;
  currentCount: number;
  threshold: number;
  percentage: number;
}

export function ProgressUpdateEmail({
  city,
  currentCount,
  threshold,
  percentage,
}: ProgressUpdateEmailProps): { subject: string; html: string } {
  return {
    subject: `${city} is ${percentage}% to launch!`,
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #18181b; margin: 0 0 16px;">
          ${city} is ${percentage}% to launch! 🚀
        </h1>
        <p style="font-size: 14px; color: #71717a; line-height: 1.6; margin: 0 0 24px;">
          Great news — ${city} is getting closer to launch. ${currentCount} of ${threshold} businesses have joined.
        </p>
        <div style="background: #f4f4f5; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
          <div style="background: #e4e4e7; border-radius: 99px; height: 8px; overflow: hidden;">
            <div style="background: #0ea5e9; height: 100%; width: ${percentage}%; border-radius: 99px;"></div>
          </div>
          <p style="font-size: 14px; font-weight: 600; color: #18181b; margin: 12px 0 0;">
            ${currentCount} / ${threshold} businesses
          </p>
        </div>
        <p style="font-size: 14px; color: #71717a; line-height: 1.6;">
          Help us get there faster by sharing Sortir with local businesses you know.
        </p>
        <p style="font-size: 12px; color: #a1a1aa; margin: 24px 0 0;">
          — The Sortir Team
        </p>
      </div>
    `,
  };
}

interface LaunchEmailProps {
  city: string;
  businessName: string;
}

export function LaunchEmail({
  city,
  businessName,
}: LaunchEmailProps): { subject: string; html: string } {
  return {
    subject: `🎉 ${city} is LIVE on Sortir!`,
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <h1 style="font-size: 28px; font-weight: 700; color: #18181b; margin: 0 0 16px;">
          🎉 ${city} is LIVE!
        </h1>
        <p style="font-size: 14px; color: #71717a; line-height: 1.6; margin: 0 0 24px;">
          Congratulations, ${businessName}! Sortir is now live in ${city}. You can start discovering and connecting with local business partners today.
        </p>
        <div style="margin: 0 0 24px;">
          <h2 style="font-size: 16px; font-weight: 600; color: #18181b; margin: 0 0 12px;">
            What to do first:
          </h2>
          <ol style="font-size: 14px; color: #71717a; line-height: 1.8; padding-left: 20px; margin: 0;">
            <li>Complete your business profile</li>
            <li>Discover and connect with potential partners</li>
            <li>Send your first partnership message</li>
          </ol>
        </div>
        <a href="https://sortir.app/auth" style="display: inline-block; background: #18181b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
          Get Started →
        </a>
        <p style="font-size: 12px; color: #a1a1aa; margin: 24px 0 0;">
          — The Sortir Team
        </p>
      </div>
    `,
  };
}

interface ReferralRewardEmailProps {
  businessName: string;
  referralCount: number;
  rewardName: string;
  rewardDescription: string;
}

export function ReferralRewardEmail({
  businessName,
  referralCount,
  rewardName,
  rewardDescription,
}: ReferralRewardEmailProps): { subject: string; html: string } {
  return {
    subject: `Reward unlocked: ${rewardName}!`,
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #18181b; margin: 0 0 16px;">
          🏆 Reward Unlocked!
        </h1>
        <p style="font-size: 14px; color: #71717a; line-height: 1.6; margin: 0 0 24px;">
          Congratulations, ${businessName}! You've reached ${referralCount} referrals and unlocked a new reward.
        </p>
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
          <p style="font-size: 16px; font-weight: 600; color: #065f46; margin: 0 0 4px;">
            ${rewardName}
          </p>
          <p style="font-size: 14px; color: #047857; margin: 0;">
            ${rewardDescription}
          </p>
        </div>
        <p style="font-size: 14px; color: #71717a; line-height: 1.6;">
          Keep sharing your referral link to unlock even more rewards!
        </p>
        <p style="font-size: 12px; color: #a1a1aa; margin: 24px 0 0;">
          — The Sortir Team
        </p>
      </div>
    `,
  };
}

interface NewConnectionRequestEmailProps {
  recipientBusinessName: string;
  senderBusinessName: string;
  message: string | null;
  appUrl: string;
}

export function newConnectionRequestEmail({
  recipientBusinessName,
  senderBusinessName,
  message,
  appUrl,
}: NewConnectionRequestEmailProps): { subject: string; html: string } {
  return {
    subject: `New connection request from ${senderBusinessName}`,
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #18181b; margin: 0 0 16px;">
          New Connection Request
        </h1>
        <p style="font-size: 14px; color: #71717a; line-height: 1.6; margin: 0 0 24px;">
          Hi ${recipientBusinessName}, <strong>${senderBusinessName}</strong> wants to connect with you on Sortir!
        </p>
        ${message ? `
        <div style="background: #f4f4f5; border-radius: 12px; padding: 16px; margin: 0 0 24px;">
          <p style="font-size: 13px; color: #52525b; line-height: 1.6; margin: 0;">
            "${message}"
          </p>
        </div>
        ` : ""}
        <a href="${appUrl}/connections" style="display: inline-block; background: #18181b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
          View Request →
        </a>
        <p style="font-size: 12px; color: #a1a1aa; margin: 24px 0 0;">
          — The Sortir Team
        </p>
      </div>
    `,
  };
}

interface NewMessageEmailProps {
  recipientBusinessName: string;
  senderBusinessName: string;
  messagePreview: string;
  appUrl: string;
}

export function newMessageEmail({
  recipientBusinessName,
  senderBusinessName,
  messagePreview,
  appUrl,
}: NewMessageEmailProps): { subject: string; html: string } {
  return {
    subject: `New message from ${senderBusinessName}`,
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #18181b; margin: 0 0 16px;">
          New Message
        </h1>
        <p style="font-size: 14px; color: #71717a; line-height: 1.6; margin: 0 0 24px;">
          Hi ${recipientBusinessName}, <strong>${senderBusinessName}</strong> sent you a message on Sortir.
        </p>
        <div style="background: #f4f4f5; border-radius: 12px; padding: 16px; margin: 0 0 24px;">
          <p style="font-size: 13px; color: #52525b; line-height: 1.6; margin: 0;">
            "${messagePreview}"
          </p>
        </div>
        <a href="${appUrl}/messages" style="display: inline-block; background: #18181b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
          Reply Now →
        </a>
        <p style="font-size: 12px; color: #a1a1aa; margin: 24px 0 0;">
          — The Sortir Team
        </p>
      </div>
    `,
  };
}

interface StateUnlockedEmailProps {
  stateName: string;
  appUrl: string;
}

export function stateUnlockedEmail({
  stateName,
  appUrl,
}: StateUnlockedEmailProps): { subject: string; html: string } {
  return {
    subject: `🎉 ${stateName} just unlocked on Sortir — go find your first partner`,
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #18181b; margin: 0 0 16px;">
          🎉 ${stateName} has unlocked on Sortir!
        </h1>
        <p style="font-size: 14px; color: #71717a; line-height: 1.6; margin: 0 0 24px;">
          Great news — ${stateName} has hit its threshold and is now fully live on Sortir. You now have full access to connect and message local business partners.
        </p>
        <p style="font-size: 14px; color: #71717a; line-height: 1.6; margin: 0 0 24px;">
          Start discovering complementary businesses within 25 miles of your location. Send connection requests, chat directly, and start building partnerships that grow your business.
        </p>
        <a href="${appUrl}/discover" style="display: inline-block; background: #18181b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
          Discover Partners Now →
        </a>
        <p style="font-size: 12px; color: #a1a1aa; margin: 24px 0 0;">
          — The Sortir Team
        </p>
      </div>
    `,
  };
}

interface StateMilestoneEmailProps {
  stateName: string;
  currentCount: number;
  threshold: number;
  percentage: number;
  appUrl: string;
  referralCode?: string;
}

export function stateMilestoneEmail({
  stateName,
  currentCount,
  threshold,
  percentage,
  appUrl,
  referralCode,
}: StateMilestoneEmailProps): { subject: string; html: string } {
  const referralLink = referralCode
    ? `${appUrl}/r/${referralCode}`
    : `${appUrl}/refer`;

  return {
    subject: `${stateName} is ${percentage}% of the way to unlocking on Sortir`,
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #18181b; margin: 0 0 16px;">
          ${stateName} is ${percentage}% to unlocking! 🚀
        </h1>
        <p style="font-size: 14px; color: #71717a; line-height: 1.6; margin: 0 0 24px;">
          ${stateName} is making great progress — ${currentCount} of ${threshold} businesses have joined. Help push it over the line by sharing your referral link with other local business owners.
        </p>
        <div style="background: #f4f4f5; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
          <p style="font-size: 14px; font-weight: 600; color: #18181b; margin: 0 0 8px;">
            ${stateName} Progress: ${percentage}%
          </p>
          <div style="background: #e4e4e7; border-radius: 99px; height: 8px; overflow: hidden;">
            <div style="background: #0ea5e9; height: 100%; width: ${percentage}%; border-radius: 99px;"></div>
          </div>
          <p style="font-size: 12px; color: #71717a; margin: 8px 0 0;">
            ${currentCount} of ${threshold} businesses signed up
          </p>
        </div>
        <a href="${referralLink}" style="display: inline-block; background: #18181b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
          Share Your Referral Link →
        </a>
        <p style="font-size: 12px; color: #a1a1aa; margin: 24px 0 0;">
          — The Sortir Team
        </p>
      </div>
    `,
  };
}
