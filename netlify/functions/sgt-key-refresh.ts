import type { Config } from "@netlify/functions";
import { getValidApiKey } from "../../src/lib/sgt/auth";

export default async () => {
  try {
    await getValidApiKey();
    return new Response("SGT key refresh OK", { status: 200 });
  } catch (err) {
    console.error("SGT key refresh failed", err);
    return new Response("SGT key refresh failed", { status: 500 });
  }
};

export const config: Config = {
  schedule: "*/15 * * * *",
};
