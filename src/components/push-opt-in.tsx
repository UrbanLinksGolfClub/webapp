"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type Status = "checking" | "unsupported" | "off" | "on" | "denied";

export function PushOptIn() {
  const [status, setStatus] = useState<Status>("checking");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function check() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setStatus("denied");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      setStatus(existing ? "on" : "off");
    }
    check().catch(() => setStatus("unsupported"));
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        setStatus("unsupported");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
      setStatus("on");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setStatus("off");
    } finally {
      setBusy(false);
    }
  }

  if (status === "checking") return null;

  if (status === "unsupported") {
    return (
      <p className="text-xs text-ul-text-muted">
        Push notifications aren&apos;t available here. On iPhone: add this site to your Home
        Screen first (Share → Add to Home Screen), then open it from there and try again.
      </p>
    );
  }

  if (status === "denied") {
    return (
      <p className="text-xs text-ul-text-muted">
        Notifications are blocked for this site in your phone/browser settings. Re-enable them
        there to turn this back on.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={status === "on" ? disable : enable}
      disabled={busy}
      className="border border-ul-cream-dark bg-ul-white px-4 py-2.5 font-heading text-[10.5px] tracking-[0.16em] text-ul-green transition-colors hover:border-ul-green disabled:opacity-50"
    >
      {busy ? "…" : status === "on" ? "DISABLE PUSH NOTIFICATIONS" : "ENABLE PUSH NOTIFICATIONS"}
    </button>
  );
}
