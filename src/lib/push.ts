import webpush from "web-push";
import { prisma } from "@/lib/db";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT;

const vapidConfigured = !!VAPID_PUBLIC_KEY && !!VAPID_PRIVATE_KEY && !!VAPID_SUBJECT;

if (vapidConfigured) {
  webpush.setVapidDetails(VAPID_SUBJECT!, VAPID_PUBLIC_KEY!, VAPID_PRIVATE_KEY!);
}

export async function sendPushToMember(
  memberId: string,
  payload: { title: string; body: string; url?: string }
) {
  if (!vapidConfigured) {
    console.log(`[push] VAPID not configured -- skipping push to member ${memberId}`);
    return;
  }

  const subscriptions = await prisma.pushSubscription.findMany({ where: { memberId } });

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        );
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          // Browser says this subscription is dead -- stop trying it.
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        } else {
          console.error("Failed to send push notification", err);
        }
      }
    })
  );
}
