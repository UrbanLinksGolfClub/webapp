import { prisma } from "@/lib/db";

const BASE_URL = "https://simulatorgolftour.com/sgt-api/club-admin";
const SAFETY_MARGIN_MS = 5 * 60 * 1000; // refresh 5 min before expiry

function clubUrl(): string {
  const url = process.env.SGT_CLUB_URL;
  if (!url) throw new Error("SGT_CLUB_URL is not configured");
  return url;
}

async function storeKey(key: string, expiresInSeconds: number) {
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
  const existing = await prisma.sgtApiKey.findFirst();
  if (existing) {
    await prisma.sgtApiKey.update({
      where: { id: existing.id },
      data: { key, expiresAt, refreshedAt: new Date() },
    });
  } else {
    await prisma.sgtApiKey.create({ data: { key, expiresAt } });
  }
}

/**
 * Mints a brand new API key using the SGT club-admin username/password.
 * Only needed once (or as a fallback if refresh fails after the key has
 * fully expired) -- after that, refreshApiKey() rotates the stored key.
 */
export async function bootstrapApiKey(): Promise<string> {
  const username = process.env.SGT_ADMIN_USERNAME;
  const password = process.env.SGT_ADMIN_PASSWORD;
  if (!username || !password) {
    throw new Error(
      "SGT_ADMIN_USERNAME / SGT_ADMIN_PASSWORD not configured - cannot bootstrap an SGT API key"
    );
  }

  const res = await fetch(`${BASE_URL}/${clubUrl()}/apikey/create`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(`Failed to create SGT API key: ${JSON.stringify(data)}`);
  }

  await storeKey(data.key, data.expires);
  return data.key as string;
}

async function refreshApiKey(currentKey: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/${clubUrl()}/apikey/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ "api-key": currentKey }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(`Failed to refresh SGT API key: ${JSON.stringify(data)}`);
  }
  await storeKey(data.key, data.expires);
  return data.key as string;
}

/**
 * Returns a valid (non-expired) SGT API key, refreshing or bootstrapping
 * as needed. Call this before making any authenticated SGT request.
 */
export async function getValidApiKey(): Promise<string> {
  const existing = await prisma.sgtApiKey.findFirst();

  if (!existing) {
    return bootstrapApiKey();
  }

  if (existing.expiresAt.getTime() - SAFETY_MARGIN_MS <= Date.now()) {
    try {
      return await refreshApiKey(existing.key);
    } catch (err) {
      console.error(
        "SGT key refresh failed, falling back to bootstrapping a new key",
        err
      );
      return bootstrapApiKey();
    }
  }

  return existing.key;
}
