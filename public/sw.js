const CACHE_NAME = "urban-links-shell-v1";
const APP_SHELL = ["/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

// Network-first: always try the network so members see live booking/leaderboard
// data, falling back to the cached app shell only when offline.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Leave Next's own JS/CSS chunks and anything off-site to the browser.
  // Routing them through here meant a dropped connection answered a chunk
  // request with nothing (they're never cached), crashing the page.
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/_next/")) return;

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then((cached) => cached || Response.error())
    )
  );
});

self.addEventListener("push", (event) => {
  let data = { title: "Urban Links Golf Club", body: "", url: "/club" };
  try {
    data = { ...data, ...event.data.json() };
  } catch {
    // Non-JSON payload -- fall back to the defaults above.
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/club";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
