import { createHash, timingSafeEqual } from "crypto";
import { HttpError } from "./errors";
import { getRequiredEnv } from "./env";

export function isAdminRequest(request: Request) {
  const expected = getRequiredEnv("ADMIN_API_KEY");
  const provided = request.headers.get("x-admin-key");
  if (!provided) return false;
  // Hash both to normalize length before constant-time comparison
  const a = createHash("sha256").update(expected).digest();
  const b = createHash("sha256").update(provided).digest();
  return timingSafeEqual(a, b);
}

export function requireAdmin(request: Request) {
  if (!isAdminRequest(request)) {
    throw new HttpError(401, "Admin API key required");
  }
}
