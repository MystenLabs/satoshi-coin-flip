import { EnokiClient } from "@mysten/enoki";

// Server-side environment variables validation
const ENOKI_SECRET_KEY = process.env.ENOKI_SECRET_KEY;

if (!ENOKI_SECRET_KEY) {
  throw new Error("ENOKI_SECRET_KEY environment variable is required");
}

export const enokiClient = new EnokiClient({
  apiKey: ENOKI_SECRET_KEY,
});