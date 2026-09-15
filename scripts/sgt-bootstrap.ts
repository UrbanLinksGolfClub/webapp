// One-time setup script: mints the first SGT Club Admin API key using
// SGT_ADMIN_USERNAME / SGT_ADMIN_PASSWORD / SGT_CLUB_URL from .env, and
// stores it in the sgt_api_key table. After this, the app only ever
// rotates the stored key via apikey/refresh -- these credentials are not
// needed again unless the key fully expires without ever refreshing.
//
// Run with: npx tsx scripts/sgt-bootstrap.ts
import "dotenv/config";
import { bootstrapApiKey } from "../src/lib/sgt/auth";

bootstrapApiKey()
  .then((key) => {
    console.log("SGT API key bootstrapped successfully.");
    console.log(`Key (first 8 chars): ${key.slice(0, 8)}...`);
  })
  .catch((err) => {
    console.error("Failed to bootstrap SGT API key:", err);
    process.exit(1);
  });
