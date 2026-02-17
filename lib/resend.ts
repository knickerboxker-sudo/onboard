import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  return await resend.emails.send({
    from: 'Sortir <notifications@sortir.app>',
    to,
    subject,
    html,
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  return await resend.emails.send({
    from: 'Sortir <onboarding@sortir.app>',
    to: email,
    subject: 'Verify your Sortir account',
    html: `<p>Click <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?token_hash=${encodeURIComponent(token)}&type=signup&next=/onboarding">here</a> to verify your account.</p>`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  return await resend.emails.send({
    from: 'Sortir <security@sortir.app>',
    to: email,
    subject: 'Reset your Sortir password',
    html: `<p>Click <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?token_hash=${encodeURIComponent(token)}&type=recovery">here</a> to reset your password. This link expires in 1 hour.</p>`,
  });
}

export async function sendMatchNotification(email: string, businessName: string) {
  return await resend.emails.send({
    from: 'Sortir <matches@sortir.app>',
    to: email,
    subject: `You matched with ${businessName}!`,
    html: `<p>You have a new match with ${businessName}. Start messaging now!</p>`,
  });
}

export async function sendPartnershipUpdate(email: string, partnershipTitle: string, updateType: string) {
  return await resend.emails.send({
    from: 'Sortir <partnerships@sortir.app>',
    to: email,
    subject: `Partnership update: ${partnershipTitle}`,
    html: `<p>Your partnership "${partnershipTitle}" has been updated: ${updateType}.</p>`,
  });
}
