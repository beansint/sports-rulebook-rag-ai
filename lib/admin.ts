import { HttpError } from "./errors";
import { getRequiredEnv } from "./env";

export function isAdminRequest(request: Request) {
  const expected = getRequiredEnv("ADMIN_API_KEY");
  const provided = request.headers.get("x-admin-key");
  return Boolean(provided && provided === expected);
}

export function requireAdmin(request: Request) {
  if (!isAdminRequest(request)) {
    throw new HttpError(401, "Admin API key required");
  }
}
