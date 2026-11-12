"use client";

import { useEffect } from "react";

// Catches any client-side crash that would otherwise show Next's bare
// "Application error: a client-side exception has occurred" screen. The
// most common cause is a member's phone still running a copy of the app
// from before the latest deploy (e.g. the home-screen app left open in the
// background) -- its old JS chunks no longer exist, so the next navigation
// fails. A single reload picks up the current deploy and fixes it, so we do
// that automatically, guarded so a genuinely broken page can't reload-loop.
const RELOAD_KEY = "ul-error-reload-at";
const RELOAD_GUARD_MS = 30_000;

function reloadedRecently(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
    return Date.now() - last < RELOAD_GUARD_MS;
  } catch {
    // Storage unavailable (private mode etc.) -- don't risk a loop.
    return true;
  }
}

function markReload() {
  try {
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // Ignore -- reloadedRecently() already treats missing storage as "yes".
  }
}

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error(error);
    if (!reloadedRecently()) {
      markReload();
      window.location.reload();
    }
  }, [error]);

  function reload() {
    markReload();
    window.location.reload();
  }

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#F5F1E6",
          color: "#2f4939",
          fontFamily: "system-ui, -apple-system, sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 360 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.28em", fontWeight: 600, opacity: 0.7 }}>
            URBAN LINKS
          </div>
          <h1 style={{ margin: "12px 0 8px", fontSize: 26, fontWeight: 500 }}>
            Something went wrong
          </h1>
          <p style={{ margin: "0 0 24px", fontSize: 14, lineHeight: 1.5, opacity: 0.8 }}>
            The app may have just been updated. Reloading usually fixes it. If it keeps happening,
            close the app completely and open it again.
          </p>
          <button
            type="button"
            onClick={reload}
            style={{
              border: 0,
              background: "#C9A55C",
              color: "#1e3228",
              padding: "14px 28px",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.2em",
              cursor: "pointer",
            }}
          >
            RELOAD
          </button>
        </div>
      </body>
    </html>
  );
}
