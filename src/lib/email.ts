import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set -- skipping "${subject}" to ${to}`);
    return;
  }
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Urban Links Golf Club <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
}
